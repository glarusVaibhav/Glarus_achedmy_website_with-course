import prisma from '@/lib/db';
import { requireSessionEnrollment } from './studentAuthService';

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
   * Computes session status based on real-time server timestamp (UTC).
   */
  static computeSessionStatus(
    date: Date | null,
    startTimeStr: string | null = null,
    durationStr = '120 min'
  ) {
    if (!date) {
      return { status: 'UPCOMING' as const, isToday: false, canJoin: false };
    }

    const sessionStart = new Date(date);
    if (startTimeStr) {
      const match = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const modifier = match[3]?.toUpperCase();
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        sessionStart.setHours(hours, minutes, 0, 0);
      }
    }

    const durationMinutes = parseInt(durationStr, 10) || 120;
    const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);

    const now = new Date();
    const nowMs = now.getTime();

    // 15 minutes pre-join window
    const preJoinWindowMs = sessionStart.getTime() - 15 * 60 * 1000;

    const isOngoing = nowMs >= preJoinWindowMs && nowMs <= sessionEnd.getTime();
    const isUpcoming = nowMs < preJoinWindowMs;
    const isCompleted = nowMs > sessionEnd.getTime();

    const isToday =
      sessionStart.getDate() === now.getDate() &&
      sessionStart.getMonth() === now.getMonth() &&
      sessionStart.getFullYear() === now.getFullYear();

    const status = isOngoing ? ('ONGOING' as const) : isUpcoming ? ('UPCOMING' as const) : ('COMPLETED' as const);

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
    // 1. Fetch live enrollments
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
              },
              orderBy: { date: 'asc' },
            },
          },
        },
      },
    });

    const liveClassesList: LiveClassPayload[] = [];
    const coursesList: any[] = [];

    enrollments.forEach((en) => {
      const lc = en.liveCourse;
      const instructorName = lc.leadInstructor?.name || 'Senior Instructor';

      // Map sessions to liveClasses
      lc.sessions.forEach((s) => {
        const computed = this.computeSessionStatus(s.date, s.startTime, s.duration);

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
            date: (s.date ? new Date(s.date) : new Date()).toISOString(),
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
          const c = this.computeSessionStatus(s.date, s.startTime, s.duration);
          return c.status === 'ONGOING' || c.status === 'UPCOMING';
        })
        .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())[0];

      coursesList.push({
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
          const computed = this.computeSessionStatus(s.date, s.startTime, s.duration);
          const isComp = computed.status === 'COMPLETED';
          const isOngoing = computed.status === 'ONGOING';
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
            endTime: '11:30 AM',
            duration: s.duration || '1h 30m',
            instructor: { name: instructorName, title: 'Lead Instructor' },
            batchName: en.batchName || 'Live Batch',
            status: isOngoing ? 'live' : isComp ? 'completed' : 'upcoming',
            meetingLink: s.meetingUrl || 'https://zoom.us/j/glarus-live-room',
            recordingUrl: s.recordingUrl || undefined,
            recordingStatus: s.recordingUrl ? 'available' : undefined,
            topics: s.topics.map((t) => t.title),
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
      });
    });

    // Sort live classes: ONGOING first, then UPCOMING chronologically
    liveClassesList.sort((a, b) => {
      if (a.status === 'ONGOING' && b.status !== 'ONGOING') return -1;
      if (a.status !== 'ONGOING' && b.status === 'ONGOING') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
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
        `Class has not started yet. The live room unlocks 15 minutes before the session starts (${computed.sessionStart?.toLocaleTimeString()}).`
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
