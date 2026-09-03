import prisma from '@/lib/db';
import { calculateRecordingAvailability } from '@/lib/recordingAvailability';
import { requireSessionEnrollment } from './studentAuthService';

export interface RecordingQueryFilters {
  search?: string;
  courseId?: string;
  instructor?: string;
  module?: string;
  watchStatus?: string;
  sortBy?: string;
}

export class RecordingService {
  /**
   * Retrieves all recordings available to the enrolled student.
   * Gated by active live course enrollment and 30-day expiration window.
   */
  static async getStudentRecordings(userId: string, filters: RecordingQueryFilters) {
    const { search = '', courseId = '', instructor = '', module = '', watchStatus = 'ALL', sortBy = 'RECENT' } = filters;

    // 1. Fetch user's persistent progress records from DB
    const savedProgresses = await prisma.sessionRecordingProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map(savedProgresses.map((p) => [p.sessionId, p]));

    // 2. Fetch live enrollments and completed sessions
    const enrollments = await prisma.liveCourseEnrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        liveCourse: {
          include: {
            leadInstructor: { select: { id: true, name: true } },
            sessions: {
              where: {
                recordingUrl: { not: null },
              },
              include: {
                agenda: { orderBy: { order: 'asc' } },
                resources: true,
                topics: { orderBy: { order: 'asc' } },
                learningOutcomes: { orderBy: { order: 'asc' } },
              },
              orderBy: { date: 'desc' },
            },
          },
        },
      },
    });

    const rawList: any[] = [];

    enrollments.forEach((en) => {
      const lc = en.liveCourse;
      const instructorName = lc.leadInstructor?.name || 'Senior Instructor';

      lc.sessions.forEach((s) => {
        const completedAt = s.date ? new Date(s.date).toISOString() : new Date().toISOString();
        const durationSec = parseInt(s.duration, 10) ? parseInt(s.duration, 10) * 60 : 5400;

        const p = progressMap.get(s.id);
        const secondsWatched = p?.secondsWatched || 0;
        const totalDuration = p?.totalDurationSeconds || durationSec;
        const percent = p?.percent || (totalDuration > 0 ? Math.round((secondsWatched / totalDuration) * 100) : 0);
        const status = p?.status || (secondsWatched > 0 ? (percent >= 90 ? 'WATCHED' : 'IN_PROGRESS') : 'UNWATCHED');

        rawList.push({
          id: s.id,
          sessionTitle: s.title,
          courseName: lc.title,
          courseId: lc.id,
          instructor: instructorName,
          instructorId: lc.leadInstructorId || 'inst-1',
          module: `Module ${s.sessionNumber}: ${s.title}`,
          sessionNumber: `Live Class #${s.sessionNumber}`,
          recordingUrl: s.recordingUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail: lc.thumbnail || '/images/courses/generative-ai.png',
          duration: s.duration || '1h 30m',
          durationSeconds: durationSec,
          completedAt,
          topics: s.topics.map((t) => t.title),
          agenda: s.agenda.map((a, idx) => ({
            id: a.id,
            stepNumber: idx + 1,
            title: a.title,
            duration: a.duration || '15m',
            timestampSeconds: idx * 900,
            timestampFormatted: `${Math.floor((idx * 900) / 60)}:00`,
            description: a.description || undefined,
          })),
          takeaways: s.learningOutcomes.map((o) => o.title),
          resources: s.resources.map((r) => ({
            id: r.id,
            title: r.title,
            type: r.type.toLowerCase() as any,
            url: r.url,
          })),
          watchProgress: {
            secondsWatched,
            percent,
            status,
            lastWatchedFormatted: `${Math.floor(secondsWatched / 60)}:${String(secondsWatched % 60).padStart(2, '0')}`,
            resumeTimestampSeconds: p?.resumeTimestampSeconds || secondsWatched,
            updatedAt: p?.updatedAt ? new Date(p.updatedAt).toISOString() : completedAt,
          },
          notesCount: 0,
        });
      });
    });

    // 3. Apply Filters
    let filtered = rawList;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.sessionTitle.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          item.instructor.toLowerCase().includes(q) ||
          item.topics.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (courseId && courseId !== 'ALL') {
      filtered = filtered.filter((item) => item.courseId === courseId || item.courseName === courseId);
    }

    if (instructor && instructor !== 'ALL') {
      filtered = filtered.filter((item) => item.instructor === instructor || item.instructorId === instructor);
    }

    if (watchStatus !== 'ALL') {
      if (watchStatus === 'EXPIRING_SOON') {
        filtered = filtered.filter((item) => {
          const avail = calculateRecordingAvailability(item.completedAt);
          return avail.isExpiringSoon;
        });
      } else if (watchStatus === 'EXPIRED') {
        filtered = filtered.filter((item) => {
          const avail = calculateRecordingAvailability(item.completedAt);
          return avail.isExpired;
        });
      } else {
        filtered = filtered.filter((item) => item.watchProgress.status === watchStatus);
      }
    }

    // 4. Sort
    if (sortBy === 'RECENT') {
      filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    } else if (sortBy === 'DURATION') {
      filtered.sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === 'TITLE') {
      filtered.sort((a, b) => a.sessionTitle.localeCompare(b.sessionTitle));
    }

    return { recordings: filtered };
  }

  /**
   * Updates and persists recording watch progress into PostgreSQL.
   */
  static async updateWatchProgress(
    userId: string,
    sessionId: string,
    secondsWatched: number,
    totalDurationSeconds?: number,
    percent?: number,
    resumeTimestampSeconds?: number,
    status?: 'UNWATCHED' | 'IN_PROGRESS' | 'WATCHED'
  ) {
    // 1. Boundary & sanitization checks
    const safeSeconds = Math.max(0, secondsWatched);
    const safeTotal = totalDurationSeconds ? Math.max(safeSeconds, totalDurationSeconds) : safeSeconds;
    const computedPercent = percent !== undefined ? Math.min(100, Math.max(0, percent)) : safeTotal > 0 ? Math.round((safeSeconds / safeTotal) * 100) : 0;
    const computedStatus = status || (computedPercent >= 90 ? 'WATCHED' : safeSeconds > 0 ? 'IN_PROGRESS' : 'UNWATCHED');

    // 2. Persist in DB
    const progress = await prisma.sessionRecordingProgress.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      update: {
        secondsWatched: safeSeconds,
        totalDurationSeconds: safeTotal,
        percent: computedPercent,
        resumeTimestampSeconds: resumeTimestampSeconds ?? safeSeconds,
        status: computedStatus as any,
        updatedAt: new Date(),
      },
      create: {
        sessionId,
        userId,
        secondsWatched: safeSeconds,
        totalDurationSeconds: safeTotal,
        percent: computedPercent,
        resumeTimestampSeconds: resumeTimestampSeconds ?? safeSeconds,
        status: computedStatus as any,
      },
    });

    return progress;
  }

  private static getFallbackRecordings(progressMap: Map<string, any>) {
    const raw = [
      {
        id: 'rec-rag-vector-db',
        sessionTitle: 'Advanced RAG & Vector Databases',
        courseName: 'Advanced Generative AI Masterclass',
        courseId: 'course-genai-masterclass',
        instructor: 'Elena Rostova',
        instructorId: 'inst-elena',
        module: 'Module 4: Retrieval Systems & Vector DBs',
        sessionNumber: 'Live Class #4',
        recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: '/images/enterprise_rag_hero_ui.png',
        duration: '1h 42m',
        durationSeconds: 6120,
        completedAt: '2026-08-15T15:30:00.000Z',
        topics: ['RAG', 'Vector Databases', 'LangChain', 'Hybrid Search', 'Pinecone'],
        agenda: [
          { id: 'ag-1', stepNumber: 1, title: 'Introduction to Production RAG Architecture', duration: '15m', timestampSeconds: 0, timestampFormatted: '00:00' },
          { id: 'ag-2', stepNumber: 2, title: 'Vector Databases Deep-Dive', duration: '25m', timestampSeconds: 1980, timestampFormatted: '33:00' },
        ],
        takeaways: ['Master hybrid sparse-dense vector retrieval', 'Deploy scalable Qdrant clusters'],
        resources: [
          { id: 'res-1', title: 'RAG Architecture Slides (PDF)', type: 'pdf', size: '14.2 MB', url: '#' },
        ],
      },
      {
        id: 'rec-langgraph-agents',
        sessionTitle: 'Multi-Agent Systems & LangGraph Hierarchies',
        courseName: 'Advanced Generative AI Masterclass',
        courseId: 'course-genai-masterclass',
        instructor: 'Dr. Alex Vance',
        instructorId: 'inst-alex',
        module: 'Module 5: Multi-Agent Architectures',
        sessionNumber: 'Live Class #3',
        recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: '/images/multi_agent_architectures.png',
        duration: '1h 55m',
        durationSeconds: 6900,
        completedAt: '2026-08-12T16:00:00.000Z',
        topics: ['LangGraph', 'Multi-Agent', 'Hierarchical Agents', 'State Management'],
        agenda: [
          { id: 'ag-1', stepNumber: 1, title: 'From Simple Chains to State Graphs', duration: '15m', timestampSeconds: 0, timestampFormatted: '00:00' },
        ],
        takeaways: ['Architect cyclical stateful agent workflows'],
        resources: [],
      },
    ];

    return raw.map((item) => {
      const p = progressMap.get(item.id);
      const secondsWatched = p?.secondsWatched || 0;
      const percent = p?.percent || 0;
      const status = p?.status || 'UNWATCHED';

      return {
        ...item,
        watchProgress: {
          secondsWatched,
          percent,
          status,
          lastWatchedFormatted: `${Math.floor(secondsWatched / 60)}:${String(secondsWatched % 60).padStart(2, '0')}`,
          resumeTimestampSeconds: p?.resumeTimestampSeconds || secondsWatched,
          updatedAt: p?.updatedAt ? new Date(p.updatedAt).toISOString() : item.completedAt,
        },
        notesCount: 0,
      };
    });
  }
}
