import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('Piyush@11', 10)
  const instructorPassword = await bcrypt.hash('Piyush@11', 10)
  const studentPassword = await bcrypt.hash('Arun@123', 10)

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Upsert Instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'piyushdhoke11@gmail.com' },
    update: {},
    create: {
      email: 'piyushdhoke11@gmail.com',
      name: 'Expert Instructor',
      password: instructorPassword,
      role: 'INSTRUCTOR',
    },
  })

  // Upsert Student
  const student = await prisma.user.upsert({
    where: { email: 'arun.sharma@gmail.com' },
    update: {},
    create: {
      email: 'arun.sharma@gmail.com',
      name: 'Learner Student',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  console.log({ admin, instructor, student })

  // Seed sample courses
  const course1 = await prisma.course.upsert({
    where: { id: "test-course-1" },
    update: {},
    create: {
      id: "test-course-1",
      title: "Advanced AI Engineering",
      description: "Learn how to build production-grade agentic platforms.",
      price: 24999,
      instructorId: instructor.id,
      status: "PENDING"
    }
  });

  const course2 = await prisma.course.upsert({
    where: { id: "test-course-2" },
    update: {},
    create: {
      id: "test-course-2",
      title: "Full-Stack Next.js 14 Masterclass",
      description: "App router, Server Actions, Tailwind, Prisma.",
      price: 14999,
      instructorId: instructor.id,
      status: "PENDING"
    }
  });

  const course3 = await prisma.course.upsert({
    where: { id: "test-course-3" },
    update: {},
    create: {
      id: "test-course-3",
      title: "Machine Learning for Beginners",
      description: "Start your journey in Data Science.",
      price: 4999,
      instructorId: instructor.id,
      status: "APPROVED"
    }
  });

  const course4 = await prisma.course.upsert({
    where: { id: "test-course-4" },
    update: {},
    create: {
      id: "test-course-4",
      title: "Python Automation Tricks",
      description: "Automate everything with Python scripts.",
      price: 2999,
      instructorId: instructor.id,
      status: "REJECTED",
      type: "SELF_PACED"
    }
  });

  // Add Curriculum to Course 3 (Approved Self Paced) - idempotent
  const existingModule = await prisma.module.findUnique({ where: { id: "module-1" } });
  if (!existingModule) {
    await prisma.module.create({
      data: {
        id: "module-1",
        title: "Getting Started with ML",
        courseId: course3.id,
        order: 1,
        lectures: {
          create: [
            { title: "What is Machine Learning?", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", order: 1 },
            { title: "Setting up Python", videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", order: 2 }
          ]
        }
      }
    });
  }

  // Make Course 1 Instructor Led and add Batches
  await prisma.course.update({
    where: { id: course1.id },
    data: { type: "INSTRUCTOR_LED" }
  });

  const existingBatch = await prisma.batch.findUnique({ where: { id: "batch-1" } });
  if (!existingBatch) {
    await prisma.batch.create({
      data: {
        id: "batch-1",
        name: "Weekend Fast Track",
        courseId: course1.id,
        startDate: new Date(),
        liveClasses: {
          create: [
            { 
              title: "Deep Learning & Neural Network Architecture (Live Workshop)", 
              date: new Date(Date.now() - 15 * 60 * 1000), 
              meetingLink: "https://zoom.us/j/sample-ongoing-live-class" 
            },
            { 
              title: "RAG Indexing, Vector Databases & LangChain Agents", 
              date: new Date(Date.now() + 2.5 * 60 * 60 * 1000), 
              meetingLink: "https://zoom.us/j/sample-upcoming-live-class" 
            }
          ]
        }
      }
    });
  } else {
    await prisma.liveClass.deleteMany({ where: { batchId: "batch-1" } });
    await prisma.liveClass.createMany({
      data: [
        {
          batchId: "batch-1",
          title: "Deep Learning & Neural Network Architecture (Live Workshop)",
          date: new Date(Date.now() - 15 * 60 * 1000),
          meetingLink: "https://zoom.us/j/sample-ongoing-live-class"
        },
        {
          batchId: "batch-1",
          title: "RAG Indexing, Vector Databases & LangChain Agents",
          date: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
          meetingLink: "https://zoom.us/j/sample-upcoming-live-class"
        }
      ]
    });
  }

  // Enroll the student into Course 1 & Course 3
  for (const cId of [course1.id, course3.id]) {
    const exists = await prisma.enrollment.findFirst({ where: { userId: student.id, courseId: cId } });
    if (!exists) {
      await prisma.enrollment.create({ data: { userId: student.id, courseId: cId } });
    }
  }

  // Create a completed self-paced course for certificate demo
  const completedCourse = await prisma.course.upsert({
    where: { id: "test-course-5" },
    update: {},
    create: {
      id: "test-course-5",
      title: "Python Fundamentals Bootcamp",
      description: "Complete beginner-to-intermediate Python programming course.",
      price: 3999,
      instructorId: instructor.id,
      status: "APPROVED",
      type: "SELF_PACED"
    }
  });

  await prisma.enrollment.upsert({
    where: { id: "enrollment-completed" },
    update: {},
    create: {
      id: "enrollment-completed",
      userId: student.id,
      courseId: completedCourse.id,
      progress: 100
    }
  });

  // Issue a certificate for the completed course
  await prisma.certificate.upsert({
    where: { userId_courseId: { userId: student.id, courseId: completedCourse.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: completedCourse.id,
      issueDate: new Date(),
      certificateUrl: null
    }
  });

  // Seed UserActivity (continue learning data)
  await prisma.userActivity.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course3.id } },
    update: { updatedAt: new Date() },
    create: {
      userId: student.id,
      courseId: course3.id,
      lastLectureTitle: "What is Machine Learning?",
      lastTimestamp: 45.5,
      totalSeconds: 1800,
    }
  });

  await prisma.userActivity.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: { updatedAt: new Date() },
    create: {
      userId: student.id,
      courseId: course1.id,
      lastLectureTitle: "Kickoff Session",
      lastTimestamp: 0,
      totalSeconds: 3600,
    }
  });

  // Seed Achievements
  const achievementData = [
    { badge: "🚀", title: "First Login", xp: 10 },
    { badge: "📚", title: "Enrolled in first course", xp: 25 },
    { badge: "🎯", title: "Completed first lecture", xp: 50 },
    { badge: "🏆", title: "Course Completed!", xp: 200 },
    { badge: "🔥", title: "3-Day Streak", xp: 30 },
  ];

  for (const ach of achievementData) {
    const exists = await prisma.achievement.findFirst({
      where: { userId: student.id, title: ach.title }
    });
    if (!exists) {
      await prisma.achievement.create({
        data: { userId: student.id, ...ach }
      });
    }
  }

  // Seed Notifications
  const notifData = [
    { message: "Welcome to EduAI! Start your learning journey today.", type: "WELCOME" },
    { message: "New live session scheduled: Deep Learning Foundations", type: "CLASS" },
    { message: "Congratulations! You earned the 'Course Completed' badge!", type: "ACHIEVEMENT" },
    { message: "Your certificate for Python Fundamentals Bootcamp is ready!", type: "CERTIFICATE" },
  ];

  for (const notif of notifData) {
    const exists = await prisma.notification.findFirst({
      where: { userId: student.id, message: notif.message }
    });
    if (!exists) {
      await prisma.notification.create({
        data: { userId: student.id, ...notif }
      });
    }
  }

  // Seed additional instructors
  const sarahPassword = await bcrypt.hash('Sarah@123', 10);
  const johnPassword = await bcrypt.hash('John@123', 10);
  
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.chen@glarus.edu' },
    update: {},
    create: {
      email: 'sarah.chen@glarus.edu',
      name: 'Dr. Sarah Chen',
      password: sarahPassword,
      role: 'INSTRUCTOR',
    }
  });

  const john = await prisma.user.upsert({
    where: { email: 'john.doe@glarus.edu' },
    update: {},
    create: {
      email: 'john.doe@glarus.edu',
      name: 'John Doe',
      password: johnPassword,
      role: 'INSTRUCTOR',
    }
  });

  // Seed Live Courses
  const liveCourse1 = await prisma.liveCourse.upsert({
    where: { id: 'live-course-genai' },
    update: {},
    create: {
      id: 'live-course-genai',
      title: 'Advanced Generative AI & Autonomous Agents Bootcamp',
      slug: 'advanced-genai-bootcamp',
      shortDescription: 'Master Agentic AI, Multi-agent orchestrations, RAG pipelines, and LangGraph in 6 intense live weeks.',
      description: 'Comprehensive 6-week live cohort covering transformer architectures, LangChain, LangGraph stateful multi-agent systems, tool-calling LLMs, vector database hybrid retrieval, and enterprise guardrails.',
      category: 'Generative AI',
      level: 'Intermediate to Advanced',
      duration: '6 Weeks (12 Live Sessions)',
      startDate: new Date('2026-09-01T19:00:00Z'),
      endDate: new Date('2026-10-10T21:00:00Z'),
      timezone: 'Asia/Kolkata (IST)',
      totalSessions: 6,
      maxStudents: 60,
      enrolledCount: 42,
      status: 'PUBLISHED',
      leadInstructorId: sarah.id,
      createdById: admin.id,
      meetingPlatform: 'Zoom Enterprise',
      meetingUrl: 'https://zoom.us/j/glarus-live-genai-bootcamp',
      prerequisites: JSON.stringify(['Python 3.10+', 'Basic PyTorch & Neural Networks', 'REST API fundamentals']),
      objectives: JSON.stringify(['Build multi-agent state machines with LangGraph', 'Implement production RAG with hybrid search', 'Deploy self-correcting autonomous coding agents']),
      tags: JSON.stringify(['AI Agents', 'LangGraph', 'RAG', 'LLMOps', 'PyTorch']),
      targetAudience: 'Senior Software Engineers, Data Scientists & AI Engineers looking to build production-grade agentic systems.',
      thumbnailGradient: 'from-purple-900 via-indigo-950 to-slate-950',
      recordingAvailable: true,
      attendanceTracking: true,
      visibility: 'PUBLIC'
    }
  });

  const liveCourse2 = await prisma.liveCourse.upsert({
    where: { id: 'live-course-nextjs' },
    update: {},
    create: {
      id: 'live-course-nextjs',
      title: 'Full-Stack Next.js 15 & Real-Time Distributed Systems',
      slug: 'nextjs-15-live-masterclass',
      shortDescription: 'Build scalable web architectures with App Router, Server Actions, WebSockets, and Edge Caching.',
      description: 'Master server components, streaming SSR, PostgreSQL optimization, micro-frontends, and distributed state management.',
      category: 'Web Development',
      level: 'Intermediate',
      duration: '4 Weeks (8 Live Sessions)',
      startDate: new Date('2026-09-15T18:00:00Z'),
      endDate: new Date('2026-10-15T20:00:00Z'),
      timezone: 'Asia/Kolkata (IST)',
      totalSessions: 4,
      maxStudents: 50,
      enrolledCount: 28,
      status: 'DRAFT',
      leadInstructorId: instructor.id,
      createdById: admin.id,
      meetingPlatform: 'Google Meet',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      prerequisites: JSON.stringify(['React 18/19 basics', 'JavaScript ES6+', 'Basic TypeScript']),
      objectives: JSON.stringify(['Master Next.js App Router & Server Actions', 'Implement distributed real-time caching', 'Deploy on Vercel & AWS']),
      tags: JSON.stringify(['Next.js', 'React 19', 'TypeScript', 'TailwindCSS']),
      targetAudience: 'Full-Stack Developers and Frontend Engineers transitioning to enterprise Next.js.',
      thumbnailGradient: 'from-cyan-950 via-blue-950 to-slate-950',
      recordingAvailable: true,
      attendanceTracking: true,
      visibility: 'PUBLIC'
    }
  });

  // Seed Live Sessions for Course 1
  const session1 = await prisma.liveSession.upsert({
    where: { id: 'session-genai-1' },
    update: {},
    create: {
      id: 'session-genai-1',
      liveCourseId: liveCourse1.id,
      sessionNumber: 1,
      title: 'Transformer Attention Deep Dive & Scaled Dot-Product Math',
      description: 'Dissecting transformer architecture from theoretical matrix multiplication to PyTorch multi-head attention implementations.',
      date: new Date('2026-09-01T19:00:00Z'),
      startTime: '07:00 PM',
      endTime: '09:00 PM',
      timezone: 'Asia/Kolkata (IST)',
      duration: '120 min',
      status: 'SCHEDULED',
      meetingUrl: 'https://zoom.us/j/glarus-session-1',
      recordingStatus: 'unavailable',
      agenda: {
        create: [
          { title: 'Cohort Welcome & Curriculum Roadmap', description: 'Orientation, tools setup, and GPU environment checks.', startTime: '07:00 PM', endTime: '07:15 PM', duration: '15 min', order: 1 },
          { title: 'Mathematical Foundations of Self-Attention', description: 'Query, Key, Value tensor projections and scaled dot-product calculus.', startTime: '07:15 PM', endTime: '07:55 PM', duration: '40 min', order: 2 },
          { title: 'Mid-Session Break & Code Setup', description: 'Short break and cloning hands-on repo.', startTime: '07:55 PM', endTime: '08:05 PM', duration: '10 min', order: 3 },
          { title: 'Live PyTorch Coding: Multi-Head Attention', description: 'Building the Attention module from scratch with tensor batching.', startTime: '08:05 PM', endTime: '08:45 PM', duration: '40 min', order: 4 },
          { title: 'Interactive Q&A & Homework Overview', description: 'Live debugging with students and assignment briefing.', startTime: '08:45 PM', endTime: '09:00 PM', duration: '15 min', order: 5 }
        ]
      },
      topics: {
        create: [
          { title: 'Scaled Dot-Product Attention', description: 'Softmax normalization, masking for causal decoders.', order: 1 },
          { title: 'Multi-Head Projections', description: 'Linear transformations, dimension splitting, and concatenation.', order: 2 },
          { title: 'Positional Encodings', description: 'Sinusoidal vs learned rotary positional embeddings (RoPE).', order: 3 }
        ]
      },
      learningOutcomes: {
        create: [
          { title: 'Calculate self-attention matrix equations by hand', order: 1 },
          { title: 'Write production-ready PyTorch Attention layers', order: 2 },
          { title: 'Understand causal masking in auto-regressive models', order: 3 }
        ]
      },
      activities: {
        create: [
          { title: 'Attention Layer Pair Programming', instructions: 'Implement scaled dot-product attention in Google Colab with test vectors.', duration: '30 min', order: 1 }
        ]
      },
      resources: {
        create: [
          { title: 'Attention Is All You Need (Paper PDF)', type: 'PDF', url: 'https://arxiv.org/abs/1706.03762' },
          { title: 'Starter GitHub Repository', type: 'GITHUB', url: 'https://github.com/glarus-academy/transformers-from-scratch' }
        ]
      },
      homework: {
        create: [
          { title: 'Implement Rotary Positional Embedding (RoPE)', description: 'Extend the baseline attention module with RoPE and benchmark inference speed.', dueDate: '04 Sep 2026' }
        ]
      }
    }
  });

  const session2 = await prisma.liveSession.upsert({
    where: { id: 'session-genai-2' },
    update: {},
    create: {
      id: 'session-genai-2',
      liveCourseId: liveCourse1.id,
      sessionNumber: 2,
      title: 'Production RAG Architectures: Hybrid Search & BM25 Reranking',
      description: 'Designing resilient retrieval pipelines with vector databases, cross-encoder rerankers, and contextual compression.',
      date: new Date('2026-09-04T19:00:00Z'),
      startTime: '07:00 PM',
      endTime: '09:00 PM',
      timezone: 'Asia/Kolkata (IST)',
      duration: '120 min',
      status: 'SCHEDULED',
      meetingUrl: 'https://zoom.us/j/glarus-session-2',
      recordingStatus: 'unavailable',
      agenda: {
        create: [
          { title: 'RAG Pitfalls: Why Naive Vector Search Fails', description: 'Chunking boundary loss, embedding hallucinations, and out-of-domain queries.', startTime: '07:00 PM', endTime: '07:30 PM', duration: '30 min', order: 1 },
          { title: 'Hybrid Retrieval: Sparse (BM25) + Dense (Vector)', description: 'Reciprocal Rank Fusion (RRF) math and index synchronization.', startTime: '07:30 PM', endTime: '08:15 PM', duration: '45 min', order: 2 },
          { title: 'Break & Sandbox Refresh', description: 'Take a break and open Qdrant instance.', startTime: '08:15 PM', endTime: '08:25 PM', duration: '10 min', order: 3 },
          { title: 'Cross-Encoder Reranking in Python', description: 'Building low-latency Cohere / HuggingFace reranker wrappers.', startTime: '08:25 PM', endTime: '09:00 PM', duration: '35 min', order: 4 }
        ]
      }
    }
  });

  const session3 = await prisma.liveSession.upsert({
    where: { id: 'session-genai-3' },
    update: {},
    create: {
      id: 'session-genai-3',
      liveCourseId: liveCourse1.id,
      sessionNumber: 3,
      title: 'Stateful Multi-Agent Orchestration with LangGraph',
      description: 'Building cyclic graphs, agent supervisors, human-in-the-loop approvals, and checkpoint persistence.',
      date: new Date('2026-09-08T19:00:00Z'),
      startTime: '07:00 PM',
      endTime: '09:00 PM',
      timezone: 'Asia/Kolkata (IST)',
      duration: '120 min',
      status: 'SCHEDULED',
      meetingUrl: 'https://zoom.us/j/glarus-session-3',
      recordingStatus: 'unavailable'
    }
  });

  // Seed Session Assignments
  // Session 1 -> Dr. Sarah Chen with Edit Permissions
  await prisma.sessionAssignment.upsert({
    where: { id: 'assign-genai-s1' },
    update: {},
    create: {
      id: 'assign-genai-s1',
      sessionId: session1.id,
      liveCourseId: liveCourse1.id,
      instructorId: sarah.id,
      canView: true,
      canEdit: true,
      canEditAgenda: true,
      canEditSchedule: true,
      canEditResources: true,
      canAddHomework: true,
      canReschedule: true,
      canCancel: false,
      canManageAttendance: true,
      canManageRecording: true,
      assignedBy: 'Super Admin',
      assignedAt: new Date()
    }
  });

  // Session 2 -> John Doe with View Only (canEdit: false)
  await prisma.sessionAssignment.upsert({
    where: { id: 'assign-genai-s2' },
    update: {},
    create: {
      id: 'assign-genai-s2',
      sessionId: session2.id,
      liveCourseId: liveCourse1.id,
      instructorId: john.id,
      canView: true,
      canEdit: false,
      canEditAgenda: false,
      canEditSchedule: false,
      canEditResources: false,
      canAddHomework: false,
      canReschedule: false,
      canCancel: false,
      canManageAttendance: true,
      canManageRecording: false,
      assignedBy: 'Super Admin',
      assignedAt: new Date()
    }
  });

  // Session 3 -> Dr. Sarah Chen
  await prisma.sessionAssignment.upsert({
    where: { id: 'assign-genai-s3' },
    update: {},
    create: {
      id: 'assign-genai-s3',
      sessionId: session3.id,
      liveCourseId: liveCourse1.id,
      instructorId: sarah.id,
      canView: true,
      canEdit: true,
      canEditAgenda: true,
      canEditSchedule: false,
      canEditResources: true,
      canAddHomework: true,
      canReschedule: false,
      canCancel: false,
      canManageAttendance: true,
      canManageRecording: true,
      assignedBy: 'Super Admin',
      assignedAt: new Date()
    }
  });

  // Log to AuditLog
  await prisma.auditLog.create({
    data: {
      action: 'Admin seeded Live Training & Cohort Management System',
      details: 'Initialized LiveCourse, LiveSessions, Agendas, and Granular Instructor Assignments for Glarus Academy Live Training portal.',
      adminId: admin.id
    }
  });

  console.log("Seeded complete next-gen live training data!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
