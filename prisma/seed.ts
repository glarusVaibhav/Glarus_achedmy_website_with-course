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

  console.log("Seeded complete next-gen dashboard data!")
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
