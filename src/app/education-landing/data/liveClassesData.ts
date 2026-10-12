export interface LiveClassSession {
  id: string;
  title: string;
  category: string;
  badge: 'Live Now' | 'Starting Today' | 'Upcoming Tomorrow' | 'Weekly Series';
  badgeColor: string;
  date: string;
  time: string;
  duration: string;
  enrolledStudents: number;
  maxSeats: number;
  instructor: {
    name: string;
    role: string;
    avatar: string;
    organization?: string;
  };
  keyTakeaways: string[];
  level: string;
  isFree?: boolean;
}

export const LIVE_CLASSES_DATA: LiveClassSession[] = [
  {
    id: 'live-math-olympiad-class-6-8',
    title: 'Speed Math & Olympiad Problem Solving Live Workshop',
    category: 'School STEM (Class 6–8)',
    badge: 'Starting Today',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    date: 'Today, 5:30 PM IST',
    time: '5:30 PM – 7:00 PM',
    duration: '90 Minutes',
    enrolledStudents: 142,
    maxSeats: 200,
    instructor: {
      name: 'Dr. Sunita Deshmukh',
      role: 'Former IMO Trainer & Math Specialist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      organization: 'Glarus Math Faculty'
    },
    keyTakeaways: [
      'Mental math shortcuts for speed & accuracy',
      'Solving non-routine Olympiad geometry puzzles',
      'Live interactive Q&A and instant poll leaderboard'
    ],
    level: 'Class 6 - 8',
    isFree: true
  },
  {
    id: 'live-fullstack-react-cloud',
    title: 'Building & Deploying Your First Fullstack React App',
    category: 'Skill Development',
    badge: 'Upcoming Tomorrow',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    date: 'Tomorrow, 7:00 PM IST',
    time: '7:00 PM – 8:30 PM',
    duration: '90 Minutes',
    enrolledStudents: 188,
    maxSeats: 250,
    instructor: {
      name: 'Rohit Shenoy',
      role: 'Principal Fullstack Engineer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
      organization: 'Ex-Senior Staff Engineer'
    },
    keyTakeaways: [
      'React component architecture & state lifecycles',
      'Connecting REST endpoints to responsive UI',
      'Live deployment to Vercel with zero configuration'
    ],
    level: 'Beginner to Intermediate',
    isFree: false
  },
  {
    id: 'live-class-10-board-trig',
    title: 'Class 10 Trigonometry: 10 High-Yield Board Exam Theorems',
    category: 'Board Prep (Class 10)',
    badge: 'Starting Today',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    date: 'Today, 8:00 PM IST',
    time: '8:00 PM – 9:15 PM',
    duration: '75 Minutes',
    enrolledStudents: 310,
    maxSeats: 350,
    instructor: {
      name: 'Ramanathan Iyer',
      role: 'Master Board Exam Coach',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      organization: '20+ Yrs Educator'
    },
    keyTakeaways: [
      'Identities proof step-by-step presentation',
      'Avoiding the 5 most common calculation traps',
      'Live question-by-question scoring breakdown'
    ],
    level: 'Class 10 CBSE/ICSE',
    isFree: true
  },
  {
    id: 'live-ai-agent-architecture',
    title: 'Architecting Multi-Agent State Graphs in LangGraph',
    category: 'AI & Professional Career',
    badge: 'Weekly Series',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    date: 'Saturday, 11:00 AM IST',
    time: '11:00 AM – 1:00 PM',
    duration: '120 Minutes',
    enrolledStudents: 220,
    maxSeats: 300,
    instructor: {
      name: 'Dr. Akash Sen',
      role: 'Lead AI Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
      organization: 'AI Fellow'
    },
    keyTakeaways: [
      'Typed state schemas and circular loop guards',
      'Tool execution sandboxes with live debugging',
      'Interactive cohort code review and open Q&A'
    ],
    level: 'Intermediate to Advanced',
    isFree: false
  }
];
