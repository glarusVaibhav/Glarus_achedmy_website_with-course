/**
 * Dynamic Course Recommendation Engine for Glarus Academy
 * Intelligently evaluates student progress, enrolled courses, pathway progression,
 * and upcoming live batch schedules to recommend the best next learning opportunity.
 */

export interface StudentLearningState {
  enrolledCourses?: Array<{ id: string; title: string; progress?: number; status?: string }>;
  liveCourses?: Array<{ id: string; title: string; batchName?: string }>;
  completedCourseIds?: string[];
  studentId?: string;
}

export interface RecommendationMetric {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

export interface RecommendedCourseItem {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorRole?: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  type: "SELF_PACED" | "LIVE";
  category: string;
  modulesCount: number;
  projectsCount: number;
  image: string;
  curriculumLink: string;
  exploreLink: string;
  recommendationReason: string;
  badgeLabel: string;
  score: number;
  price?: number;
  originalPrice?: number;
  scheduleInfo?: {
    batchName: string;
    startDate: string;
    daysRemaining?: number;
    seatsLeft?: number;
    totalSeats?: number;
    schedulePattern?: string;
  };
  visualEcosystem: {
    terminalFilename: string;
    badgeTag: string;
    codeLines: Array<{ code: string; highlight?: boolean; comment?: boolean; variable?: boolean }>;
    flowNodes: Array<{ name: string; subtitle: string; color: "purple" | "cyan" | "emerald" | "amber" }>;
    footerNote: string;
    frameworkTag: string;
  };
  metrics: RecommendationMetric[];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE COURSE REPOSITORY (SELF-PACED + LIVE)
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_RECOMMENDABLE_COURSES: RecommendedCourseItem[] = [
  // ─── 1. LIVE: Agentic AI Swarms ──────────────────────────────────────────
  {
    id: "live-agentic-ai",
    title: "Building Autonomous Agents with LangGraph & Multi-Agent Swarms",
    description: "Build production-ready AI agent swarms using LangGraph, persistent memory, custom MCP tools, and autonomous multi-agent workflows.",
    instructor: "Alex Chen",
    instructorRole: "Staff AI Engineer & Lead Instructor",
    duration: "6 Weeks",
    level: "Advanced",
    type: "LIVE",
    category: "Agentic AI",
    modulesCount: 6,
    projectsCount: 5,
    image: "/images/hierarchical_langgraph.png",
    curriculumLink: "/courses/generative-ai",
    exploreLink: "/courses?type=live",
    badgeLabel: "LIVE · STARTS AUG 20",
    recommendationReason: "Recommended as your next high-impact step in the AI Engineering track with live interactive code reviews.",
    score: 95,
    price: 19999,
    originalPrice: 29999,
    scheduleInfo: {
      batchName: "Weekend AI Class #4",
      startDate: "Aug 20, 2026",
      daysRemaining: 9,
      seatsLeft: 18,
      totalSeats: 50,
      schedulePattern: "Tue • Thu • Sat (08:00 PM – 10:30 PM IST)",
    },
    visualEcosystem: {
      terminalFilename: "langgraph_swarm_engine.ts",
      badgeTag: "LIVE RUNTIME",
      codeLines: [
        { code: "const workflow = new StateGraph<AgentState>({", variable: true },
        { code: "  channels: { memory: new MemorySaver(), messages: messageChannel }" },
        { code: "// Orchestrating autonomous swarm routing", comment: true },
        { code: "workflow.addNode('planner', runStrategicPlanner);", highlight: true },
        { code: "workflow.addNode('coder', runSandboxExecution);" },
        { code: "const app = workflow.compile();", variable: true },
      ],
      flowNodes: [
        { name: "Planner", subtitle: "Strategic LLM", color: "purple" },
        { name: "Tool Router", subtitle: "FastAPI MCP", color: "cyan" },
        { name: "Evaluator", subtitle: "Automated Eval", color: "emerald" },
      ],
      footerNote: "5 Enterprise Swarm Capstones",
      frameworkTag: "LangGraph v0.2.x",
    },
    metrics: [
      { label: "Curriculum", value: "6 Live Modules" },
      { label: "Portfolio", value: "5 Live Capstones" },
      { label: "Mentorship", value: "1-on-1 Code Reviews", highlight: true },
    ],
  },

  // ─── 2. LIVE: LLMOps Pipeline ───────────────────────────────────────────
  {
    id: "live-llmops",
    title: "Production LLMOps: From Fine-Tuning to GPU Inference Clusters",
    description: "Master enterprise MLOps for large language models: QLoRA adapters, vLLM serving, automated evaluations (Ragas), and Kubernetes GPU scaling.",
    instructor: "Elena Rodriguez",
    instructorRole: "Principal ML Platform Architect",
    duration: "8 Weeks",
    level: "Advanced",
    type: "LIVE",
    category: "LLMOps",
    modulesCount: 8,
    projectsCount: 4,
    image: "/images/m17_llmops_lifecycle.png",
    curriculumLink: "/courses/llm-architecture",
    exploreLink: "/courses?type=live",
    badgeLabel: "LIVE · UPCOMING BATCH",
    recommendationReason: "Matches your advanced AI trajectory by adding production deployment, GPU scaling, and LLM evaluation benchmarks.",
    score: 88,
    price: 18999,
    originalPrice: 27999,
    scheduleInfo: {
      batchName: "Enterprise LLMOps Cohort #2",
      startDate: "Sep 01, 2026",
      daysRemaining: 21,
      seatsLeft: 22,
      totalSeats: 50,
      schedulePattern: "Mon • Wed • Fri (07:30 PM – 09:30 PM IST)",
    },
    visualEcosystem: {
      terminalFilename: "vllm_gpu_cluster.py",
      badgeTag: "PROD CLUSTER",
      codeLines: [
        { code: "from vllm import AsyncLLMEngine, SamplingParams", variable: true },
        { code: "# Dynamic continuous batching & PagedAttention", comment: true },
        { code: "engine = AsyncLLMEngine.from_engine_args(gpu_count=4)", highlight: true },
        { code: "eval_results = ragas.evaluate(testset, metrics=[faithfulness])" },
        { code: "monitor.push_telemetry(latency_p99='42ms')", variable: true },
      ],
      flowNodes: [
        { name: "vLLM Serve", subtitle: "4x A100 GPUs", color: "purple" },
        { name: "Ragas Eval", subtitle: "Faithfulness", color: "cyan" },
        { name: "Observability", subtitle: "OpenTelemetry", color: "emerald" },
      ],
      footerNote: "Production Kubernetes Helm Charts",
      frameworkTag: "PyTorch & vLLM",
    },
    metrics: [
      { label: "Curriculum", value: "8 Modules" },
      { label: "Projects", value: "4 Production Systems" },
      { label: "Credential", value: "Enterprise LLMOps", highlight: true },
    ],
  },

  // ─── 3. SELF-PACED: Complete Generative AI Engineering ────────────────────
  {
    id: "ai-1",
    title: "Complete Generative AI Engineering & Agent Architecture",
    description: "Master modern foundation models, LangChain, vector retrieval, prompt optimization, and full-stack AI application development.",
    instructor: "Alex Chen",
    instructorRole: "Staff AI Engineer",
    duration: "40 Hours",
    level: "Intermediate",
    type: "SELF_PACED",
    category: "Generative AI",
    modulesCount: 12,
    projectsCount: 4,
    image: "/images/ai_system_architecture.png",
    curriculumLink: "/course/Generative_AI_Application_Engineer",
    exploreLink: "/courses",
    badgeLabel: "SELF-PACED · 24/7 ACCESS",
    recommendationReason: "Builds a comprehensive foundation across LLMs, embeddings, vector indexing, and production application patterns.",
    score: 92,
    price: 15999,
    originalPrice: 24999,
    visualEcosystem: {
      terminalFilename: "rag_vector_pipeline.py",
      badgeTag: "VECTOR STORE",
      codeLines: [
        { code: "from langchain_community.vectorstores import Pinecone", variable: true },
        { code: "# Hierarchical semantic chunking & hybrid retrieval", comment: true },
        { code: "retriever = vectorstore.as_retriever(search_kwargs={'k': 8})", highlight: true },
        { code: "chain = create_retrieval_chain(retriever, document_prompt)" },
        { code: "response = chain.invoke({'input': query})", variable: true },
      ],
      flowNodes: [
        { name: "Embeddings", subtitle: "OpenAI Text-3", color: "purple" },
        { name: "Hybrid Search", subtitle: "Dense + Sparse", color: "cyan" },
        { name: "Reranker", subtitle: "Cohere v3", color: "emerald" },
      ],
      footerNote: "Full Source Code + GitHub Repos",
      frameworkTag: "LangChain & Vector DBs",
    },
    metrics: [
      { label: "Modules", value: "12 Deep Modules" },
      { label: "Hands-on", value: "4 Full-Stack Apps" },
      { label: "Format", value: "Self-Paced Video", highlight: true },
    ],
  },

  // ─── 4. SELF-PACED: NLP with Hugging Face & Transformers ─────────────────
  {
    id: "ai-4",
    title: "NLP with Hugging Face & Transformer Architectures",
    description: "Deep dive into Natural Language Processing, self-attention mathematics, BERT, tokenizers, and parameter-efficient fine-tuning with PEFT & LoRA.",
    instructor: "Elena Rodriguez",
    instructorRole: "NLP Research Scientist",
    duration: "30 Hours",
    level: "Intermediate",
    type: "SELF_PACED",
    category: "NLP",
    modulesCount: 10,
    projectsCount: 4,
    image: "/images/architectures.png",
    curriculumLink: "/courses",
    exploreLink: "/courses",
    badgeLabel: "RECOMMENDED NEXT STEP",
    recommendationReason: "Deepens your foundational knowledge of transformer attention mechanisms and custom tokenization algorithms.",
    score: 85,
    price: 12999,
    originalPrice: 19999,
    visualEcosystem: {
      terminalFilename: "fine_tune_lora.py",
      badgeTag: "PEFT TRAIN",
      codeLines: [
        { code: "from peft import LoraConfig, get_peft_model", variable: true },
        { code: "config = LoraConfig(r=16, lora_alpha=32, target_modules=['q_proj'])", highlight: true },
        { code: "# Train lightweight adapter weights on consumer GPUs", comment: true },
        { code: "model = get_peft_model(base_model, config)" },
        { code: "trainer.train()", variable: true },
      ],
      flowNodes: [
        { name: "Base Model", subtitle: "Llama 3 8B", color: "purple" },
        { name: "LoRA Matrix", subtitle: "Rank=16 Adapter", color: "cyan" },
        { name: "Inference", subtitle: "Quantized 4-Bit", color: "emerald" },
      ],
      footerNote: "Pre-trained Weights & Colab Notebooks",
      frameworkTag: "Hugging Face & PEFT",
    },
    metrics: [
      { label: "Curriculum", value: "10 Modules" },
      { label: "Projects", value: "4 NLP Notebooks" },
      { label: "Access", value: "Lifetime Access", highlight: true },
    ],
  },

  // ─── 5. LIVE: Scalable Cloud Architecture for AI ─────────────────────────
  {
    id: "live-cloud-ai",
    title: "Scalable Cloud Architecture & Kubernetes for AI Systems",
    description: "Design and deploy scalable, cost-optimized, and resilient AI backends on AWS, Ray Clusters, Docker containers, and Kubernetes namespaces.",
    instructor: "David Kumar",
    instructorRole: "Cloud Infrastructure Architect",
    duration: "6 Weeks",
    level: "Intermediate",
    type: "LIVE",
    category: "Cloud",
    modulesCount: 6,
    projectsCount: 3,
    image: "/images/deployment.png",
    curriculumLink: "/courses",
    exploreLink: "/courses?type=live",
    badgeLabel: "LIVE · ENROLLING NOW",
    recommendationReason: "Equips you with production infrastructure skills to deploy high-concurrency AI backends to the cloud.",
    score: 80,
    price: 17999,
    originalPrice: 25999,
    scheduleInfo: {
      batchName: "AI Cloud Architect Batch #1",
      startDate: "Sep 10, 2026",
      daysRemaining: 30,
      seatsLeft: 15,
      totalSeats: 60,
      schedulePattern: "Tue • Thu Evenings (08:00 PM – 10:00 PM IST)",
    },
    visualEcosystem: {
      terminalFilename: "kubernetes_keda_scaler.yaml",
      badgeTag: "K8S CLOUD",
      codeLines: [
        { code: "apiVersion: keda.sh/v1alpha1", variable: true },
        { code: "kind: ScaledObject", variable: true },
        { code: "# Autoscaling GPU pods based on queue depth", comment: true },
        { code: "metadata: { name: 'ai-inference-autoscaler' }", highlight: true },
        { code: "spec: { minReplicaCount: 2, maxReplicaCount: 20 }" },
      ],
      flowNodes: [
        { name: "Ingress", subtitle: "AWS ALB", color: "purple" },
        { name: "K8s Pods", subtitle: "Auto-scaled GPU", color: "cyan" },
        { name: "Storage", subtitle: "S3 Vector Lake", color: "emerald" },
      ],
      footerNote: "Terraform + Helm Infrastructure as Code",
      frameworkTag: "Kubernetes & AWS",
    },
    metrics: [
      { label: "Modules", value: "6 Live Weeks" },
      { label: "Hands-on", value: "3 Cloud Deployments" },
      { label: "Certificate", value: "Cloud AI Engineer", highlight: true },
    ],
  },

  // ─── 6. SELF-PACED: Machine Learning for Beginners ────────────────────────
  {
    id: "ai-2",
    title: "Machine Learning Foundations & Python for Data Science",
    description: "Start your journey in AI. Master Python 3.12, NumPy, Pandas, Scikit-Learn, and the core statistical algorithms driving modern ML.",
    instructor: "Sarah Jenkins",
    instructorRole: "Senior Data Scientist",
    duration: "25 Hours",
    level: "Beginner",
    type: "SELF_PACED",
    category: "Machine Learning",
    modulesCount: 8,
    projectsCount: 3,
    image: "/images/enterprise_rag_hero_ui.png",
    curriculumLink: "/courses",
    exploreLink: "/courses",
    badgeLabel: "FOUNDATION PATHWAY",
    recommendationReason: "Ideal starter course to solidify core machine learning algorithms, statistical mathematics, and clean Python code.",
    score: 75,
    price: 8999,
    originalPrice: 14999,
    visualEcosystem: {
      terminalFilename: "model_training_pipeline.py",
      badgeTag: "ML PIPELINE",
      codeLines: [
        { code: "from sklearn.ensemble import GradientBoostingClassifier", variable: true },
        { code: "# Cross-validated model evaluation & feature importance", comment: true },
        { code: "model = GradientBoostingClassifier(n_estimators=200)", highlight: true },
        { code: "model.fit(X_train_scaled, y_train)" },
        { code: "accuracy = accuracy_score(y_test, model.predict(X_test))", variable: true },
      ],
      flowNodes: [
        { name: "Data Prep", subtitle: "Pandas & Impute", color: "purple" },
        { name: "Feature Eng", subtitle: "StandardScaler", color: "cyan" },
        { name: "Model Eval", subtitle: "ROC-AUC 98.4%", color: "emerald" },
      ],
      footerNote: "Interactive Jupyter Notebooks Included",
      frameworkTag: "Scikit-Learn & Python",
    },
    metrics: [
      { label: "Modules", value: "8 Foundational Modules" },
      { label: "Projects", value: "3 Real-World Datasets" },
      { label: "Format", value: "Self-Paced", highlight: true },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC RECOMMENDATION ENGINE EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────

export function evaluateCourseRecommendation(
  studentState: StudentLearningState,
  dayOffset: number = 0
): {
  recommendedCourse: RecommendedCourseItem;
  alternativeCourses: RecommendedCourseItem[];
  reasonTag: string;
} {
  const enrolledIds = new Set(
    (studentState.enrolledCourses || []).map((c) => c.id.toLowerCase())
  );
  const enrolledTitles = (studentState.enrolledCourses || []).map((c) =>
    c.title.toLowerCase()
  );

  // Check what student is currently studying
  const hasGenAI = enrolledTitles.some(
    (t) => t.includes("generative ai") || t.includes("agent")
  );
  const hasML = enrolledTitles.some(
    (t) => t.includes("machine learning") || t.includes("python")
  );
  const totalEnrolled = enrolledIds.size;

  // Score each course candidate based on context
  const scoredCourses = ALL_RECOMMENDABLE_COURSES.map((course) => {
    let finalScore = course.score;
    let customReason = course.recommendationReason;

    const isAlreadyEnrolled =
      enrolledIds.has(course.id.toLowerCase()) ||
      enrolledTitles.some(
        (t) =>
          t.includes(course.title.toLowerCase().slice(0, 15)) ||
          course.title.toLowerCase().includes(t.slice(0, 15))
      );

    // If student is already enrolled, de-prioritize from discovery recommendations
    if (isAlreadyEnrolled) {
      finalScore -= 200;
    }

    // Pathway logic:
    if (hasGenAI) {
      if (course.category === "Agentic AI") {
        finalScore += 25;
        customReason =
          "Builds directly on the Generative AI skills in your dashboard with live multi-agent graph workflows.";
      } else if (course.category === "LLMOps") {
        finalScore += 20;
        customReason =
          "Expands your in-progress GenAI knowledge into production deployment, GPU cluster scaling, and evaluation pipelines.";
      } else if (course.category === "NLP") {
        finalScore += 15;
        customReason =
          "Deepens your language model fine-tuning and PEFT adapter capabilities to complement your AI studies.";
      }
    } else if (hasML) {
      if (course.category === "Generative AI" || course.category === "Agentic AI") {
        finalScore += 30;
        customReason =
          "Recommended as your natural next progression from Machine Learning into modern Foundation Models.";
      }
    } else if (totalEnrolled === 0) {
      // Fresh learner: recommend the flagship complete course or the live interactive bootcamp
      if (course.id === "ai-1" || course.id === "live-agentic-ai") {
        finalScore += 30;
        customReason =
          "Curated as the highest-rated entry point to start mastering production AI engineering.";
      }
    }

    // Boost live courses that have upcoming batches starting soon
    if (course.type === "LIVE" && course.scheduleInfo) {
      if (course.scheduleInfo.daysRemaining && course.scheduleInfo.daysRemaining <= 14) {
        finalScore += 15;
      }
    }

    return {
      ...course,
      score: finalScore,
      recommendationReason: customReason,
    };
  });

  // Sort descending by score
  const eligibleCourses = scoredCourses.sort((a, b) => b.score - a.score);

  // Time-based stable rotation:
  // Using deterministic day hashing so the recommendation stays stable across the day/session,
  // but can rotate smoothly over time or allow cycling.
  const today = new Date();
  const dateKey = today.getFullYear() * 1000 + (today.getMonth() + 1) * 50 + today.getDate() + dayOffset;
  const topCandidates = eligibleCourses.slice(0, 3);
  
  // Pick from the top pool using dateKey
  const selectedIndex = (dateKey % Math.max(1, topCandidates.length)) || 0;
  const recommendedCourse = topCandidates[selectedIndex] || eligibleCourses[0] || ALL_RECOMMENDABLE_COURSES[0];

  const alternativeCourses = eligibleCourses.filter((c) => c.id !== recommendedCourse.id).slice(0, 2);

  const reasonTag =
    recommendedCourse.type === "LIVE"
      ? "LIVE OPPORTUNITY"
      : "CURATED LEARNING PATHWAY";

  return {
    recommendedCourse,
    alternativeCourses,
    reasonTag,
  };
}

/**
 * Returns a list of multiple top recommended courses (e.g. 4 courses)
 * with support for filtering by type ("ALL" | "LIVE" | "SELF_PACED") and rotation offset.
 */
export function getRecommendedCourseList(
  studentState: StudentLearningState,
  count: number = 4,
  offset: number = 0,
  filterType: "ALL" | "LIVE" | "SELF_PACED" = "ALL"
): RecommendedCourseItem[] {
  const scoredCourses = ALL_RECOMMENDABLE_COURSES.map((course) => {
    let finalScore = course.score || 80;
    const enrolledIds = (studentState.enrolledCourses || []).map((c) => c.id);

    // Boost score for un-enrolled courses
    if (!enrolledIds.includes(course.id)) {
      finalScore += 10;
    }

    if (course.type === "LIVE" && course.scheduleInfo) {
      if (course.scheduleInfo.daysRemaining && course.scheduleInfo.daysRemaining <= 14) {
        finalScore += 15;
      }
    }

    return {
      ...course,
      score: finalScore,
    };
  }).sort((a, b) => b.score - a.score);

  let filtered = scoredCourses;
  if (filterType === "LIVE") {
    filtered = scoredCourses.filter((c) => c.type === "LIVE");
  } else if (filterType === "SELF_PACED") {
    filtered = scoredCourses.filter((c) => c.type === "SELF_PACED");
  }

  const n = filtered.length;
  if (n === 0) return scoredCourses.slice(0, count);

  const normalizedOffset = ((offset % n) + n) % n;
  const rotated = [...filtered.slice(normalizedOffset), ...filtered.slice(0, normalizedOffset)];
  return rotated.slice(0, count);
}
