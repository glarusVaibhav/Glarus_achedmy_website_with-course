import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { title, category, level } = await req.json();
    const courseTitle = title || "Advanced Generative AI & Autonomous Agents Bootcamp";
    const courseCategory = category || "Generative AI";
    const courseLevel = level || "Intermediate";

    const prompt = `You are a world-class live tech bootcamp curriculum architect for Glarus Academy.
Given the live cohort course title: "${courseTitle}" (Category: ${courseCategory}, Level: ${courseLevel}),
generate high-converting, professional, and accurate landing page showcase metadata in JSON format.

Output MUST be valid JSON with this exact structure:
{
  "subtitle": "Comprehensive 6-week live cohort covering ...",
  "duration": "6 Weeks (12 Live Sessions)",
  "price": 14999,
  "originalPrice": 24999,
  "learningOutcomes": [
    {
      "title": "Short punchy competency title (e.g. Build Stateful Agent Graphs)",
      "description": "2 sentences describing the technical depth, frameworks, and practical takeaways."
    }
  ], // EXACTLY 6 distinct competency items
  "projects": [
    {
      "number": "01",
      "title": "Capstone Project Title",
      "desc": "2 sentences explaining the architecture and deliverable.",
      "tech": ["Python", "LangGraph", "Docker", "FastAPI"]
    }
  ], // EXACTLY 4 capstone projects
  "batches": [
    {
      "id": "batch-01",
      "name": "Batch #01 (Weekend Cohort)",
      "startDate": "Starts 24 Aug 2026",
      "schedule": "Sat & Sun",
      "time": "10:00 AM – 12:00 PM IST",
      "duration": "6 Weeks",
      "enrolled": 42,
      "total": 50
    },
    {
      "id": "batch-02",
      "name": "Batch #02 (Weekday Evening)",
      "startDate": "Starts 01 Sep 2026",
      "schedule": "Tue & Thu",
      "time": "07:00 PM – 09:00 PM IST",
      "duration": "6 Weeks",
      "enrolled": 25,
      "total": 50
    }
  ],
  "features": [
    "12 Interactive Live Masterclasses (24 Hours Total)",
    "1-on-1 Code Defenses & Mentor Code Reviews",
    "Full GitHub Code Repositories & Jupyter Notebooks",
    "4 Production-Grade Capstone Projects",
    "Dedicated Private Discord Cohort Channel",
    "Cryptographically Verified Certificate of Completion",
    "Lifetime Access to HD Session Recordings"
  ], // 6 to 7 benefit cards
  "learningJourney": [
    { "step": "01", "title": "Learn", "desc": "Attend interactive live masterclasses with lead AI scientists." },
    { "step": "02", "title": "Practice", "desc": "Implement attention math & custom kernels in Google Colab." },
    { "step": "03", "title": "Build", "desc": "Engineer 4 production systems with LangGraph & vector databases." },
    { "step": "04", "title": "Defend", "desc": "Present deliverables and receive 1-on-1 mentor code reviews." },
    { "step": "05", "title": "Get Certified", "desc": "Earn your cryptographically verified Glarus Academy certificate." }
  ],
  "faqs": [
    {
      "q": "How long is this live cohort program?",
      "a": "The cohort spans 6 weeks with 2 live masterclasses per week (total 12 sessions of 2 hours each)."
    },
    {
      "q": "What happens if I miss a live masterclass?",
      "a": "Every session is recorded in 1080p Full HD and published to your student dashboard within 2 hours with timestamped agendas, transcripts, and downloadable slides."
    },
    {
      "q": "Are hands-on capstone projects and mentor defenses included?",
      "a": "Yes! You will build 4 production projects and defend them in live 1-on-1 code reviews with senior instructors."
    },
    {
      "q": "Will I receive a verified certificate upon completion?",
      "a": "Yes. Learners who complete the curriculum milestones and capstone defenses receive an official Glarus Academy Smart Credential."
    }
  ]
}

DO NOT include markdown formatting or backticks, just raw JSON.`;

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          response_format: { type: "json_object" }
        });

        const rawText = chatCompletion.choices[0]?.message?.content;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return NextResponse.json({ success: true, data: parsed });
        }
      } catch (groqErr) {
        console.warn("Groq API error, using intelligent fallback", groqErr);
      }
    }

    // Intelligent Fallback
    const fallbackData = {
      subtitle: `Comprehensive live cohort covering modern industry architectures, hands-on production code, and enterprise deployment best practices for ${courseTitle}.`,
      duration: "6 Weeks (12 Live Sessions)",
      price: 14999,
      originalPrice: 24999,
      learningOutcomes: [
        {
          title: "Build Production-Ready Stateful Agent Graphs",
          description: "Architect cyclical multi-agent workflows with LangGraph, checkpointing, and persistent state machines."
        },
        {
          title: "Implement Supervisor Agent Routing Patterns",
          description: "Construct hierarchical planning agents, worker swarms, and deterministic tool delegation pipelines."
        },
        {
          title: "Integrate Model Context Protocol (MCP) Servers",
          description: "Connect agent workflows to live databases, REST APIs, and external enterprise tools using the open MCP standard."
        },
        {
          title: "Design Human-in-the-Loop Interrupt Mechanisms",
          description: "Implement safe state-pausing authorization gates and manual verification steps for high-risk operations."
        },
        {
          title: "Deploy Low-Latency Streaming Microservices",
          description: "Package agents with FastAPI, Docker, and Ray Serve with real-time SSE token and thought streaming."
        },
        {
          title: "Benchmark Agent Task Accuracy & Cost Control",
          description: "Set up distributed telemetry with LangSmith, latency profiling, and automated cost optimization monitors."
        }
      ],
      projects: [
        {
          number: "01",
          title: "Autonomous Multi-Agent Financial Analyst Swarm",
          desc: "Construct an end-to-end swarm that ingests SEC filings, runs quantitative metrics, and drafts investment memos.",
          tech: ["Python", "LangGraph", "FastAPI", "Docker"]
        },
        {
          number: "02",
          title: "Production Hybrid RAG Document Engine",
          desc: "Construct an enterprise search system indexing 100K+ technical documents with hybrid vector retrieval.",
          tech: ["Qdrant", "PostgreSQL", "Cohere", "Next.js"]
        },
        {
          number: "03",
          title: "Real-Time AI Code Reviewer & PR Bot",
          desc: "Deploy a webhook-triggered AI assistant that analyzes pull requests, enforces conventions, and runs unit tests.",
          tech: ["TypeScript", "GitHub API", "OpenAI", "Redis"]
        },
        {
          number: "04",
          title: "Enterprise Multi-Tenant SaaS Platform",
          desc: "Architect a scalable SaaS with team workspaces, usage metering, stripe billing, and automated CI/CD.",
          tech: ["Next.js 15", "Prisma", "PostgreSQL", "Tailwind CSS"]
        }
      ],
      batches: [
        {
          id: "batch-01",
          name: "Batch #01 (Weekend Cohort)",
          startDate: "Starts 24 Aug 2026",
          schedule: "Sat & Sun",
          time: "10:00 AM – 12:00 PM IST",
          duration: "6 Weeks",
          enrolled: 42,
          total: 50
        },
        {
          id: "batch-02",
          name: "Batch #02 (Weekday Evening)",
          startDate: "Starts 01 Sep 2026",
          schedule: "Tue & Thu",
          time: "07:00 PM – 09:00 PM IST",
          duration: "6 Weeks",
          enrolled: 25,
          total: 50
        }
      ],
      features: [
        "12 Interactive Live Masterclasses (24 Hours Total)",
        "1-on-1 Code Defenses & Mentor Code Reviews",
        "Full GitHub Code Repositories & Jupyter Notebooks",
        "4 Production-Grade Capstone Projects",
        "Dedicated Private Discord Cohort Channel",
        "Cryptographically Verified Certificate of Completion",
        "Lifetime Access to HD Session Recordings"
      ],
      learningJourney: [
        { step: "01", title: "Learn", desc: "Attend interactive live masterclasses with lead AI scientists." },
        { step: "02", practice: "Practice", title: "Practice", desc: "Implement attention math & custom kernels in Google Colab." },
        { step: "03", title: "Build", desc: "Engineer 4 production systems with LangGraph & vector databases." },
        { step: "04", title: "Defend", desc: "Present deliverables and receive 1-on-1 mentor code reviews." },
        { step: "05", title: "Get Certified", desc: "Earn your cryptographically verified Glarus Academy certificate." }
      ],
      faqs: [
        {
          q: "How long is this live cohort program?",
          a: "The cohort spans 6 weeks with 2 live masterclasses per week (total 12 sessions of 2 hours each)."
        },
        {
          q: "What happens if I miss a live masterclass?",
          a: "Every session is recorded in 1080p Full HD and published to your student dashboard within 2 hours with timestamped agendas, transcripts, and downloadable slides."
        },
        {
          q: "Are hands-on capstone projects and mentor defenses included?",
          a: "Yes! You will build 4 production projects and defend them in live 1-on-1 code reviews with senior instructors."
        },
        {
          q: "Will I receive a verified certificate upon completion?",
          a: "Yes. Learners who complete the curriculum milestones and capstone defenses receive an official Glarus Academy Smart Credential."
        }
      ]
    };

    return NextResponse.json({ success: true, data: fallbackData });
  } catch (error: any) {
    console.error("Live Course Landing AI Error:", error);
    return NextResponse.json({ error: "Failed to generate live course landing content" }, { status: 500 });
  }
}
