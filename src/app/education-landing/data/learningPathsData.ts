export interface PathStep {
  stepNumber: number;
  title: string;
  duration: string;
  skillsGained: string[];
  deliverable: string;
  icon: string;
}

export interface LearningPathItem {
  id: string;
  title: string;
  category: 'School' | 'Coding' | 'AI & Tech' | 'Design & Creative';
  tagline: string;
  estimatedTime: string;
  totalCourses: number;
  totalProjects: number;
  color: {
    badge: string;
    border: string;
    accent: string;
    pillBg: string;
    lightBg: string;
  };
  steps: PathStep[];
  outcomes: string[];
  recommendedFor: string;
}

export const LEARNING_PATHS_DATA: LearningPathItem[] = [
  {
    id: 'school-foundations-path',
    title: 'School Academic Foundations (Class 5 → Class 8)',
    category: 'School',
    tagline: 'From elementary curiosity to confident, self-driven middle school scholars.',
    estimatedTime: '4 Academic Years · Self-Paced & Live',
    totalCourses: 12,
    totalProjects: 40,
    color: {
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      border: 'border-amber-200',
      accent: '#d97706',
      pillBg: 'bg-amber-500',
      lightBg: 'bg-amber-50/50'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Class 5: Wonder & Number Sense',
        duration: 'Grade 5',
        skillsGained: ['Mental Arithmetic', 'Everyday Science', 'Vocabulary & Reading Fluency'],
        deliverable: 'Visual Math Puzzle Journal & Science Logbook',
        icon: 'Calculator'
      },
      {
        stepNumber: 2,
        title: 'Class 6: Conceptual Discovery',
        duration: 'Grade 6',
        skillsGained: ['Algebra Basics', 'Experimental Science Method', 'Introductory Python'],
        deliverable: 'First 3 Scratch & Python Mini Games',
        icon: 'Atom'
      },
      {
        stepNumber: 3,
        title: 'Class 7: Analytical Reasoning',
        duration: 'Grade 7',
        skillsGained: ['Geometry Proofs', 'Physics Laws of Motion', 'Critical Essay Writing'],
        deliverable: 'Science Fair Project & Math Olympiad Toolkit',
        icon: 'Compass'
      },
      {
        stepNumber: 4,
        title: 'Class 8: High School Springboard',
        duration: 'Grade 8',
        skillsGained: ['Advanced Algebra', 'Chemical Equations', 'Data & Logic Systems'],
        deliverable: 'Class 9 Entrance & Olympiad Prep Portfolio',
        icon: 'GraduationCap'
      }
    ],
    outcomes: [
      'Top percentile grades in school assessments',
      'Solid problem-solving mindset eliminating rote memorization',
      'Early exposure to coding, logic & scientific inquiry',
      'Unshakeable foundation for high school board excellence'
    ],
    recommendedFor: 'Students in Grades 5–8 and parents seeking structured, joyful learning.'
  },
  {
    id: 'coding-fullstack-path',
    title: 'Software Developer Career Track (Beginner → Fullstack Engineer)',
    category: 'Coding',
    tagline: 'Learn to code from zero, build real web systems, and deploy production software.',
    estimatedTime: '6 Months · 10–12 Hrs/Week',
    totalCourses: 5,
    totalProjects: 8,
    color: {
      badge: 'bg-blue-100 text-blue-900 border-blue-200',
      border: 'border-blue-200',
      accent: '#2563eb',
      pillBg: 'bg-blue-600',
      lightBg: 'bg-blue-50/50'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Programming Core & Problem Solving',
        duration: 'Weeks 1–4',
        skillsGained: ['Python / JS Fundamentals', 'Control Flow', 'Data Structures & Algorithms'],
        deliverable: '5 Algorithmic Problem Sets & CLI Toolkit',
        icon: 'Code2'
      },
      {
        stepNumber: 2,
        title: 'Modern Frontend & Responsive UI',
        duration: 'Weeks 5–10',
        skillsGained: ['HTML5 & CSS3 Architecture', 'Tailwind CSS', 'React 19 & Next.js'],
        deliverable: 'Responsive Web Application with Dark/Light Theme',
        icon: 'Layout'
      },
      {
        stepNumber: 3,
        title: 'Backend Systems, APIs & Databases',
        duration: 'Weeks 11–18',
        skillsGained: ['Node.js & Express', 'PostgreSQL & Prisma ORM', 'JWT Auth & Security'],
        deliverable: 'Production REST API with Authentication & Role RBAC',
        icon: 'Database'
      },
      {
        stepNumber: 4,
        title: 'Cloud Deployment & Portfolio Capstone',
        duration: 'Weeks 19–24',
        skillsGained: ['Docker Basics', 'CI/CD Pipelines', 'Cloud Hosting & Live Testing'],
        deliverable: 'Fullstack SaaS Product with Payment & Email Integration',
        icon: 'Rocket'
      }
    ],
    outcomes: [
      'Build and deploy fullstack web apps independently',
      'A GitHub portfolio showcasing 4 production-grade projects',
      'Job and internship readiness for software development roles',
      'Verified GlarusAcademy Fullstack Developer Credential'
    ],
    recommendedFor: 'College students, career changers, and self-taught developers.'
  },
  {
    id: 'ai-data-science-path',
    title: 'AI & Data Science Practitioner (Data Analysis → Generative AI)',
    category: 'AI & Tech',
    tagline: 'Master data wrangling, machine learning models, vector RAG, and autonomous agents.',
    estimatedTime: '7 Months · 8–10 Hrs/Week',
    totalCourses: 6,
    totalProjects: 10,
    color: {
      badge: 'bg-purple-100 text-purple-900 border-purple-200',
      border: 'border-purple-200',
      accent: '#7c3aed',
      pillBg: 'bg-purple-600',
      lightBg: 'bg-purple-50/50'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Data Wrangling & Statistical Insights',
        duration: 'Weeks 1–6',
        skillsGained: ['Pandas & NumPy', 'Data Cleansing', 'Statistical Visualization with Seaborn'],
        deliverable: 'Interactive Exploratory Data Analysis Report',
        icon: 'BarChart3'
      },
      {
        stepNumber: 2,
        title: 'Predictive Machine Learning Models',
        duration: 'Weeks 7–14',
        skillsGained: ['Scikit-Learn', 'Regression & Classification', 'Feature Engineering & Tuning'],
        deliverable: 'Customer Churn & Price Prediction Engine',
        icon: 'Brain'
      },
      {
        stepNumber: 3,
        title: 'Deep Learning & Natural Language Processing',
        duration: 'Weeks 15–20',
        skillsGained: ['PyTorch Foundations', 'Transformer Models', 'Embeddings & Vector Search'],
        deliverable: 'Semantic Search Engine over Technical Documents',
        icon: 'Cpu'
      },
      {
        stepNumber: 4,
        title: 'Generative AI & Multi-Agent Workflows',
        duration: 'Weeks 21–28',
        skillsGained: ['LangGraph State Machines', 'Hybrid Vector RAG', 'Tool Calling Sandboxes'],
        deliverable: 'Production Autonomous Research Copilot Application',
        icon: 'Sparkles'
      }
    ],
    outcomes: [
      'End-to-end fluency from exploratory data to production AI systems',
      'Deep understanding of stateful multi-agent architectures',
      'Verified expertise in building real-world enterprise RAG systems',
      'Industry-recognized AI Engineering Portfolio'
    ],
    recommendedFor: 'Developers, analysts, engineers, and tech professionals looking to lead in AI.'
  },
  {
    id: 'ui-ux-design-path',
    title: 'Product Design & UI/UX Leadership (Wireframes → Design Systems)',
    category: 'Design & Creative',
    tagline: 'Design intuitive, accessible digital products that users genuinely love.',
    estimatedTime: '4 Months · 6–8 Hrs/Week',
    totalCourses: 4,
    totalProjects: 6,
    color: {
      badge: 'bg-rose-100 text-rose-900 border-rose-200',
      border: 'border-rose-200',
      accent: '#e11d48',
      pillBg: 'bg-rose-600',
      lightBg: 'bg-rose-50/50'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Design Thinking & User Empathy',
        duration: 'Weeks 1–4',
        skillsGained: ['User Research', 'Journey Mapping', 'Information Architecture'],
        deliverable: 'Comprehensive User Research & Persona Study',
        icon: 'Users'
      },
      {
        stepNumber: 2,
        title: 'Figma Mastery & Rapid Prototyping',
        duration: 'Weeks 5–8',
        skillsGained: ['Wireframing', 'Auto-Layout & Variants', 'Interactive Clickable Prototypes'],
        deliverable: 'Interactive Mobile App Prototype in Figma',
        icon: 'Smartphone'
      },
      {
        stepNumber: 3,
        title: 'Scalable Design Systems & Accessibility',
        duration: 'Weeks 9–12',
        skillsGained: ['WCAG Accessibility Standards', 'Design Tokens', 'Component Libraries'],
        deliverable: 'Enterprise Design System with 40+ Master Components',
        icon: 'Palette'
      },
      {
        stepNumber: 4,
        title: 'Case Study Crafting & Portfolio',
        duration: 'Weeks 13–16',
        skillsGained: ['Design Storytelling', 'Client Handoff Specs', 'Portfolio Website Presentation'],
        deliverable: 'Polished Behance/Webflow Case Study Presentation',
        icon: 'Award'
      }
    ],
    outcomes: [
      'Master industry-standard tools (Figma, FigJam, Tokens)',
      'Create high-converting, user-friendly digital experiences',
      'A job-ready UX Case Study portfolio reviewed by design leads',
      'Direct handoff collaboration skills with developers'
    ],
    recommendedFor: 'Aspiring UI/UX designers, graphic designers, product managers, and founders.'
  }
];
