import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seedStudents() {
  console.log('🌱 Seeding realistic Student Management database records...');
  const studentPassword = await bcrypt.hash('Student@123', 10);

  // 1. Get or create Instructor(s)
  let sarah = await prisma.user.findFirst({
    where: { email: 'sarah.chen@glarus.edu' }
  });
  if (!sarah) {
    sarah = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@glarus.edu',
        password: studentPassword,
        role: 'INSTRUCTOR',
        status: 'ACTIVE',
        bio: 'Lead AI Researcher & Senior Instructor at Glarus Academy.',
        location: 'Bengaluru, India'
      }
    });
  }

  let alex = await prisma.user.findFirst({
    where: { email: 'alex.chen@glarus.edu' }
  });
  if (!alex) {
    alex = await prisma.user.create({
      data: {
        name: 'Alex Chen',
        email: 'alex.chen@glarus.edu',
        password: studentPassword,
        role: 'INSTRUCTOR',
        status: 'ACTIVE',
        bio: 'Senior Full Stack & Machine Learning Engineer.',
        location: 'Singapore'
      }
    });
  }

  // 2. Ensure Core Courses exist
  const coursesToSeed = [
    {
      id: 'course-python-bootcamp',
      title: 'Python Bootcamp',
      description: 'Comprehensive Python programming from foundations to object-oriented and AI algorithms.',
      price: 6900,
      type: 'INSTRUCTOR_LED' as const,
      instructorId: sarah.id,
      category: 'Python & AI',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 12
    },
    {
      id: 'course-ml-masterclass',
      title: 'ML Engineering Masterclass',
      description: 'Applied machine learning pipelines, scikit-learn, PyTorch, model optimization, and deployment.',
      price: 5500,
      type: 'SELF_PACED' as const,
      instructorId: alex.id,
      category: 'Machine Learning',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 10
    },
    {
      id: 'course-react-masterclass',
      title: 'React Masterclass',
      description: 'Master React 19, Server Components, Zustand, and dynamic web applications.',
      price: 4999,
      type: 'SELF_PACED' as const,
      instructorId: alex.id,
      category: 'Frontend Development',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 8
    },
    {
      id: 'course-ui-ux-design',
      title: 'UI/UX Design Pro',
      description: 'Design thinking, Figma design systems, wireframing, and interactive design.',
      price: 3999,
      type: 'SELF_PACED' as const,
      instructorId: sarah.id,
      category: 'UI/UX Design',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 8
    },
    {
      id: 'course-ai-eng-adv',
      title: 'Advanced AI Engineering',
      description: 'Master LLMs, transformer architectures, vector databases, and autonomous AI agents.',
      price: 18999,
      type: 'INSTRUCTOR_LED' as const,
      instructorId: sarah.id,
      category: 'Generative AI',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 14
    },
    {
      id: 'course-autonomous-agents',
      title: 'Autonomous Agents',
      description: 'Building multi-agent autonomous graphs with LangGraph and OpenAI Swarm.',
      price: 6000,
      type: 'SELF_PACED' as const,
      instructorId: alex.id,
      category: 'Generative AI',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 6
    },
    {
      id: 'course-cloud-sysops',
      title: 'Cloud Computing & SysOps',
      description: 'Containerization, Kubernetes, AWS architectures, CI/CD, and site reliability engineering.',
      price: 7500,
      type: 'SELF_PACED' as const,
      instructorId: alex.id,
      category: 'Cloud & DevOps',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 10
    },
    {
      id: 'course-enterprise-systems',
      title: 'Enterprise System Design',
      description: 'High-throughput distributed systems, microservices, Kafka streaming, and caching layers.',
      price: 9999,
      type: 'SELF_PACED' as const,
      instructorId: sarah.id,
      category: 'System Architecture',
      status: 'PUBLISHED' as const,
      isPublished: true,
      totalModules: 12
    }
  ];

  for (const c of coursesToSeed) {
    const course = await prisma.course.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        price: c.price,
        type: c.type,
        status: c.status,
        isPublished: c.isPublished
      },
      create: {
        id: c.id,
        title: c.title,
        description: c.description,
        price: c.price,
        type: c.type,
        instructorId: c.instructorId,
        category: c.category,
        status: c.status,
        isPublished: c.isPublished
      }
    });

    // Ensure modules exist for module count tracking
    for (let m = 1; m <= c.totalModules; m++) {
      const modId = `${c.id}-mod-${m}`;
      await prisma.module.upsert({
        where: { id: modId },
        update: {},
        create: {
          id: modId,
          title: `Module ${m}: Core Concepts & Practice`,
          courseId: course.id,
          order: m
        }
      });
    }
  }

  // 3. Ensure a LiveCourse for Live Cohort demonstration exists
  const liveCourse = await prisma.liveCourse.upsert({
    where: { id: 'live-course-python' },
    update: {},
    create: {
      id: 'live-course-python',
      title: 'Python Bootcamp',
      shortDescription: 'Live Cohort Bootcamp covering Python, AI fundamentals, and production workflows.',
      description: 'Live interactive weekend classes with industry mentors.',
      price: 6900,
      status: 'ACTIVE',
      isPublished: true,
      leadInstructorId: sarah.id,
      category: 'Python & AI',
      duration: '6 Weeks',
      totalSessions: 12
    }
  });

  // Ensure an upcoming live session exists
  await prisma.liveSession.upsert({
    where: { id: 'live-session-python-1' },
    update: {},
    create: {
      id: 'live-session-python-1',
      liveCourseId: liveCourse.id,
      sessionNumber: 3,
      title: 'Advanced Data Structures & Object Oriented Architecture',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: '07:00 PM',
      endTime: '09:00 PM',
      duration: '120 min',
      status: 'SCHEDULED'
    }
  });

  // 4. Seed the 5 Students
  const studentsData = [
    {
      id: 'stu-1',
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      phone: '+91 98765 12340',
      location: 'Bengaluru, India',
      bio: 'AI Engineer & Full-stack learner passionate about LangGraph and modern autonomous systems.',
      avatar: 'AP',
      status: 'ACTIVE' as const,
      joinedAt: new Date('2026-01-10T09:00:00Z'),
      lastActive: new Date(Date.now() - 10 * 60 * 1000), // 10m ago
      courses: [
        {
          courseId: 'course-python-bootcamp',
          isLive: true,
          batchName: 'Weekend Live Batch A',
          nextSession: 'Sat, 07:00 PM',
          progress: 85,
          price: 6900,
          completedModules: 10,
          totalModules: 12,
          isCompleted: false
        },
        {
          courseId: 'course-ml-masterclass',
          isLive: false,
          progress: 60,
          price: 5500,
          completedModules: 6,
          totalModules: 10,
          isCompleted: false
        }
      ],
      assignments: [
        { title: 'Python Bootcamp — Module 1 Practical Project', score: 97, grade: 'Grade A', date: '10 Jan 2026', courseId: 'course-python-bootcamp' },
        { title: 'Python Bootcamp — Module 2 Practical Project', score: 88, grade: 'Grade A', date: '10 Jan 2026', courseId: 'course-python-bootcamp' },
        { title: 'Python Bootcamp — Module 3 Practical Project', score: 97, grade: 'Grade A', date: '10 Jan 2026', courseId: 'course-python-bootcamp' },
        { title: 'Python Bootcamp — Module 4 Practical Project', score: 88, grade: 'Grade A', date: '10 Jan 2026', courseId: 'course-python-bootcamp' },
        { title: 'Python Bootcamp — Module 5 Practical Project', score: 97, grade: 'Grade A', date: '10 Jan 2026', courseId: 'course-python-bootcamp' },
        { title: 'ML Engineering Masterclass — Module 1 Practical Project', score: 97, grade: 'Grade A', date: '05 Feb 2026', courseId: 'course-ml-masterclass' },
        { title: 'ML Engineering Masterclass — Module 2 Practical Project', score: 88, grade: 'Grade A', date: '05 Feb 2026', courseId: 'course-ml-masterclass' },
        { title: 'ML Engineering Masterclass — Module 3 Practical Project', score: 85, grade: 'Grade B+', date: '05 Feb 2026', courseId: 'course-ml-masterclass' },
      ],
      certificates: [
        { courseId: 'course-python-bootcamp', credentialId: 'GLARUS-PY-2026-AP01' }
      ]
    },
    {
      id: 'stu-2',
      name: 'Priya Nair',
      email: 'priya.nair@outlook.com',
      phone: '+91 98112 34567',
      location: 'Mumbai, India',
      bio: 'Product designer transitioning to frontend engineering and full-stack interactive web development.',
      avatar: 'PN',
      status: 'ACTIVE' as const,
      joinedAt: new Date('2026-02-12T11:00:00Z'),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      courses: [
        {
          courseId: 'course-react-masterclass',
          isLive: false,
          progress: 45,
          price: 4999,
          completedModules: 4,
          totalModules: 8,
          isCompleted: false
        },
        {
          courseId: 'course-ui-ux-design',
          isLive: false,
          progress: 90,
          price: 3999,
          completedModules: 7,
          totalModules: 8,
          isCompleted: false
        }
      ],
      assignments: [
        { title: 'React Masterclass — Component Hierarchy Project', score: 92, grade: 'Grade A', date: '15 Feb 2026', courseId: 'course-react-masterclass' },
        { title: 'UI/UX Design Pro — Design System Figma Prototype', score: 98, grade: 'Grade A+', date: '20 Feb 2026', courseId: 'course-ui-ux-design' },
      ],
      certificates: []
    },
    {
      id: 'stu-3',
      name: 'Lucas Martin',
      email: 'lucas.m@yahoo.com',
      phone: '+1 415 555 0198',
      location: 'San Francisco, USA',
      bio: 'Autonomous systems and multi-agent systems engineer building enterprise agents.',
      avatar: 'LM',
      status: 'ACTIVE' as const,
      joinedAt: new Date('2026-01-01T10:00:00Z'),
      lastActive: new Date(Date.now() - 42 * 60 * 1000), // 42m ago
      courses: [
        {
          courseId: 'course-ai-eng-adv',
          isLive: true,
          batchName: 'Agentic Cohort Alpha',
          nextSession: 'Sun, 08:00 PM',
          progress: 95,
          price: 18999,
          completedModules: 13,
          totalModules: 14,
          isCompleted: false
        },
        {
          courseId: 'course-autonomous-agents',
          isLive: false,
          progress: 80,
          price: 6000,
          completedModules: 5,
          totalModules: 6,
          isCompleted: false
        }
      ],
      assignments: [
        { title: 'Advanced AI Engineering — Multi-Agent Routing System', score: 99, grade: 'Grade A+', date: '20 Jan 2026', courseId: 'course-ai-eng-adv' },
        { title: 'Autonomous Agents — LangGraph Persistence Memory', score: 94, grade: 'Grade A', date: '10 Feb 2026', courseId: 'course-autonomous-agents' },
      ],
      certificates: [
        { courseId: 'course-autonomous-agents', credentialId: 'GLARUS-AGENTS-2026-LM01' }
      ]
    },
    {
      id: 'stu-4',
      name: 'Meera Gupta',
      email: 'meera.g@proton.me',
      phone: '+91 99887 76655',
      location: 'Hyderabad, India',
      bio: 'Cloud computing enthusiast and site reliability engineer.',
      avatar: 'MG',
      status: 'ACTIVE' as const, // Inactive > 5 days => dynamic 'At Risk'
      joinedAt: new Date('2026-02-15T14:30:00Z'),
      lastActive: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      courses: [
        {
          courseId: 'course-cloud-sysops',
          isLive: false,
          progress: 20,
          price: 7500,
          completedModules: 2,
          totalModules: 10,
          isCompleted: false
        }
      ],
      assignments: [
        { title: 'Cloud Computing — Terraform Infrastructure Automation', score: 78, grade: 'Grade B', date: '18 Feb 2026', courseId: 'course-cloud-sysops' },
      ],
      certificates: []
    },
    {
      id: 'stu-5',
      name: 'Vikram Malhotra',
      email: 'vikram.m@techcorp.in',
      phone: '+91 97766 55443',
      location: 'Delhi, India',
      bio: 'Backend architect specializing in enterprise microservices.',
      avatar: 'VM',
      status: 'BLOCKED' as const,
      joinedAt: new Date('2026-03-02T16:00:00Z'),
      lastActive: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      courses: [
        {
          courseId: 'course-enterprise-systems',
          isLive: false,
          progress: 10,
          price: 9999,
          completedModules: 1,
          totalModules: 12,
          isCompleted: false
        }
      ],
      assignments: [
        { title: 'Enterprise System Design — Event-Driven Architecture with Kafka', score: 65, grade: 'Grade C+', date: '04 Mar 2026', courseId: 'course-enterprise-systems' },
      ],
      certificates: []
    }
  ];

  for (const s of studentsData) {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        phone: s.phone,
        location: s.location,
        bio: s.bio,
        avatar: s.avatar,
        status: s.status,
        updatedAt: s.lastActive
      },
      create: {
        id: s.id,
        name: s.name,
        email: s.email,
        password: studentPassword,
        phone: s.phone,
        location: s.location,
        bio: s.bio,
        avatar: s.avatar,
        status: s.status,
        role: 'STUDENT',
        createdAt: s.joinedAt,
        updatedAt: s.lastActive
      }
    });

    // Record user activity for last active tracking
    for (const c of s.courses) {
      await prisma.userActivity.upsert({
        where: { userId_courseId: { userId: user.id, courseId: c.courseId } },
        update: {
          updatedAt: s.lastActive,
          accessedAt: s.lastActive
        },
        create: {
          userId: user.id,
          courseId: c.courseId,
          lastLectureTitle: 'Module Practical Review',
          lastTimestamp: 120,
          totalSeconds: 3600,
          accessedAt: s.lastActive,
          updatedAt: s.lastActive
        }
      });

      // Self-paced enrollment
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: user.id, courseId: c.courseId } },
        update: {
          progress: c.progress,
          isCompleted: c.isCompleted
        },
        create: {
          userId: user.id,
          courseId: c.courseId,
          progress: c.progress,
          isCompleted: c.isCompleted,
          createdAt: s.joinedAt
        }
      });

      // Live course enrollment if live
      if (c.isLive) {
        await prisma.liveCourseEnrollment.upsert({
          where: { userId_liveCourseId: { userId: user.id, liveCourseId: liveCourse.id } },
          update: {
            batchName: (c as any).batchName || 'Weekend Live Batch A',
            progress: c.progress
          },
          create: {
            userId: user.id,
            liveCourseId: liveCourse.id,
            batchName: (c as any).batchName || 'Weekend Live Batch A',
            progress: c.progress,
            status: 'ACTIVE',
            enrolledAt: s.joinedAt
          }
        });
      }

      // Purchase & Invoice
      const txnId = `TXN_${user.id.toUpperCase()}_${c.courseId.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
      const purchase = await prisma.purchase.upsert({
        where: { transactionId: txnId },
        update: {
          amount: c.price,
          paymentStatus: 'COMPLETED'
        },
        create: {
          userId: user.id,
          courseId: c.courseId,
          amount: c.price,
          currency: 'INR',
          paymentMethod: 'Online Payment',
          transactionId: txnId,
          paymentStatus: 'COMPLETED',
          createdAt: s.joinedAt
        }
      });

      await prisma.invoice.upsert({
        where: { purchaseId: purchase.id },
        update: {},
        create: {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${user.id.slice(-3)}`,
          purchaseId: purchase.id,
          subtotal: Math.round(c.price * 0.82),
          taxAmount: Math.round(c.price * 0.18),
          totalAmount: c.price,
          billingName: user.name,
          billingEmail: user.email,
          gstin: '29AAACG1234F1Z5',
          issuedAt: s.joinedAt
        }
      });
    }

    // Seed assignments & submissions
    for (const [idx, asg] of s.assignments.entries()) {
      const assignmentId = `asg-${asg.courseId}-${idx + 1}`;
      const course = coursesToSeed.find((x) => x.id === asg.courseId);
      const instructorName = course?.instructorId === sarah.id ? sarah.name : alex.name;

      await prisma.assignment.upsert({
        where: { id: assignmentId },
        update: {
          title: asg.title,
          courseId: asg.courseId
        },
        create: {
          id: assignmentId,
          title: asg.title,
          description: `Practical implementation and assessment for ${course?.title}.`,
          moduleName: `Module ${idx + 1} Assessment`,
          courseId: asg.courseId,
          totalMarks: 100,
          pointsLabel: '100 Pts',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      await prisma.assignmentSubmission.upsert({
        where: { assignmentId_userId: { assignmentId, userId: user.id } },
        update: {
          scoreNumeric: asg.score,
          scoreLabel: `${asg.score}/100`,
          status: 'GRADED',
          feedback: `Evaluated by ${instructorName}. Excellent comprehension of key objectives.`
        },
        create: {
          assignmentId,
          userId: user.id,
          status: 'GRADED',
          scoreNumeric: asg.score,
          scoreLabel: `${asg.score}/100`,
          feedback: `Evaluated by ${instructorName}. Excellent comprehension of key objectives.`,
          submittedAt: new Date(s.joinedAt.getTime() + (idx + 1) * 3 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Seed certificates
    for (const cert of s.certificates) {
      await prisma.certificate.upsert({
        where: { userId_courseId: { userId: user.id, courseId: cert.courseId } },
        update: { credentialId: cert.credentialId },
        create: {
          userId: user.id,
          courseId: cert.courseId,
          credentialId: cert.credentialId,
          issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          certificateUrl: `/api/student/certificates/${cert.credentialId}/download`
        }
      });
    }
  }

  console.log('✅ Successfully seeded all 5 realistic students with complete relational records!');
}

seedStudents()
  .catch((e) => {
    console.error('Error seeding students:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
