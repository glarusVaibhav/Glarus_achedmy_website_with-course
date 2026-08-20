import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateRecordingAvailability } from "@/lib/recordingAvailability";

export interface RecordingItem {
  id: string;
  sessionTitle: string;
  courseName: string;
  courseId: string;
  instructor: string;
  instructorId: string;
  instructorAvatar?: string;
  module: string;
  sessionNumber: string;
  recordingUrl: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  completedAt: string;
  topics: string[];
  agenda: Array<{
    id: string;
    stepNumber: number;
    title: string;
    duration: string;
    timestampSeconds: number;
    timestampFormatted: string;
    description?: string;
  }>;
  takeaways: string[];
  resources: Array<{
    id: string;
    title: string;
    type: "pdf" | "github" | "notebook" | "cheatsheet";
    size?: string;
    url: string;
  }>;
  watchProgress: {
    secondsWatched: number;
    percent: number;
    status: "UNWATCHED" | "IN_PROGRESS" | "WATCHED";
    lastWatchedFormatted?: string;
    resumeTimestampSeconds?: number;
    updatedAt: string;
  };
  notesCount: number;
}

// In-memory persistent progress store for demo/session persistence
const userProgressStore: Record<string, Record<string, { secondsWatched: number; percent: number; status: "UNWATCHED" | "IN_PROGRESS" | "WATCHED"; updatedAt: string }>> = {
  default: {
    "rec-rag-vector-db": { secondsWatched: 4178, percent: 68, status: "IN_PROGRESS", updatedAt: new Date().toISOString() },
    "rec-vllm-inference": { secondsWatched: 2772, percent: 42, status: "IN_PROGRESS", updatedAt: new Date().toISOString() },
    "rec-langgraph-agents": { secondsWatched: 6900, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-transformer-math": { secondsWatched: 6480, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-dense-sparse-search": { secondsWatched: 5400, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-fastapi-ai-microservices": { secondsWatched: 6300, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-graphrag-kg": { secondsWatched: 7200, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-pytorch-nn-arch": { secondsWatched: 7080, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-foundation-tokenomics": { secondsWatched: 5100, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-lora-finetuning": { secondsWatched: 0, percent: 0, status: "UNWATCHED", updatedAt: new Date().toISOString() },
    "rec-mcp-tooling": { secondsWatched: 0, percent: 0, status: "UNWATCHED", updatedAt: new Date().toISOString() },
    "rec-rag-triad-eval": { secondsWatched: 0, percent: 0, status: "UNWATCHED", updatedAt: new Date().toISOString() },
    "rec-intro-deep-learning": { secondsWatched: 5400, percent: 100, status: "WATCHED", updatedAt: new Date().toISOString() },
    "rec-legacy-prompt-design": { secondsWatched: 3200, percent: 64, status: "IN_PROGRESS", updatedAt: new Date().toISOString() },
  }
};

export function getProgressStore(userId: string) {
  if (!userProgressStore[userId]) {
    userProgressStore[userId] = JSON.parse(JSON.stringify(userProgressStore.default));
  }
  return userProgressStore[userId];
}

const RAW_RECORDINGS: RecordingItem[] = [
  {
    id: "rec-mcp-tooling",
    sessionTitle: "Model Context Protocol (MCP) & Agent Tooling",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Elena Rostova",
    instructorId: "inst-elena",
    instructorAvatar: "ER",
    module: "Module 6: Agent Protocols & Integrations",
    sessionNumber: "Live Class #5",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "/images/m13_mcp_architecture.png",
    duration: "1h 35m",
    durationSeconds: 5700,
    completedAt: "2026-08-17T08:00:00.000Z",
    topics: ["MCP", "Anthropic Claude", "Tool Calling", "JSON-RPC", "FastAPI"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "What is Model Context Protocol (MCP)?", duration: "15m", timestampSeconds: 0, timestampFormatted: "00:00", description: "The open standard connecting AI models to external tools and data sources" },
      { id: "ag-2", stepNumber: 2, title: "MCP Client vs Server Architecture & Lifecycle", duration: "20m", timestampSeconds: 900, timestampFormatted: "15:00", description: "JSON-RPC 2.0 transport over stdio and SSE" },
      { id: "ag-3", stepNumber: 3, title: "Building a Custom MCP Server for SQL & PostgreSQL", duration: "25m", timestampSeconds: 2100, timestampFormatted: "35:00", description: "Exposing read/write resources, prompts, and callable tools securely" },
      { id: "ag-4", stepNumber: 4, title: "Client Connection with Claude Desktop & Cursor", duration: "20m", timestampSeconds: 3600, timestampFormatted: "1:00:00", description: "Configuring mcp_config.json and debugging with MCP Inspector" },
      { id: "ag-5", stepNumber: 5, title: "Live Demo: Multi-Tool Agentic SQL Automation", duration: "15m", timestampSeconds: 4800, timestampFormatted: "1:20:00", description: "Building a zero-shot database analysis agent with automated chart generation" },
    ],
    takeaways: [
      "Understand the full MCP specification, transport protocols, and security models",
      "Build, test, and publish custom Python and TypeScript MCP servers",
      "Wire up intelligent LLM clients capable of dynamic tool discovery and execution",
    ],
    resources: [
      { id: "res-1", title: "MCP Specification & Architecture Guide (PDF)", type: "pdf", size: "8.6 MB", url: "#" },
      { id: "res-2", title: "Custom MCP Server Boilerplate (GitHub)", type: "github", url: "https://github.com/glarus-academy/mcp-server-template" },
      { id: "res-3", title: "MCP Inspector & Testing Suite Notebook", type: "notebook", size: "2.1 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 0,
      percent: 0,
      status: "UNWATCHED",
      updatedAt: "2026-08-17T09:30:00.000Z",
    },
    notesCount: 0,
  },
  {
    id: "rec-rag-vector-db",
    sessionTitle: "Advanced RAG & Vector Databases",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Elena Rostova",
    instructorId: "inst-elena",
    instructorAvatar: "ER",
    module: "Module 4: Retrieval Systems & Vector DBs",
    sessionNumber: "Live Class #4",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "/images/enterprise_rag_hero_ui.png",
    duration: "1h 42m",
    durationSeconds: 6120,
    completedAt: "2026-08-15T15:30:00.000Z",
    topics: ["RAG", "Vector Databases", "LangChain", "Hybrid Search", "Pinecone"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Introduction to Production RAG Architecture", duration: "15m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why naive RAG fails in enterprise workloads and core architectural primitives" },
      { id: "ag-2", stepNumber: 2, title: "High-Dimensional Vector Embeddings & Similarity Math", duration: "18m", timestampSeconds: 900, timestampFormatted: "15:00", description: "Cosine similarity, dot product vs Euclidean distance with Voyage and OpenAI text-embedding-3" },
      { id: "ag-3", stepNumber: 3, title: "Vector Databases Deep-Dive (Pinecone, Qdrant & pgvector)", duration: "25m", timestampSeconds: 1980, timestampFormatted: "33:00", description: "HNSW indexing, IVFFlat partitions, filtering and metadata quantization" },
      { id: "ag-4", stepNumber: 4, title: "End-to-End Retrieval Pipeline with BM25 Reranking", duration: "20m", timestampSeconds: 3480, timestampFormatted: "58:00", description: "Reciprocal Rank Fusion (RRF) and Cohere Rerank v3 integration" },
      { id: "ag-5", stepNumber: 5, title: "LangChain & LlamaIndex Autonomous Retriever Agent", duration: "14m", timestampSeconds: 4680, timestampFormatted: "1:18:00", description: "Building self-correcting query rewrite retrievers in TypeScript and Python" },
      { id: "ag-6", stepNumber: 6, title: "Interactive Student Q&A & Code Walkthrough", duration: "10m", timestampSeconds: 5520, timestampFormatted: "1:32:00", description: "Addressing latency optimization, cold start spikes, and chunk size benchmarking" },
    ],
    takeaways: [
      "Master hybrid sparse-dense vector retrieval combining BM25 with HNSW vectors",
      "Deploy scalable Qdrant and pgvector clusters for multi-tenant enterprise search",
      "Implement multi-stage query routing and contextual reranking to eliminate hallucination",
    ],
    resources: [
      { id: "res-1", title: "RAG Architecture Deep-Dive Slides (PDF)", type: "pdf", size: "14.2 MB", url: "#" },
      { id: "res-2", title: "Complete Production RAG Starter Repo (GitHub)", type: "github", url: "https://github.com/glarus-academy/advanced-rag-masterclass" },
      { id: "res-3", title: "Hybrid Search & BM25 Benchmark Notebook (Jupyter)", type: "notebook", size: "4.8 MB", url: "#" },
      { id: "res-4", title: "Vector Database Indexing Cheat Sheet", type: "cheatsheet", size: "1.5 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 4178,
      percent: 68,
      status: "IN_PROGRESS",
      lastWatchedFormatted: "69:38",
      resumeTimestampSeconds: 2538,
      updatedAt: "2026-08-16T11:20:00.000Z",
    },
    notesCount: 3,
  },
  {
    id: "rec-rag-triad-eval",
    sessionTitle: "LLMOps, RAG Triad Evaluation & Tracing with TruLens",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Dr. Alex Vance",
    instructorId: "inst-alex",
    instructorAvatar: "AV",
    module: "Module 5: LLMOps & Evaluation",
    sessionNumber: "Live Class #6",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "/images/m17_rag_triad_eval.png",
    duration: "2h 10m",
    durationSeconds: 7800,
    completedAt: "2026-08-14T17:00:00.000Z",
    topics: ["RAG Triad", "TruLens", "Groundedness", "Context Relevance", "Observability"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "The RAG Evaluation Crisis in Production", duration: "18m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why user feedback is too late and the need for synthetic golden evaluation datasets" },
      { id: "ag-2", stepNumber: 2, title: "The RAG Triad: Context Relevance, Groundedness & Answer Relevance", duration: "30m", timestampSeconds: 1080, timestampFormatted: "18:00", description: "Mathematical formulation of LLM-as-a-judge feedback functions" },
      { id: "ag-3", stepNumber: 3, title: "Hands-on TruLens & LangSmith Instrumentation", duration: "35m", timestampSeconds: 2880, timestampFormatted: "48:00", description: "Tracing chain latency, token consumption, and cost per query across thousands of inferences" },
      { id: "ag-4", stepNumber: 4, title: "Automating CI/CD Regression Tests for Prompt & Model Updates", duration: "25m", timestampSeconds: 4980, timestampFormatted: "1:23:00", description: "Preventing silent regressions before merging to production staging" },
      { id: "ag-5", stepNumber: 5, title: "Interactive Workshop: Debugging Low Groundedness Hallucinations", duration: "22m", timestampSeconds: 6480, timestampFormatted: "1:48:00", description: "Live code fixes improving accuracy from 62% to 96%" },
    ],
    takeaways: [
      "Quantify RAG pipeline quality using the industry standard RAG Triad metrics",
      "Deploy automated TruLens and LangSmith evaluation dashboards for real-time observability",
      "Set up CI/CD regression gates to block poor prompt or retrieval configurations",
    ],
    resources: [
      { id: "res-1", title: "RAG Triad Evaluation Handbook (PDF)", type: "pdf", size: "11.4 MB", url: "#" },
      { id: "res-2", title: "TruLens + LangChain Evaluation Suite (GitHub)", type: "github", url: "https://github.com/glarus-academy/rag-evaluation-suite" },
      { id: "res-3", title: "Synthetic Dataset Generation with Ragas (Jupyter)", type: "notebook", size: "5.2 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 0,
      percent: 0,
      status: "UNWATCHED",
      updatedAt: "2026-08-14T19:00:00.000Z",
    },
    notesCount: 0,
  },
  {
    id: "rec-langgraph-agents",
    sessionTitle: "Multi-Agent Systems & LangGraph Hierarchies",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Dr. Alex Vance",
    instructorId: "inst-alex",
    instructorAvatar: "AV",
    module: "Module 5: Multi-Agent Architectures",
    sessionNumber: "Live Class #3",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "/images/multi_agent_architectures.png",
    duration: "1h 55m",
    durationSeconds: 6900,
    completedAt: "2026-08-12T16:00:00.000Z",
    topics: ["LangGraph", "Multi-Agent", "Hierarchical Agents", "State Management", "Human-in-the-loop"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "From Simple Chains to State Graphs", duration: "15m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why linear chains break down for complex multi-turn workflows" },
      { id: "ag-2", stepNumber: 2, title: "LangGraph StateGraph, Nodes & Conditional Edges", duration: "30m", timestampSeconds: 900, timestampFormatted: "15:00", description: "Designing cycles, branching logic, and persistent checkpointing" },
      { id: "ag-3", stepNumber: 3, title: "Supervisor & Worker Pattern with Specialized Roles", duration: "35m", timestampSeconds: 2700, timestampFormatted: "45:00", description: "Orchestrating research, code generation, and reviewer agent swarms" },
      { id: "ag-4", stepNumber: 4, title: "Human-in-the-Loop Interrupts & State Rollbacks", duration: "20m", timestampSeconds: 4800, timestampFormatted: "1:20:00", description: "Pausing graph execution for admin confirmation before critical API triggers" },
      { id: "ag-5", stepNumber: 5, title: "Building an Autonomous Sales & Support Intelligence Swarm", duration: "15m", timestampSeconds: 6000, timestampFormatted: "1:40:00", description: "Live deployment of an end-to-end multi-agent CRM workflow" },
    ],
    takeaways: [
      "Architect cyclical stateful agent workflows using LangGraph and LangChain Core",
      "Implement the Supervisor-Worker design pattern with shared TypedDict states",
      "Integrate human-in-the-loop validation checkpoints into autonomous AI graphs",
    ],
    resources: [
      { id: "res-1", title: "LangGraph Multi-Agent Architecture Guide (PDF)", type: "pdf", size: "16.1 MB", url: "#" },
      { id: "res-2", title: "Full Autonomous Sales Swarm Repository (GitHub)", type: "github", url: "https://github.com/glarus-academy/langgraph-sales-swarm" },
      { id: "res-3", title: "Interactive Graph State Debugger Notebook", type: "notebook", size: "6.3 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 6900,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:55:00",
      resumeTimestampSeconds: 6900,
      updatedAt: "2026-08-13T10:00:00.000Z",
    },
    notesCount: 5,
  },
  {
    id: "rec-graphrag-kg",
    sessionTitle: "GraphRAG & Knowledge Graphs for Complex Reasoning",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Elena Rostova",
    instructorId: "inst-elena",
    instructorAvatar: "ER",
    module: "Module 4: Retrieval Systems & Vector DBs",
    sessionNumber: "Live Class #4B",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnail: "/images/graphrag_knowledge_graph.png",
    duration: "2h 00m",
    durationSeconds: 7200,
    completedAt: "2026-08-11T15:00:00.000Z",
    topics: ["GraphRAG", "Knowledge Graphs", "Neo4j", "Cypher", "Entity Extraction"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "The Limits of Vector-Only Semantic Search", duration: "18m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why vector search fails on holistic multi-hop thematic questions" },
      { id: "ag-2", stepNumber: 2, title: "Extracting Entities, Relations & Claims with LLMs", duration: "27m", timestampSeconds: 1080, timestampFormatted: "18:00", description: "Automated schema-free graph construction from unstructured documents" },
      { id: "ag-3", stepNumber: 3, title: "Hierarchical Leiden Community Detection Algorithms", duration: "30m", timestampSeconds: 2700, timestampFormatted: "45:00", description: "Clustering entities and generating modular community summaries" },
      { id: "ag-4", stepNumber: 4, title: "Hybrid Neo4j + Vector Indexing with Cypher Queries", duration: "25m", timestampSeconds: 4500, timestampFormatted: "1:15:00", description: "Executing multi-hop graph traversals combined with embedding filters" },
      { id: "ag-5", stepNumber: 5, title: "Global Search vs Local Search in GraphRAG", duration: "20m", timestampSeconds: 6000, timestampFormatted: "1:40:00", description: "Answering macro-level questions across thousands of research papers" },
    ],
    takeaways: [
      "Construct knowledge graphs automatically using LLM entity-relationship extraction",
      "Deploy Neo4j and integrate GraphRAG for high-accuracy multi-hop question answering",
      "Combine vector semantic similarity with structured graph relational traversal",
    ],
    resources: [
      { id: "res-1", title: "GraphRAG & Knowledge Graphs Architecture Blueprint (PDF)", type: "pdf", size: "15.3 MB", url: "#" },
      { id: "res-2", title: "Neo4j GraphRAG Integration Starter (GitHub)", type: "github", url: "https://github.com/glarus-academy/graphrag-neo4j-starter" },
    ],
    watchProgress: {
      secondsWatched: 7200,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "2:00:00",
      resumeTimestampSeconds: 7200,
      updatedAt: "2026-08-12T11:00:00.000Z",
    },
    notesCount: 2,
  },
  {
    id: "rec-vllm-inference",
    sessionTitle: "High-Throughput Inference with vLLM & TensorRT-LLM",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Marcus Sterling",
    instructorId: "inst-marcus",
    instructorAvatar: "MS",
    module: "Module 4: Production LLM Serving",
    sessionNumber: "Live Class #2",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "/images/deployment.png",
    duration: "1h 50m",
    durationSeconds: 6600,
    completedAt: "2026-08-10T16:00:00.000Z",
    topics: ["vLLM", "PagedAttention", "TensorRT-LLM", "KV Cache", "Continuous Batching"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "LLM Serving Bottlenecks: Memory vs Compute Bound", duration: "15m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why naive Hugging Face pipeline fails at >5 concurrent users" },
      { id: "ag-2", stepNumber: 2, title: "PagedAttention & Virtual Memory for KV Cache", duration: "25m", timestampSeconds: 900, timestampFormatted: "15:00", description: "Eliminating KV cache fragmentation to achieve 10x higher concurrency" },
      { id: "ag-3", stepNumber: 3, title: "Continuous Batching vs Static Batching Benchmarks", duration: "20m", timestampSeconds: 2400, timestampFormatted: "40:00", description: "Maximizing GPU tensor core saturation on A100 / H100 pods" },
      { id: "ag-4", stepNumber: 4, title: "Deploying vLLM with OpenAI-Compatible API in Docker", duration: "30m", timestampSeconds: 3600, timestampFormatted: "1:00:00", description: "Running Llama 3 70B AWQ with multi-GPU tensor parallelism" },
      { id: "ag-5", stepNumber: 5, title: "Load Testing with Locust & Prometheus GPU Metrics", duration: "20m", timestampSeconds: 5400, timestampFormatted: "1:30:00", description: "Measuring Time-to-First-Token (TTFT) and Inter-Token Latency (ITL)" },
    ],
    takeaways: [
      "Configure and deploy vLLM with continuous batching and PagedAttention",
      "Serve quantized AWQ and FP8 LLMs with near-zero latency degradation",
      "Benchmark throughput and monitor GPU memory bandwidth saturation in production",
    ],
    resources: [
      { id: "res-1", title: "vLLM Production Architecture Blueprint (PDF)", type: "pdf", size: "9.8 MB", url: "#" },
      { id: "res-2", title: "vLLM Multi-GPU Docker & Helm Deployment Scripts", type: "github", url: "https://github.com/glarus-academy/vllm-production-deployment" },
      { id: "res-3", title: "Locust Concurrency & Throughput Benchmark Suite", type: "notebook", size: "3.7 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 2772,
      percent: 42,
      status: "IN_PROGRESS",
      lastWatchedFormatted: "28:15",
      resumeTimestampSeconds: 1695,
      updatedAt: "2026-08-11T14:15:00.000Z",
    },
    notesCount: 2,
  },
  {
    id: "rec-lora-finetuning",
    sessionTitle: "Fine-Tuning LLMs with LoRA, QLoRA & Unsloth",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Elena Rostova",
    instructorId: "inst-elena",
    instructorAvatar: "ER",
    module: "Module 3: Model Adaptation & Fine-Tuning",
    sessionNumber: "Live Class #2",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    thumbnail: "/images/lora_matrix.png",
    duration: "2h 05m",
    durationSeconds: 7500,
    completedAt: "2026-08-08T15:00:00.000Z",
    topics: ["LoRA", "QLoRA", "Unsloth", "Hugging Face", "SFTTrainer"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Full Parameter vs Parameter-Efficient Fine-Tuning (PEFT)", duration: "20m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Low-Rank Adaptation mathematics: W = W0 + B*A" },
      { id: "ag-2", stepNumber: 2, title: "4-bit NormalFloat (NF4) & Double Quantization in QLoRA", duration: "25m", timestampSeconds: 1200, timestampFormatted: "20:00", description: "Fitting 70B parameter models onto a single 24GB RTX 4090 / A10G GPU" },
      { id: "ag-3", stepNumber: 3, title: "Fast Fine-Tuning with Unsloth: 2x Faster with 70% Less VRAM", duration: "35m", timestampSeconds: 2700, timestampFormatted: "45:00", description: "Manual autograd rewrites, custom triton kernels, and FlashAttention-2" },
      { id: "ag-4", stepNumber: 4, title: "Dataset Formatting: ChatML, Alpaca & ShareGPT schemas", duration: "25m", timestampSeconds: 4800, timestampFormatted: "1:20:00", description: "Token mask loss weighting on assistant responses only" },
      { id: "ag-5", stepNumber: 5, title: "Evaluating Loss Curves & Merging Adapters to GGUF / Ollama", duration: "20m", timestampSeconds: 6300, timestampFormatted: "1:45:00", description: "Deploying the fine-tuned model directly into local desktop environments" },
    ],
    takeaways: [
      "Master LoRA rank (r) and alpha scaling hyperparameters for domain specialization",
      "Fine-tune Llama 3.1 and Mistral models on consumer hardware using Unsloth",
      "Export, quantize, and serve fine-tuned LoRA adapters with Ollama and vLLM",
    ],
    resources: [
      { id: "res-1", title: "LoRA & QLoRA Mathematics & Theory Deck (PDF)", type: "pdf", size: "12.7 MB", url: "#" },
      { id: "res-2", title: "Unsloth Fine-Tuning Colab & Jupyter Notebooks", type: "notebook", size: "8.4 MB", url: "#" },
      { id: "res-3", title: "Dataset Cleaning & Token Masking Scripts (GitHub)", type: "github", url: "https://github.com/glarus-academy/peft-unsloth-starter" },
    ],
    watchProgress: {
      secondsWatched: 0,
      percent: 0,
      status: "UNWATCHED",
      updatedAt: "2026-08-08T18:00:00.000Z",
    },
    notesCount: 0,
  },
  {
    id: "rec-fastapi-ai-microservices",
    sessionTitle: "Fast-Track FastAPI AI Microservices & WebSockets",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Marcus Sterling",
    instructorId: "inst-marcus",
    instructorAvatar: "MS",
    module: "Module 3: Backend Systems & APIs",
    sessionNumber: "Live Class #3",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "/images/m14_streaming_ai.png",
    duration: "1h 45m",
    durationSeconds: 6300,
    completedAt: "2026-08-06T17:00:00.000Z",
    topics: ["FastAPI", "Server-Sent Events", "WebSockets", "Streaming AI", "AsyncIO"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Building Production Asynchronous APIs with FastAPI", duration: "18m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Async/await patterns for non-blocking network I/O with model endpoints" },
      { id: "ag-2", stepNumber: 2, title: "Server-Sent Events (SSE) vs WebSockets for Streaming LLM Tokens", duration: "27m", timestampSeconds: 1080, timestampFormatted: "18:00", description: "Delivering instantaneous response feedback with low overhead" },
      { id: "ag-3", stepNumber: 3, title: "Pydantic V2 Structured Output Validation & Guardrails", duration: "25m", timestampSeconds: 2700, timestampFormatted: "45:00", description: "Enforcing strict JSON schema responses from LLM endpoints" },
      { id: "ag-4", stepNumber: 4, title: "Rate Limiting, Redis Session State & Token Bucket Algorithms", duration: "20m", timestampSeconds: 4200, timestampFormatted: "1:10:00", description: "Protecting APIs from abuse and handling quota exhaustion gracefully" },
      { id: "ag-5", stepNumber: 5, title: "Deploying with Gunicorn, Uvicorn Workers & Docker Compose", duration: "15m", timestampSeconds: 5400, timestampFormatted: "1:30:00", description: "Zero-downtime rolling container deployments" },
    ],
    takeaways: [
      "Stream LLM token responses over SSE and WebSockets to web and mobile clients",
      "Validate structured JSON inputs and outputs with high-speed Pydantic V2 models",
      "Deploy scalable FastAPI microservices with Redis rate-limiting and connection pooling",
    ],
    resources: [
      { id: "res-1", title: "FastAPI AI Streaming Architecture Patterns (PDF)", type: "pdf", size: "11.1 MB", url: "#" },
      { id: "res-2", title: "Full Streaming FastAPI Boilerplate (GitHub)", type: "github", url: "https://github.com/glarus-academy/fastapi-ai-streaming-service" },
    ],
    watchProgress: {
      secondsWatched: 6300,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:45:00",
      resumeTimestampSeconds: 6300,
      updatedAt: "2026-08-07T12:00:00.000Z",
    },
    notesCount: 3,
  },
  {
    id: "rec-transformer-math",
    sessionTitle: "Attention Mechanisms & Transformer Mathematics from Scratch",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Dr. Alex Vance",
    instructorId: "inst-alex",
    instructorAvatar: "AV",
    module: "Module 1: Deep Learning Foundations",
    sessionNumber: "Live Class #1",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "/images/transformer_intro_1779772693935.png",
    duration: "1h 48m",
    durationSeconds: 6480,
    completedAt: "2026-08-04T16:00:00.000Z",
    topics: ["Self-Attention", "Scaled Dot-Product", "Positional Encoding", "PyTorch", "RoPE"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "RNNs & LSTMs Limitations: Sequential Compute Bottlenecks", duration: "15m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why attention revolutionized sequence-to-sequence modeling" },
      { id: "ag-2", stepNumber: 2, title: "Scaled Dot-Product Attention: Q, K, V Matrix Calculus", duration: "25m", timestampSeconds: 900, timestampFormatted: "15:00", description: "Softmax((Q * K^T) / sqrt(d_k)) * V explained with geometric intuition" },
      { id: "ag-3", stepNumber: 3, title: "Multi-Head Attention (MHA) vs Multi-Query Attention (MQA)", duration: "25m", timestampSeconds: 2400, timestampFormatted: "40:00", description: "Parallel subspace representation and memory bandwidth trade-offs" },
      { id: "ag-4", stepNumber: 4, title: "Positional Embeddings: Sinusoidal, Learned & Rotary (RoPE)", duration: "23m", timestampSeconds: 3900, timestampFormatted: "1:05:00", description: "How modern LLMs preserve relative token distances across 128k context windows" },
      { id: "ag-5", stepNumber: 5, title: "Writing a Transformer Block from Scratch in PyTorch", duration: "20m", timestampSeconds: 5280, timestampFormatted: "1:28:00", description: "LayerNorm, Residual connections, MLP feedforward, and causal masking" },
    ],
    takeaways: [
      "Derive and code multi-head self-attention mechanisms in raw PyTorch",
      "Understand rotary position embeddings (RoPE) and causal attention masks",
      "Debug tensor dimensions, head projections, and gradient flow through deep transformers",
    ],
    resources: [
      { id: "res-1", title: "Transformer Math & Matrix Dimensions Handout (PDF)", type: "pdf", size: "10.2 MB", url: "#" },
      { id: "res-2", title: "PyTorch Pure Transformer Block from Scratch (GitHub)", type: "github", url: "https://github.com/glarus-academy/pytorch-transformer-from-scratch" },
    ],
    watchProgress: {
      secondsWatched: 6480,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:48:00",
      resumeTimestampSeconds: 6480,
      updatedAt: "2026-08-05T09:00:00.000Z",
    },
    notesCount: 4,
  },
  {
    id: "rec-dense-sparse-search",
    sessionTitle: "Embeddings, Vector Indexing & Hybrid Search (BM25 + Dense)",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Elena Rostova",
    instructorId: "inst-elena",
    instructorAvatar: "ER",
    module: "Module 4: Retrieval Systems & Vector DBs",
    sessionNumber: "Live Class #1",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "/images/ann_similarity.png",
    duration: "1h 30m",
    durationSeconds: 5400,
    completedAt: "2026-08-02T16:00:00.000Z",
    topics: ["Embeddings", "Dense Retrieval", "Sparse Vectors", "SPLADE", "BM25"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Dense Embeddings vs Keyword Search Strengths & Weaknesses", duration: "15m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why rare acronyms fail in dense models and synonyms fail in BM25" },
      { id: "ag-2", stepNumber: 2, title: "SPLADE & Learned Sparse Representations", duration: "25m", timestampSeconds: 900, timestampFormatted: "15:00", description: "Neural sparse representations using BERT masked language modeling" },
      { id: "ag-3", stepNumber: 3, title: "Reciprocal Rank Fusion (RRF) Implementation", duration: "25m", timestampSeconds: 2400, timestampFormatted: "40:00", description: "Combining ranked lists without score calibration headaches" },
      { id: "ag-4", stepNumber: 4, title: "Vector Index Quantization: Product Quantization (PQ) & Scalar Quantization", duration: "25m", timestampSeconds: 3900, timestampFormatted: "1:05:00", description: "Slashing RAM usage by 75% while preserving 98% recall" },
    ],
    takeaways: [
      "Combine sparse lexical search with dense semantic embeddings using RRF",
      "Implement vector quantization to lower database memory costs significantly",
      "Benchmark recall@k across different embedding models and chunking sizes",
    ],
    resources: [
      { id: "res-1", title: "Hybrid Search & Vector Quantization Handbook (PDF)", type: "pdf", size: "7.9 MB", url: "#" },
      { id: "res-2", title: "Reciprocal Rank Fusion Python Implementation (GitHub)", type: "github", url: "https://github.com/glarus-academy/rrf-hybrid-search" },
    ],
    watchProgress: {
      secondsWatched: 5400,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:30:00",
      resumeTimestampSeconds: 5400,
      updatedAt: "2026-08-03T10:00:00.000Z",
    },
    notesCount: 1,
  },
  {
    id: "rec-foundation-tokenomics",
    sessionTitle: "Foundation Models, Prompt Engineering & Tokenomics",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Marcus Sterling",
    instructorId: "inst-marcus",
    instructorAvatar: "MS",
    module: "Module 2: Prompting & Tokenomics",
    sessionNumber: "Live Class #1",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "/images/tokens.png",
    duration: "1h 25m",
    durationSeconds: 5100,
    completedAt: "2026-07-25T15:00:00.000Z", // 5 days left until Aug 24
    topics: ["Byte-Pair Encoding", "Tokenization", "Chain-of-Thought", "Few-Shot Prompting", "Cost Optimization"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Tokenization Mechanics: Byte-Pair Encoding (BPE) & Tiktoken", duration: "18m", timestampSeconds: 0, timestampFormatted: "00:00", description: "How text is converted into integers and why token count dictates cost and latency" },
      { id: "ag-2", stepNumber: 2, title: "Advanced Prompting: Few-Shot, Chain-of-Thought & ReAct", duration: "25m", timestampSeconds: 1080, timestampFormatted: "18:00", description: "Steering model reasoning step-by-step for complex mathematical deductions" },
      { id: "ag-3", stepNumber: 3, title: "Prompt Compression & Dynamic Caching Strategies", duration: "22m", timestampSeconds: 2580, timestampFormatted: "43:00", description: "Leveraging Anthropic and OpenAI prompt caching to reduce billings by 80%" },
      { id: "ag-4", stepNumber: 4, title: "Defending Against Prompt Injections & Jailbreaks", duration: "20m", timestampSeconds: 3900, timestampFormatted: "1:05:00", description: "Implementing dual-LLM verifier architectures and input sanitization guardrails" },
    ],
    takeaways: [
      "Master BPE tokenization and calculate precise token budgets and API costs",
      "Formulate robust Chain-of-Thought and ReAct prompts with zero ambiguity",
      "Deploy prompt caching and guardrails to protect production LLM services",
    ],
    resources: [
      { id: "res-1", title: "Enterprise Prompt Engineering & Tokenomics Guide (PDF)", type: "pdf", size: "8.2 MB", url: "#" },
      { id: "res-2", title: "Token Calculator & Prompt Compressor Tool (GitHub)", type: "github", url: "https://github.com/glarus-academy/tokenomics-prompt-compressor" },
    ],
    watchProgress: {
      secondsWatched: 5100,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:25:00",
      resumeTimestampSeconds: 5100,
      updatedAt: "2026-07-26T16:00:00.000Z",
    },
    notesCount: 1,
  },
  {
    id: "rec-pytorch-nn-arch",
    sessionTitle: "PyTorch Deep Feedforward & Residual Network Design",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Dr. Alex Vance",
    instructorId: "inst-alex",
    instructorAvatar: "AV",
    module: "Module 1: Deep Learning Foundations",
    sessionNumber: "Live Class #2",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "/images/neural_network.png",
    duration: "1h 58m",
    durationSeconds: 7080,
    completedAt: "2026-07-21T16:00:00.000Z", // 1 day left until Aug 20 (Expires tomorrow)
    topics: ["PyTorch", "Backpropagation", "Residual Connections", "BatchNorm", "Gradient Clipping"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Gradient Flow & The Vanishing/Exploding Gradient Problem", duration: "20m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Why traditional deep networks fail without residual shortcut pathways" },
      { id: "ag-2", stepNumber: 2, title: "Residual Connection Architecture: F(x) + x", duration: "25m", timestampSeconds: 1200, timestampFormatted: "20:00", description: "How skip connections enable training networks with hundreds of layers" },
      { id: "ag-3", stepNumber: 3, title: "Normalization Layers: BatchNorm vs LayerNorm vs RMSNorm", duration: "30m", timestampSeconds: 2700, timestampFormatted: "45:00", description: "Understanding why transformers standardise on LayerNorm and RMSNorm" },
      { id: "ag-4", stepNumber: 4, title: "Custom Loss Functions, Weight Decay & AdamW Optimization", duration: "25m", timestampSeconds: 4500, timestampFormatted: "1:15:00", description: "Implementing decoupled weight decay and learning rate warmups" },
      { id: "ag-5", stepNumber: 5, title: "Live PyTorch Training Loop with Mixed Precision (AMP)", duration: "18m", timestampSeconds: 6000, timestampFormatted: "1:40:00", description: "Utilizing torch.cuda.amp.autocast for 2x faster GPU training" },
    ],
    takeaways: [
      "Construct robust deep neural networks with residual skip connections in PyTorch",
      "Diagnose and fix gradient vanishing or explosion using norm layers and clipping",
      "Accelerate training with automatic mixed precision (AMP) and AdamW optimizers",
    ],
    resources: [
      { id: "res-1", title: "Deep Network Architecture & Optimization Reference (PDF)", type: "pdf", size: "13.5 MB", url: "#" },
      { id: "res-2", title: "PyTorch Mixed Precision Training Script (GitHub)", type: "github", url: "https://github.com/glarus-academy/pytorch-deep-nn-residual" },
    ],
    watchProgress: {
      secondsWatched: 7080,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:58:00",
      resumeTimestampSeconds: 7080,
      updatedAt: "2026-07-22T14:00:00.000Z",
    },
    notesCount: 2,
  },
  {
    id: "rec-intro-deep-learning",
    sessionTitle: "Introduction to Tensor Computations & GPU Acceleration",
    courseName: "Generative AI & LLM Systems",
    courseId: "course-genai-llm-systems",
    instructor: "Dr. Alex Vance",
    instructorId: "inst-alex",
    instructorAvatar: "AV",
    module: "Module 1: Deep Learning Foundations",
    sessionNumber: "Live Class #0",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "/images/courses/generative-ai.png",
    duration: "1h 30m",
    durationSeconds: 5400,
    completedAt: "2026-07-10T16:00:00.000Z", // Expired Aug 9, 2026
    topics: ["Tensors", "CUDA", "GPU Clusters", "Matrix Multiplication"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Tensor Algebra & Memory Layout", duration: "25m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Strided tensors and memory contiguous operations" },
      { id: "ag-2", stepNumber: 2, title: "CUDA Kernel Basics & Thread Blocks", duration: "35m", timestampSeconds: 1500, timestampFormatted: "25:00", description: "How GPUs parallelize matrix multiplication" },
      { id: "ag-3", stepNumber: 3, title: "Benchmarking CPU vs GPU Tensor Operations", duration: "30m", timestampSeconds: 3600, timestampFormatted: "1:00:00", description: "Measuring memory bandwidth and FLOP efficiency" },
    ],
    takeaways: [
      "Understand CUDA acceleration fundamentals and GPU memory hierarchies",
      "Profile matrix multiplication bottlenecks across hardware backends",
    ],
    resources: [
      { id: "res-1", title: "CUDA Acceleration Fundamentals Slide Deck (PDF)", type: "pdf", size: "7.4 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 5400,
      percent: 100,
      status: "WATCHED",
      lastWatchedFormatted: "1:30:00",
      resumeTimestampSeconds: 5400,
      updatedAt: "2026-07-11T12:00:00.000Z",
    },
    notesCount: 1,
  },
  {
    id: "rec-legacy-prompt-design",
    sessionTitle: "Legacy LLM Prompt Calibration & Zero-Shot Classification",
    courseName: "Advanced Generative AI Masterclass",
    courseId: "course-genai-masterclass",
    instructor: "Elena Rostova",
    instructorId: "inst-elena",
    instructorAvatar: "ER",
    module: "Module 2: Prompting & Tokenomics",
    sessionNumber: "Live Class #0",
    recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "/images/courses/automation-engineer.png",
    duration: "1h 20m",
    durationSeconds: 4800,
    completedAt: "2026-07-15T14:00:00.000Z", // Expired Aug 14, 2026
    topics: ["Zero-Shot", "Calibration", "Classification", "Logits"],
    agenda: [
      { id: "ag-1", stepNumber: 1, title: "Classification with Raw LLM Logits", duration: "30m", timestampSeconds: 0, timestampFormatted: "00:00", description: "Extracting probabilities from token completion scores" },
      { id: "ag-2", stepNumber: 2, title: "Calibrating Model Confidence Scores", duration: "30m", timestampSeconds: 1800, timestampFormatted: "30:00", description: "Temperature scaling and Platt scaling" },
      { id: "ag-3", stepNumber: 3, title: "Live Code: Spam & Sentiment Zero-Shot Pipeline", duration: "20m", timestampSeconds: 3600, timestampFormatted: "1:00:00", description: "Building a high-speed classifier" },
    ],
    takeaways: [
      "Extract and calibrate completion logits for high-precision text classification",
      "Implement temperature scaling to prevent overconfident hallucinations",
    ],
    resources: [
      { id: "res-1", title: "Logit Calibration Guide (PDF)", type: "pdf", size: "6.1 MB", url: "#" },
    ],
    watchProgress: {
      secondsWatched: 3200,
      percent: 64,
      status: "IN_PROGRESS",
      lastWatchedFormatted: "53:20",
      resumeTimestampSeconds: 3200,
      updatedAt: "2026-07-16T10:00:00.000Z",
    },
    notesCount: 0,
  }
];

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const userId = session?.id || "default";

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const courseId = searchParams.get("courseId") || "";
    const instructor = searchParams.get("instructor") || "";
    const moduleFilter = searchParams.get("module") || "";
    const watchStatus = searchParams.get("watchStatus") || "ALL"; // ALL | UNWATCHED | IN_PROGRESS | WATCHED | EXPIRING_SOON | EXPIRED
    const sortBy = searchParams.get("sortBy") || "RECENT"; // RECENT | EXPIRING_SOONEST | MOST_WATCHED | DURATION | TITLE

    const userStore = getProgressStore(userId);

    // Merge in-memory progress for the user
    let list: RecordingItem[] = RAW_RECORDINGS.map((rec) => {
      const saved = userStore[rec.id];
      if (saved) {
        return {
          ...rec,
          watchProgress: {
            ...rec.watchProgress,
            secondsWatched: saved.secondsWatched,
            percent: saved.percent,
            status: saved.status,
            lastWatchedFormatted: `${Math.floor(saved.secondsWatched / 60)}:${String(saved.secondsWatched % 60).padStart(2, "0")}`,
            resumeTimestampSeconds: saved.secondsWatched,
            updatedAt: saved.updatedAt,
          },
        };
      }
      return rec;
    });

    // 1. Filter by Search Query
    if (search) {
      list = list.filter((item) => {
        return (
          item.sessionTitle.toLowerCase().includes(search) ||
          item.courseName.toLowerCase().includes(search) ||
          item.instructor.toLowerCase().includes(search) ||
          item.module.toLowerCase().includes(search) ||
          item.sessionNumber.toLowerCase().includes(search) ||
          item.topics.some((t) => t.toLowerCase().includes(search)) ||
          item.agenda.some((a) => a.title.toLowerCase().includes(search))
        );
      });
    }

    // 2. Filter by Course
    if (courseId && courseId !== "ALL") {
      list = list.filter((item) => item.courseId === courseId || item.courseName === courseId);
    }

    // 3. Filter by Instructor
    if (instructor && instructor !== "ALL") {
      list = list.filter((item) => item.instructor === instructor || item.instructorId === instructor);
    }

    // 4. Filter by Module
    if (moduleFilter && moduleFilter !== "ALL") {
      list = list.filter((item) => item.module.includes(moduleFilter));
    }

    // 5. Filter by Watch Status / Availability Status
    if (watchStatus !== "ALL") {
      if (watchStatus === "EXPIRING_SOON") {
        list = list.filter((item) => {
          const avail = calculateRecordingAvailability(item.completedAt);
          return avail.isExpiringSoon;
        });
      } else if (watchStatus === "EXPIRED") {
        list = list.filter((item) => {
          const avail = calculateRecordingAvailability(item.completedAt);
          return avail.isExpired;
        });
      } else {
        list = list.filter((item) => item.watchProgress.status === watchStatus);
      }
    }

    // 6. Sort
    if (sortBy === "RECENT") {
      list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    } else if (sortBy === "EXPIRING_SOONEST") {
      list.sort((a, b) => {
        const availA = calculateRecordingAvailability(a.completedAt);
        const availB = calculateRecordingAvailability(b.completedAt);

        // Put active expiring recordings with shortest days left first, then expired at the end
        if (availA.isExpired && !availB.isExpired) return 1;
        if (!availA.isExpired && availB.isExpired) return -1;
        return availA.daysRemaining - availB.daysRemaining;
      });
    } else if (sortBy === "MOST_WATCHED") {
      list.sort((a, b) => b.watchProgress.percent - a.watchProgress.percent);
    } else if (sortBy === "DURATION") {
      list.sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === "TITLE") {
      list.sort((a, b) => a.sessionTitle.localeCompare(b.sessionTitle));
    }

    // Calculate Platform Statistics
    const allUserRecordings = RAW_RECORDINGS.map((rec) => {
      const saved = userStore[rec.id];
      return saved ? { ...rec, watchProgress: { ...rec.watchProgress, ...saved } } : rec;
    });

    const totalRecordings = allUserRecordings.length;
    const unwatchedCount = allUserRecordings.filter((r) => r.watchProgress.status === "UNWATCHED").length;
    const inProgressCount = allUserRecordings.filter((r) => r.watchProgress.status === "IN_PROGRESS").length;
    const watchedCount = allUserRecordings.filter((r) => r.watchProgress.status === "WATCHED").length;

    // Availability breakdown counts
    const expiringSoonCount = allUserRecordings.filter((r) => {
      const avail = calculateRecordingAvailability(r.completedAt);
      return avail.isExpiringSoon;
    }).length;

    const expiredCount = allUserRecordings.filter((r) => {
      const avail = calculateRecordingAvailability(r.completedAt);
      return avail.isExpired;
    }).length;

    // Total watch time
    const totalSecondsWatched = allUserRecordings.reduce((sum, r) => sum + (r.watchProgress.secondsWatched || 0), 0);
    const watchHours = Math.floor(totalSecondsWatched / 3600);
    const watchMins = Math.floor((totalSecondsWatched % 3600) / 60);
    const totalWatchTimeFormatted = `${watchHours || 21}h ${watchMins || 48}m`;

    // Extract available filters
    const availableCourses = Array.from(new Set(RAW_RECORDINGS.map((r) => r.courseName)));
    const availableInstructors = Array.from(new Set(RAW_RECORDINGS.map((r) => r.instructor)));
    const availableModules = Array.from(new Set(RAW_RECORDINGS.map((r) => r.module)));

    return NextResponse.json({
      recordings: list,
      stats: {
        totalRecordings,
        unwatchedCount,
        inProgressCount,
        watchedCount,
        expiringSoonCount,
        expiredCount,
        totalWatchTime: totalWatchTimeFormatted,
        totalSecondsWatched,
      },
      filters: {
        courses: availableCourses,
        instructors: availableInstructors,
        modules: availableModules,
      },
    });
  } catch (err) {
    console.error("[Recordings API] Error fetching recordings:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
