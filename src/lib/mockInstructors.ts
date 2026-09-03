export interface InstructorCreatedCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "SELF_PACED" | "INSTRUCTOR_LED";
  status: "APPROVED" | "PENDING" | "REJECTED";
  modulesCount: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface InstructorLiveAssignment {
  id: string;
  courseTitle: string;
  cohortName: string;
  sessionTitle: string;
  sessionNumber: number;
  date: string;
  time: string;
  meetingPlatform: string;
  meetingUrl?: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  permissions: {
    canEditAgenda: boolean;
    canManageAttendance: boolean;
    canManageRecording: boolean;
    canAddHomework: boolean;
  };
}

export interface DetailedInstructorItem {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar: string;
  photoUrl?: string;
  location?: string;
  rating: number;
  verificationStatus: "VERIFIED" | "PENDING" | "CHANGES_REQUESTED" | "REJECTED";
  accountStatus: "Active" | "Inactive" | "Suspended";
  joinedDate: string;
  version: number;
  feedback?: string;

  // Submitted Form Fields
  experience: string;
  teachingLanguages: string[];
  skills: string[];
  areasOfExpertise: string;
  opportunitySource?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  teachingVideoType?: "LINK" | "UPLOAD";
  teachingVideoUrl?: string;
  teachingVideoFileName?: string;
  aboutInstructor?: string;
  bio?: string;
  courseTeachingPlan: string;
  whyGlarusAcademy?: string;
  teachesOnOtherPlatforms: boolean;
  otherPlatformDetails?: string;

  // Assigned & Created Courses
  createdCourses: InstructorCreatedCourse[];
  assignedLiveCohorts: InstructorLiveAssignment[];
  assignedTasksCount: number;
  liveSessionsCount: number;
}

export const MOCK_INSTRUCTORS_DETAILED: DetailedInstructorItem[] = [
  {
    id: "inst-1",
    name: "Dr. Sarah Chen",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@glarus.edu",
    phone: "+91 98765 43210",
    avatar: "SC",
    location: "Bengaluru, India & San Francisco, USA",
    rating: 4.9,
    verificationStatus: "VERIFIED",
    accountStatus: "Active",
    joinedDate: "15 Jan 2026",
    version: 2,
    feedback: "Approved. Credentials verified with Stanford AI Lab & Meta AI publication index.",

    experience: "8+ years in Machine Learning & Autonomous Agent Engineering at Stanford & Meta AI.",
    teachingLanguages: ["English", "Hindi"],
    skills: ["Agentic AI", "PyTorch", "Autonomous Systems", "RAG", "LangGraph", "Vector DBs"],
    areasOfExpertise: "Large Language Models, Production Multi-Agent Workflows & Fine-Tuning",
    opportunitySource: "LinkedIn",
    resumeUrl: "https://glarus.edu/resumes/sarah_chen.pdf",
    resumeFileName: "Dr_Sarah_Chen_Curriculum_Vitae.pdf",
    teachingVideoType: "LINK",
    teachingVideoUrl: "https://youtube.com/watch?v=agentic-ai-demo-sarah",
    aboutInstructor: "Lead AI Researcher & Instructor with over 15 published research papers at NeurIPS, ICML, and CVPR. Passionate about empowering the next generation of AI architects with production-grade tooling.",
    bio: "Lead AI Researcher & Instructor with over 15 published research papers.",
    courseTeachingPlan: "1. Foundations of Agentic AI & Tool-calling architectures\n2. Multi-Agent state graphs with LangGraph & AutoGen\n3. Self-healing RAG pipelines with Qdrant vector retrieval\n4. Capstone: Deploying a 24/7 Autonomous Code-Review Agent",
    whyGlarusAcademy: "Glarus Academy's hyper-focus on cutting-edge generative AI and hands-on cohort engineering provides the exact environment needed to teach high-impact, real-world skills.",
    teachesOnOtherPlatforms: true,
    otherPlatformDetails: "Guest Lecturer at Stanford Online & Coursera ML Specialization (40,000+ alumni).",

    createdCourses: [
      {
        id: "c-sarah-1",
        title: "Advanced AI Agents & Multi-Agent Swarms",
        description: "Master autonomous agent architectures, planning algorithms, and multi-agent coordination.",
        price: 8999,
        type: "INSTRUCTOR_LED",
        status: "APPROVED",
        modulesCount: 8,
        rating: 4.95,
        reviewsCount: 142,
        createdAt: "20 Jan 2026"
      },
      {
        id: "c-sarah-2",
        title: "Autonomous Workflows with LangGraph",
        description: "Build robust stateful multi-actor agent workflows with cyclic graphs and persistence.",
        price: 4999,
        type: "SELF_PACED",
        status: "APPROVED",
        modulesCount: 6,
        rating: 4.88,
        reviewsCount: 89,
        createdAt: "02 Feb 2026"
      }
    ],
    assignedLiveCohorts: [
      {
        id: "la-1",
        courseTitle: "FAANG AI Cohort 4 (Live)",
        cohortName: "Weekend Live Batch Alpha",
        sessionTitle: "Session 4: LangGraph Multi-Agent Architecture",
        sessionNumber: 4,
        date: "28 Feb 2026",
        time: "07:00 PM - 09:00 PM IST",
        meetingPlatform: "Zoom",
        meetingUrl: "https://zoom.us/j/9812739123",
        status: "SCHEDULED",
        permissions: {
          canEditAgenda: true,
          canManageAttendance: true,
          canManageRecording: true,
          canAddHomework: true
        }
      },
      {
        id: "la-2",
        courseTitle: "Autonomous Agents Masterclass",
        cohortName: "LangGraph Lab Alpha",
        sessionTitle: "Session 1: Agentic Loop & State Management",
        sessionNumber: 1,
        date: "Today",
        time: "07:00 PM - 09:00 PM IST",
        meetingPlatform: "Google Meet",
        meetingUrl: "https://meet.google.com/xyz-qwer-abc",
        status: "LIVE",
        permissions: {
          canEditAgenda: true,
          canManageAttendance: true,
          canManageRecording: true,
          canAddHomework: true
        }
      }
    ],
    assignedTasksCount: 3,
    liveSessionsCount: 4
  },
  {
    id: "inst-2",
    name: "Alex Chen",
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@glarus.edu",
    phone: "+91 98450 11223",
    avatar: "AC",
    location: "Hyderabad, India",
    rating: 4.8,
    verificationStatus: "PENDING",
    accountStatus: "Inactive",
    joinedDate: "Today, 10:20 AM",
    version: 1,
    feedback: "",

    experience: "5 years building LLM evaluation frameworks and LangChain/LlamaIndex production pipelines.",
    teachingLanguages: ["English"],
    skills: ["LangGraph", "Vector DBs", "RAG Pipelines", "FastAPI", "Python", "LlamaIndex"],
    areasOfExpertise: "RAG Architecture, Chunking Strategies & Enterprise AI Agents",
    opportunitySource: "Friend / Colleague",
    resumeUrl: "https://glarus.edu/resumes/alex_chen_cv.pdf",
    resumeFileName: "Alex_Chen_Staff_Engineer_CV.pdf",
    teachingVideoType: "LINK",
    teachingVideoUrl: "https://youtube.com/watch?v=alex-chen-rag-demo",
    aboutInstructor: "Senior AI Engineer passionate about hands-on production agent development. Built high-scale document query engines serving 2M+ queries per day.",
    bio: "Senior AI Engineer passionate about hands-on production agent development.",
    courseTeachingPlan: "Curriculum proposal for Advanced RAG Architecture: Hybrid keyword + dense vector search, reranking with Cohere, query decomposition, agentic query rewriting.",
    whyGlarusAcademy: "Want to teach a practical curriculum without fluff to serious AI engineers.",
    teachesOnOtherPlatforms: false,

    createdCourses: [
      {
        id: "c-alex-1",
        title: "Advanced RAG Architecture & Vector Search",
        description: "Enterprise retrieval systems with hybrid search, re-ranking, and metadata filtering.",
        price: 5999,
        type: "INSTRUCTOR_LED",
        status: "PENDING",
        modulesCount: 5,
        rating: 4.8,
        reviewsCount: 12,
        createdAt: "Today"
      }
    ],
    assignedLiveCohorts: [
      {
        id: "la-3",
        courseTitle: "Generative AI Bootcamp (Live)",
        cohortName: "Weekday Evening Cohort",
        sessionTitle: "Session 2: Semantic Search & Vector Embeddings",
        sessionNumber: 2,
        date: "Tomorrow",
        time: "08:00 PM - 10:00 PM IST",
        meetingPlatform: "Zoom",
        meetingUrl: "https://zoom.us/j/8127391823",
        status: "SCHEDULED",
        permissions: {
          canEditAgenda: true,
          canManageAttendance: true,
          canManageRecording: false,
          canAddHomework: true
        }
      }
    ],
    assignedTasksCount: 2,
    liveSessionsCount: 1
  },
  {
    id: "inst-3",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@glarus.edu",
    phone: "+91 91234 56780",
    avatar: "JD",
    location: "Pune, India",
    rating: 4.7,
    verificationStatus: "VERIFIED",
    accountStatus: "Active",
    joinedDate: "02 Feb 2026",
    version: 1,

    experience: "6 years Senior React Engineer at Stripe & active contributor to Next.js ecosystem.",
    teachingLanguages: ["English", "Marathi"],
    skills: ["React 19", "Next.js 14", "TypeScript", "TailwindCSS", "Zustand", "GraphQL"],
    areasOfExpertise: "Modern Fullstack Frontend Systems & Server Components",
    opportunitySource: "Job Portal / Job Board",
    resumeUrl: "https://glarus.edu/resumes/john_doe.pdf",
    resumeFileName: "John_Doe_Frontend_Architect.pdf",
    teachingVideoType: "LINK",
    teachingVideoUrl: "https://youtube.com/watch?v=react-19-server-actions-john",
    aboutInstructor: "Frontend architect teaching modern full-stack web engineering, component patterns, and server actions.",
    bio: "Frontend architect teaching modern full-stack web engineering.",
    courseTeachingPlan: "React 19 deep dive: Server Actions, optimistic UI, Suspense boundaries, streaming architecture.",
    whyGlarusAcademy: "Great platform with motivated students looking for advanced architectural depth.",
    teachesOnOtherPlatforms: true,
    otherPlatformDetails: "Author of popular React patterns newsletter with 15k subscribers.",

    createdCourses: [
      {
        id: "c-john-1",
        title: "React 19 Masterclass: Architecture to Production",
        description: "Master React Server Components, Actions, and high-performance fullstack apps.",
        price: 3499,
        type: "SELF_PACED",
        status: "APPROVED",
        modulesCount: 12,
        rating: 4.75,
        reviewsCount: 78,
        createdAt: "05 Feb 2026"
      },
      {
        id: "c-john-2",
        title: "TypeScript for High-Scale Enterprise",
        description: "Advanced generic programming, type gymnastics, and robust enterprise patterns.",
        price: 2999,
        type: "SELF_PACED",
        status: "APPROVED",
        modulesCount: 8,
        rating: 4.68,
        reviewsCount: 45,
        createdAt: "14 Feb 2026"
      }
    ],
    assignedLiveCohorts: [
      {
        id: "la-4",
        courseTitle: "Full-Stack Web Immersion (Live)",
        cohortName: "Cohort 2026-B",
        sessionTitle: "Session 6: Server Actions & Cache Tag Revalidation",
        sessionNumber: 6,
        date: "04 Mar 2026",
        time: "06:30 PM - 08:30 PM IST",
        meetingPlatform: "Zoom",
        status: "SCHEDULED",
        permissions: {
          canEditAgenda: true,
          canManageAttendance: true,
          canManageRecording: true,
          canAddHomework: true
        }
      }
    ],
    assignedTasksCount: 1,
    liveSessionsCount: 2
  },
  {
    id: "inst-4",
    name: "Bob Smith",
    firstName: "Bob",
    lastName: "Smith",
    email: "b.smith@glarus.edu",
    phone: "+91 99887 76655",
    avatar: "BS",
    location: "Chennai, India",
    rating: 3.2,
    verificationStatus: "REJECTED",
    accountStatus: "Suspended",
    joinedDate: "12 Mar 2026",
    version: 1,
    feedback: "Application rejected due to incomplete teaching demonstration and lack of verified production experience.",

    experience: "2 years junior instructor teaching basic HTML/CSS.",
    teachingLanguages: ["English", "Tamil"],
    skills: ["HTML", "CSS", "Basic JavaScript", "Web Basics"],
    areasOfExpertise: "Web Fundamentals & Responsive UI Layouts",
    opportunitySource: "Online Search / Google",
    resumeUrl: "https://glarus.edu/resumes/bob_smith.pdf",
    resumeFileName: "Bob_Smith_CV.pdf",
    teachingVideoType: "LINK",
    teachingVideoUrl: "https://youtube.com/watch?v=sample-video",
    aboutInstructor: "Web fundamentals educator.",
    bio: "Web fundamentals educator.",
    courseTeachingPlan: "HTML/CSS basics.",
    whyGlarusAcademy: "To teach beginner courses.",
    teachesOnOtherPlatforms: false,

    createdCourses: [],
    assignedLiveCohorts: [],
    assignedTasksCount: 0,
    liveSessionsCount: 0
  }
];

export function getDetailedInstructorById(id: string): DetailedInstructorItem | undefined {
  return MOCK_INSTRUCTORS_DETAILED.find((i) => i.id === id || i.email === id);
}
