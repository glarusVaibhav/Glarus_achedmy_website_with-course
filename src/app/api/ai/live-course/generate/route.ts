import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { prompt, startDate, sessionCount = 6, frequency = "2x per week", defaultDuration = "120 min", preferredTime = "07:00 PM", timezone = "Asia/Kolkata (IST)", level = "Intermediate", category = "Generative AI" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Course topic or prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an elite curriculum architect and live cohort designer for Glarus Academy.
Based on the user's prompt and schedule parameters, generate a complete, structured Live Course with exactly ${sessionCount} live workshop sessions.
Keep descriptions crisp and concise (1-2 sentences per item).

Output MUST be strictly valid JSON without markdown wrapping or code blocks.
The JSON structure MUST follow this exact schema:
{
  "course": {
    "title": "String (engaging, professional course title)",
    "shortDescription": "String (1-2 sentences overview)",
    "description": "String (concise 2-paragraph overview of the live cohort, hands-on projects, and mastery path)",
    "category": "${category}",
    "level": "${level}",
    "duration": "${sessionCount} Live Sessions",
    "targetAudience": "String (who this is designed for)",
    "prerequisites": ["String", "String"],
    "objectives": ["String", "String", "String"],
    "tags": ["String", "String", "String"]
  },
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "String (concrete session topic)",
      "description": "String (what will be built/learned live)",
      "duration": "${defaultDuration}",
      "startTime": "${preferredTime}",
      "endTime": "Calculated end time (e.g. 09:00 PM for a 120 min session starting at 07:00 PM)",
      "agenda": [
        {
          "title": "String (e.g. Cohort Welcome & Setup)",
          "description": "String",
          "startTime": "07:00 PM",
          "endTime": "07:15 PM",
          "duration": "15 min"
        },
        {
          "title": "String (Core Concept Deep Dive)",
          "description": "String",
          "startTime": "07:15 PM",
          "endTime": "08:00 PM",
          "duration": "45 min"
        },
        {
          "title": "String (Live Hands-on Implementation)",
          "description": "String",
          "startTime": "08:00 PM",
          "endTime": "08:45 PM",
          "duration": "45 min"
        },
        {
          "title": "String (Q&A & Take-Home Briefing)",
          "description": "String",
          "startTime": "08:45 PM",
          "endTime": "09:00 PM",
          "duration": "15 min"
        }
      ],
      "topics": [
        { "title": "Topic Title", "description": "Topic brief" }
      ],
      "learningOutcomes": [
        "Outcome 1",
        "Outcome 2"
      ],
      "activities": [
        { "title": "Live Coding Challenge", "instructions": "Step by step challenge", "duration": "30 min" }
      ],
      "resources": [
        { "title": "Documentation / Paper", "type": "URL", "url": "https://docs.example.com" }
      ],
      "homework": [
        { "title": "Session Project Challenge", "description": "Deliverable description", "dueDate": "4 days after session" }
      ]
    }
  ]
}`;

    const userPrompt = `User Prompt: ${prompt}
Number of sessions to generate: ${sessionCount}
Schedule frequency: ${frequency}
Default duration: ${defaultDuration}
Preferred start time: ${preferredTime}
Timezone: ${timezone}
Start Date baseline: ${startDate || new Date().toISOString().split('T')[0]}

Generate all ${sessionCount} comprehensive sessions with rich agendas, real technical topics, actionable exercises, and specific homework challenges.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Live Course Error:", errText);
      return NextResponse.json({ error: "Failed to generate live course with AI" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      // Robust JSON repair if truncated at trailing session
      const lastSessionIndex = content.lastIndexOf('{"sessionNumber"');
      if (lastSessionIndex > 0) {
        const truncatedCleaned = content.slice(0, content.lastIndexOf("},")) + "}]}";
        try {
          parsed = JSON.parse(truncatedCleaned);
        } catch {
          throw parseErr;
        }
      } else {
        throw parseErr;
      }
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("AI Generation Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
