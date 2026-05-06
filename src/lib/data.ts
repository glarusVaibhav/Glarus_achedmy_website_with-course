import { Course } from "@/components/CourseCard";

export const CATEGORIES = [
  "Machine Learning",
  "Generative AI",
  "Data Science",
  "NLP",
  "Computer Vision",
  "AI Ethics"
];

export const COURSES: Course[] = [
  {
    id: "ai-1",
    title: "Complete Generative AI Engineering",
    description: "Master LLMs, LangChain, and vector databases to build autonomous AI agents from scratch.",
    instructor: "Alex Chen",
    price: 15999,
    level: "Intermediate",
    rating: 4.8,
    duration: "40 hours",
    image: "/images/course-1.png"
  },
  {
    id: "ai-2",
    title: "Machine Learning for Beginners",
    description: "Your first step into AI. Learn Python, Scikit-Learn, and the math behind machine learning.",
    instructor: "Sarah Jenkins",
    price: 8999,
    level: "Beginner",
    rating: 4.9,
    duration: "25 hours",
    image: "/images/course-2.png"
  },
  {
    id: "ai-3",
    title: "Advanced Computer Vision",
    description: "Build state-of-the-art vision models using PyTorch, YOLO, and Vision Transformers.",
    instructor: "David Kumar",
    price: 19999,
    level: "Advanced",
    rating: 4.7,
    duration: "50 hours",
    image: "/images/course-3.png"
  },
  {
    id: "ai-4",
    title: "NLP with Hugging Face",
    description: "Deep dive into Natural Language Processing, BERT, and fine-tuning open-source models.",
    instructor: "Elena Rodriguez",
    price: 12999,
    level: "Intermediate",
    rating: 4.9,
    duration: "30 hours",
    image: "/images/course-4.png"
  },
  {
    id: "ai-5",
    title: "AI Ethics & Safety",
    description: "Understand the implications of AI, bias mitigation, and how to build responsible systems.",
    instructor: "Dr. James Wilson",
    price: 4999,
    level: "Beginner",
    rating: 4.6,
    duration: "10 hours",
    image: "/images/course-5.png"
  },
  {
    id: "ai-6",
    title: "Productionizing ML Models",
    description: "Learn MLOps, Docker, Kubernetes, and model deployment on AWS/GCP.",
    instructor: "Michael Chang",
    price: 24999,
    level: "Advanced",
    rating: 4.8,
    duration: "45 hours",
    image: "/images/course-6.png"
  }
];
