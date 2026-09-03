import { 
  Cpu, 
  Layers, 
  Database, 
  Bot, 
  Terminal, 
  Sparkles, 
  Code2, 
  ShieldCheck, 
  Brain, 
  LineChart, 
  Server, 
  Boxes,
  Lock,
  Zap
} from "lucide-react";

export interface CourseDetailItem {
  id: string;
  slugs: string[];
  title: string;
  category: string;
  level: string;
  duration: string;
  lastUpdated: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: string;
  enrolledCount: string;
  description: string;
  learningOutcomes: Array<{
    icon: any;
    title: string;
    desc: string;
  }>;
  modules: Array<{
    number: string;
    title: string;
    lessonsCount: number;
    duration: string;
    preview?: boolean;
    lessons: Array<{
      title: string;
      duration: string;
      preview?: boolean;
    }>;
  }>;
  projects: Array<{
    number: string;
    title: string;
    desc: string;
    tech: string[];
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
}

export const COURSE_CATALOG_DETAILS: Record<string, CourseDetailItem> = {
  // ── FULL-STACK AI & NEXT.JS 16 MASTERCLASS ──
  "cmtl2cz4i0001vyik7ryv5ouy": {
    id: "cmtl2cz4i0001vyik7ryv5ouy",
    slugs: ["cmtl2cz4i0001vyik7ryv5ouy", "fullstack-ai-nextjs16", "nextjs-masterclass"],
    title: "Full-Stack AI & Next.js 16 Masterclass: Building Production SaaS",
    category: "AI Engineering & Web",
    level: "All Levels",
    duration: "30 Hours VOD",
    lastUpdated: "August 2026",
    price: 14999,
    originalPrice: 22999,
    rating: 5.0,
    reviewsCount: "1,120+",
    enrolledCount: "4,800+",
    description: "Master modern full-stack engineering with Next.js 16, React 19, Turbopack, PostgreSQL, Prisma ORM, and low-latency Groq/OpenAI streaming AI endpoints.",
    learningOutcomes: [
      {
        icon: Cpu,
        title: "Next.js 16 App Router & Server Actions",
        desc: "Build modern reactive web apps using Server Components, Server Actions, and Turbopack bundler."
      },
      {
        icon: Database,
        title: "PostgreSQL & Prisma Production ORM",
        desc: "Design scalable relational database schemas, transactions, indexing, and high-performance queries."
      },
      {
        icon: Bot,
        title: "Streaming AI & Low-Latency LLM Pipelines",
        desc: "Integrate OpenAI and Groq APIs with real-time UI streaming, token counting, and tool calling."
      },
      {
        icon: ShieldCheck,
        title: "Enterprise Auth & Role-Based Access Control",
        desc: "Implement JWT authentication, rate limiting, and secure role-based portals for Students, Instructors, and Admins."
      },
      {
        icon: Sparkles,
        title: "Production SaaS Deployment & Docker",
        desc: "Containerize applications with Docker, setup automated CI/CD pipelines, and deploy with zero downtime."
      }
    ],
    modules: [
      {
        number: "01",
        title: "Modern Next.js 16 & React 19 Architecture",
        lessonsCount: 2,
        duration: "1h 45m",
        preview: true,
        lessons: [
          { title: "1.1 Turbopack, App Router & Server Actions Deep Dive", duration: "25:30", preview: true },
          { title: "1.2 State Management with Zustand and Optimistic UI", duration: "28:15", preview: true }
        ]
      },
      {
        number: "02",
        title: "PostgreSQL, Prisma ORM & Database Performance",
        lessonsCount: 2,
        duration: "2h 10m",
        preview: true,
        lessons: [
          { title: "2.1 Schema Design, Indexing & High-Scale Relations", duration: "32:00", preview: true },
          { title: "2.2 Transactions, Concurrency & Security Policies", duration: "29:40", preview: false }
        ]
      },
      {
        number: "03",
        title: "AI Agents, Streaming & Production Deployment",
        lessonsCount: 2,
        duration: "2h 30m",
        preview: true,
        lessons: [
          { title: "3.1 Building Low-Latency Streaming AI Endpoints with Groq & OpenAI", duration: "34:20", preview: true },
          { title: "3.2 Dockerizing, CI/CD and Edge Deployment with SSL", duration: "31:10", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "Autonomous AI-Powered LMS & Code Sandbox",
        desc: "Build and deploy a full-featured online education portal with code execution and live AI tutors.",
        tech: ["Next.js 16", "React 19", "Prisma", "PostgreSQL", "Groq AI", "Tailwind CSS v4"]
      }
    ],
    faqs: [
      {
        q: "Is this course suitable for beginners?",
        a: "Yes, this course starts with architectural fundamentals and takes you step-by-step to production deployment."
      },
      {
        q: "Do I get lifetime access and certificate?",
        a: "Yes! You get lifetime access to all lectures, codebase repositories, updates, and a verified completion certificate."
      }
    ]
  },

  // ── 1. GENERATIVE AI APPLICATION ENGINEERING ──
  "Generative_AI_Application_Engineer": {
    id: "Generative_AI_Application_Engineer",
    slugs: ["Generative_AI_Application_Engineer", "2", "generative-ai", "gen-ai"],
    title: "Generative AI Application Engineering",
    category: "Web Development / AI",
    level: "Intermediate",
    duration: "24 Hours VOD",
    lastUpdated: "July 2026",
    price: 15999,
    originalPrice: 24999,
    rating: 4.9,
    reviewsCount: "2,540+",
    enrolledCount: "12,000+",
    description: "Master LLMs, LangChain, RAG, and Vector Databases to build production-ready autonomous AI agents from scratch.",
    learningOutcomes: [
      {
        icon: Cpu,
        title: "Build Production-Grade AI Applications",
        desc: "Go from fundamental concept to real-world AI applications with production architecture."
      },
      {
        icon: Layers,
        title: "Master LangChain, LangGraph & Agent Workflows",
        desc: "Build stateful, multi-agent cyclical workflows using industry-standard orchestration frameworks."
      },
      {
        icon: Database,
        title: "Implement Advanced RAG with Vector Databases",
        desc: "Create high-accuracy hybrid retrieval systems with dense embeddings, BM25, and cross-encoder reranking."
      },
      {
        icon: Bot,
        title: "Build Autonomous AI Agents",
        desc: "Create reasoning agents that plan, execute tool calls, and solve complex multi-step workflows."
      },
      {
        icon: Terminal,
        title: "Integrate Model Context Protocol (MCP)",
        desc: "Connect LLMs with real-world file systems, Postgres databases, and custom API servers."
      },
      {
        icon: Sparkles,
        title: "Fine-Tune Open Source Models",
        desc: "Adapt and optimize Llama 3 & DeepSeek models with LoRA and QLoRA on domain datasets."
      }
    ],
    modules: [
      {
        number: "01",
        title: "Introduction to LLMs & Core Architecture",
        lessonsCount: 5,
        duration: "2h 45m",
        preview: true,
        lessons: [
          { title: "1.1 What are LLMs & How Do Autoregressive Models Work?", duration: "18:40", preview: true },
          { title: "1.2 Tokens, Embeddings & Semantic Vector Spaces", duration: "24:15", preview: true },
          { title: "1.3 Transformer Self-Attention & Positional Encoding", duration: "32:10", preview: false },
          { title: "1.4 Sampling Strategies: Temperature, Top-K, Top-P", duration: "16:25", preview: false },
          { title: "1.5 Setting Up Local Development Pods with PyTorch & CUDA", duration: "14:20", preview: false }
        ]
      },
      {
        number: "02",
        title: "Advanced Prompt Engineering & Structured Function Calling",
        lessonsCount: 8,
        duration: "4h 15m",
        preview: true,
        lessons: [
          { title: "2.1 Structured JSON Output & Pydantic v2 Schema Enforcement", duration: "22:30", preview: true },
          { title: "2.2 Chain-of-Thought, Tree-of-Thoughts & ReAct Framework", duration: "28:45", preview: false },
          { title: "2.3 Tool Calling Protocols & API Parameter Extraction", duration: "26:10", preview: false },
          { title: "2.4 Multi-Turn Conversational Memory & Dynamic Summarization", duration: "30:50", preview: false }
        ]
      },
      {
        number: "03",
        title: "Enterprise RAG, Vector Search & Hybrid Retrieval",
        lessonsCount: 11,
        duration: "6h 30m",
        preview: false,
        lessons: [
          { title: "3.1 Recursive Chunking, Semantic Boundaries & Metadata Tagging", duration: "25:10", preview: false },
          { title: "3.2 Dense Embedding Pipelines vs Sparse BM25 Keywords", duration: "29:40", preview: false },
          { title: "3.3 Qdrant, Pinecone & PostgreSQL pgvector HNSW Indexing", duration: "35:15", preview: false },
          { title: "3.4 Reciprocal Rank Fusion & Cross-Encoder Reranking Models", duration: "28:20", preview: false },
          { title: "3.5 RAG Evaluation Frameworks with TruLens & Ragas", duration: "31:45", preview: false }
        ]
      },
      {
        number: "04",
        title: "Autonomous Agents, LangGraph & Model Context Protocol (MCP)",
        lessonsCount: 12,
        duration: "10h 30m",
        preview: false,
        lessons: [
          { title: "4.1 Stateful Cyclical Graphs with LangGraph & Checkpointers", duration: "38:20", preview: false },
          { title: "4.2 Building Multi-Agent Swarms: Planner, Coder & Critic", duration: "45:10", preview: false },
          { title: "4.3 Model Context Protocol (MCP) Server & Client Implementation", duration: "42:30", preview: false },
          { title: "4.4 LoRA & QLoRA Fine-Tuning Pipelines on Custom Enterprise Data", duration: "48:15", preview: false },
          { title: "4.5 Production Containerization, Ray Serve & vLLM High-Throughput", duration: "52:00", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "AI Knowledge Assistant",
        desc: "Build a production RAG assistant that can search, retrieve, and generate verified answers with citations from corporate document libraries.",
        tech: ["RAG", "LangChain", "PGVector", "FastAPI"]
      },
      {
        number: "02",
        title: "Autonomous AI Agent",
        desc: "Create an autonomous engineering agent that reasons, plans, executes terminal commands, and debugs code across multi-step tasks.",
        tech: ["LangGraph", "MCP Protocol", "Python", "OpenAI"]
      },
      {
        number: "03",
        title: "Agentic Workflow System",
        desc: "Architect a multi-agent swarm with supervisor routing, persistent memory checkpoints, and human-in-the-loop review interrupts.",
        tech: ["CrewAI", "LangGraph", "Redis", "Next.js 15"]
      },
      {
        number: "04",
        title: "Production GenAI Application",
        desc: "Deploy a high-concurrency generative AI application combining real-time streaming tokens, usage metering, and vector search.",
        tech: ["Next.js", "vLLM", "Docker", "Tailwind CSS"]
      }
    ],
    faqs: [
      {
        q: "Who is this course designed for?",
        a: "This track is built for software engineers, backend developers, and tech leads who want to master LLM engineering, autonomous agents, and production RAG architectures."
      },
      {
        q: "How long do I have access to course materials?",
        a: "You receive lifetime unlimited access to all video lessons, code repositories, Jupyter notebooks, continuous curriculum updates, and community channels."
      },
      {
        q: "Do I need prior AI or machine learning experience?",
        a: "Basic Python programming and standard web development concepts are helpful. The course starts from core LLM concepts and builds up to advanced production engineering."
      },
      {
        q: "What projects are included in the curriculum?",
        a: "You will build 4 comprehensive portfolio projects: an Enterprise RAG Assistant, an Autonomous Tool-Calling Agent, a Multi-Agent Swarm with LangGraph, and a Scalable Full-Stack GenAI Application."
      }
    ]
  },

  // ── 2. ADVANCED LLM ARCHITECTURE ──
  "ai-1": {
    id: "ai-1",
    slugs: ["ai-1", "1", "advanced-llm-architecture", "llm-architecture"],
    title: "Advanced LLM Architecture",
    category: "AI Engineering",
    level: "Advanced",
    duration: "18 Hours VOD",
    lastUpdated: "July 2026",
    price: 15999,
    originalPrice: 24999,
    rating: 4.9,
    reviewsCount: "1,820+",
    enrolledCount: "9,600+",
    description: "Deep dive into Transformer internals, Multi-Head Attention, RoPE embeddings, KV Cache optimizations, and distributed pre-training pipelines from scratch with PyTorch.",
    learningOutcomes: [
      {
        icon: Cpu,
        title: "Master Transformer Mathematical Foundations",
        desc: "Implement scaled dot-product attention, multi-head projections, and Rotary Position Embeddings (RoPE) in pure PyTorch."
      },
      {
        icon: Zap,
        title: "Accelerate Inference with FlashAttention & KV Cache",
        desc: "Optimize memory bandwidth using PagedAttention, KV cache quantization, and FlashAttention-2 GPU kernels."
      },
      {
        icon: Server,
        title: "Scale Distributed Pre-Training",
        desc: "Implement Data Parallelism (DDP), Fully Sharded Data Parallel (FSDP), and Tensor Parallelism using DeepSpeed."
      },
      {
        icon: Boxes,
        title: "Model Quantization & Compression",
        desc: "Compress billion-parameter models using 4-bit/8-bit weight quantization (GPTQ, AWQ, and GGUF formats)."
      },
      {
        icon: Terminal,
        title: "Byte-Pair Encoding (BPE) Tokenizers",
        desc: "Build custom vocabulary tokenizers from scratch, handling regex splitting, special tokens, and Unicode merges."
      },
      {
        icon: Sparkles,
        title: "Architect Mixture of Experts (MoE)",
        desc: "Design sparse router gates and top-k expert dispatch mechanisms similar to Mixtral and DeepSeek-V2 architectures."
      }
    ],
    modules: [
      {
        number: "01",
        title: "Transformer Internals & Attention Mathematics",
        lessonsCount: 6,
        duration: "3h 30m",
        preview: true,
        lessons: [
          { title: "1.1 Scaled Dot-Product Attention & Matrix Projections", duration: "25:10", preview: true },
          { title: "1.2 Rotary Positional Embeddings (RoPE) vs Sinusoidal", duration: "30:40", preview: true },
          { title: "1.3 Multi-Query Attention (MQA) & Grouped-Query Attention (GQA)", duration: "28:15", preview: false },
          { title: "1.4 Custom BPE Tokenizer Construction in Python & C++", duration: "32:00", preview: false }
        ]
      },
      {
        number: "02",
        title: "Inference Acceleration & KV Cache Optimization",
        lessonsCount: 7,
        duration: "4h 45m",
        preview: true,
        lessons: [
          { title: "2.1 Memory Bottlenecks in Autoregressive Token Generation", duration: "24:30", preview: true },
          { title: "2.2 FlashAttention-2: Tiling Math & Online Softmax", duration: "42:15", preview: false },
          { title: "2.3 PagedAttention & Continuous Batching with vLLM", duration: "36:50", preview: false },
          { title: "2.4 Speculative Decoding & Medusa Multi-Head Verification", duration: "31:20", preview: false }
        ]
      },
      {
        number: "03",
        title: "Distributed Pre-Training & Parallelism",
        lessonsCount: 8,
        duration: "5h 15m",
        preview: false,
        lessons: [
          { title: "3.1 Distributed Data Parallel (DDP) All-Reduce Gradients", duration: "34:10", preview: false },
          { title: "3.2 Zero Redundancy Optimizer (ZeRO 1-3) & PyTorch FSDP", duration: "45:00", preview: false },
          { title: "3.3 Megatron-LM Tensor & Pipeline Parallelism", duration: "40:20", preview: false },
          { title: "3.4 Gradient Checkpointing & Mixed Precision FP16/BF16", duration: "28:40", preview: false }
        ]
      },
      {
        number: "04",
        title: "Quantization, MoE & Architecture Frontiers",
        lessonsCount: 9,
        duration: "4h 30m",
        preview: false,
        lessons: [
          { title: "4.1 Post-Training Quantization: GPTQ, AWQ, and SmoothQuant", duration: "35:10", preview: false },
          { title: "4.2 Sparse Mixture of Experts (MoE) Routing Mechanics", duration: "38:40", preview: false },
          { title: "4.3 State Space Models: Mamba & Selective State Spaces", duration: "41:15", preview: false },
          { title: "4.4 Long-Context Scaling: YaRN & Context Extension", duration: "32:00", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "From-Scratch 1B Parameter Transformer",
        desc: "Implement and train a 1B parameter GPT-style model in PyTorch with RoPE, SwiGLU activations, and RMSNorm.",
        tech: ["PyTorch", "CUDA", "FlashAttention-2", "Weights & Biases"]
      },
      {
        number: "02",
        title: "Custom FlashAttention GPU Kernel",
        desc: "Write a high-performance Triton/CUDA kernel that fuses online softmax and attention scaling to boost inference by 4x.",
        tech: ["Triton", "CUDA C++", "PyTorch C Extensions", "vLLM"]
      },
      {
        number: "03",
        title: "Distributed Training Cluster (FSDP)",
        desc: "Deploy a distributed pre-training run across a multi-GPU cluster using PyTorch FSDP, DeepSpeed ZeRO-3, and mixed precision.",
        tech: ["PyTorch FSDP", "DeepSpeed", "NCCL", "Ray Cluster"]
      },
      {
        number: "04",
        title: "4-bit Quantization & High-Throughput Engine",
        desc: "Quantize a 7B LLM into 4-bit AWQ weights and deploy on a single GPU with sub-10ms token generation latency.",
        tech: ["AWQ", "AutoGPTQ", "Triton", "FastAPI"]
      }
    ],
    faqs: [
      {
        q: "Is this course focused on using APIs or building models?",
        a: "This course is strictly focused on model internals, architecture design, and low-level engineering with PyTorch, CUDA, and distributed training."
      },
      {
        q: "What mathematical background is recommended?",
        a: "A working knowledge of linear algebra (matrix multiplications, eigenvalues), calculus (partial derivatives, chain rule), and proficiency in PyTorch."
      }
    ]
  },

  // ── 3. MACHINE LEARNING MATH FOUNDATIONS ──
  "ai-2": {
    id: "ai-2",
    slugs: ["ai-2", "4", "ml-math", "machine-learning-for-beginners"],
    title: "Machine Learning Math Foundations",
    category: "AI Engineering",
    level: "Beginner",
    duration: "32 Hours VOD",
    lastUpdated: "July 2026",
    price: 8999,
    originalPrice: 14999,
    rating: 4.9,
    reviewsCount: "3,120+",
    enrolledCount: "14,800+",
    description: "Master the essential linear algebra, multivariate calculus, probability theory, and optimization algorithms required to build and understand modern AI systems.",
    learningOutcomes: [
      {
        icon: LineChart,
        title: "Linear Algebra & Vector Spaces",
        desc: "Master matrix decompositions, eigenvalues, Singular Value Decomposition (SVD), and Principal Component Analysis (PCA)."
      },
      {
        icon: Cpu,
        title: "Multivariate Calculus & Autograd",
        desc: "Understand Jacobians, Hessians, vector-valued chain rule, and the mathematics powering neural network backpropagation."
      },
      {
        icon: Sparkles,
        title: "Probability & Information Theory",
        desc: "Deep dive into Bayesian inference, entropy, KL divergence, cross-entropy loss, and maximum likelihood estimation."
      },
      {
        icon: Brain,
        title: "Convex & Non-Convex Optimization",
        desc: "Master gradient descent variants (SGD, Momentum, AdamW), learning rate schedules, and loss landscape dynamics."
      },
      {
        icon: Terminal,
        title: "NumPy & SciPy Vectorized Math",
        desc: "Translate mathematical formulations directly into fast, vectorized C-accelerated Python algorithms."
      },
      {
        icon: Code2,
        title: "Build ML Algorithms from Scratch",
        desc: "Implement Linear/Logistic Regression, SVMs, and Multi-Layer Perceptrons without third-party ML libraries."
      }
    ],
    modules: [
      {
        number: "01",
        title: "Linear Algebra & High-Dimensional Geometry",
        lessonsCount: 8,
        duration: "7h 30m",
        preview: true,
        lessons: [
          { title: "1.1 Vectors, Dot Products & Hyperplanes in n-Dimensions", duration: "32:10", preview: true },
          { title: "1.2 Matrix Transformations & Rank-Nullity Theorem", duration: "38:40", preview: true },
          { title: "1.3 Eigenvectors, Spectral Theorem & SVD Decomposition", duration: "45:15", preview: false },
          { title: "1.4 Principal Component Analysis (PCA) Derivation", duration: "40:00", preview: false }
        ]
      },
      {
        number: "02",
        title: "Multivariate Calculus & Backpropagation Math",
        lessonsCount: 8,
        duration: "8h 15m",
        preview: true,
        lessons: [
          { title: "2.1 Gradients, Directional Derivatives & Tangent Planes", duration: "35:20", preview: true },
          { title: "2.2 Matrix Calculus & Vector-Valued Chain Rule", duration: "48:10", preview: false },
          { title: "2.3 Jacobians, Hessians & Second-Order Taylor Approximations", duration: "42:30", preview: false },
          { title: "2.4 The Exact Mathematical Derivation of Backprop in Deep Nets", duration: "52:00", preview: false }
        ]
      },
      {
        number: "03",
        title: "Probability, Distributions & Information Theory",
        lessonsCount: 8,
        duration: "8h 45m",
        preview: false,
        lessons: [
          { title: "3.1 Random Variables, Joint Probability & Bayes' Rule", duration: "36:40", preview: false },
          { title: "3.2 Gaussian Distributions, Covariance Matrices & Mahalanobis Distance", duration: "44:10", preview: false },
          { title: "3.3 Shannon Entropy, Cross-Entropy & KL Divergence", duration: "40:30", preview: false },
          { title: "3.4 Maximum Likelihood (MLE) vs Maximum A Posteriori (MAP)", duration: "46:15", preview: false }
        ]
      },
      {
        number: "04",
        title: "Optimization Algorithms & Pure Python Engines",
        lessonsCount: 8,
        duration: "7h 30m",
        preview: false,
        lessons: [
          { title: "4.1 Convex Sets, Strong Convexity & Lipschitz Smoothness", duration: "38:10", preview: false },
          { title: "4.2 Stochastic Gradient Descent & Convergence Proofs", duration: "45:00", preview: false },
          { title: "4.3 AdamW: Adaptive Moment Estimation with Weight Decay", duration: "42:20", preview: false },
          { title: "4.4 Constrained Optimization & Lagrange Multipliers (KKT Conditions)", duration: "48:00", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "SVD Image Compression & Denoising Engine",
        desc: "Build an image dimensionality reduction and noise filtering engine using pure NumPy Singular Value Decomposition.",
        tech: ["NumPy", "Linear Algebra", "SVD", "Matplotlib"]
      },
      {
        number: "02",
        title: "MicroGrad-Style Autograd Engine",
        desc: "Construct a scalar-valued and tensor-valued automatic differentiation engine with a complete computation graph and backprop.",
        tech: ["Python", "Calculus", "Autograd", "Computation Graphs"]
      },
      {
        number: "03",
        title: "Bayesian Spam Classifier & Anomaly Detector",
        desc: "Derive and program a multi-variate Gaussian Mixture Model and Naive Bayes inference engine from mathematical first principles.",
        tech: ["Probability Theory", "SciPy", "Bayesian Inference", "Python"]
      },
      {
        number: "04",
        title: "Convex Optimization Portfolio Allocator",
        desc: "Implement Markowitz Mean-Variance portfolio optimization with quadratic programming and Lagrange multipliers.",
        tech: ["Optimization", "CVXPY", "NumPy", "Financial Math"]
      }
    ],
    faqs: [
      {
        q: "Do I need high school or college math to begin?",
        a: "High school algebra is sufficient! We build every mathematical concept from geometric intuition up to formal derivations."
      },
      {
        q: "Are the code exercises in Python?",
        a: "Yes. Every single mathematical theorem is paired with an interactive Google Colab notebook using pure Python and NumPy."
      }
    ]
  },

  // ── 4. RAG & VECTOR DATABASES ──
  "ai-3": {
    id: "ai-3",
    slugs: ["ai-3", "3", "rag-vector-db", "advanced-computer-vision"],
    title: "RAG & Vector Databases",
    category: "Data Science",
    level: "Advanced",
    duration: "12 Hours VOD",
    lastUpdated: "July 2026",
    price: 19999,
    originalPrice: 29999,
    rating: 4.8,
    reviewsCount: "1,640+",
    enrolledCount: "8,900+",
    description: "Master enterprise retrieval-augmented generation: semantic chunking, dense vs sparse search, PGVector, Qdrant, Milvus, and reciprocal rank fusion reranking.",
    learningOutcomes: [
      {
        icon: Database,
        title: "Semantic Chunking & Metadata Strategies",
        desc: "Implement recursive character, agentic chunking, and markdown structure preservation for zero information loss."
      },
      {
        icon: Layers,
        title: "Hybrid Search (Dense + Sparse BM25)",
        desc: "Combine dense semantic embeddings with sparse keyword search and Reciprocal Rank Fusion (RRF) scoring."
      },
      {
        icon: Server,
        title: "High-Performance Vector Databases",
        desc: "Deploy and tune HNSW, IVF-Flat, and Product Quantization (PQ) indices across PostgreSQL pgvector, Qdrant, and Milvus."
      },
      {
        icon: Zap,
        title: "Cross-Encoder & ColBERT Reranking",
        desc: "Filter false positive retrievals and elevate needle-in-haystack context using fast neural cross-encoders."
      },
      {
        icon: Sparkles,
        title: "GraphRAG with Knowledge Graphs",
        desc: "Construct Neo4j knowledge graphs linked to vector spaces for multi-hop enterprise entity reasoning."
      },
      {
        icon: ShieldCheck,
        title: "End-to-End RAG Evaluation",
        desc: "Automate precision, faithfulness, context recall, and hallucination testing using Ragas and TruLens."
      }
    ],
    modules: [
      {
        number: "01",
        title: "Document Ingestion & Semantic Chunking",
        lessonsCount: 5,
        duration: "2h 45m",
        preview: true,
        lessons: [
          { title: "1.1 The Chunking Dilemma: Context Fragmentation vs Loss", duration: "24:10", preview: true },
          { title: "1.2 Markdown & Table-Aware Parsers with Unstructured.io", duration: "32:00", preview: true },
          { title: "1.3 Semantic Embedding Discontinuity Splitting", duration: "28:15", preview: false },
          { title: "1.4 Metadata Tagging & Hierarchical Parent-Child Indexing", duration: "35:00", preview: false }
        ]
      },
      {
        number: "02",
        title: "Vector Indexing Algorithms & Database Internals",
        lessonsCount: 6,
        duration: "3h 15m",
        preview: true,
        lessons: [
          { title: "2.1 Approximate Nearest Neighbor (ANN) Math", duration: "30:20", preview: true },
          { title: "2.2 Hierarchical Navigable Small World (HNSW) Graphs", duration: "42:10", preview: false },
          { title: "2.3 Product Quantization (PQ) & Scalar Compression", duration: "36:00", preview: false },
          { title: "2.4 Production PostgreSQL pgvector with HNSW Tuning", duration: "38:45", preview: false }
        ]
      },
      {
        number: "03",
        title: "Hybrid Search & Neural Reranking",
        lessonsCount: 6,
        duration: "3h 30m",
        preview: false,
        lessons: [
          { title: "3.1 Sparse BM25 / SPLADE vs Dense Bi-Encoders", duration: "34:00", preview: false },
          { title: "3.2 Reciprocal Rank Fusion (RRF) & Weighted Blending", duration: "29:30", preview: false },
          { title: "3.3 Cross-Encoder Scoring (Cohere, BGE-Reranker)", duration: "35:15", preview: false },
          { title: "3.4 Multi-Vector Late Interaction with ColBERT v2", duration: "41:00", preview: false }
        ]
      },
      {
        number: "04",
        title: "GraphRAG & Continuous Evaluation",
        lessonsCount: 6,
        duration: "2h 30m",
        preview: false,
        lessons: [
          { title: "4.1 Knowledge Graph Extraction with LLM Triples", duration: "32:10", preview: false },
          { title: "4.2 Combining Neo4j Graph Traversal with Vector Similarity", duration: "38:40", preview: false },
          { title: "4.3 Quantitative RAG Benchmarking with Ragas & TruLens", duration: "35:00", preview: false },
          { title: "4.4 Self-RAG & Corrective RAG (CRAG) Control Flows", duration: "34:10", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "Enterprise 10-K SEC Filing Assistant",
        desc: "Ingest 500+ page annual financial reports, extract complex balance sheet tables, and deliver cited calculations.",
        tech: ["FastAPI", "PGVector", "Cohere Rerank", "LangChain"]
      },
      {
        number: "02",
        title: "GraphRAG Medical Literature Search",
        desc: "Build a multi-hop clinical knowledge graph connecting PubMed papers, drug compounds, and disease phenotypes.",
        tech: ["Neo4j", "GraphRAG", "Cypher", "OpenAI Embeddings"]
      },
      {
        number: "03",
        title: "High-Throughput Qdrant Search Microservice",
        desc: "Deploy a low-latency gRPC vector search engine handling 5,000 queries per second with HNSW quantization.",
        tech: ["Qdrant", "gRPC", "Docker", "Python 3.12"]
      },
      {
        number: "04",
        title: "Automated RAG Quality Gatekeeper",
        desc: "Create a CI/CD test harness that evaluates retrieval accuracy and blocks PRs if context recall drops below 95%.",
        tech: ["Ragas", "GitHub Actions", "TruLens", "PyTest"]
      }
    ],
    faqs: [
      {
        q: "Which vector databases are covered?",
        a: "We provide hands-on production code for PostgreSQL pgvector, Qdrant, Pinecone, and Milvus."
      },
      {
        q: "Does this course cover local embedding models?",
        a: "Yes! We run open-source embedding and reranker models (such as BGE and Nomic) locally on CPU and GPU."
      }
    ]
  },

  // ── 5. SMART CONTRACT SECURITY TESTING ──
  "ai-4": {
    id: "ai-4",
    slugs: ["ai-4", "5", "smart-contracts", "nlp-with-hugging-face"],
    title: "Smart Contract Security Testing",
    category: "Web3 / Security",
    level: "Expert",
    duration: "15 Hours VOD",
    lastUpdated: "July 2026",
    price: 12999,
    originalPrice: 19999,
    rating: 4.9,
    reviewsCount: "1,140+",
    enrolledCount: "6,200+",
    description: "Learn automated fuzzing, static analysis with Slither, invariant testing with Foundry, and formal verification to audit and secure smart contracts.",
    learningOutcomes: [
      {
        icon: ShieldCheck,
        title: "EVM Attack Vectors & Exploit Analysis",
        desc: "Master reentrancy, oracle manipulation, read-only reentrancy, signature replay, and precision loss vulnerabilities."
      },
      {
        icon: Terminal,
        title: "Stateful Invariant Testing with Foundry",
        desc: "Write property-based fuzz tests and stateful invariant handlers to break DeFi protocols automatically."
      },
      {
        icon: Code2,
        title: "Static Analysis with Slither & AST Parsers",
        desc: "Write custom Python Slither detectors and Abstract Syntax Tree (AST) scripts to catch dangerous patterns."
      },
      {
        icon: Lock,
        title: "Formal Verification with Certora Prover",
        desc: "Mathematically prove that smart contract rules can never be violated under any transaction sequence."
      },
      {
        icon: Cpu,
        title: "EVM Bytecode & Assembly (Yul) Debugging",
        desc: "Step through memory layouts, storage slot collisions, and custom assembly opcodes."
      },
      {
        icon: Sparkles,
        title: "Professional Audit Report Deliverables",
        desc: "Format high-severity findings, write proof-of-concept exploits, and formulate mitigation recommendations."
      }
    ],
    modules: [
      {
        number: "01",
        title: "EVM Execution Model & Critical Vulnerability Classes",
        lessonsCount: 6,
        duration: "3h 45m",
        preview: true,
        lessons: [
          { title: "1.1 EVM Stack, Memory & Storage Slot Packing", duration: "32:15", preview: true },
          { title: "1.2 Cross-Function & Read-Only Reentrancy Attacks", duration: "42:00", preview: true },
          { title: "1.3 Flash Loan Price Manipulation & TWAP Oracles", duration: "38:40", preview: false },
          { title: "1.4 ERC-20 / ERC-721 Weird Tokens & Unchecked Returns", duration: "30:10", preview: false }
        ]
      },
      {
        number: "02",
        title: "Fuzzing & Invariant Testing with Foundry",
        lessonsCount: 6,
        duration: "4h 15m",
        preview: true,
        lessons: [
          { title: "2.1 Stateless Fuzzing vs Stateful Invariant Testing", duration: "35:00", preview: true },
          { title: "2.2 Designing Invariant Target Contracts & Actor Handlers", duration: "48:15", preview: false },
          { title: "2.3 Echidna Property Testing & Corpus Generation", duration: "44:30", preview: false },
          { title: "2.4 Medusa Experimental Fuzzer Integration", duration: "36:00", preview: false }
        ]
      },
      {
        number: "03",
        title: "Static Analysis & Custom Slither Detectors",
        lessonsCount: 5,
        duration: "3h 30m",
        preview: false,
        lessons: [
          { title: "3.1 Intermediate Representation (SlithIR) Architecture", duration: "38:20", preview: false },
          { title: "3.2 Writing Custom Vulnerability Detectors in Python", duration: "45:00", preview: false },
          { title: "3.3 Automated CI/CD Audit Pipelines with GitHub Actions", duration: "32:15", preview: false },
          { title: "3.4 Semgrep Rules for Solidity AST Patterns", duration: "34:40", preview: false }
        ]
      },
      {
        number: "04",
        title: "Formal Verification & Audit Deliverables",
        lessonsCount: 5,
        duration: "3h 30m",
        preview: false,
        lessons: [
          { title: "4.1 Mathematical Specs with Certora Verification Language (CVL)", duration: "46:10", preview: false },
          { title: "4.2 Proving Invariants on AMM Vault Balances", duration: "42:30", preview: false },
          { title: "4.3 Structuring an Executive Security Audit Report", duration: "30:00", preview: false },
          { title: "4.4 Bug Bounty Strategies on Immunefi & Code4rena", duration: "35:40", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "DeFi Lending Protocol Exploit Suite",
        desc: "Construct working proof-of-concept exploits for reentrancy, oracle price manipulation, and liquidation drainage.",
        tech: ["Solidity", "Foundry", "Anvil", "Ethers.js"]
      },
      {
        number: "02",
        title: "Stateful Invariant Test Suite for Uniswap v2 Fork",
        desc: "Engineer a comprehensive handler suite ensuring token reserves and invariant $k = x \\cdot y$ are never broken.",
        tech: ["Foundry", "Solidity 0.8", "Property Fuzzing"]
      },
      {
        number: "03",
        title: "Automated Slither CI Scanner Plugin",
        desc: "Build a Python-powered static analysis CLI tool that flags unauthorized proxy delegatecalls before deployment.",
        tech: ["Python", "Slither", "SlithIR", "Docker"]
      },
      {
        number: "04",
        title: "Production Smart Contract Audit Report",
        desc: "Conduct a full simulated security audit on a multi-token staking protocol with high/medium findings and mitigations.",
        tech: ["Certora", "CVL", "Markdown", "Security Auditing"]
      }
    ],
    faqs: [
      {
        q: "What Solidity level is required?",
        a: "Intermediate familiarity with Solidity (interfaces, ERC standards, modifiers) is recommended."
      },
      {
        q: "Are the audit tools free and open source?",
        a: "Yes! We work primarily with Foundry, Slither, Echidna, and open-source testing frameworks."
      }
    ]
  },

  // ── 6. PRODUCTIONIZING ML MODELS & MLOPS ──
  "ai-6": {
    id: "ai-6",
    slugs: ["ai-6", "6", "productionizing-ml-models", "ai-5"],
    title: "Productionizing ML Models & MLOps",
    category: "MLOps / Cloud",
    level: "Advanced",
    duration: "45 Hours VOD",
    lastUpdated: "July 2026",
    price: 24999,
    originalPrice: 34999,
    rating: 4.8,
    reviewsCount: "2,080+",
    enrolledCount: "10,400+",
    description: "Master end-to-end MLOps: Docker containerization, Kubernetes orchestration, Ray Serve, Triton Inference Server, CI/CD pipelines, and real-time model monitoring.",
    learningOutcomes: [
      {
        icon: Server,
        title: "High-Throughput Model Serving",
        desc: "Serve large deep learning models with sub-millisecond overhead using NVIDIA Triton and Ray Serve."
      },
      {
        icon: Boxes,
        title: "Docker & GPU Scheduling",
        desc: "Containerize PyTorch and TensorFlow runtimes with CUDA base images and multi-instance GPU (MIG) slicing."
      },
      {
        icon: Cpu,
        title: "Kubernetes (EKS) Orchestration",
        desc: "Deploy scalable inference microservices with Helm, KEDA event-driven autoscaling, and Istio service mesh."
      },
      {
        icon: Terminal,
        title: "Continuous Training & GitOps Pipelines",
        desc: "Automate model retraining, data validation, and artifact versioning using GitHub Actions and DVC."
      },
      {
        icon: Database,
        title: "Feature Stores with Feast & Redis",
        desc: "Serve low-latency online features and maintain point-in-time correctness for offline model training."
      },
      {
        icon: LineChart,
        title: "Model Drift & Observability",
        desc: "Detect concept and data drift in real-time with Prometheus, Grafana, and Evidently AI telemetry."
      }
    ],
    modules: [
      {
        number: "01",
        title: "Model Packaging & Optimized Serving",
        lessonsCount: 7,
        duration: "5h 30m",
        preview: true,
        lessons: [
          { title: "1.1 Model Serialization: ONNX, TorchScript & TensorRT", duration: "38:15", preview: true },
          { title: "1.2 Triton Inference Server Configuration & Model Repos", duration: "44:00", preview: true },
          { title: "1.3 Dynamic Batching & Concurrent Model Instances", duration: "36:40", preview: false },
          { title: "1.4 High-Concurrency Ray Serve Cluster Deployment", duration: "42:10", preview: false }
        ]
      },
      {
        number: "02",
        title: "Docker, GPU Infrastructure & Kubernetes",
        lessonsCount: 8,
        duration: "7h 00m",
        preview: true,
        lessons: [
          { title: "2.1 Multi-Stage Docker Builds for PyTorch & CUDA", duration: "35:00", preview: true },
          { title: "2.2 NVIDIA Container Toolkit & GPU Passthrough", duration: "40:20", preview: false },
          { title: "2.3 Kubernetes Helm Charts for AI Inference Pods", duration: "48:15", preview: false },
          { title: "2.4 KEDA Autoscaling on Request Rate & GPU Utilization", duration: "45:00", preview: false }
        ]
      },
      {
        number: "03",
        title: "Data Pipelines & Feature Stores",
        lessonsCount: 7,
        duration: "6h 15m",
        preview: false,
        lessons: [
          { title: "3.1 Data Version Control (DVC) with S3 Backends", duration: "34:00", preview: false },
          { title: "3.2 Feature Store Architecture with Feast & Redis", duration: "46:30", preview: false },
          { title: "3.3 Point-in-Time Correct Feature Joins", duration: "38:15", preview: false },
          { title: "3.4 Great Expectations Automated Data Quality Gates", duration: "35:40", preview: false }
        ]
      },
      {
        number: "04",
        title: "CI/CD GitOps & Drift Telemetry",
        lessonsCount: 8,
        duration: "6h 45m",
        preview: false,
        lessons: [
          { title: "4.1 GitHub Actions Workflows for Automated Model Evaluation", duration: "42:10", preview: false },
          { title: "4.2 Canary Deployments & Blue-Green Traffic Splitting", duration: "38:00", preview: false },
          { title: "4.3 Real-Time Drift Detection with Evidently AI", duration: "45:15", preview: false },
          { title: "4.4 Prometheus Metrics & Grafana MLOps Dashboards", duration: "40:00", preview: false }
        ]
      }
    ],
    projects: [
      {
        number: "01",
        title: "Triton GPU Serving Gateway",
        desc: "Deploy a production NVIDIA Triton server with dynamic batching and TensorRT engine serialization.",
        tech: ["NVIDIA Triton", "TensorRT", "gRPC", "Docker"]
      },
      {
        number: "02",
        title: "Kubernetes Auto-Scaling AI Cluster",
        desc: "Deploy a multi-node Kubernetes cluster on AWS EKS with KEDA autoscaling GPU pods based on incoming request queue depth.",
        tech: ["AWS EKS", "Helm", "KEDA", "Kubernetes"]
      },
      {
        number: "03",
        title: "Feature Store with Feast & Redis",
        desc: "Build an end-to-end feature pipeline syncing batch transformations in Parquet to low-latency Redis online serving.",
        tech: ["Feast", "Redis", "DuckDB", "Python"]
      },
      {
        number: "04",
        title: "Real-Time Drift Monitoring Stack",
        desc: "Construct an observability stack that alerts on prediction distribution shifts and triggers automated retraining.",
        tech: ["Evidently AI", "Prometheus", "Grafana", "Slack Webhooks"]
      }
    ],
    faqs: [
      {
        q: "Do I need cloud credits or local GPUs?",
        a: "All projects are structured so you can run them locally on Docker or deploy to free-tier cloud clusters."
      },
      {
        q: "Is Kubernetes experience required?",
        a: "We teach Kubernetes from the ground up specifically for machine learning deployment."
      }
    ]
  }
};

/**
 * Helper to resolve any incoming id or slug to its full course configuration.
 */
export function getCourseDetails(idOrSlug: string): CourseDetailItem {
  if (!idOrSlug) return COURSE_CATALOG_DETAILS["Generative_AI_Application_Engineer"];

  const decoded = decodeURIComponent(idOrSlug).trim();

  // 1. Direct ID match
  if (COURSE_CATALOG_DETAILS[decoded]) {
    return COURSE_CATALOG_DETAILS[decoded];
  }

  // 2. Slug or alias match
  const lower = decoded.toLowerCase();
  for (const item of Object.values(COURSE_CATALOG_DETAILS)) {
    if (
      item.id.toLowerCase() === lower ||
      item.slugs.some(s => s.toLowerCase() === lower) ||
      item.title.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(lower) ||
      lower.includes(item.id.toLowerCase())
    ) {
      return item;
    }
  }

  // 3. Fallback to flagship course if not found
  return COURSE_CATALOG_DETAILS["Generative_AI_Application_Engineer"];
}
