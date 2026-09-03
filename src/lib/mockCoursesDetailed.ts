export interface LessonItem {
  id: string;
  title: string;
  type: "video" | "quiz" | "assignment" | "resource";
  duration?: string;
  size?: string;
  videoUrl?: string;
  description?: string;
  notes?: string;
  // For Quizzes
  quizQuestions?: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
  // For Assignments
  assignmentBrief?: string;
  deliverables?: string[];
  starterFileUrl?: string;
  starterFileName?: string;
  // For Resources
  resourceUrl?: string;
  resourceFileName?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  items: LessonItem[];
}

export interface DetailedCoursePreview {
  id: string;
  title: string;
  instructorId?: string;
  instructor: string;
  instructorEmail: string;
  instructorAvatar?: string;
  category: string;
  price: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  enrolledStudents: number;
  revenue: number;
  status: "PUBLISHED" | "PENDING_APPROVAL" | "DRAFT" | "REJECTED";
  rating: number;
  reviewsCount: number;
  updatedAt: string;
  previewVideoUrl: string;
  thumbnailGradient: string;
  description: string;
  prerequisites: string[];
  outcomes: string[];
  targetAudience: string;
  aiQualityReport: {
    status: "OPTIMAL" | "FLAGGED";
    flags: string[];
    audioScore: number;
    videoClarityScore: number;
    completenessScore: number;
  };
  sections: SectionItem[];
}

export const MOCK_DETAILED_COURSES: DetailedCoursePreview[] = [
  {
    id: "c-sarah-1",
    title: "Advanced AI Agents & Multi-Agent Swarms",
    instructorId: "inst-1",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    instructorAvatar: "SC",
    category: "Artificial Intelligence",
    price: 8999,
    level: "Advanced",
    duration: "24h 30m • 8 Modules",
    enrolledStudents: 1420,
    revenue: 12778580,
    status: "PUBLISHED",
    rating: 4.95,
    reviewsCount: 142,
    updatedAt: "20 Jan 2026",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailGradient: "from-purple-900 via-indigo-950 to-slate-950",
    description:
      "Master autonomous multi-agent architectures, hierarchical supervisor coordination, planning algorithms, deterministic tool-calling validation, and self-correcting RAG pipelines for high-reliability production systems.",
    prerequisites: [
      "Proficiency in Python 3.10+ (asyncio, type hints, pydantic)",
      "Fundamental knowledge of LLM APIs (OpenAI, Anthropic)",
      "Basic understanding of vector embeddings and graph structures"
    ],
    outcomes: [
      "Architect stateful multi-agent workflows using LangGraph and AutoGen",
      "Enforce deterministic tool execution with structured Pydantic schemas",
      "Deploy self-healing RAG systems with reranking and dynamic query routing",
      "Implement human-in-the-loop governance and observability with LangSmith"
    ],
    targetAudience: "AI Architects, Senior Software Engineers, and Tech Leads building next-generation autonomous enterprise AI systems.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 98,
      videoClarityScore: 99,
      completenessScore: 100
    },
    sections: [
      {
        id: "s-sarah-1",
        title: "Section 1: Foundations of Agentic AI & ReAct Loops",
        description: "Reasoning mechanisms, observation loops, and deterministic schema bindings.",
        items: [
          {
            id: "l-s1-1",
            title: "Introduction to the ReAct (Reason + Act) Framework",
            type: "video",
            duration: "18m 10s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            description: "Deep dive into how LLMs reason through sequential thoughts, actions, and environment observations.",
            notes: "Key takeaways: Observation buffering, token conservation, and handling tool output errors gracefully."
          },
          {
            id: "l-s1-2",
            title: "Tool Calling, Schema Validation & Structured Outputs",
            type: "video",
            duration: "24m 30s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            description: "Implementing rigorous Pydantic schemas for multi-tool binding with OpenAI and Claude.",
            notes: "Best practices for writing self-documenting JSON parameter descriptions."
          },
          {
            id: "l-s1-3",
            title: "Section 1 Knowledge Check: Tool Calling Mechanics",
            type: "quiz",
            duration: "10 mins",
            description: "Test your understanding of tool schemas, hallucination mitigation, and reasoning steps.",
            quizQuestions: [
              {
                question: "What is the primary role of the observation step in a ReAct loop?",
                options: [
                  "To format the output as HTML",
                  "To feed the tool's execution result back into the LLM context for subsequent reasoning",
                  "To terminate the agent immediately",
                  "To compress the prompt into vector embeddings"
                ],
                correctAnswerIndex: 1,
                explanation: "The observation feeds the execution return value back to the LLM so it can decide the next logical step."
              },
              {
                question: "Why should Pydantic schemas be used for LLM tool arguments?",
                options: [
                  "To enforce strict type casting and validation on LLM JSON outputs before execution",
                  "To speed up internet connection speed",
                  "To replace the LLM tokenizer",
                  "To disable agent recursion"
                ],
                correctAnswerIndex: 0,
                explanation: "Pydantic ensures runtime type safety and validates that all required parameters are present."
              }
            ]
          },
          {
            id: "l-s1-4",
            title: "Hands-On Lab: Build an Autonomous Weather & Flight Agent",
            type: "assignment",
            duration: "45 mins",
            description: "Build a multi-tool agent that calls real weather APIs and flight lookups to plan a travel itinerary.",
            assignmentBrief: "Using LangChain/LangGraph, instantiate a tool-calling agent with 2 custom tools: `get_live_weather(city)` and `search_flights(origin, destination)`. The agent must handle invalid airport codes gracefully.",
            deliverables: [
              "Python script `travel_agent.py` implementing the agent loop",
              "Execution log showing reasoning trace and tool observations",
              "Unit tests verifying error handling when a tool throws a 404"
            ],
            starterFileUrl: "https://glarus.edu/assets/labs/agent_lab_starter.zip",
            starterFileName: "Agentic_AI_Lab1_Starter.zip"
          },
          {
            id: "l-s1-5",
            title: "Downloadable Architecture Cheatsheet & Code Starter",
            type: "resource",
            size: "3.2 MB",
            description: "High-resolution architectural diagram and production boilerplate repository.",
            resourceUrl: "https://glarus.edu/resources/agentic_ai_cheatsheet.pdf",
            resourceFileName: "Agentic_AI_Architecture_Cheatsheet.pdf"
          }
        ]
      },
      {
        id: "s-sarah-2",
        title: "Section 2: Multi-Agent Swarms with LangGraph",
        description: "State synchronization, supervisor routers, and cyclical graph workflows.",
        items: [
          {
            id: "l-s2-1",
            title: "Hierarchical Supervisor Agents & Delegations",
            type: "video",
            duration: "32m 00s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            description: "Coordinating specialized sub-agents (Coder, Reviewer, Tester) under a central orchestrator.",
            notes: "Using Enum routing to deterministically transition between state nodes."
          },
          {
            id: "l-s2-2",
            title: "Shared State & Memory Synchronization",
            type: "video",
            duration: "28m 15s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            description: "Managing concurrent message buffers and reducer functions across agent workers.",
            notes: "Avoiding state race conditions in LangGraph with channel reducers."
          },
          {
            id: "l-s2-3",
            title: "Capstone Project: 24/7 Autonomous GitHub Code Reviewer",
            type: "assignment",
            duration: "1.5 hours",
            description: "Deploy an agent team that listens to GitHub webhooks, analyzes pull request diffs, and posts review comments.",
            assignmentBrief: "Build a stateful LangGraph pipeline with a Lead Reviewer node, a Security Auditor node, and a Performance Profiler node.",
            deliverables: [
              "Complete LangGraph workflow definition",
              "Sample PR review output on a real open-source repo",
              "Dockerfile for continuous deployment"
            ],
            starterFileUrl: "https://glarus.edu/assets/labs/capstone_agent.zip",
            starterFileName: "Github_Reviewer_Capstone.zip"
          }
        ]
      }
    ]
  },
  {
    id: "c-sarah-2",
    title: "Autonomous Workflows with LangGraph",
    instructorId: "inst-1",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    instructorAvatar: "SC",
    category: "Artificial Intelligence",
    price: 4999,
    level: "Intermediate",
    duration: "16h 15m • 6 Modules",
    enrolledStudents: 890,
    revenue: 4449110,
    status: "PUBLISHED",
    rating: 4.88,
    reviewsCount: 89,
    updatedAt: "02 Feb 2026",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailGradient: "from-indigo-950 via-purple-900 to-slate-950",
    description:
      "Build robust stateful multi-actor agent workflows with cyclic graphs, persistent checkpoints, and human-in-the-loop approvals using LangGraph.",
    prerequisites: [
      "Familiarity with Python 3.10+ and async programming",
      "Experience with basic LangChain or OpenAI function calling"
    ],
    outcomes: [
      "Design resilient state machines with LangGraph state graphs",
      "Implement checkpointing with Postgres and Redis",
      "Add human-in-the-loop pauses and approval steps",
      "Deploy scalable serverless agent endpoints"
    ],
    targetAudience: "Developers looking to build reliable, production-grade agentic workflows without infinite loops.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 97,
      videoClarityScore: 98,
      completenessScore: 99
    },
    sections: [
      {
        id: "s-lg-1",
        title: "Section 1: LangGraph Architecture & Cyclic State",
        description: "State graph fundamentals, nodes, edges, and conditional routing.",
        items: [
          {
            id: "l-lg-1",
            title: "Why DAGs Fail: The Need for Cyclic Graphs in AI Agents",
            type: "video",
            duration: "19m 45s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            description: "Understanding cyclic loops, self-correction, and state persistence.",
            notes: "Graphs enable reflection steps that standard linear chains cannot support."
          },
          {
            id: "l-lg-2",
            title: "Defining Typed State & Channel Reducers",
            type: "video",
            duration: "25m 10s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            description: "Implementing TypedDict schemas and operator.add list appends.",
            notes: "Always define strict type boundaries to prevent state corruption."
          },
          {
            id: "l-lg-3",
            title: "Quiz: State Management & Reducer Semantics",
            type: "quiz",
            duration: "10 mins",
            description: "Validate knowledge of state transitions and conditional routing.",
            quizQuestions: [
              {
                question: "What happens when multiple nodes update the same state key without a reducer?",
                options: [
                  "The last written value overwrites previous values",
                  "The program crashes immediately",
                  "Values are automatically merged as JSON",
                  "A runtime warning is printed"
                ],
                correctAnswerIndex: 0,
                explanation: "Without a custom reducer function, state updates in LangGraph default to direct value replacement."
              }
            ]
          },
          {
            id: "l-lg-4",
            title: "Lab: Build a Self-Correcting Code Generator Agent",
            type: "assignment",
            duration: "50 mins",
            description: "Create an agent that writes Python code, executes it in a sandbox, and rewrites on error.",
            deliverables: ["State graph script", "Sandbox execution wrapper", "Unit test suite"],
            starterFileUrl: "https://glarus.edu/assets/labs/langgraph_code_gen.zip",
            starterFileName: "LangGraph_CodeGen_Lab.zip"
          }
        ]
      },
      {
        id: "s-lg-2",
        title: "Section 2: Persistence & Human-in-the-Loop",
        description: "Checkpointers, time-travel debugging, and manual human approvals.",
        items: [
          {
            id: "l-lg-201",
            title: "Postgres Checkpointing & Thread Resumption",
            type: "video",
            duration: "22m 30s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            description: "Saving graph state snapshots across sessions using SqliteSaver and PostgresSaver."
          },
          {
            id: "l-lg-202",
            title: "Implementing Interrupts for Human Approval",
            type: "video",
            duration: "27m 00s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            description: "Pausing agent execution before high-stakes tool actions and resuming with human feedback."
          }
        ]
      }
    ]
  },
  {
    id: "c-alex-1",
    title: "Advanced RAG Architecture & Vector Search",
    instructorId: "inst-2",
    instructor: "Alex Chen",
    instructorEmail: "alex.chen@glarus.edu",
    instructorAvatar: "AC",
    category: "Autonomous Systems",
    price: 5999,
    level: "Intermediate",
    duration: "15h 00m • 5 Modules",
    enrolledStudents: 320,
    revenue: 1919680,
    status: "PENDING_APPROVAL",
    rating: 4.8,
    reviewsCount: 12,
    updatedAt: "Today",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailGradient: "from-sky-950 via-indigo-950 to-slate-950",
    description:
      "Enterprise retrieval systems with hybrid search, re-ranking, and metadata filtering. Master chunking strategies, dense embeddings, and agentic query rewriting.",
    prerequisites: ["Python proficiency", "Basic knowledge of vector embeddings"],
    outcomes: [
      "Implement hybrid dense + sparse BM25 retrieval",
      "Deploy Cohere cross-encoder reranking pipelines",
      "Build agentic query decomposition workflows",
      "Benchmark retrieval quality with Ragas metrics"
    ],
    targetAudience: "Backend and AI Engineers optimizing enterprise search and knowledge retrieval.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 95,
      videoClarityScore: 97,
      completenessScore: 96
    },
    sections: [
      {
        id: "s-alex-1",
        title: "Section 1: Semantic Embeddings & Hybrid Search",
        description: "Vector database indexing, distance metrics, and sparse keyword synergy.",
        items: [
          {
            id: "l-alex-1",
            title: "Dense vs Sparse Retrieval: Combining Qdrant & BM25",
            type: "video",
            duration: "21m 00s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            description: "Why pure semantic search fails on keyword lookups and how reciprocal rank fusion solves it."
          },
          {
            id: "l-alex-2",
            title: "Hands-on Lab: Hybrid Search Pipeline with Reranking",
            type: "assignment",
            duration: "45 mins",
            description: "Build an end-to-end retrieval system indexing 10,000 PDF pages with sub-50ms latency.",
            deliverables: ["Pipeline script", "Benchmark results", "Qdrant collection setup"]
          }
        ]
      }
    ]
  },
  {
    id: "c-john-1",
    title: "React 19 Masterclass: Architecture to Production",
    instructorId: "inst-3",
    instructor: "John Doe",
    instructorEmail: "john.doe@glarus.edu",
    instructorAvatar: "JD",
    category: "Frontend Engineering",
    price: 3499,
    level: "Advanced",
    duration: "22h 00m • 12 Modules",
    enrolledStudents: 967,
    revenue: 3383533,
    status: "PUBLISHED",
    rating: 4.75,
    reviewsCount: 78,
    updatedAt: "05 Feb 2026",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailGradient: "from-blue-950 via-sky-900 to-slate-950",
    description:
      "Master React Server Components, Actions, useActionState, useOptimistic, Suspense streaming, and high-performance architectural patterns.",
    prerequisites: ["Solid React fundamentals", "TypeScript basics"],
    outcomes: [
      "Master Server vs Client Component boundaries",
      "Build zero-bundle mutations with Server Actions",
      "Implement optimistic UI with instantaneous feedback",
      "Optimize core web vitals and bundle size"
    ],
    targetAudience: "Frontend and Full-Stack Engineers wanting to build modern, lightning-fast web applications.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 96,
      videoClarityScore: 98,
      completenessScore: 97
    },
    sections: [
      {
        id: "s-john-1",
        title: "Section 1: React 19 Core Mental Model & Server Components",
        description: "Server Actions, form hooks, and streaming architecture.",
        items: [
          {
            id: "l-john-1",
            title: "Server Actions & useActionState Deep Dive",
            type: "video",
            duration: "26m 30s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            description: "How React 19 revolutionizes form submissions and async state transitions."
          },
          {
            id: "l-john-2",
            title: "Practical Assignment: Optimistic Task Management Board",
            type: "assignment",
            duration: "1 hour",
            description: "Build an interactive Kanban board with useOptimistic and Server Actions."
          }
        ]
      }
    ]
  },
  {
    id: "c-john-2",
    title: "TypeScript for High-Scale Enterprise",
    instructorId: "inst-3",
    instructor: "John Doe",
    instructorEmail: "john.doe@glarus.edu",
    instructorAvatar: "JD",
    category: "Software Engineering",
    price: 2999,
    level: "Advanced",
    duration: "14h 30m • 8 Modules",
    enrolledStudents: 450,
    revenue: 1349550,
    status: "PUBLISHED",
    rating: 4.68,
    reviewsCount: 45,
    updatedAt: "14 Feb 2026",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    thumbnailGradient: "from-indigo-950 via-slate-900 to-black",
    description:
      "Advanced generic programming, template literal types, conditional type gymnastics, and robust enterprise patterns for large codebases.",
    prerequisites: ["Intermediate JavaScript and TypeScript"],
    outcomes: [
      "Master advanced conditional types and infer keywords",
      "Build strictly typed API clients and SDKs",
      "Prevent runtime bugs with branded types"
    ],
    targetAudience: "Senior Engineers looking to master TypeScript's advanced type system.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 94,
      videoClarityScore: 96,
      completenessScore: 95
    },
    sections: [
      {
        id: "s-ts-1",
        title: "Section 1: Advanced Type System Patterns",
        description: "Conditional types, template literals, and mapped types.",
        items: [
          {
            id: "l-ts-1",
            title: "Type Gymnastics: Deep Dive into Conditional Types & Infer",
            type: "video",
            duration: "28m 00s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            description: "Unlocking recursive type transformations and extracting inner function return types."
          }
        ]
      }
    ]
  },
  {
    id: "crs-101",
    title: "Advanced AI Agents & Autonomous Workflows",
    instructorId: "inst-1",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    instructorAvatar: "SC",
    category: "Artificial Intelligence",
    price: 1499,
    level: "Advanced",
    duration: "18h 40m",
    enrolledStudents: 1842,
    revenue: 485600,
    status: "PUBLISHED",
    rating: 4.9,
    reviewsCount: 142,
    updatedAt: "Today, 10:30 AM",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailGradient: "from-purple-900 to-indigo-950",
    description:
      "A comprehensive, enterprise-grade immersion into Autonomous Agent Engineering. Learn how to architect stateful multi-agent teams using LangGraph, coordinate reasoning loops with ReAct, enforce structured tool-calling validations, and deploy self-correcting RAG systems capable of 24/7 production reliability.",
    prerequisites: [
      "Proficiency in Python 3.10+ (asyncio, type hints, pydantic)",
      "Fundamental knowledge of OpenAI or Anthropic API completions",
      "Basic understanding of vector embeddings and semantic search"
    ],
    outcomes: [
      "Architect autonomous multi-agent loops with cyclic state graphs (LangGraph)",
      "Implement deterministic JSON schema tool-calling with Pydantic validation",
      "Build self-healing RAG pipelines with semantic query routing and reranking",
      "Deploy scalable Agent APIs using FastAPI, Docker, and Redis persistence"
    ],
    targetAudience: "Senior Software Engineers, AI Engineers, and Tech Leads looking to move from prompt engineering to production autonomous systems.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 98,
      videoClarityScore: 99,
      completenessScore: 100
    },
    sections: [
      {
        id: "s-1",
        title: "Section 1: Foundations of Agentic AI & ReAct Loops",
        description: "Core architectural patterns of reasoning, tool-calling, and deterministic execution.",
        items: [
          {
            id: "l-101",
            title: "Introduction to the ReAct (Reason + Act) Framework",
            type: "video",
            duration: "18m 10s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            description: "Deep dive into how LLMs reason through sequential thoughts, actions, and environment observations.",
            notes: "Key takeaways: Observation buffering, token conservation, and handling tool output errors gracefully."
          },
          {
            id: "l-102",
            title: "Tool Calling, Schema Validation & Structured Outputs",
            type: "video",
            duration: "24m 30s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            description: "Implementing rigorous Pydantic schemas for multi-tool binding with OpenAI and Claude.",
            notes: "Best practices for writing self-documenting JSON parameter descriptions."
          },
          {
            id: "l-103",
            title: "Section 1 Knowledge Check: Tool Calling Mechanics",
            type: "quiz",
            duration: "10 mins",
            description: "Test your understanding of tool schemas, hallucination mitigation, and reasoning steps.",
            quizQuestions: [
              {
                question: "What is the primary role of the observation step in a ReAct loop?",
                options: [
                  "To format the output as HTML",
                  "To feed the tool's execution result back into the LLM context for subsequent reasoning",
                  "To terminate the agent immediately",
                  "To compress the prompt into vector embeddings"
                ],
                correctAnswerIndex: 1,
                explanation: "The observation feeds the execution return value back to the LLM so it can decide the next logical step."
              },
              {
                question: "Why should Pydantic schemas be used for LLM tool arguments?",
                options: [
                  "To enforce strict type casting and validation on LLM JSON outputs before execution",
                  "To speed up internet connection speed",
                  "To replace the LLM tokenizer",
                  "To disable agent recursion"
                ],
                correctAnswerIndex: 0,
                explanation: "Pydantic ensures runtime type safety and validates that all required parameters are present."
              }
            ]
          },
          {
            id: "l-104",
            title: "Hands-On Lab: Build an Autonomous Weather & Flight Agent",
            type: "assignment",
            duration: "45 mins",
            description: "Build a multi-tool agent that calls real weather APIs and flight lookups to plan a travel itinerary.",
            assignmentBrief: "Using LangChain/LangGraph, instantiate a tool-calling agent with 2 custom tools: `get_live_weather(city)` and `search_flights(origin, destination)`. The agent must handle invalid airport codes gracefully.",
            deliverables: [
              "Python script `travel_agent.py` implementing the agent loop",
              "Execution log showing reasoning trace and tool observations",
              "Unit tests verifying error handling when a tool throws a 404"
            ],
            starterFileUrl: "https://glarus.edu/assets/labs/agent_lab_starter.zip",
            starterFileName: "Agentic_AI_Lab1_Starter.zip"
          },
          {
            id: "l-105",
            title: "Downloadable Architecture Cheatsheet & Code Starter",
            type: "resource",
            size: "3.2 MB",
            description: "High-resolution architectural diagram and production boilerplate repository.",
            resourceUrl: "https://glarus.edu/resources/agentic_ai_cheatsheet.pdf",
            resourceFileName: "Agentic_AI_Architecture_Cheatsheet.pdf"
          }
        ]
      },
      {
        id: "s-2",
        title: "Section 2: Multi-Agent Swarms with LangGraph",
        description: "State synchronization, supervisor routers, and cyclical graph workflows.",
        items: [
          {
            id: "l-201",
            title: "Hierarchical Supervisor Agents & Delegations",
            type: "video",
            duration: "32m 00s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            description: "Coordinating specialized sub-agents (Coder, Reviewer, Tester) under a central orchestrator.",
            notes: "Using Enum routing to deterministically transition between state nodes."
          },
          {
            id: "l-202",
            title: "Shared State & Memory Synchronization",
            type: "video",
            duration: "28m 15s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            description: "Managing concurrent message buffers and reducer functions across agent workers.",
            notes: "Avoiding state race conditions in LangGraph with channel reducers."
          },
          {
            id: "l-203",
            title: "Capstone Project: 24/7 Autonomous GitHub Code Reviewer",
            type: "assignment",
            duration: "1.5 hours",
            description: "Deploy an agent team that listens to GitHub webhooks, analyzes pull request diffs, and posts review comments.",
            assignmentBrief: "Build a stateful LangGraph pipeline with a Lead Reviewer node, a Security Auditor node, and a Performance Profiler node.",
            deliverables: [
              "Complete LangGraph workflow definition",
              "Sample PR review output on a real open-source repo",
              "Dockerfile for continuous deployment"
            ],
            starterFileUrl: "https://glarus.edu/assets/labs/capstone_agent.zip",
            starterFileName: "Github_Reviewer_Capstone.zip"
          }
        ]
      }
    ]
  },
  {
    id: "crs-102",
    title: "Mastering Next.js 14 App Router & Server Actions",
    instructorId: "inst-2",
    instructor: "Jordan Walke",
    instructorEmail: "jordan.w@glarus.edu",
    instructorAvatar: "JW",
    category: "Web Development",
    price: 3499,
    level: "Intermediate",
    duration: "14h 20m",
    enrolledStudents: 0,
    revenue: 0,
    status: "PENDING_APPROVAL",
    rating: 0,
    reviewsCount: 0,
    updatedAt: "Yesterday, 4:15 PM",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailGradient: "from-neutral-900 to-slate-900",
    description:
      "Learn Next.js 14 App Router from mental model to high-scale enterprise production. Master React Server Components (RSC), Client Component boundaries, progressive streaming with Suspense, Server Actions mutations, optimistic UI, and edge middleware authentication.",
    prerequisites: [
      "Solid React fundamentals (Hooks, JSX, component lifecycles)",
      "Basic TypeScript and modern ES6+ JavaScript",
      "Familiarity with SQL or ORM data fetching"
    ],
    outcomes: [
      "Master Server vs Client Component boundaries and serialization constraints",
      "Build mutation pipelines with Server Actions, `useActionState`, and `revalidatePath`",
      "Implement nested layouts with parallel routing and intercepting modals",
      "Optimize core web vitals with streaming SSR and Next.js Image/Font optimization"
    ],
    targetAudience: "Frontend and Full-Stack Developers transitioning from Pages Router or traditional SPAs to Next.js App Router.",
    aiQualityReport: {
      status: "FLAGGED",
      flags: [
        "Audio volume levels in Section 2 Video 1 fall below -24 LUFS standard threshold.",
        "Consider re-recording or applying audio normalization before publishing."
      ],
      audioScore: 78,
      videoClarityScore: 95,
      completenessScore: 94
    },
    sections: [
      {
        id: "s-next-1",
        title: "Section 1: App Router Mental Model & Foundations",
        description: "Understanding server components, bundling, and client hydration.",
        items: [
          {
            id: "l-next-101",
            title: "Introduction to App Router & Architecture",
            type: "video",
            duration: "12m 40s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            description: "How React Server Components decouple server rendering from browser bundle size.",
            notes: "Server components execute exclusively on the server and transmit zero JS to the client."
          },
          {
            id: "l-next-102",
            title: "Server vs Client Component Boundaries",
            type: "video",
            duration: "18m 10s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            description: "When to use 'use client', passing server components as children, and serialization rules.",
            notes: "Golden rule: Keep 'use client' as far down the component leaf tree as possible."
          },
          {
            id: "l-next-103",
            title: "Next.js 14 Project Assets & Starter Repo",
            type: "resource",
            size: "2.4 MB",
            description: "Includes starter Figma designs, Tailwind tokens, and Prisma database schema.",
            resourceUrl: "https://glarus.edu/assets/nextjs14_starter.zip",
            resourceFileName: "Next14_Enterprise_Boilerplate.zip"
          }
        ]
      },
      {
        id: "s-next-2",
        title: "Section 2: Data Fetching, Mutations & Streaming",
        description: "Server Actions, revalidation tags, and Suspense boundaries.",
        items: [
          {
            id: "l-next-201",
            title: "Server Actions Basics & Form Mutations",
            type: "video",
            duration: "24m 00s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            description: "Creating zero-API mutation functions directly inside server actions.",
            notes: "Using `useOptimistic` for instant client-side updates while database operations complete."
          },
          {
            id: "l-next-202",
            title: "Streaming UI & Granular Suspense Boundaries",
            type: "video",
            duration: "31m 15s",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            description: "Streaming slow database queries with `loading.tsx` and custom React `<Suspense>` wrappers.",
            notes: "Enables sub-100ms First Contentful Paint even on heavy analytics dashboards."
          },
          {
            id: "l-next-203",
            title: "Section 2 Quiz: Server Actions & Caching",
            type: "quiz",
            duration: "15 mins",
            description: "Verify your understanding of cache tag revalidation, action error handling, and cookies.",
            quizQuestions: [
              {
                question: "What function is used to invalidate a specific cache tag in Next.js 14?",
                options: [
                  "revalidateTag('my-tag')",
                  "invalidateCache('my-tag')",
                  "clearTag('my-tag')",
                  "refreshRoute('my-tag')"
                ],
                correctAnswerIndex: 0,
                explanation: "`revalidateTag()` purges all cache entries associated with the specified tag name on-demand."
              },
              {
                question: "Can sensitive database secrets be safely accessed inside a Server Action?",
                options: [
                  "Yes, because Server Actions execute solely on the server environment",
                  "No, server actions leak to client bundles",
                  "Only if encrypted with RSA",
                  "Only in development mode"
                ],
                correctAnswerIndex: 0,
                explanation: "Server Actions run only in Node.js/Edge server environments and never expose private environment keys."
              }
            ]
          },
          {
            id: "l-next-204",
            title: "Practical Assignment: Build an E-Commerce Cart with Server Actions",
            type: "assignment",
            duration: "1 hour",
            description: "Implement add-to-cart, optimistic quantity increments, and checkout mutation actions.",
            assignmentBrief: "Build an interactive e-commerce product drawer using React 19 / Next.js 14 Server Actions with optimistic UI updates.",
            deliverables: [
              "Cart drawer component with `useOptimistic` count",
              "Server action with cookie session storage",
              "Full validation with Zod schemas"
            ],
            starterFileUrl: "https://glarus.edu/assets/labs/ecommerce_cart.zip",
            starterFileName: "Cart_Server_Action_Starter.zip"
          }
        ]
      }
    ]
  }
];

export function getDetailedCourseById(id: string): DetailedCoursePreview | undefined {
  const cleanId = decodeURIComponent(id || "").trim();
  const lowerId = cleanId.toLowerCase();

  // 1. Direct match by ID
  const directMatch = MOCK_DETAILED_COURSES.find(
    (c) => c.id.toLowerCase() === lowerId || c.id === cleanId
  );
  if (directMatch) return directMatch;

  // 2. Substring or title match
  const titleMatch = MOCK_DETAILED_COURSES.find(
    (c) =>
      c.title.toLowerCase().includes(lowerId) ||
      lowerId.includes(c.title.toLowerCase()) ||
      lowerId.includes(c.id.toLowerCase())
  );
  if (titleMatch) return titleMatch;

  // 3. Fallback: Generate a structured course preview if unknown ID
  return {
    id: cleanId,
    title: cleanId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    instructorId: "inst-1",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "sarah.chen@glarus.edu",
    instructorAvatar: "SC",
    category: "AI & Technology",
    price: 4999,
    level: "Intermediate",
    duration: "16h 00m • 6 Modules",
    enrolledStudents: 240,
    revenue: 1199760,
    status: "PUBLISHED",
    rating: 4.9,
    reviewsCount: 24,
    updatedAt: "Recent",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailGradient: "from-purple-900 to-indigo-950",
    description:
      "A comprehensive curriculum built to guide students through production-grade engineering concepts, real-world patterns, and hands-on projects.",
    prerequisites: [
      "Basic programming knowledge in Python / TypeScript",
      "Understanding of modern web application concepts"
    ],
    outcomes: [
      "Master core concepts and architectural building blocks",
      "Implement end-to-end practical projects and real-world workflows",
      "Deploy production-ready solutions with best practices"
    ],
    targetAudience: "Engineers and developers looking to elevate their practical engineering skillset.",
    aiQualityReport: {
      status: "OPTIMAL",
      flags: [],
      audioScore: 96,
      videoClarityScore: 98,
      completenessScore: 95
    },
    sections: MOCK_DETAILED_COURSES[0].sections
  };
}
