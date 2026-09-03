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

  // Upsert Student (Demo User)
  const student = await prisma.user.upsert({
    where: { email: 'arun.sharma@gmail.com' },
    update: {},
    create: {
      email: 'arun.sharma@gmail.com',
      name: 'Arun Sharma',
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
      status: "APPROVED",
      type: "SELF_PACED"
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
      status: "APPROVED",
      type: "SELF_PACED"
    }
  });

  const courseFlagship = await prisma.course.upsert({
    where: { id: "Generative_AI_Application_Engineer" },
    update: {},
    create: {
      id: "Generative_AI_Application_Engineer",
      title: "Generative AI Application Engineering",
      description: "Complete hands-on enterprise LLM and agentic system architecture.",
      price: 15999,
      instructorId: instructor.id,
      status: "APPROVED",
      type: "SELF_PACED"
    }
  });

  // Add Curriculum to Course 3
  const module1 = await prisma.module.upsert({
    where: { id: "module-1" },
    update: {},
    create: {
      id: "module-1",
      title: "Getting Started with ML",
      courseId: course3.id,
      order: 1,
    }
  });

  const lec1 = await prisma.lecture.upsert({
    where: { id: "lec-1" },
    update: {},
    create: {
      id: "lec-1",
      moduleId: module1.id,
      title: "What is Machine Learning?",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      order: 1
    }
  });

  // Completed self-paced course for certificate demo
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

  // Enroll demo student into Course 1, Course 3, Flagship, and Completed Course
  for (const cId of [course1.id, course3.id, courseFlagship.id]) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: cId } },
      update: {},
      create: { userId: student.id, courseId: cId, progress: 78 }
    });
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: completedCourse.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: completedCourse.id,
      progress: 100,
      isCompleted: true,
    }
  });

  // Issue a verified certificate for the completed course
  await prisma.certificate.upsert({
    where: { userId_courseId: { userId: student.id, courseId: completedCourse.id } },
    update: { credentialId: "GA-CERT-2026-ARUN01" },
    create: {
      userId: student.id,
      courseId: completedCourse.id,
      credentialId: "GA-CERT-2026-ARUN01",
      issueDate: new Date(),
      certificateUrl: "/api/student/certificates/GA-CERT-2026-ARUN01/download"
    }
  });

  // Video Progress for demo student
  await prisma.videoProgress.upsert({
    where: { userId_lectureId: { userId: student.id, lectureId: "lec-1" } },
    update: {},
    create: {
      userId: student.id,
      lectureId: "lec-1",
      progressSeconds: 3600,
      isCompleted: true
    }
  });

  // UserActivity (Streak & Continue learning)
  await prisma.userActivity.upsert({
    where: { userId_courseId: { userId: student.id, courseId: courseFlagship.id } },
    update: { updatedAt: new Date() },
    create: {
      userId: student.id,
      courseId: courseFlagship.id,
      lastLectureTitle: "Module 4: RAG & Vector DBs",
      lastTimestamp: 45.5,
      totalSeconds: 7200,
      updatedAt: new Date()
    }
  });

  await prisma.userActivity.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course3.id } },
    update: { updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    create: {
      userId: student.id,
      courseId: course3.id,
      lastLectureTitle: "What is Machine Learning?",
      lastTimestamp: 45.5,
      totalSeconds: 3600,
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
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
    { message: "Welcome to Glarus Academy! Start your AI engineering journey.", type: "WELCOME" },
    { message: "New live session starting soon: Transformer Attention Deep Dive", type: "CLASS" },
    { message: "Congratulations! You earned the '3-Day Streak' badge!", type: "ACHIEVEMENT" },
    { message: "Your verified certificate for Python Fundamentals Bootcamp is ready!", type: "CERTIFICATE" },
  ];

  for (const notif of notifData) {
    const exists = await prisma.notification.findFirst({
      where: { recipientId: student.id, message: notif.message }
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          recipientId: student.id,
          title: notif.type,
          message: notif.message,
          category: 'STUDENT',
          type: 'SYSTEM_ANNOUNCEMENT',
        }
      });
    }
  }

  // Seed instructors
  const sarahPassword = await bcrypt.hash('Sarah@123', 10);
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

  // Live Course Cohort 1
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
      price: 19999,
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
      prerequisites: 'Python 3.10+, PyTorch installed, basic Linear Algebra & Matrix Calculus',
      objectives: 'Build multi-agent state machines with LangGraph, deploy production RAG, master LLMOps',
      tags: 'AI Agents, LangGraph, RAG, LLMOps, PyTorch',
      targetAudience: 'Senior Software Engineers, Data Scientists & AI Engineers looking to build production-grade agentic systems.',
      thumbnailGradient: 'from-purple-900 via-indigo-950 to-slate-950',
      recordingAvailable: true,
      attendanceTracking: true,
      visibility: 'PUBLIC'
    }
  });

  // Enroll demo student in Live Course
  await prisma.liveCourseEnrollment.upsert({
    where: { userId_liveCourseId: { userId: student.id, liveCourseId: liveCourse1.id } },
    update: { status: 'ACTIVE' },
    create: {
      userId: student.id,
      liveCourseId: liveCourse1.id,
      batchName: 'Weekend AI Class #4',
      status: 'ACTIVE',
      progress: 50
    }
  });

  // Seed Live Sessions for Course 1
  // Session 1: ONGOING right now
  const session1 = await prisma.liveSession.upsert({
    where: { id: 'session-genai-1' },
    update: {
      date: new Date(Date.now() - 15 * 60 * 1000), // started 15 min ago
      status: 'LIVE'
    },
    create: {
      id: 'session-genai-1',
      liveCourseId: liveCourse1.id,
      sessionNumber: 1,
      title: 'Deep Learning & Neural Network Architecture (Live Workshop)',
      description: 'Hands-on deep dive into transformer attention mechanisms and custom PyTorch neural networks.',
      date: new Date(Date.now() - 15 * 60 * 1000),
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      timezone: 'Asia/Kolkata (IST)',
      duration: '120 min',
      status: 'LIVE',
      meetingId: '7b8f4a21-5c91-4e32-9a77-123456789abc',
      meetingPasscode: 'Kx82PmQ1',
      meetingUrl: 'https://zoom.us/j/sample-ongoing-live-class',
      recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      recordingStatus: 'available',
      agenda: {
        create: [
          { title: 'Neural Network Foundations & Multilayer Perceptrons', description: 'Orientation, tools setup, and GPU environment checks.', startTime: '10:00 AM', endTime: '10:15 AM', duration: '15 min', order: 1 },
          { title: 'Custom Loss Functions, Gradient Descent & Backprop Calculus', description: 'Query, Key, Value tensor projections and scaled dot-product calculus.', startTime: '10:15 AM', endTime: '10:40 AM', duration: '25 min', order: 2 },
          { title: 'Live PyTorch Implementation: Deep Feedforward & Residual Layers', description: 'Building the Attention module from scratch with tensor batching.', startTime: '10:40 AM', endTime: '11:20 AM', duration: '40 min', order: 3 },
          { title: 'Regularization Strategies: Dropout, BatchNorm & Gradient Clipping', description: 'Techniques for stabilizing gradient propagation.', startTime: '11:20 AM', endTime: '11:45 AM', duration: '25 min', order: 4 },
          { title: 'Live Debugging, Q&A & Hands-On Homework Assignment', description: 'Live debugging with students and assignment briefing.', startTime: '11:45 AM', endTime: '12:00 PM', duration: '15 min', order: 5 }
        ]
      },
      learningOutcomes: {
        create: [
          { title: 'Build and train multi-layer perceptron neural nets from scratch in PyTorch', order: 1 },
          { title: 'Implement and debug backpropagation algorithms with custom loss metrics', order: 2 },
          { title: 'Master regularization to prevent overfitting in production AI models', order: 3 }
        ]
      }
    }
  });

  // Session 2: UPCOMING today in 2.5 hours
  await prisma.liveSession.upsert({
    where: { id: 'session-genai-2' },
    update: {
      date: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      status: 'SCHEDULED',
      meetingId: '8c9e5b32-6d02-4f43-ab88-234567890bcd',
      meetingPasscode: 'Lz93QnB2'
    },
    create: {
      id: 'session-genai-2',
      liveCourseId: liveCourse1.id,
      sessionNumber: 2,
      title: 'RAG Indexing, Vector Databases & LangChain Agents',
      description: 'Designing resilient retrieval pipelines with vector databases, cross-encoder rerankers, and contextual compression.',
      date: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      timezone: 'Asia/Kolkata (IST)',
      duration: '90 min',
      status: 'SCHEDULED',
      meetingId: '8c9e5b32-6d02-4f43-ab88-234567890bcd',
      meetingPasscode: 'Lz93QnB2',
      meetingUrl: 'https://zoom.us/j/sample-upcoming-live-class',
      recordingStatus: 'unavailable',
      agenda: {
        create: [
          { title: 'Production RAG Architecture & Semantic Search Fundamentals', duration: '20 mins', order: 1 },
          { title: 'High-Performance Document Chunking & Embedding Strategies', duration: '20 mins', order: 2 },
          { title: 'Vector Database Integration: Pinecone, Qdrant & Hybrid Indexing', duration: '25 mins', order: 3 },
          { title: 'Autonomous Agent Orchestration with LangChain & Memory Tools', duration: '15 mins', order: 4 },
          { title: 'Live Interactive Q&A, Latency Tuning & Code Review', duration: '10 mins', order: 5 }
        ]
      },
      learningOutcomes: {
        create: [
          { title: 'Design production-grade Retrieval-Augmented Generation (RAG) pipelines', order: 1 },
          { title: 'Perform hybrid vector search with BM25 reranking for high accuracy', order: 2 },
          { title: 'Deploy conversational AI agents with tool-calling and persistent state', order: 3 }
        ]
      }
    }
  });

  // Seed Live Attendance for demo student
  await prisma.liveSessionAttendance.upsert({
    where: { sessionId_userId: { sessionId: session1.id, userId: student.id } },
    update: {},
    create: {
      sessionId: session1.id,
      userId: student.id,
      status: 'PRESENT',
      durationMinutes: 90,
      joinedAt: new Date(Date.now() - 15 * 60 * 1000)
    }
  });

  // Seed Recording Progress for demo student
  await prisma.sessionRecordingProgress.upsert({
    where: { sessionId_userId: { sessionId: session1.id, userId: student.id } },
    update: {},
    create: {
      sessionId: session1.id,
      userId: student.id,
      secondsWatched: 4178,
      totalDurationSeconds: 6120,
      percent: 68,
      status: 'IN_PROGRESS',
      resumeTimestampSeconds: 4178
    }
  });

  // Seed Assignments for demo student
  const asg1 = await prisma.assignment.upsert({
    where: { id: 'asg-demo-1' },
    update: {},
    create: {
      id: 'asg-demo-1',
      liveCourseId: liveCourse1.id,
      title: 'Building an Autonomous Research Agent with LangGraph',
      description: 'Implement a cyclical multi-agent graph with supervisor routing and persistent SQLite checkpointing in Python.',
      moduleName: 'Module 6: Multi-Agent Graphs & Workflows',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      pointsLabel: '100 Pts',
      instructions: [
        'Use LangGraph with StateGraph to construct supervisor and worker agents.',
        'Integrate Tavily or SerpAPI tool nodes for live web retrieval.',
        'Implement thread memory and checkpoint resumption.'
      ]
    }
  });

  const asg2 = await prisma.assignment.upsert({
    where: { id: 'asg-demo-2' },
    update: {},
    create: {
      id: 'asg-demo-2',
      liveCourseId: liveCourse1.id,
      title: 'Custom PyTorch Loss & Transformer Block Implementation',
      description: 'Implement scaled dot-product multi-head attention with causal masking, LayerNorm, and RoPE positional encodings in PyTorch.',
      moduleName: 'Module 3: Transformer Deep-Dive',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      totalMarks: 100,
      pointsLabel: '100 Pts'
    }
  });

  // Seed Submissions for demo student
  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId: asg1.id, userId: student.id } },
    update: {},
    create: {
      assignmentId: asg1.id,
      userId: student.id,
      status: 'IN_REVIEW',
      githubUrl: 'https://github.com/arun-sharma/autonomous-research-agent-langgraph',
      liveUrl: 'https://langgraph-agent.demo.glarus.ai',
      fileName: 'research_agent_architecture.pdf',
      notes: 'Implemented supervisor routing with Tavily web search and SQLite persistent memory.',
    }
  });

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId: asg2.id, userId: student.id } },
    update: {},
    create: {
      assignmentId: asg2.id,
      userId: student.id,
      status: 'GRADED',
      scoreNumeric: 98,
      scoreLabel: '98/100',
      feedback: 'Outstanding work! Your RoPE vector rotation and causal mask tensors are cleanly vectorized with zero CPU bottlenecks.',
      githubUrl: 'https://github.com/arun-sharma/pytorch-transformer-from-scratch',
      fileName: 'transformer_blocks_submission.zip',
      gradedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  // Seed Purchase and Invoice for demo student
  const purchase = await prisma.purchase.upsert({
    where: { transactionId: 'TXN_ARUN_DEMO_01' },
    update: {},
    create: {
      userId: student.id,
      courseId: courseFlagship.id,
      amount: 15999,
      currency: 'INR',
      paymentMethod: 'Credit Card (•••• 4242)',
      transactionId: 'TXN_ARUN_DEMO_01',
      paymentStatus: 'COMPLETED'
    }
  });

  await prisma.invoice.upsert({
    where: { purchaseId: purchase.id },
    update: {},
    create: {
      invoiceNumber: 'INV-2026-0801',
      purchaseId: purchase.id,
      subtotal: 13558,
      taxAmount: 2441,
      totalAmount: 15999,
      billingName: 'Arun Sharma',
      billingEmail: 'arun.sharma@gmail.com',
      gstin: '29AAACG1234F1Z5',
      issuedAt: new Date()
    }
  });

  // Initialize global settings
  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      platformName: "Glarus Academy",
      currency: "INR",
      commissionPercent: 15.0,
    }
  });

  console.log("Seeded complete demo student data for arun.sharma@gmail.com!");
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
