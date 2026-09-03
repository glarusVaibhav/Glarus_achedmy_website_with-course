import prisma from '@/lib/db';
import { emitDomainEvent } from '@/lib/notifications/eventDispatcher';
import { DOMAIN_EVENT_TYPES } from '@/lib/notifications/events';

export interface AssignmentSubmissionInput {
  githubUrl?: string;
  liveUrl?: string;
  fileName?: string;
  fileUrl?: string;
  notes?: string;
}

export interface FormattedAssignmentItem {
  id: string;
  title: string;
  course: string;
  courseId: string;
  module: string;
  instructor: string;
  dueDate: string;
  dueTimestamp: string;
  status: 'PENDING' | 'IN_REVIEW' | 'GRADED';
  points: string;
  totalMarks: number;
  score?: string;
  scoreNumeric?: number;
  description: string;
  instructions?: string[];
  feedback?: string;
  gradedDate?: string;
  submission?: {
    githubUrl?: string;
    liveUrl?: string;
    fileName?: string;
    notes?: string;
    submittedAt?: string;
  };
}

export class AssignmentService {
  /**
   * Retrieves all assignments from courses in which the student is enrolled.
   */
  static async getStudentAssignments(
    userId: string,
    selectedCourse = 'ALL',
    selectedStatus = 'ALL',
    searchQuery = ''
  ): Promise<{ assignments: FormattedAssignmentItem[] }> {
    // 1. Fetch user enrollments (Self-Paced & Live)
    const [selfPacedEnrollments, liveEnrollments] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true, course: { select: { id: true, title: true, instructor: { select: { name: true } } } } },
      }),
      prisma.liveCourseEnrollment.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { liveCourseId: true, liveCourse: { select: { id: true, title: true, leadInstructor: { select: { name: true } } } } },
      }),
    ]);

    const enrolledCourseIds = selfPacedEnrollments.map((e) => e.courseId);
    const enrolledLiveCourseIds = liveEnrollments.map((e) => e.liveCourseId);

    // 2. Fetch Assignments from DB
    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          { courseId: { in: enrolledCourseIds } },
          { liveCourseId: { in: enrolledLiveCourseIds } },
        ],
      },
      include: {
        course: { select: { id: true, title: true, instructor: { select: { name: true } } } },
        liveCourse: { select: { id: true, title: true, leadInstructor: { select: { name: true } } } },
        submissions: {
          where: { userId },
          take: 1,
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // 3. Fallback Initial Assignments if none in DB yet
    let formattedList: FormattedAssignmentItem[] = assignments.map((a) => {
      const sub = a.submissions[0];
      const courseTitle = a.course?.title || a.liveCourse?.title || 'General Assessment';
      const instructorName = a.course?.instructor?.name || a.liveCourse?.leadInstructor?.name || 'Senior Instructor';

      return {
        id: a.id,
        title: a.title,
        course: courseTitle,
        courseId: a.courseId || a.liveCourseId || a.id,
        module: a.moduleName || 'Core Curriculum',
        instructor: instructorName,
        dueDate: a.dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        dueTimestamp: a.dueDate.toISOString(),
        status: sub ? (sub.status as 'PENDING' | 'IN_REVIEW' | 'GRADED') : 'PENDING',
        points: a.pointsLabel,
        totalMarks: a.totalMarks,
        score: sub?.scoreLabel || (sub?.scoreNumeric !== null && sub?.scoreNumeric !== undefined ? `${sub.scoreNumeric}/${a.totalMarks}` : undefined),
        scoreNumeric: sub?.scoreNumeric ?? undefined,
        description: a.description,
        instructions: a.instructions,
        feedback: sub?.feedback || undefined,
        gradedDate: sub?.gradedAt ? sub.gradedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : undefined,
        submission: sub
          ? {
              githubUrl: sub.githubUrl || undefined,
              liveUrl: sub.liveUrl || undefined,
              fileName: sub.fileName || undefined,
              notes: sub.notes || undefined,
              submittedAt: sub.submittedAt ? sub.submittedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : undefined,
            }
          : undefined,
      };
    });

    // 4. Apply Filters
    let filtered = formattedList;

    if (selectedCourse !== 'ALL') {
      const q = selectedCourse.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.course.toLowerCase() === q ||
          item.course.toLowerCase().includes(q) ||
          item.courseId.toLowerCase() === q
      );
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.course.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.instructor.toLowerCase().includes(q)
      );
    }

    return { assignments: filtered };
  }

  /**
   * Submits student assignment project work with GitHub, live demo, or file.
   */
  static async submitAssignment(userId: string, assignmentId: string, input: AssignmentSubmissionInput) {
    // 1. Find assignment or create demo record if submitted against a fallback ID
    let assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true, liveCourse: true },
    });

    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          id: assignmentId,
          title: 'Advanced AI Project Assessment',
          description: 'Hands-on practical capstone project submission.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalMarks: 100,
          pointsLabel: '100 Pts',
        },
        include: { course: true, liveCourse: true },
      });
    }

    // 2. Upsert submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId,
        },
      },
      update: {
        status: 'IN_REVIEW',
        githubUrl: input.githubUrl || undefined,
        liveUrl: input.liveUrl || undefined,
        fileName: input.fileName || undefined,
        fileUrl: input.fileUrl || undefined,
        notes: input.notes || undefined,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        assignmentId,
        userId,
        status: 'IN_REVIEW',
        githubUrl: input.githubUrl,
        liveUrl: input.liveUrl,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        notes: input.notes,
        submittedAt: new Date(),
      },
    });

    // 3. Dispatch Notification Event
    const instructorId = assignment.course?.instructorId || assignment.liveCourse?.leadInstructorId;
    if (instructorId) {
      emitDomainEvent({
        eventType: DOMAIN_EVENT_TYPES.ASSIGNMENT_SUBMITTED,
        actorId: userId,
        payload: {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          studentId: userId,
          instructorId,
        },
      }).catch(() => {});
    }

    return { success: true, submission };
  }

  private static getFallbackAssignments(): FormattedAssignmentItem[] {
    return [
      {
        id: 'asg-1',
        title: 'Building an Autonomous Research Agent with LangGraph',
        course: 'Advanced Generative AI Masterclass',
        courseId: 'c-genai-adv',
        module: 'Module 6: Multi-Agent Graphs & Workflows',
        instructor: 'Dr. Alex Vance',
        dueDate: 'Aug 24, 2026',
        dueTimestamp: '2026-08-24T23:59:00',
        status: 'PENDING',
        points: '100 Pts',
        totalMarks: 100,
        description: 'Implement a cyclical multi-agent graph with supervisor routing and persistent SQLite checkpointing in Python.',
        instructions: [
          'Use LangGraph with StateGraph to construct supervisor and worker agents.',
          'Integrate Tavily or SerpAPI tool nodes for live web retrieval.',
          'Implement thread memory and checkpoint resumption.',
        ],
      },
      {
        id: 'asg-2',
        title: 'Hybrid Vector Indexing & BM25 Benchmark Challenge',
        course: 'Advanced Generative AI Masterclass',
        courseId: 'c-genai-adv',
        module: 'Module 4: Advanced RAG Architecture',
        instructor: 'Elena Rostova',
        dueDate: 'Aug 21, 2026',
        dueTimestamp: '2026-08-21T23:59:00',
        status: 'IN_REVIEW',
        points: '100 Pts',
        totalMarks: 100,
        description: 'Build a Reciprocal Rank Fusion (RRF) pipeline and measure Recall@10 against baseline dense retrieval over 5,000 documents.',
        submission: {
          githubUrl: 'https://github.com/learner-student/hybrid-rrf-benchmark',
          liveUrl: 'https://rag-benchmark-demo.vercel.app',
          fileName: 'benchmark_evaluation_report.pdf',
          notes: 'Achieved a 28% higher Recall@10 with cross-encoder reranking.',
          submittedAt: 'Aug 19, 2026 at 04:30 PM',
        },
      },
      {
        id: 'asg-4',
        title: 'Custom PyTorch Loss & Transformer Block Implementation',
        course: 'Generative AI & LLM Systems',
        courseId: 'c-llm-sys',
        module: 'Module 3: Transformer Deep-Dive',
        instructor: 'Dr. Alex Vance',
        dueDate: 'Aug 10, 2026',
        dueTimestamp: '2026-08-10T23:59:00',
        status: 'GRADED',
        score: '98/100',
        scoreNumeric: 98,
        points: '100 Pts',
        totalMarks: 100,
        description: 'Implement scaled dot-product multi-head attention with causal masking, LayerNorm, and RoPE positional encodings in PyTorch.',
        gradedDate: 'Aug 12, 2026',
        feedback: 'Outstanding work! Your RoPE vector rotation and causal mask tensors are cleanly vectorized with zero CPU bottlenecks.',
        submission: {
          githubUrl: 'https://github.com/learner-student/pytorch-transformer-from-scratch',
          fileName: 'transformer_blocks_submission.zip',
          submittedAt: 'Aug 09, 2026 at 11:15 PM',
        },
      },
    ];
  }
}
