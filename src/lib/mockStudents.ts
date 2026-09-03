export interface EnrolledCourseItem {
  id: string;
  title: string;
  progress: number;
  enrolledDate: string;
  completed: boolean;
  type: "LIVE" | "SELF_PACED";
  batchName?: string;
  nextSession?: string;
  price?: number;
  assignmentsCount?: number;
  assignmentsScoreAvg?: number;
  instructorName?: string;
  category?: string;
  totalModules?: number;
  completedModules?: number;
}

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  enrolledCourses: EnrolledCourseItem[];
  totalSpent: number;
  assignmentsSubmitted: number;
  quizScoreAvg: number;
  certificatesEarned: number;
  lastActive: string;
  status: "Active" | "At Risk" | "Blocked";
  joinedDate: string;
  bio?: string;
  location?: string;
}

export const MOCK_STUDENTS: StudentItem[] = [
  {
    id: "stu-1",
    name: "Aarav Patel",
    email: "aarav.patel@gmail.com",
    phone: "+91 98765 12340",
    avatar: "AP",
    bio: "AI Engineer & Full-stack learner passionate about LangGraph and modern autonomous systems.",
    location: "Bengaluru, India",
    enrolledCourses: [
      {
        id: "c1",
        title: "Python Bootcamp",
        progress: 85,
        enrolledDate: "10 Jan 2026",
        completed: false,
        type: "LIVE",
        batchName: "Weekend Live Batch A",
        nextSession: "Sat, 07:00 PM",
        price: 6900,
        assignmentsCount: 5,
        assignmentsScoreAvg: 94,
        instructorName: "Dr. Sarah Chen",
        category: "Python & AI",
        totalModules: 12,
        completedModules: 10
      },
      {
        id: "c2",
        title: "ML Engineering Masterclass",
        progress: 60,
        enrolledDate: "05 Feb 2026",
        completed: false,
        type: "SELF_PACED",
        price: 5500,
        assignmentsCount: 3,
        assignmentsScoreAvg: 90,
        instructorName: "Alex Chen",
        category: "Machine Learning",
        totalModules: 10,
        completedModules: 6
      }
    ],
    totalSpent: 12400,
    assignmentsSubmitted: 8,
    quizScoreAvg: 92,
    certificatesEarned: 1,
    lastActive: "10m ago",
    status: "Active",
    joinedDate: "10 Jan 2026"
  },
  {
    id: "stu-2",
    name: "Priya Nair",
    email: "priya.nair@outlook.com",
    phone: "+91 98112 34567",
    avatar: "PN",
    bio: "Product designer transitioning to frontend engineering and full-stack interactive web development.",
    location: "Mumbai, India",
    enrolledCourses: [
      {
        id: "c3",
        title: "React Masterclass",
        progress: 45,
        enrolledDate: "12 Feb 2026",
        completed: false,
        type: "LIVE",
        batchName: "Weekday Evening Cohort",
        nextSession: "Tomorrow, 08:00 PM",
        price: 11250,
        assignmentsCount: 2,
        assignmentsScoreAvg: 80,
        instructorName: "John Doe",
        category: "Frontend Development",
        totalModules: 14,
        completedModules: 6
      },
      {
        id: "c4",
        title: "UI/UX Design Pro",
        progress: 45,
        enrolledDate: "20 Feb 2026",
        completed: false,
        type: "SELF_PACED",
        price: 7500,
        assignmentsCount: 2,
        assignmentsScoreAvg: 76,
        instructorName: "Sarah Jenkins",
        category: "Design Systems",
        totalModules: 8,
        completedModules: 4
      }
    ],
    totalSpent: 18750,
    assignmentsSubmitted: 4,
    quizScoreAvg: 78,
    certificatesEarned: 0,
    lastActive: "2h ago",
    status: "Active",
    joinedDate: "12 Feb 2026"
  },
  {
    id: "stu-3",
    name: "Lucas Martin",
    email: "lucas.m@yahoo.com",
    phone: "+1 415 555 0192",
    avatar: "LM",
    bio: "Senior software engineer specializing in scalable LLM deployment and enterprise multi-agent workflows.",
    location: "San Francisco, USA",
    enrolledCourses: [
      {
        id: "c5",
        title: "Advanced AI Engineering",
        progress: 100,
        enrolledDate: "01 Jan 2026",
        completed: true,
        type: "LIVE",
        batchName: "FAANG AI Cohort 4",
        price: 4990,
        assignmentsCount: 8,
        assignmentsScoreAvg: 98,
        instructorName: "Dr. Sarah Chen",
        category: "Generative AI",
        totalModules: 16,
        completedModules: 16
      },
      {
        id: "c6",
        title: "Autonomous Agents",
        progress: 82,
        enrolledDate: "15 Jan 2026",
        completed: false,
        type: "LIVE",
        batchName: "LangGraph Lab Alpha",
        nextSession: "Today, 07:00 PM",
        price: 4000,
        assignmentsCount: 6,
        assignmentsScoreAvg: 94,
        instructorName: "Alex Chen",
        category: "Autonomous Systems",
        totalModules: 12,
        completedModules: 10
      }
    ],
    totalSpent: 8990,
    assignmentsSubmitted: 14,
    quizScoreAvg: 96,
    certificatesEarned: 2,
    lastActive: "42m ago",
    status: "Active",
    joinedDate: "01 Jan 2026"
  },
  {
    id: "stu-4",
    name: "Meera Gupta",
    email: "meera.g@proton.me",
    phone: "+91 99201 88442",
    avatar: "MG",
    bio: "DevOps & Cloud enthusiastic exploring serverless architecture and microservices orchestration.",
    location: "Hyderabad, India",
    enrolledCourses: [
      {
        id: "c7",
        title: "Cloud Computing & Serverless",
        progress: 15,
        enrolledDate: "18 Feb 2026",
        completed: false,
        type: "SELF_PACED",
        price: 14200,
        assignmentsCount: 1,
        assignmentsScoreAvg: 48,
        instructorName: "Vikram Mehta",
        category: "Cloud & DevOps",
        totalModules: 20,
        completedModules: 3
      }
    ],
    totalSpent: 14200,
    assignmentsSubmitted: 1,
    quizScoreAvg: 48,
    certificatesEarned: 0,
    lastActive: "6 days ago",
    status: "At Risk",
    joinedDate: "18 Feb 2026"
  },
  {
    id: "stu-5",
    name: "Vikram Malhotra",
    email: "vikram.m@techcorp.in",
    phone: "+91 98200 99881",
    avatar: "VM",
    bio: "Backend developer looking to master scalable enterprise architecture patterns.",
    location: "New Delhi, India",
    enrolledCourses: [
      {
        id: "c8",
        title: "Enterprise System Design",
        progress: 5,
        enrolledDate: "02 Mar 2026",
        completed: false,
        type: "SELF_PACED",
        price: 4500,
        assignmentsCount: 0,
        assignmentsScoreAvg: 0,
        instructorName: "Dr. Sarah Chen",
        category: "System Design",
        totalModules: 15,
        completedModules: 1
      }
    ],
    totalSpent: 4500,
    assignmentsSubmitted: 0,
    quizScoreAvg: 0,
    certificatesEarned: 0,
    lastActive: "14 days ago",
    status: "Blocked",
    joinedDate: "02 Mar 2026"
  }
];

export function getStudentById(id: string): StudentItem | undefined {
  return MOCK_STUDENTS.find((s) => s.id === id || s.email === id);
}
