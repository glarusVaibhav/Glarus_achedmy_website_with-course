export interface SchoolClassItem {
  classNumber: number;
  label: string;
  tagline: string;
  ageGroup: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    lightTint: string;
  };
  subjects: {
    name: string;
    icon: string;
    chaptersCount: number;
    popularTopic: string;
  }[];
  keyMilestones: string[];
  totalPracticeQuestions: string;
  interactiveQuizzes: number;
  highlightBadge: string;
  description: string;
}

export const SCHOOL_CLASSES_DATA: SchoolClassItem[] = [
  {
    classNumber: 5,
    label: 'Class 5',
    tagline: 'Foundation of Curiosity & Logical Thinking',
    ageGroup: 'Ages 9 – 10 Years',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      accent: '#f59e0b',
      lightTint: '#fffbeb'
    },
    subjects: [
      { name: 'Mathematics', icon: 'Calculator', chaptersCount: 14, popularTopic: 'Fractions, Factors & Shapes' },
      { name: 'General Science', icon: 'Atom', chaptersCount: 12, popularTopic: 'Plants, Human Body & Ecosystems' },
      { name: 'English Grammar & Reading', icon: 'BookOpen', chaptersCount: 16, popularTopic: 'Vocabulary, Tenses & Story Writing' },
      { name: 'Young Logic & Scratch', icon: 'Gamepad2', chaptersCount: 10, popularTopic: 'Visual Block Animations & Puzzles' }
    ],
    keyMilestones: [
      'Visual mental math & speed calculations',
      'Hands-on everyday science observations',
      'Creative sentence structuring & reading fluency',
      'Step-by-step problem-solving mindset'
    ],
    totalPracticeQuestions: '1,200+',
    interactiveQuizzes: 45,
    highlightBadge: 'Junior Foundation',
    description: 'Transform classroom hesitation into boundless curiosity with colorful illustrations, interactive worksheets, and gamified progress rewards.'
  },
  {
    classNumber: 6,
    label: 'Class 6',
    tagline: 'Exploring Concepts & Scientific Inquiry',
    ageGroup: 'Ages 10 – 11 Years',
    colorTheme: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      accent: '#10b981',
      lightTint: '#ecfdf5'
    },
    subjects: [
      { name: 'Mathematics', icon: 'Calculator', chaptersCount: 16, popularTopic: 'Integers, Algebra Intro & Mensuration' },
      { name: 'Science Explorer', icon: 'FlaskConical', chaptersCount: 16, popularTopic: 'Light, Electricity & Separation of Substances' },
      { name: 'Social Studies', icon: 'Globe2', chaptersCount: 18, popularTopic: 'Ancient Civilizations & Earth Geography' },
      { name: 'Introduction to Python', icon: 'Code', chaptersCount: 12, popularTopic: 'Variables, Loops & Turtle Graphics' }
    ],
    keyMilestones: [
      'Bridge from arithmetic to algebraic thinking',
      'Understanding the scientific method through experiments',
      'Spatial awareness & map reading skills',
      'Building first real computer programs'
    ],
    totalPracticeQuestions: '1,600+',
    interactiveQuizzes: 52,
    highlightBadge: 'Concept Builder',
    description: 'Help students transition smoothly into middle school academics with structured conceptual clarity and fun real-world applications.'
  },
  {
    classNumber: 7,
    label: 'Class 7',
    tagline: 'Deepening Analytical & Reasoning Abilities',
    ageGroup: 'Ages 11 – 12 Years',
    colorTheme: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200',
      text: 'text-sky-900',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      accent: '#0284c7',
      lightTint: '#f0f9ff'
    },
    subjects: [
      { name: 'Mathematics', icon: 'Sigma', chaptersCount: 15, popularTopic: 'Rational Numbers, Lines & Angles, Triangles' },
      { name: 'Science Deep-Dive', icon: 'Microscope', chaptersCount: 18, popularTopic: 'Nutrition in Animals, Heat & Motion' },
      { name: 'English Literature & Composition', icon: 'PenTool', chaptersCount: 14, popularTopic: 'Critical Comprehension & Essay Craft' },
      { name: 'Applied Web Basics', icon: 'Layout', chaptersCount: 10, popularTopic: 'Building First Responsive Web Pages' }
    ],
    keyMilestones: [
      'Geometry proofs and algebraic equations mastery',
      'Physics motion laws and chemistry reactions basics',
      'Structured essay writing & vocabulary expansion',
      'Olympiad & competitive foundation practice'
    ],
    totalPracticeQuestions: '2,000+',
    interactiveQuizzes: 60,
    highlightBadge: 'Analytical Booster',
    description: 'Master higher-order thinking with animated theorem demonstrations, instant doubt-solving tutors, and structured homework assistance.'
  },
  {
    classNumber: 8,
    label: 'Class 8',
    tagline: 'Bridging to High School Academic Excellence',
    ageGroup: 'Ages 12 – 13 Years',
    colorTheme: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      accent: '#4f46e5',
      lightTint: '#eef2ff'
    },
    subjects: [
      { name: 'Mathematics', icon: 'Calculator', chaptersCount: 16, popularTopic: 'Exponents, Linear Equations & Factorisation' },
      { name: 'Physics & Chemistry', icon: 'Atom', chaptersCount: 18, popularTopic: 'Force & Pressure, Combustion & Metals' },
      { name: 'Biology & Environmental Science', icon: 'Dna', chaptersCount: 12, popularTopic: 'Cell Structure & Microorganisms' },
      { name: 'Data & Python Logic', icon: 'Binary', chaptersCount: 12, popularTopic: 'Data Structures, Functions & Algorithms' }
    ],
    keyMilestones: [
      'Solid command over high school algebra & geometry',
      'Microscopic understanding of biological cells',
      'Chemical equations balancing & periodic table prep',
      'Critical analysis & structured debate skills'
    ],
    totalPracticeQuestions: '2,400+',
    interactiveQuizzes: 68,
    highlightBadge: 'High School Prep',
    description: 'The critical springboard for high school. Gain unbeatable confidence across STEM subjects before stepping into board curriculum years.'
  },
  {
    classNumber: 9,
    label: 'Class 9',
    tagline: 'Rigorous Foundation for Board Exam Mastery',
    ageGroup: 'Ages 13 – 14 Years',
    colorTheme: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      text: 'text-purple-900',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      accent: '#7c3aed',
      lightTint: '#f5f3ff'
    },
    subjects: [
      { name: 'Mathematics', icon: 'Sigma', chaptersCount: 15, popularTopic: 'Polynomials, Coordinate Geometry, Circles' },
      { name: 'Physics', icon: 'Zap', chaptersCount: 10, popularTopic: 'Laws of Motion, Gravitation, Work & Energy' },
      { name: 'Chemistry', icon: 'FlaskConical', chaptersCount: 8, popularTopic: 'Atoms & Molecules, Structure of the Atom' },
      { name: 'Biology', icon: 'Dna', chaptersCount: 8, popularTopic: 'Tissues, Diversity in Living Organisms' }
    ],
    keyMilestones: [
      'Derivations of kinematic equations & gravitational physics',
      'Mole concept and atomic mass calculation formulas',
      'Geometric proofs & coordinate analytical methods',
      'Time-managed sample paper solving routines'
    ],
    totalPracticeQuestions: '3,200+',
    interactiveQuizzes: 80,
    highlightBadge: 'Crucial Foundation',
    description: 'Class 9 determines Class 10 success. Eliminate conceptual gaps early with deep theorem breakdowns, formula cheat sheets, and step-by-step solutions.'
  },
  {
    classNumber: 10,
    label: 'Class 10',
    tagline: 'Board Examination Distinction & Confidence',
    ageGroup: 'Ages 14 – 15 Years',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      accent: '#2563eb',
      lightTint: '#eff6ff'
    },
    subjects: [
      { name: 'Mathematics (Standard / Basic)', icon: 'Calculator', chaptersCount: 15, popularTopic: 'Trigonometry, Triangles & Quadratic Equations' },
      { name: 'Physics & Chemistry', icon: 'Atom', chaptersCount: 16, popularTopic: 'Electricity, Light, Carbon Compounds' },
      { name: 'Life Processes Biology', icon: 'HeartPulse', chaptersCount: 8, popularTopic: 'Heredity, Control & Coordination' },
      { name: '10-Year Solved PYQ Engine', icon: 'FileCheck', chaptersCount: 20, popularTopic: 'Chapter-wise Previous Year Board Questions' }
    ],
    keyMilestones: [
      'Mastery of high-frequency board exam questions',
      'Step marking presentation strategies for top scorers',
      'Live speed revision bootcamps before board exams',
      'Formula memorization maps & rapid recap notes'
    ],
    totalPracticeQuestions: '4,500+',
    interactiveQuizzes: 110,
    highlightBadge: 'Board Exam Engine',
    description: 'Comprehensive board exam preparation engine. Step-by-step video solutions, question paper prediction sets, and personalized revision schedules.'
  },
  {
    classNumber: 11,
    label: 'Class 11',
    tagline: 'Advanced Science, Commerce & STEM Specialization',
    ageGroup: 'Ages 15 – 16 Years',
    colorTheme: {
      bg: 'bg-teal-50/70',
      border: 'border-teal-200',
      text: 'text-teal-900',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-800',
      accent: '#0d9488',
      lightTint: '#f0fdfa'
    },
    subjects: [
      { name: 'Calculus & Higher Math', icon: 'TrendingUp', chaptersCount: 16, popularTopic: 'Limits, Derivatives, Trigonometric Functions' },
      { name: 'Classical Mechanics Physics', icon: 'Compass', chaptersCount: 15, popularTopic: 'Vectors, Work-Energy-Power, Rotational Motion' },
      { name: 'Physical & Organic Chemistry', icon: 'TestTube2', chaptersCount: 14, popularTopic: 'Chemical Bonding, Thermodynamics, Hydrocarbons' },
      { name: 'Computer Science with Python', icon: 'Code2', chaptersCount: 12, popularTopic: 'Algorithmic Problem Solving & Data Handling' }
    ],
    keyMilestones: [
      'Seamless transition into rigorous senior secondary concepts',
      'Calculus-based physical derivations and problem models',
      'Mechanistic organic chemistry reaction pathways',
      'Entrance exam (JEE/NEET/CUET) foundation alignment'
    ],
    totalPracticeQuestions: '5,000+',
    interactiveQuizzes: 95,
    highlightBadge: 'Senior Secondary',
    description: 'Overcome the steep Class 11 learning curve. Visual physics models, calculus fundamentals, and organic chemistry mechanisms broken down clearly.'
  },
  {
    classNumber: 12,
    label: 'Class 12',
    tagline: 'Pre-University Excellence & Career Springboard',
    ageGroup: 'Ages 16 – 17 Years',
    colorTheme: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      text: 'text-rose-900',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      accent: '#e11d48',
      lightTint: '#fff1f2'
    },
    subjects: [
      { name: 'Advanced Mathematics', icon: 'Sigma', chaptersCount: 13, popularTopic: 'Integrals, Differential Equations, Vectors & 3D' },
      { name: 'Modern & Electro Physics', icon: 'Radio', chaptersCount: 14, popularTopic: 'Wave Optics, Dual Nature, Semiconductors, AC' },
      { name: 'Organic & Inorganic Chemistry', icon: 'FlaskRound', chaptersCount: 16, popularTopic: 'Coordination Compounds, Electrochemistry, Biomolecules' },
      { name: 'Computer Science / Informatics', icon: 'Database', chaptersCount: 12, popularTopic: 'SQL, Networking & Advanced Python Stacks' }
    ],
    keyMilestones: [
      'Comprehensive final board preparation & mock series',
      'Integration and 3D geometry rapid-solution techniques',
      'CUET & university entrance exam mastery practice',
      'Career mapping and higher education skill readiness'
    ],
    totalPracticeQuestions: '6,000+',
    interactiveQuizzes: 120,
    highlightBadge: 'Final Mastery',
    description: 'Your gateway to top universities and careers. Maximize board scores while simultaneously preparing for national entrance exams.'
  }
];
