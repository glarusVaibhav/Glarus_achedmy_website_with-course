export interface CourseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'Mathematics' | 'Science' | 'English' | 'Computer Science' | 'Web Development' | 'Artificial Intelligence' | 'Data Science' | 'Business' | 'Design' | 'Career Skills';
  level: string; // e.g. "Class 5 - 6", "Class 9 - 10", "Beginner", "Intermediate", "All Levels", "Advanced"
  gradeGroup?: 'school-junior' | 'school-senior' | 'skills' | 'career';
  duration: string;
  totalLessons: number;
  format: 'Self-Paced' | 'Live Interactive' | 'Hands-on Lab' | 'Hybrid';
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  badge?: string;
  badgeColor?: string;
  accentColor: string;
  iconName: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  topics: string[];
  price: string;
  originalPrice?: string;
}

export const COURSE_CATEGORIES = [
  'All Categories',
  'School: Class 5-8',
  'School: Class 9-12',
  'Mathematics',
  'Science',
  'Coding & Web Dev',
  'AI & Data Science',
  'Design & Creative',
  'Business & Leadership'
] as const;

export const COURSES_DATA: CourseItem[] = [
  // ── SCHOOL JUNIOR (CLASS 5-8) ──
  {
    id: 'math-class-5',
    title: 'Mathematics Mastery — Class 5',
    subtitle: 'Build Rock-Solid Foundations in Numbers, Geometry & Word Logic',
    description: 'Master fractions, decimals, prime factors, perimeter, and mental math through fun interactive puzzles and daily practice worksheets.',
    category: 'Mathematics',
    level: 'Class 5',
    gradeGroup: 'school-junior',
    duration: '32 Hours · 48 Lessons',
    totalLessons: 48,
    format: 'Hybrid',
    rating: 4.9,
    reviewsCount: 340,
    studentsCount: 2840,
    badge: 'Curriculum Aligned',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    accentColor: '#f59e0b',
    iconName: 'Calculator',
    instructor: {
      name: 'Dr. Sunita Deshmukh',
      role: 'Former Gold Medalist & Math Educator',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Fractions & Decimals', 'Factors & Multiples', 'Angles & Shapes', 'Speed, Time & Distance', 'Visual Word Problems'],
    price: '₹1,999',
    originalPrice: '₹3,999'
  },
  {
    id: 'science-class-6',
    title: 'Science Explorer — Class 6',
    subtitle: 'Unraveling the Wonders of Physics, Chemistry & Living Systems',
    description: 'Explore light and shadows, plant anatomy, fiber to fabric, and magnetism through illustrated experiment simulations.',
    category: 'Science',
    level: 'Class 6',
    gradeGroup: 'school-junior',
    duration: '28 Hours · 42 Lessons',
    totalLessons: 42,
    format: 'Live Interactive',
    rating: 4.95,
    reviewsCount: 412,
    studentsCount: 3120,
    badge: 'Popular for Grade 6',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: '#10b981',
    iconName: 'Atom',
    instructor: {
      name: 'Prof. Rajesh Nair',
      role: 'Senior Science Pedagogy Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Components of Food', 'Light, Shadows & Reflection', 'Electricity & Circuits', 'Fun with Magnets', 'Living Organisms & Habitats'],
    price: '₹2,199',
    originalPrice: '₹4,499'
  },
  {
    id: 'kids-coding-scratch-python',
    title: 'Young Coders: Logic, Scratch & Python',
    subtitle: 'From Visual Block Coding to First Real Python Games (Class 5–8)',
    description: 'Learn programming fundamentals without fear. Create 8 games, an animated storybook, and solve interactive algorithmic riddles.',
    category: 'Computer Science',
    level: 'Class 5 - 8',
    gradeGroup: 'school-junior',
    duration: '24 Hours · 36 Projects',
    totalLessons: 36,
    format: 'Hands-on Lab',
    rating: 4.92,
    reviewsCount: 520,
    studentsCount: 4890,
    badge: 'Bestseller for Young Coders',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    accentColor: '#2563eb',
    iconName: 'Gamepad2',
    instructor: {
      name: 'Ananya Sharma',
      role: 'EdTech Coding Mentor & Game Dev',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Loops & Logic Blocks', 'Game Physics in Scratch', 'Variables & Conditionals', 'Introduction to Python Syntax', 'Building Mini Arcade Games'],
    price: '₹2,499',
    originalPrice: '₹4,999'
  },

  // ── SCHOOL SENIOR (CLASS 9-12) ──
  {
    id: 'math-class-10-boards',
    title: 'Class 10 Mathematics: Board Mastery',
    subtitle: 'Complete Syllabus, Theorem Proofs & Step-by-Step Problem Solving',
    description: 'Comprehensive coverage of Trigonometry, Coordinate Geometry, Quadratic Equations, and Surface Areas with 500+ solved PYQs.',
    category: 'Mathematics',
    level: 'Class 10',
    gradeGroup: 'school-senior',
    duration: '54 Hours · 75 Lessons',
    totalLessons: 75,
    format: 'Live Interactive',
    rating: 4.98,
    reviewsCount: 890,
    studentsCount: 6420,
    badge: 'Top Rated for Boards',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    accentColor: '#4f46e5',
    iconName: 'Sigma',
    instructor: {
      name: 'Ramanathan Iyer',
      role: '20+ Yrs Board Exam Mentor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Trigonometric Ratios & Identities', 'Quadratic Equations & AP', 'Circles & Tangents', 'Statistics & Probability', '10 Full Mock Board Papers'],
    price: '₹2,999',
    originalPrice: '₹5,999'
  },
  {
    id: 'physics-class-11-12',
    title: 'Physics Concept Engine — Class 11 & 12',
    subtitle: 'Mechanics, Electromagnetism, Optics & Modern Physics Made Crystal Clear',
    description: 'Visual physics simulations that eliminate rote memorization. Ideal for CBSE/ICSE board exams and engineering entrance foundations.',
    category: 'Science',
    level: 'Class 11 - 12',
    gradeGroup: 'school-senior',
    duration: '60 Hours · 90 Lessons',
    totalLessons: 90,
    format: 'Hybrid',
    rating: 4.94,
    reviewsCount: 670,
    studentsCount: 5120,
    badge: 'Comprehensive Deep Dive',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    accentColor: '#9333ea',
    iconName: 'Zap',
    instructor: {
      name: 'Dr. Alok Verma',
      role: 'IIT Alumnus & Physics Educator',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Kinematics & Rotational Dynamics', 'Thermodynamics & Waves', 'Electrostatics & Current', 'Electromagnetic Induction', 'Wave Optics & Atomic Physics'],
    price: '₹3,499',
    originalPrice: '₹6,999'
  },

  // ── SKILL DEVELOPMENT & CODING ──
  {
    id: 'python-complete-mastery',
    title: 'Python Programming: From Scratch to Projects',
    subtitle: 'The Universal Language for Beginners, Students & Automation',
    description: 'Learn modern Python 3 with hands-on labs: Data structures, OOP, file processing, web scraping, and creating real desktop utilities.',
    category: 'Computer Science',
    level: 'Beginner to Intermediate',
    gradeGroup: 'skills',
    duration: '38 Hours · 52 Lessons',
    totalLessons: 52,
    format: 'Hands-on Lab',
    rating: 4.91,
    reviewsCount: 1240,
    studentsCount: 9850,
    badge: 'Most Enrolled Coding Course',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    accentColor: '#0891b2',
    iconName: 'Code2',
    instructor: {
      name: 'Vikram Joshi',
      role: 'Senior Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Python Syntax & Data Structures', 'Object-Oriented Programming (OOP)', 'Working with APIs & JSON', 'Data Automation & Scripting', 'Capstone: CLI Task Manager'],
    price: '₹2,499',
    originalPrice: '₹4,999'
  },
  {
    id: 'modern-fullstack-web',
    title: 'Modern Fullstack Web Development',
    subtitle: 'Build Scalable Apps with HTML5, CSS3, JavaScript, React & Node.js',
    description: 'Learn modern responsive frontend design, backend REST APIs, database modeling, and deploy 5 real-world production web applications.',
    category: 'Web Development',
    level: 'All Levels',
    gradeGroup: 'skills',
    duration: '65 Hours · 88 Lessons',
    totalLessons: 88,
    format: 'Hands-on Lab',
    rating: 4.96,
    reviewsCount: 980,
    studentsCount: 7600,
    badge: 'Job Ready Portfolio',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: '#059669',
    iconName: 'Globe',
    instructor: {
      name: 'Rohit Shenoy',
      role: 'Tech Lead & Fullstack Architect',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['HTML5 & Responsive CSS', 'JavaScript ES6+ Deep Dive', 'React Components & State Management', 'Node.js & Express REST APIs', 'PostgreSQL & Full Cloud Deployment'],
    price: '₹3,999',
    originalPrice: '₹7,999'
  },
  {
    id: 'ui-ux-design-fundamentals',
    title: 'UI/UX Design Systems & Figma Mastery',
    subtitle: 'Design Clean, User-Centered Web & Mobile Digital Experiences',
    description: 'Master wireframing, typography, color accessibility, auto-layout, interactive prototypes, and design systems in Figma.',
    category: 'Design',
    level: 'Beginner to Advanced',
    gradeGroup: 'skills',
    duration: '26 Hours · 34 Lessons',
    totalLessons: 34,
    format: 'Self-Paced',
    rating: 4.88,
    reviewsCount: 420,
    studentsCount: 3840,
    badge: 'Creative Showcase',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    accentColor: '#e11d48',
    iconName: 'Palette',
    instructor: {
      name: 'Meera Kulkarni',
      role: 'Staff Product Designer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Design Thinking & User Research', 'Figma Auto-Layout & Components', 'Design Systems & Tokens', 'Micro-Interactions & Prototyping', 'Portfolio Case Study Review'],
    price: '₹2,299',
    originalPrice: '₹4,599'
  },

  // ── AI, DATA SCIENCE & PROFESSIONAL CAREER ──
  {
    id: 'applied-generative-ai-agents',
    title: 'Generative AI & Autonomous Agent Architectures',
    subtitle: 'Build Enterprise AI Workflows with LLMs, LangGraph, RAG & Tool Calling',
    description: 'Hands-on development of production AI applications: Vector databases, multi-agent state machines, guardrails, and automated evaluation.',
    category: 'Artificial Intelligence',
    level: 'Intermediate to Advanced',
    gradeGroup: 'career',
    duration: '45 Hours · 60 Lessons',
    totalLessons: 60,
    format: 'Hands-on Lab',
    rating: 4.97,
    reviewsCount: 780,
    studentsCount: 6200,
    badge: 'Advanced Specialization',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    accentColor: '#7c3aed',
    iconName: 'Sparkles',
    instructor: {
      name: 'Dr. Akash Sen',
      role: 'AI Research Scientist & Lead Architect',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Prompt Engineering & Structured Outputs', 'Hybrid Vector RAG Architectures', 'LangGraph Multi-Agent Workflows', 'Tool Execution & Code Sandboxes', 'LangSmith Monitoring & Safety'],
    price: '₹4,499',
    originalPrice: '₹8,999'
  },
  {
    id: 'data-science-machine-learning',
    title: 'Data Science & Machine Learning Practical Lab',
    subtitle: 'From Pandas & Data Analysis to Predictive Machine Learning Models',
    description: 'Harness data to solve real problems: Data wrangling, statistical modeling, Scikit-Learn algorithms, feature engineering, and visualization.',
    category: 'Data Science',
    level: 'Intermediate',
    gradeGroup: 'career',
    duration: '40 Hours · 56 Lessons',
    totalLessons: 56,
    format: 'Hybrid',
    rating: 4.9,
    reviewsCount: 510,
    studentsCount: 4320,
    badge: 'High Impact Career Skill',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentColor: '#059669',
    iconName: 'BarChart3',
    instructor: {
      name: 'Pooja Agarwal',
      role: 'Principal Data Scientist',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop'
    },
    topics: ['Data Wrangling with Pandas & NumPy', 'Exploratory Data Analysis (EDA)', 'Regression & Classification Models', 'Model Evaluation & Hyperparameter Tuning', 'Interactive Streamlit Dashboards'],
    price: '₹3,499',
    originalPrice: '₹6,999'
  }
];
