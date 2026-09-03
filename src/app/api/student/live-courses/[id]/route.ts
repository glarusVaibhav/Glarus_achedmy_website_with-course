import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { LiveSessionService } from '@/lib/services/liveSessionService';

// Default enriched live course catalog as fallback/augmentation for all live courses
const CATALOG_LIVE_COURSES: Record<string, any> = {
  'live-agentic-ai': {
    id: 'live-agentic-ai',
    slug: 'building-autonomous-agents-langgraph',
    title: 'Building Autonomous Agents with LangGraph',
    category: 'Agentic AI',
    level: 'Intermediate',
    duration: '4 Weeks · 12 Live Sessions',
    price: 18999,
    originalPrice: 24999,
    description: 'Build production-ready AI agents using LangGraph, cyclical state machines, persistent memory, tool-calling LLMs, and multi-agent supervisor workflows.',
    prerequisites: 'Python 3.10+, basic AsyncIO, familiarity with OpenAI/Anthropic API calls.',
    objectives: 'Master cyclical agent graphs, supervisor routing, human-in-the-loop interrupts, and persistent checkpoint storage.',
    tags: 'Agentic AI, LangGraph, CrewAI, Python, LLMs',
    targetAudience: 'Software Engineers, Backend Developers, and AI Architects deploying autonomous agents to production.',
    instructor: {
      name: 'Dr. Sarah Chen',
      role: 'Lead AI Scientist',
      expertise: 'Autonomous Agents & Multi-Agent Swarms',
      avatar: '/images/avatars/instructor.png',
      bio: 'Former DeepMind research scientist with 10+ years engineering autonomous systems, multi-agent frameworks, and high-throughput AI workflows.'
    },
    batches: [
      { id: 'batch-01', name: 'Batch #04 (Weekend)', startDate: '24 Aug 2026', schedule: 'Mon · Wed · Fri', time: '08:00 PM – 10:30 PM IST', duration: '4 Weeks', enrolled: 32, total: 50 },
      { id: 'batch-02', name: 'Batch #05 (Weekday Evening)', startDate: '15 Sep 2026', schedule: 'Tue · Thu', time: '08:00 PM – 10:30 PM IST', duration: '4 Weeks', enrolled: 18, total: 50 }
    ],
    learningOutcomes: [
      'Build production-ready stateful agent graphs with LangGraph and checkpointing',
      'Implement supervisor agent routing patterns for complex multi-step tasks',
      'Integrate Model Context Protocol (MCP) servers and custom tool APIs',
      'Design human-in-the-loop interrupt mechanisms for safe transaction verification',
      'Deploy low-latency agent microservices with streaming token outputs',
      'Benchmark agent task accuracy and cost optimization with LangSmith'
    ],
    includes: [
      '12 Interactive Live Masterclasses (24 Hours Total)',
      '1-on-1 Code Defenses & Mentor Code Reviews',
      'Full GitHub Code Repositories & Jupyter Notebooks',
      '4 Production-Grade Capstone Projects',
      'Dedicated Private Discord Cohort Channel',
      'Cryptographically Verified Certificate of Completion',
      'Lifetime Access to HD Session Recordings'
    ],
    faqs: [
      { q: 'How long is the live cohort program?', a: 'The cohort spans 4 weeks with 3 live sessions per week (total 12 sessions of 2 hours each).' },
      { q: 'What happens if I miss a live masterclass?', a: 'Every session is recorded in 1080p Full HD and published within 2 hours with timestamped agendas, transcripts, and downloadable slides.' },
      { q: 'Are hands-on capstone projects included?', a: 'Yes! You will build 4 real-world projects: a Multi-Agent Research Swarm, an Autonomous Financial Coder, a Tool-Calling MCP Server, and an Enterprise Production Agent.' },
      { q: 'Will I receive a verified certificate upon completion?', a: 'Yes. Students who attend or watch all sessions and submit capstone projects earn a verifiable Glarus Academy Live Cohort Certificate.' }
    ],
    sessions: [
      {
        sessionNumber: 1,
        title: 'Foundations of Agentic AI & State Graph Architecture',
        duration: '120 min',
        date: '2026-08-24T14:30:00.000Z',
        startTime: '08:00 PM',
        endTime: '10:00 PM',
        description: 'Introduction to autonomous agent architecture, cyclical state graphs vs DAGs, and state channel schemas.',
        agenda: ['Orientation & System Environment Setup', 'Linear Chains vs Autonomous Graphs', 'State Channels, Schemas & Reducers in Python', 'Live Coding: First State Machine Graph', 'Q&A & Homework Briefing'],
        learningOutcomes: ['Understand state machines vs DAGs', 'Construct type-safe state schemas with Pydantic v2', 'Execute first compiled LangGraph instance']
      },
      {
        sessionNumber: 2,
        title: 'Tool Calling Protocols & MCP Server Integration',
        duration: '120 min',
        date: '2026-08-26T14:30:00.000Z',
        startTime: '08:00 PM',
        endTime: '10:00 PM',
        description: 'Implementing tool invocation protocols, Model Context Protocol (MCP), and resilient JSON parameter parsing.',
        agenda: ['Tool Calling Spec & Token Streaming', 'Building an MCP Server from Scratch', 'Handling Tool Execution Errors & Fallbacks', 'Live Integration with Postgres & Search APIs', 'Interactive Student Q&A'],
        learningOutcomes: ['Expose local databases to agents safely', 'Construct robust tool definition schemas', 'Handle tool runtime exceptions dynamically']
      },
      {
        sessionNumber: 3,
        title: 'Short-Term, Long-Term & Episodic Memory Checkpoints',
        duration: '120 min',
        date: '2026-08-28T14:30:00.000Z',
        startTime: '08:00 PM',
        endTime: '10:00 PM',
        description: 'Deep dive into LangGraph MemorySaver, Postgres checkpointers, thread IDs, and episodic conversation summarization.',
        agenda: ['Thread-Level Isolation & Checkpoint Persistence', 'Redis & Postgres Checkpointer Architecture', 'Semantic Memory Retrieval with Vector Stores', 'Time-Travel Debugging & State Replay', 'Assignment 1 Kickoff'],
        learningOutcomes: ['Persist multi-turn conversation states in Redis/Postgres', 'Replay and fork agent graphs at arbitrary steps', 'Implement semantic episodic recall']
      },
      {
        sessionNumber: 4,
        title: 'Multi-Agent Swarms & Hierarchical Supervisor Routing',
        duration: '120 min',
        date: '2026-08-31T14:30:00.000Z',
        startTime: '08:00 PM',
        endTime: '10:00 PM',
        description: 'Designing multi-agent systems with planner agents, worker specialists (coder, researcher), and critic reviewers.',
        agenda: ['Supervisor Routing Patterns & Command Loops', 'Agent-to-Agent Communication Protocols', 'Handling Infinite Loops & Recursion Limits', 'Building a Multi-Agent Market Research Team', 'Live Code Review & Feedback'],
        learningOutcomes: ['Design multi-agent hierarchical topologies', 'Prevent cyclic deadlocks and budget exhaustion', 'Coordinate parallel worker agents']
      },
      {
        sessionNumber: 5,
        title: 'Human-in-the-Loop Interrupts & Authorization Gates',
        duration: '120 min',
        date: '2026-09-02T14:30:00.000Z',
        startTime: '08:00 PM',
        endTime: '10:00 PM',
        description: 'Implementing interrupt_before and interrupt_after hooks for human review of critical actions.',
        agenda: ['Security Threat Modeling for AI Agents', 'State Interruption & Human Review Endpoints', 'Modifying Agent State Before Resume', 'Live Demo: Financial Transaction Approval Gate', 'Capstone Project 1 Defense'],
        learningOutcomes: ['Halt agent graph execution before hazardous tool calls', 'Inject approved user feedback into running graphs', 'Build secure enterprise agent approval workflows']
      },
      {
        sessionNumber: 6,
        title: 'Production Deployment, Ray Serve & Latency Optimization',
        duration: '120 min',
        date: '2026-09-04T14:30:00.000Z',
        startTime: '08:00 PM',
        endTime: '10:00 PM',
        description: 'Packaging agents as high-concurrency microservices with Ray Serve, Docker, token streaming, and LangSmith observability.',
        agenda: ['High-Concurrency Agent Serving with Ray & FastAPI', 'Real-Time Server-Sent Events (SSE) Token Streaming', 'LangSmith Tracing, Latency Profiling & Cost Tracking', 'Final Capstone Showcase & Certificate Ceremony', 'Graduation & Career Networking'],
        learningOutcomes: ['Deploy scalable agent endpoints on Kubernetes/Ray', 'Stream reasoning steps in real-time to frontends', 'Trace production bottlenecks with LangSmith telemetry']
      }
    ]
  },
  'live-llmops': {
    id: 'live-llmops',
    slug: 'llmops-pipeline-training-to-production',
    title: 'LLMOps Pipeline: From Training to Production',
    category: 'LLMOps',
    level: 'Advanced',
    duration: '8 Weeks · 16 Live Sessions',
    price: 24999,
    originalPrice: 34999,
    description: 'Master MLOps for LLMs: data curation pipelines, synthetic data generation, LoRA fine-tuning, vLLM deployment, and real-time monitoring.',
    prerequisites: 'Python 3.10+, PyTorch, Docker fundamentals, experience with GPU training.',
    objectives: 'Build automated continuous fine-tuning pipelines, deploy Triton/vLLM servers, and monitor model drift in production.',
    tags: 'LLMOps, vLLM, Docker, PyTorch, LoRA, Ray',
    targetAudience: 'ML Engineers, Platform Engineers, and AI Infrastructure Architects.',
    instructor: {
      name: 'Alexandre Dubois',
      role: 'Principal ML Platform Engineer',
      expertise: 'Distributed AI Infrastructure & High-Throughput Serving',
      avatar: '/images/avatars/instructor.png',
      bio: 'Author of open-source distributed training utilities; scaled LLM serving to 10M+ daily requests across multi-cloud Kubernetes clusters.'
    },
    batches: [
      { id: 'batch-llmops-1', name: 'Batch #02 (Fast Track)', startDate: '01 Sep 2026', schedule: 'Mon · Wed · Fri', time: '07:30 PM – 09:30 PM IST', duration: '8 Weeks', enrolled: 28, total: 50 },
      { id: 'batch-llmops-2', name: 'Batch #03 (Weekend)', startDate: '20 Sep 2026', schedule: 'Sat · Sun', time: '10:00 AM – 01:00 PM IST', duration: '8 Weeks', enrolled: 12, total: 50 }
    ],
    learningOutcomes: [
      'Build automated data filtering, deduplication, and synthetic data generation pipelines',
      'Fine-tune open-weights models (Llama 3, DeepSeek) using LoRA, QLoRA, and Unsloth',
      'Optimize high-concurrency model serving with vLLM, TensorRT-LLM, and continuous batching',
      'Implement Prometheus & Evidently telemetry for token drift and latency tracking',
      'Deploy auto-scaling GPU inference clusters on AWS EKS with KEDA'
    ],
    includes: [
      '16 Interactive Live Masterclasses (32 Hours Total)',
      'Dedicated GPU Cloud Training Credits',
      'Enterprise Docker & Kubernetes Helm Templates',
      '5 Production Portfolio Projects',
      '1-on-1 Architecture Reviews',
      'Verified LLMOps Specialist Certificate'
    ],
    faqs: [
      { q: 'Will GPU cloud credits be provided?', a: 'Yes, cloud compute vouchers are provided for fine-tuning labs and Kubernetes cluster exercises.' },
      { q: 'What models will we fine-tune?', a: 'We will work with Llama 3 8B, DeepSeek-V2, and Mistral models across domain datasets.' }
    ],
    sessions: [
      { sessionNumber: 1, title: 'Data Ingestion, Quality Filtering & Synthetic Generation', duration: '120 min', date: '2026-09-01T14:00:00.000Z', startTime: '07:30 PM', endTime: '09:30 PM', description: 'Curating domain datasets, MinHash deduplication, and instruction generation with LLMs.', agenda: ['Data Ingestion', 'MinHash LSH Deduplication', 'Synthetic QA Pairs', 'Validation'], learningOutcomes: ['Master dataset filtering', 'Generate high-quality synthetic data'] },
      { sessionNumber: 2, title: 'LoRA, QLoRA & Parameter-Efficient Fine-Tuning', duration: '120 min', date: '2026-09-03T14:00:00.000Z', startTime: '07:30 PM', endTime: '09:30 PM', description: 'Low-rank adaptation mathematics, 4-bit quantization, and Unsloth acceleration.', agenda: ['LoRA Math & Rank Selection', 'Quantization with bitsandbytes', 'Unsloth Speedups', 'Evaluation'], learningOutcomes: ['Fine-tune LLMs on consumer GPUs', 'Evaluate training loss curves'] },
      { sessionNumber: 3, title: 'High-Throughput Model Serving with vLLM & PagedAttention', duration: '120 min', date: '2026-09-05T14:00:00.000Z', startTime: '07:30 PM', endTime: '09:30 PM', description: 'Continuous batching, PagedAttention memory management, and vLLM server deployment.', agenda: ['KV Cache Memory Bottlenecks', 'PagedAttention Deep Dive', 'vLLM OpenAI-Compatible Server', 'Benchmarking'], learningOutcomes: ['Deploy vLLM clusters', 'Achieve 5x inference throughput'] },
      { sessionNumber: 4, title: 'Kubernetes Auto-Scaling with KEDA on AWS EKS', duration: '120 min', date: '2026-09-08T14:00:00.000Z', startTime: '07:30 PM', endTime: '09:30 PM', description: 'Deploying inference pods with Helm, GPU metrics, and KEDA queue depth autoscaling.', agenda: ['Helm Chart Packaging', 'NVIDIA GPU Operator', 'KEDA Autoscaling Triggers', 'Chaos Testing'], learningOutcomes: ['Orchestrate GPU pods on Kubernetes', 'Auto-scale based on request queues'] }
    ]
  },
  'live-cloud-ai': {
    id: 'live-cloud-ai',
    slug: 'scalable-cloud-architecture-ai-applications',
    title: 'Scalable Cloud Architecture for AI Applications',
    category: 'Cloud',
    level: 'Intermediate',
    duration: '6 Weeks · 12 Live Sessions',
    price: 21999,
    originalPrice: 29999,
    description: 'Design and deploy scalable, secure, and cost-optimized AI applications on AWS, Google Cloud, and Kubernetes.',
    prerequisites: 'Basic cloud experience (AWS/GCP), Docker, and REST APIs.',
    objectives: 'Architect multi-region AI infrastructure, optimize GPU compute costs, and secure model APIs.',
    tags: 'Cloud Architecture, AWS, Kubernetes, Terraform, Security',
    targetAudience: 'Cloud Architects, DevOps Engineers, and Full-Stack Developers.',
    instructor: {
      name: 'Priya Sundaram',
      role: 'Staff Cloud Solutions Architect',
      expertise: 'Cloud Infrastructure & High-Availability AI',
      avatar: '/images/avatars/instructor.png',
      bio: 'AWS Certified Solutions Architect & Kubernetes specialist with 12+ years building global SaaS platforms.'
    },
    batches: [
      { id: 'batch-cloud-1', name: 'Batch #01 (Evening Cohort)', startDate: '10 Sep 2026', schedule: 'Tue · Thu', time: '08:00 PM – 10:00 PM IST', duration: '6 Weeks', enrolled: 45, total: 60 }
    ],
    learningOutcomes: [
      'Design multi-tier cloud architectures for low-latency AI inference',
      'Automate infrastructure provisioning with Terraform and GitOps',
      'Secure AI APIs with zero-trust networking, mTLS, and token rate limiting',
      'Reduce cloud GPU spend by up to 60% with spot instances and dynamic scaling'
    ],
    includes: [
      '12 Interactive Live Masterclasses (24 Hours Total)',
      'Production Terraform Infrastructure Modules',
      'Architecture Blueprint Review & Grading',
      'Cloud Architecture Portfolio Projects',
      'Verified AI Cloud Architect Certificate'
    ],
    faqs: [
      { q: 'Which cloud providers are covered?', a: 'AWS is primary, with comparative blueprints for GCP and Azure.' }
    ],
    sessions: [
      { sessionNumber: 1, title: 'Cloud AI Architecture Patterns & Cost Modeling', duration: '120 min', date: '2026-09-10T14:30:00.000Z', startTime: '08:00 PM', endTime: '10:00 PM', description: 'Designing high-availability inference pipelines and estimating GPU TCO.', agenda: ['Inference Topology Patterns', 'GPU Instance Cost Modeling', 'VPC & Subnet Planning', 'Lab Setup'], learningOutcomes: ['Design scalable cloud topologies', 'Model AI compute costs'] },
      { sessionNumber: 2, title: 'Terraform Infrastructure-as-Code for AI Clusters', duration: '120 min', date: '2026-09-12T14:30:00.000Z', startTime: '08:00 PM', endTime: '10:00 PM', description: 'Automating AWS VPC, EKS, S3, and PGVector cluster provisioning.', agenda: ['Terraform Modules', 'EKS Cluster Automation', 'IAM Roles for Service Accounts', 'State Management'], learningOutcomes: ['Provision cloud resources with code', 'Implement zero-trust IAM roles'] }
    ]
  }
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const courseId = decodeURIComponent(id).trim();

    // 1. Soft Session Check (Unenrolled / Unauthenticated visitors should not error)
    let user: any = null;
    try {
      user = await verifyStudentSession();
    } catch {
      user = null;
    }

    // 2. Fetch Live Course from Database (by ID or Slug)
    let dbCourse = await prisma.liveCourse.findFirst({
      where: {
        OR: [
          { id: courseId },
          { slug: courseId },
          { id: 'live-course-genai' }
        ]
      },
      include: {
        leadInstructor: {
          select: { id: true, name: true, email: true, role: true }
        },
        sessions: {
          include: {
            agenda: { orderBy: { order: 'asc' } },
            topics: { orderBy: { order: 'asc' } },
            learningOutcomes: { orderBy: { order: 'asc' } },
            resources: true,
            assignments: true,
            sessionAssignmentsList: true
          },
          orderBy: [
            { sessionNumber: 'asc' },
            { date: 'asc' }
          ]
        },
        assignmentsList: true,
        enrollments: true
      }
    });

    // 3. Fallback / Augment with rich catalog details if DB course is sparse or matches catalog ID
    const catalogItem = CATALOG_LIVE_COURSES[courseId] || CATALOG_LIVE_COURSES['live-agentic-ai'];

    const courseTitle = dbCourse?.title || catalogItem.title;
    const courseCategory = dbCourse?.category || catalogItem.category;
    const courseLevel = dbCourse?.level || catalogItem.level;
    const courseDuration = dbCourse?.duration || catalogItem.duration;
    const coursePrice = dbCourse?.price || catalogItem.price;
    const courseOriginalPrice = catalogItem.originalPrice || Math.round(coursePrice * 1.35);
    const courseDesc = dbCourse?.description || catalogItem.description;
    const courseShortDesc = dbCourse?.shortDescription || catalogItem.description;
    const coursePrereqs = dbCourse?.prerequisites || catalogItem.prerequisites;
    const courseObjectives = dbCourse?.objectives || catalogItem.objectives;

    const instructorInfo = dbCourse?.leadInstructor?.name
      ? {
          name: dbCourse.leadInstructor.name,
          role: 'Lead Cohort Instructor',
          expertise: 'Agentic AI & Distributed Systems',
          avatar: '/images/avatars/instructor.png',
          bio: 'Senior AI Researcher & Architect with deep expertise in neural systems and production ML.'
        }
      : catalogItem.instructor;

    // Build deterministic sessions array
    const rawSessions = (dbCourse?.sessions && dbCourse.sessions.length > 0)
      ? dbCourse.sessions
      : catalogItem.sessions;

    const formattedSessions = rawSessions.map((s: any, idx: number) => {
      const sessNum = s.sessionNumber || idx + 1;
      const agendaList = (s.agenda && Array.isArray(s.agenda))
        ? s.agenda.map((a: any) => typeof a === 'string' ? a : (a.title || a.description || 'Module Agenda Topic'))
        : (catalogItem.sessions[idx]?.agenda || ['Architecture & Foundations', 'Live Coding Walkthrough', 'Q&A']);
      
      const outcomesList = (s.learningOutcomes && Array.isArray(s.learningOutcomes))
        ? s.learningOutcomes.map((o: any) => typeof o === 'string' ? o : (o.title || 'Core Competency'))
        : (catalogItem.sessions[idx]?.learningOutcomes || ['Master foundational principles', 'Build functional deliverables']);

      const resourcesList = (s.resources && Array.isArray(s.resources))
        ? s.resources.map((r: any) => ({ title: r.title || 'Session Notebook', type: r.type || 'NOTEBOOK' }))
        : [{ title: 'Google Colab Starter Notebook', type: 'NOTEBOOK' }, { title: 'Architecture Slide Deck (PDF)', type: 'PDF' }];

      return {
        id: s.id || `session-${sessNum}`,
        sessionNumber: sessNum,
        sessionCode: `Session ${String(sessNum).padStart(2, '0')}`,
        title: s.title,
        description: s.description || 'Interactive deep-dive masterclass with lead AI scientists.',
        date: s.date ? new Date(s.date).toISOString() : new Date(Date.now() + idx * 2 * 24 * 3600 * 1000).toISOString(),
        startTime: s.startTime || '08:00 PM',
        endTime: s.endTime || '10:00 PM',
        duration: s.duration || '120 min',
        agenda: agendaList,
        learningOutcomes: outcomesList,
        resources: resourcesList,
        preparation: s.preparation || 'Python 3.10+ installed with PyTorch and dependencies.',
        project: s.project || (idx % 2 === 1 ? `Capstone Project ${Math.ceil(idx / 2)}` : null)
      };
    });

    const batchesList = catalogItem.batches || [
      { id: 'batch-01', name: 'Main Live Cohort', startDate: '24 Aug 2026', schedule: 'Mon · Wed · Fri', time: '08:00 PM – 10:30 PM IST', duration: '4 Weeks', enrolled: dbCourse?.enrolledCount || 32, total: dbCourse?.maxStudents || 50 }
    ];

    const learningOutcomes = catalogItem.learningOutcomes;
    const includedFeatures = catalogItem.includes;
    const faqs = catalogItem.faqs;

    // 4. Check Enrollment if User is Authenticated
    let isEnrolled = false;
    let enrollmentRecord: any = null;

    if (user && dbCourse) {
      enrollmentRecord = await prisma.liveCourseEnrollment.findUnique({
        where: {
          userId_liveCourseId: {
            userId: user.id,
            liveCourseId: dbCourse.id
          }
        }
      });
      if (enrollmentRecord && enrollmentRecord.status === 'ACTIVE') {
        isEnrolled = true;
      }
    }

    // ── STATE A: PUBLIC / UNENROLLED USER (Strictly Sanitized Public Data) ──
    if (!isEnrolled) {
      return NextResponse.json({
        success: true,
        isEnrolled: false,
        course: {
          id: dbCourse?.id || catalogItem.id,
          title: courseTitle,
          category: courseCategory,
          level: courseLevel,
          duration: courseDuration,
          price: coursePrice,
          originalPrice: courseOriginalPrice,
          description: courseDesc,
          shortDescription: courseShortDesc,
          prerequisites: coursePrereqs,
          objectives: courseObjectives,
          totalSessions: formattedSessions.length,
          projectsCount: 4,
          certificateIncluded: true,
          instructor: instructorInfo,
          learningOutcomes,
          batches: batchesList,
          sessions: formattedSessions, // Complete session curriculum
          includes: includedFeatures,
          faqs
        }
      });
    }

    // ── STATE B: ENROLLED STUDENT DASHBOARD (Private Learning Dashboard) ──
    // Fetch student's attendance records, recording progress, assignments & certificate
    const [attendances, recordingProgress, submissions, certificate] = await Promise.all([
      prisma.liveSessionAttendance.findMany({
        where: { userId: user.id }
      }),
      prisma.sessionRecordingProgress.findMany({
        where: { userId: user.id }
      }),
      prisma.assignmentSubmission.findMany({
        where: { userId: user.id },
        include: { assignment: true }
      }),
      prisma.certificate.findFirst({
        where: { userId: user.id, liveCourseId: dbCourse?.id }
      })
    ]);

    const attendanceMap = new Map(attendances.map(a => [a.sessionId, a.status]));
    const recordingMap = new Map(recordingProgress.map(r => [r.sessionId, r]));
    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s.status]));

    // Map sessions with real-time status and student activity
    let attendedCount = 0;
    let nextUpcomingSession: any = null;

    const studentSessions = formattedSessions.map((s: any, idx: number) => {
      const computed = LiveSessionService.computeSessionStatus(
        s.date ? new Date(s.date) : null,
        s.startTime,
        s.duration
      );

      const attendance = attendanceMap.get(s.id) || (computed.status === 'COMPLETED' ? 'ABSENT' : null);
      if (attendance === 'PRESENT') attendedCount++;

      const recProg = recordingMap.get(s.id);
      const isCompleted = computed.status === 'COMPLETED';
      const isLiveNow = computed.status === 'ONGOING';

      // Find next session
      if (!nextUpcomingSession && (isLiveNow || computed.status === 'UPCOMING')) {
        nextUpcomingSession = {
          id: s.id,
          sessionNumber: s.sessionNumber,
          title: s.title,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          duration: s.duration,
          isLiveNow,
          canJoin: computed.canJoin
        };
      }

      const recStatus = isCompleted ? (recProg?.status === 'WATCHED' ? 'COMPLETED' : recProg ? 'IN_PROGRESS' : 'AVAILABLE') : 'UNAVAILABLE';

      return {
        ...s,
        status: isLiveNow ? 'LIVE_NOW' : isCompleted ? 'COMPLETED' : 'UPCOMING',
        isLiveNow,
        canJoin: computed.canJoin,
        attendance: attendance || 'PENDING',
        recording: {
          status: recStatus,
          progressPercent: recProg?.percent || 0,
          resumeSeconds: recProg?.resumeTimestampSeconds || 0,
          durationFormatted: s.duration
        },
        assignment: s.project ? {
          title: `${s.title} — Capstone Deliverable`,
          dueDate: new Date(new Date(s.date).getTime() + 7 * 24 * 3600 * 1000).toISOString(),
          status: submissionMap.get(s.id) || 'NOT_STARTED'
        } : null
      };
    });

    const totalSessions = studentSessions.length || 1;
    const attendanceRate = Math.round((attendedCount / totalSessions) * 100);
    const completedSessionsCount = studentSessions.filter((s: any) => s.status === 'COMPLETED').length;
    const progressPercent = Math.min(100, Math.round((completedSessionsCount / totalSessions) * 100));

    return NextResponse.json({
      success: true,
      isEnrolled: true,
      enrollment: {
        id: enrollmentRecord.id,
        batchName: enrollmentRecord.batchName,
        enrolledAt: enrollmentRecord.enrolledAt,
        progress: progressPercent
      },
      studentStats: {
        courseProgress: progressPercent,
        attendanceRate: isNaN(attendanceRate) ? 100 : attendanceRate,
        attendedSessionsCount: attendedCount,
        totalSessionsCount: totalSessions,
        assignmentsSubmittedCount: submissions.length,
        totalAssignmentsCount: 4,
        recordingsWatchedCount: recordingProgress.filter(r => r.status === 'WATCHED').length,
        totalRecordingsCount: completedSessionsCount,
        certificateStatus: certificate ? 'ISSUED' : progressPercent >= 100 ? 'READY_TO_CLAIM' : 'IN_PROGRESS'
      },
      nextSession: nextUpcomingSession || studentSessions[0],
      batch: {
        name: enrollmentRecord.batchName || 'Weekend Cohort #4',
        startDate: '24 Aug 2026',
        expectedCompletion: '30 Sep 2026',
        schedule: 'Mon · Wed · Fri',
        time: '08:00 PM – 10:30 PM IST',
        attendanceRate: isNaN(attendanceRate) ? 100 : attendanceRate,
        totalStudents: 42
      },
      course: {
        id: dbCourse?.id || catalogItem.id,
        title: courseTitle,
        category: courseCategory,
        level: courseLevel,
        duration: courseDuration,
        description: courseDesc,
        instructor: instructorInfo,
        learningOutcomes,
        sessions: studentSessions,
        certificate: certificate ? { id: certificate.id, credentialId: certificate.credentialId } : null
      }
    });

  } catch (err: any) {
    console.error('[Live Course Details API Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch live course details.' } },
      { status: 500 }
    );
  }
}
