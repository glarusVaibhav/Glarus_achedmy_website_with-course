import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, topic, category, level } = await req.json();
    const courseTitle = title || topic || "Full-Stack AI & Cloud Masterclass";
    const courseCategory = category || "Artificial Intelligence";
    const courseLevel = level || "All Levels";

    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are a world-class edtech landing page copywriter and curriculum architect for Glarus Academy.
Based on the course title and category, generate rich landing page marketing and curriculum metadata.
Return a STRICT JSON object with no markdown wrapping and exact structure:
{
  "subtitle": "A compelling 1-2 sentence tagline explaining what learners will build and master",
  "duration": "e.g. 36 Hours VOD",
  "originalPrice": 4999,
  "learningOutcomes": [
    { "title": "Outcome 1 Title", "description": "Concise 1-2 sentence description of this competency" },
    { "title": "Outcome 2 Title", "description": "Concise 1-2 sentence description of this competency" },
    { "title": "Outcome 3 Title", "description": "Concise 1-2 sentence description of this competency" },
    { "title": "Outcome 4 Title", "description": "Concise 1-2 sentence description of this competency" },
    { "title": "Outcome 5 Title", "description": "Concise 1-2 sentence description of this competency" },
    { "title": "Outcome 6 Title", "description": "Concise 1-2 sentence description of this competency" }
  ],
  "projects": [
    { "number": "01", "title": "Project 1 Title", "desc": "Detailed explanation of architecture & deliverables", "tech": ["Tech1", "Tech2", "Tech3"] },
    { "number": "02", "title": "Project 2 Title", "desc": "Detailed explanation of architecture & deliverables", "tech": ["Tech1", "Tech2", "Tech3"] },
    { "number": "03", "title": "Project 3 Title", "desc": "Detailed explanation of architecture & deliverables", "tech": ["Tech1", "Tech2", "Tech3"] },
    { "number": "04", "title": "Project 4 Title", "desc": "Detailed explanation of architecture & deliverables", "tech": ["Tech1", "Tech2", "Tech3"] }
  ],
  "faqs": [
    { "q": "What are the prerequisites for this masterclass?", "a": "A foundational understanding of programming basics is recommended. We start with fundamental concepts and advance to production architecture." },
    { "q": "Are the projects portfolio-ready?", "a": "Yes! Every project includes full source code, test suites, and Docker deployment configs designed to impress hiring teams." },
    { "q": "Do I get a verified certificate?", "a": "Upon completing all modules and capstone projects with passing marks, you will receive a cryptographically verified Glarus Academy smart certificate." },
    { "q": "Will I have lifetime access to updates?", "a": "Yes, your enrollment grants permanent lifetime access including all future curriculum updates and bonus modules." }
  ],
  "features": [
    "Comprehensive on-demand HD video lectures",
    "Real-world production capstone projects",
    "Interactive coding sandboxes & quizzes",
    "Verified Certificate of Completion",
    "Full lifetime access to course updates",
    "24/7 AI Tutor & Discord community support"
  ]
}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate landing page assets for course: "${courseTitle}", Category: "${courseCategory}", Level: "${courseLevel}"` }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const groqData = await response.json();
          const content = groqData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({ success: true, data: parsed });
          }
        }
      } catch (err) {
        console.warn("Groq landing generation fallback:", err);
      }
    }

    // Intelligent Fallback Template if Groq is unavailable
    const fallbackData = {
      subtitle: `Master production-grade ${courseTitle} with hands-on architecture, real-world case studies, and deployment pipelines.`,
      duration: "35 Hours VOD",
      originalPrice: 4999,
      learningOutcomes: [
        {
          title: `Core Architectural Principles of ${courseTitle}`,
          description: `Master fundamental and advanced structural design patterns tailored specifically for modern ${courseCategory} applications.`
        },
        {
          title: "Production State & Data Flow Orchestration",
          description: "Design robust, observable workflows with error isolation, automated retry loops, and asynchronous processing."
        },
        {
          title: "High-Performance API & Microservices Integration",
          description: "Build scalable endpoints with low-latency streaming responses, schema validation, and secure authentication guards."
        },
        {
          title: "Automated Testing, CI/CD & Cloud Infrastructure",
          description: "Containerize services with Docker, set up automated unit/integration test suites, and deploy to modern cloud environments."
        },
        {
          title: "Security, Rate Limiting & Enterprise Governance",
          description: "Implement defense-in-depth security best practices, JWT/OAuth auth flows, role-based access control, and telemetry monitoring."
        },
        {
          title: "Full Capstone Portfolio Deployment",
          description: "Architect, build, and deploy an end-to-end industry capstone application to showcase in high-tier technical interviews."
        }
      ],
      projects: [
        {
          number: "01",
          title: `Core Architecture Lab for ${courseTitle}`,
          desc: "Implement the foundational pipeline with clean modular abstractions, state management, and configuration presets.",
          tech: ["Python / TypeScript", "Docker", "REST / GraphQL"]
        },
        {
          number: "02",
          title: "High-Throughput Streaming & Event Engine",
          desc: "Construct an asynchronous event stream processor with Redis caching, backpressure control, and real-time frontend updates.",
          tech: ["FastAPI", "Redis", "WebSockets"]
        },
        {
          number: "03",
          title: "Automated Observability & Telemetry Stack",
          desc: "Integrate distributed tracing, latency monitoring, error alerting, and cost-optimization dashboards.",
          tech: ["OpenTelemetry", "Prometheus", "Grafana"]
        },
        {
          number: "04",
          title: "Production Enterprise Capstone System",
          desc: "Design and ship a complete multi-tenant platform with automated CI/CD pipelines, container orchestration, and verified audit logs.",
          tech: ["Next.js", "PostgreSQL", "Cloud Deployment"]
        }
      ],
      faqs: [
        {
          q: `What prerequisites are recommended for this course?`,
          a: `Basic familiarity with programming and web concepts is helpful. We cover advanced architectures step-by-step with practical hands-on examples.`
        },
        {
          q: "Are the projects and code repositories included?",
          a: "Yes, every module includes full access to production GitHub repositories, starter boilerplate, solution code, and architecture diagrams."
        },
        {
          q: "Will I receive a verified certificate upon completion?",
          a: "Yes! Completing the course modules and capstone project earns an official Glarus Academy smart certificate with a verifiable credential link."
        },
        {
          q: "How long do I have access to course materials?",
          a: "You receive permanent lifetime access, including all future module revisions, supplementary resources, and developer community forums."
        }
      ],
      features: [
        "35+ Hours of on-demand high-definition video",
        "4 Comprehensive real-world capstone projects",
        "Full lifetime access to curriculum updates",
        "Verified Certificate of Completion",
        "Source code, architecture diagrams & notebooks",
        "Access to private instructor & developer community"
      ]
    };

    return NextResponse.json({ success: true, data: fallbackData });
  } catch (error: any) {
    console.error("Course landing AI error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate landing data" }, { status: 500 });
  }
}
