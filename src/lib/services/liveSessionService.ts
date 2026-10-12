import prisma from '@/lib/db';
import { requireSessionEnrollment } from './studentAuthService';
import { formatTime } from '@/lib/dateTime';

export interface LiveClassPayload {
  id: string;
  courseTitle: string;
  title: string;
  instructor: string;
  batchName: string;
  date: string;
  duration?: string;
  status: 'ONGOING' | 'UPCOMING' | 'COMPLETED';
  meetingLink: string;
  prerequisites?: string;
  agenda?: string[];
  takeaways?: string[];
}

export class LiveSessionService {
  /**
   * Helper to parse duration strings like "120 min", "1h 30m", "90m", "2h", "15 min" into minutes.
   */
  static parseDurationToMinutes(durationStr?: string | null): number {
    if (!durationStr) return 90;
    const str = String(durationStr).toLowerCase().trim();

    // Check for hour + minute pattern: "1h 30m", "2 hrs 15 mins", "1 hour 30 min", "2h"
    const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
    const minMatch = str.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);

    if (hourMatch || minMatch) {
      const hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
      const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
      return Math.round(hours * 60 + mins);
    }

    const parsed = parseInt(str, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : 90;
  }

  /**
   * Helper to parse startTime or endTime string into hours and minutes
   */
  static applyTimeToDate(baseDate: Date, timeStr?: string | null): Date {
    const d = new Date(baseDate);
    if (!timeStr) return d;

    // Handle "14:30", "02:15 PM", "2:15PM", "11:30 AM"
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3]?.toUpperCase();

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      d.setHours(hours, minutes, 0, 0);
    }
    return d;
  }

  /**
   * Computes session status based on real-time server timestamp (UTC), endTime, duration, and DB status.
   */
  static computeSessionStatus(
    date: Date | null,
    startTimeStr: string | null = null,
    durationStr: string | null = '120 min',
    endTimeStr: string | null = null,
    dbStatus?: string | null,
    actualEndAt?: Date | null
  ) {
    // If DB explicitly marks it as COMPLETED or CANCELLED, or if actualEndAt is set:
    if (dbStatus === 'COMPLETED' || dbStatus === 'CANCELLED' || actualEndAt) {
      return {
        status: 'COMPLETED' as const,
        isToday: false,
        canJoin: false,
        sessionStart: date ? new Date(date) : null,
        sessionEnd: actualEndAt || (date ? new Date(date) : null),
      };
    }

    if (!date) {
      return { status: 'UPCOMING' as const, isToday: false, canJoin: false };
    }

    const sessionStart = this.applyTimeToDate(new Date(date), startTimeStr);

    let sessionEnd: Date;
    if (endTimeStr) {
      sessionEnd = this.applyTimeToDate(new Date(date), endTimeStr);
      // If endTime is earlier than or equal to startTime, fallback to duration
      if (sessionEnd.getTime() <= sessionStart.getTime()) {
        const durationMinutes = this.parseDurationToMinutes(durationStr);
        sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);
      }
    } else {
      const durationMinutes = this.parseDurationToMinutes(durationStr);
      sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);
    }

    const now = new Date();
    const nowMs = now.getTime();

    // 15 minutes pre-join window
    const preJoinWindowMs = sessionStart.getTime() - 15 * 60 * 1000;

    const isCompleted = nowMs > sessionEnd.getTime();
    const isOngoing = !isCompleted && nowMs >= preJoinWindowMs;
    const isUpcoming = !isCompleted && !isOngoing;

    const isToday =
      sessionStart.getDate() === now.getDate() &&
      sessionStart.getMonth() === now.getMonth() &&
      sessionStart.getFullYear() === now.getFullYear();

    const status = isCompleted ? ('COMPLETED' as const) : isOngoing ? ('ONGOING' as const) : ('UPCOMING' as const);

    return {
      status,
      isToday,
      canJoin: isOngoing,
      sessionStart,
      sessionEnd,
    };
  }

  /**
   * Retrieves all live courses and active/upcoming live classes for the student.
   */
  static async getEnrolledLiveCoursesAndClasses(userId: string) {
    // 1. Fetch live enrollments with complete sessions and resources
    const enrollments = await prisma.liveCourseEnrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        liveCourse: {
          include: {
            leadInstructor: { select: { id: true, name: true } },
            sessions: {
              include: {
                agenda: { orderBy: { order: 'asc' } },
                topics: { orderBy: { order: 'asc' } },
                learningOutcomes: { orderBy: { order: 'asc' } },
                resources: true,
                homework: true,
                sessionAssignmentsList: true,
              },
              orderBy: { sessionNumber: 'asc' },
            },
          },
        },
      },
    });

    const liveClassesList: LiveClassPayload[] = [];
    const coursesList: any[] = [];

    // Optional background sync: update expired session statuses in DB if needed without deleting anything
    const expiredSessionIds: string[] = [];

    enrollments.forEach((en) => {
      const lc = en.liveCourse;
      const instructorName = lc.leadInstructor?.name || 'Senior Instructor';

      // Map sessions to liveClasses
      lc.sessions.forEach((s) => {
        const computed = this.computeSessionStatus(
          s.date,
          s.startTime,
          s.duration,
          s.endTime,
          s.status,
          s.actualEnd_at
        );

        if (computed.status === 'COMPLETED' && s.status !== 'COMPLETED') {
          expiredSessionIds.push(s.id);
        }

        if (computed.status === 'ONGOING' || computed.status === 'UPCOMING') {
          const agendaTitles = s.agenda.map(
            (a, idx) => `${String(idx + 1).padStart(2, '0')}. ${a.title}${a.duration ? ` (${a.duration})` : ''}`
          );
          const takeaways = s.learningOutcomes.map((o) => o.title);

          liveClassesList.push({
            id: s.id,
            courseTitle: lc.title,
            title: s.title,
            instructor: instructorName,
            batchName: en.batchName,
            date: (computed.sessionStart || (s.date ? new Date(s.date) : new Date())).toISOString(),
            duration: s.duration,
            status: computed.status,
            meetingLink: s.meetingUrl || 'https://zoom.us/j/glarus-live-room',
            prerequisites: lc.prerequisites || 'Python 3.10+, PyTorch installed, basic Linear Algebra',
            agenda: agendaTitles.length > 0 ? agendaTitles : undefined,
            takeaways: takeaways.length > 0 ? takeaways : undefined,
          });
        }
      });

      // Find next upcoming session for this course
      const nextSession = lc.sessions
        .filter((s) => {
          const c = this.computeSessionStatus(
            s.date,
            s.startTime,
            s.duration,
            s.endTime,
            s.status,
            s.actualEnd_at
          );
          return c.status === 'ONGOING' || c.status === 'UPCOMING';
        })
        .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())[0];

      const courseEntry: any = {
        id: lc.id,
        title: lc.title,
        tagline: lc.shortDescription || 'Live Training Program',
        description: lc.description || 'Live Masterclass Cohort',
        badge: en.batchName || 'LIVE COHORT',
        gradient: 'from-purple-600/20 via-blue-600/20 to-card',
        thumbnail: lc.thumbnail || '/images/courses/generative-ai.png',
        instructor: {
          name: instructorName,
          title: lc.leadInstructor?.name ? 'Lead Cohort Instructor' : 'Senior AI Scientist',
          avatar: '/images/avatars/instructor.png',
        },
        sessions: lc.sessions.map((s, idx) => {
          const computed = this.computeSessionStatus(
            s.date,
            s.startTime,
            s.duration,
            s.endTime,
            s.status,
            s.actualEnd_at
          );
          const isComp = computed.status === 'COMPLETED';
          const isOngoing = computed.status === 'ONGOING';

          // Detect active learning resources dynamically
          const hasVideo = Boolean(
            s.recordingUrl ||
            s.resources?.some((r) => {
              const type = (r.type || '').toUpperCase();
              const url = (r.url || '').toLowerCase();
              return (
                type === 'VIDEO' ||
                type === 'RECORDING' ||
                url.endsWith('.mp4') ||
                url.endsWith('.webm') ||
                url.includes('youtube.com') ||
                url.includes('youtu.be') ||
                url.includes('vimeo.com')
              );
            })
          );

          const hasPdf = Boolean(
            s.resources?.some((r) => {
              const type = (r.type || '').toUpperCase();
              const url = (r.url || '').toLowerCase();
              const title = (r.title || '').toLowerCase();
              return (
                type === 'PDF' ||
                type === 'DOCUMENT' ||
                type === 'DOC' ||
                type === 'SLIDES' ||
                url.endsWith('.pdf') ||
                title.endsWith('.pdf')
              );
            })
          );

          const hasQuiz = Boolean(
            s.resources?.some((r) => (r.type || '').toUpperCase() === 'QUIZ') ||
            s.homework?.some((h) => {
              const t = (h.title || '').toLowerCase();
              const d = (h.description || '').trim();
              return t.includes('quiz') || t.includes('knowledge check') || d.startsWith('[');
            })
          );

          const hasAssignment = Boolean(
            (s.sessionAssignmentsList && s.sessionAssignmentsList.length > 0) ||
            s.resources?.some((r) => {
              const type = (r.type || '').toUpperCase();
              return (
                type === 'ASSIGNMENT' ||
                type === 'PROJECT' ||
                type === 'CODE' ||
                type === 'GITHUB' ||
                type === 'ZIP' ||
                type === 'DATASET'
              );
            }) ||
            s.homework?.some((h) => {
              const t = (h.title || '').toLowerCase();
              const d = (h.description || '').trim();
              return !t.includes('quiz') && !t.includes('knowledge check') && !d.startsWith('[');
            })
          );

          return {
            id: s.id,
            courseId: lc.id,
            courseTitle: lc.title,
            sessionNumber: s.sessionNumber || idx + 1,
            sessionCode: `Session ${String(s.sessionNumber || idx + 1).padStart(2, '0')}`,
            title: s.title,
            description: s.description || '',
            date: s.date ? new Date(s.date).toISOString().split('T')[0] : '2026-09-02',
            startTime: s.startTime || '10:00 AM',
            endTime: s.endTime || (computed.sessionEnd ? formatTime(computed.sessionEnd) : '11:30 AM'),
            duration: s.duration || '1h 30m',
            instructor: { name: instructorName, title: 'Lead Instructor' },
            batchName: en.batchName || 'Live Batch',
            status: isOngoing ? 'live' : isComp ? 'completed' : 'upcoming',
            meetingLink: s.meetingUrl || 'https://zoom.us/j/glarus-live-room',
            recordingUrl: s.recordingUrl || undefined,
            recordingStatus: s.recordingUrl ? 'available' : undefined,
            hasVideo,
            hasPdf,
            hasQuiz,
            hasAssignment,
            topics: s.topics.map((t) => t.title),
            resources: (s.resources || []).map((r) => ({
              id: r.id,
              title: r.title,
              type: r.type,
              url: r.url,
            })),
            homework: (s.homework || []).map((h) => ({
              id: h.id,
              title: h.title,
              description: h.description || undefined,
              dueDate: h.dueDate || undefined,
            })),
            sessionAssignmentsList: (s.sessionAssignmentsList || []).map((a) => ({
              id: a.id,
              title: a.title,
              description: a.description || undefined,
              dueDate: a.dueDate ? a.dueDate.toISOString() : undefined,
            })),
            agenda: s.agenda.map((a, aidx) => ({
              id: a.id,
              stepNumber: String(aidx + 1).padStart(2, '0'),
              timeRange: a.duration ? `${a.duration}` : '15m',
              title: a.title,
              description: a.description || undefined,
            })),
          };
        }),
        nextClass: nextSession
          ? {
              id: nextSession.id,
              title: nextSession.title,
              date: (nextSession.date ? new Date(nextSession.date) : new Date()).toISOString(),
              meetingLink: nextSession.meetingUrl || 'https://zoom.us/j/glarus-live-room',
            }
          : null,
        totalClasses: lc.sessions.length || 12,
        status: 'IN_PROGRESS',
      };

      // Determine Course-Level Live-Session Priority & Sorting Timestamp
      const courseSessions = courseEntry.sessions;
      const liveSession = courseSessions.find((s: any) => s.status === 'live');

      const upcomingSessions = courseSessions
        .filter((s: any) => s.status === 'upcoming')
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const nextUpcoming = upcomingSessions[0] || null;

      let sessionPriority = 3; // Priority 3: No live or upcoming sessions
      let sortTime = Number.MAX_SAFE_INTEGER;

      if (liveSession) {
        sessionPriority = 1; // Priority 1: Currently LIVE session
        sortTime = new Date(liveSession.date).getTime();
      } else if (nextUpcoming) {
        sessionPriority = 2; // Priority 2: Has upcoming session
        sortTime = new Date(nextUpcoming.date).getTime();
      }

      courseEntry.sessionPriority = sessionPriority;
      courseEntry.sortTime = sortTime;
      courseEntry.liveSession = liveSession || null;
      courseEntry.nextUpcomingSession = nextUpcoming || null;

      // Generate course-level pending resources notifications for completed sessions that actually have resources
      const completedWithPending = courseSessions.filter(
        (s: any) => s.status === 'completed' && (s.hasVideo || s.hasPdf || s.hasQuiz || s.hasAssignment)
      );
      const pendingNotifications = completedWithPending.map((s: any) => {
        const labels: string[] = [];
        if (s.hasVideo) labels.push('recorded video lecture');
        if (s.hasPdf) labels.push('downloadable PDF slides');
        if (s.hasQuiz) labels.push('interactive quiz');
        if (s.hasAssignment) labels.push('assignment');

        const lead = s.hasVideo ? 'Access your' : 'Access the';
        let msg = `Review completed session materials for ${s.title}.`;
        if (labels.length === 1) {
          msg = `${lead} ${labels[0]} for ${s.title}.`;
        } else if (labels.length === 2) {
          msg = `${lead} ${labels[0]} and ${labels[1]} for ${s.title}.`;
        } else if (labels.length > 2) {
          const allExceptLast = labels.slice(0, -1).join(', ');
          const last = labels[labels.length - 1];
          msg = `${lead} ${allExceptLast}, and ${last} for ${s.title}.`;
        }

        return {
          id: `pending-${s.id}`,
          sessionId: s.id,
          sessionNumber: s.sessionNumber,
          sessionCode: s.sessionCode || `Session ${String(s.sessionNumber).padStart(2, '0')}`,
          title: `Pending Resources in ${s.sessionCode || 'Session ' + s.sessionNumber}`,
          message: msg,
          hasVideo: s.hasVideo,
          hasPdf: s.hasPdf,
          hasQuiz: s.hasQuiz,
          hasAssignment: s.hasAssignment,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
      });

      courseEntry.notifications = pendingNotifications;
      courseEntry.unreadNotificationCount = pendingNotifications.length;

      coursesList.push(courseEntry);
    });

    // Fire non-blocking status updates for expired sessions so DB stays consistent
    if (expiredSessionIds.length > 0) {
      prisma.liveSession
        .updateMany({
          where: { id: { in: expiredSessionIds } },
          data: { status: 'COMPLETED' },
        })
        .catch((err) => console.warn('[LiveSessionService] Failed to auto-update expired session status:', err));
    }

    // Sort live classes: ONGOING first, then UPCOMING chronologically
    liveClassesList.sort((a, b) => {
      if (a.status === 'ONGOING' && b.status !== 'ONGOING') return -1;
      if (a.status !== 'ONGOING' && b.status === 'ONGOING') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Sort courses with Priority 1: LIVE (earliest start), Priority 2: UPCOMING (earliest start ASC), Priority 3: NO UPCOMING
    coursesList.sort((a, b) => {
      if (a.sessionPriority !== b.sessionPriority) {
        return a.sessionPriority - b.sessionPriority;
      }
      if (a.sessionPriority === 1 || a.sessionPriority === 2) {
        if (a.sortTime !== b.sortTime) {
          return a.sortTime - b.sortTime;
        }
      }
      return 0;
    });

    return { courses: coursesList, classes: liveClassesList };
  }

  /**
   * Generates a secure join token or verified meeting link for an enrolled student.
   * Gated by enrollment check and 15-minute pre-join window.
   */
  static async getLiveSessionJoinAccess(userId: string, sessionId: string) {
    const { session } = await requireSessionEnrollment(userId, sessionId);

    const computed = this.computeSessionStatus(session.date, session.startTime, session.duration);

    if (!computed.canJoin && computed.status !== 'ONGOING') {
      throw new Error(
        `Class has not started yet. The live room unlocks 15 minutes before the session starts (${computed.sessionStart ? formatTime(computed.sessionStart) : "soon"}).`
      );
    }

    // Log attendance kickoff
    await prisma.liveSessionAttendance.upsert({
      where: { sessionId_userId: { sessionId: session.id, userId } },
      update: {
        status: 'PRESENT',
        joinedAt: new Date(),
      },
      create: {
        sessionId: session.id,
        userId,
        status: 'PRESENT',
        joinedAt: new Date(),
      },
    }).catch(() => {});

    return {
      success: true,
      sessionId: session.id,
      sessionTitle: session.title,
      meetingId: session.meetingId || session.id,
      passcode: session.meetingPasscode || 'GlarusLive2026',
      meetingUrl: session.meetingUrl || (session.meetingId ? `https://zoom.us/j/${session.meetingId}` : 'https://zoom.us/j/glarus-live-classroom'),
      joinedAt: new Date().toISOString(),
    };
  }
}
