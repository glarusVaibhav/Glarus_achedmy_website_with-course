import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, courseTitle, sessionTitle, sessionDescription, duration = "120 min", currentData, customInstructions } = await req.json();

    if (!action || !sessionTitle) {
      return NextResponse.json({ error: "Action and session title are required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key not configured" }, { status: 500 });
    }

    let systemPrompt = `You are an elite live workshop assistant for Glarus Academy.
Return strictly valid JSON without markdown wrapping.`;

    let userPrompt = `Course: ${courseTitle || "Live AI Training"}
Session: ${sessionTitle}
Description: ${sessionDescription || ""}
Duration: ${duration}
Custom Instructions: ${customInstructions || "None"}
Current Data: ${JSON.stringify(currentData || {})}`;

    if (action === "GENERATE_AGENDA" || action === "IMPROVE_AGENDA") {
      systemPrompt += `
Generate or improve a step-by-step agenda for this session totaling ${duration}.
Output format:
{
  "agenda": [
    {
      "title": "Step Title",
      "description": "Concrete action and live teaching detail",
      "duration": "15 min",
      "startTime": "e.g. 07:00 PM",
      "endTime": "e.g. 07:15 PM"
    }
  ],
  "rationale": "Brief explanation of why this timeline maximizes learner engagement."
}`;
    } else if (action === "GENERATE_LEARNING_OBJECTIVES") {
      systemPrompt += `
Generate 4-5 high-impact, measurable learning outcomes using Bloom's Taxonomy.
Output format:
{
  "learningOutcomes": [
    "Outcome 1",
    "Outcome 2",
    "Outcome 3"
  ],
  "rationale": "Summary of competencies gained."
}`;
    } else if (action === "GENERATE_ACTIVITIES") {
      systemPrompt += `
Generate 2-3 hands-on pair-programming or breakout activities for this live session.
Output format:
{
  "activities": [
    {
      "title": "Activity Name",
      "instructions": "Detailed step-by-step instructions for students",
      "duration": "25 min"
    }
  ]
}`;
    } else if (action === "GENERATE_HOMEWORK") {
      systemPrompt += `
Generate a structured homework assignment reinforcing the session's live coding.
Output format:
{
  "homework": {
    "title": "Assignment Title",
    "description": "Comprehensive deliverable details, starter assets, and grading criteria.",
    "dueDate": "3 days after session"
  }
}`;
    } else if (action === "GENERATE_DISCUSSION_QUESTIONS") {
      systemPrompt += `
Generate 4 thought-provoking live discussion and debate questions.
Output format:
{
  "discussionQuestions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4"
  ]
}`;
    } else {
      systemPrompt += `
Generate an executive session summary and study guide.
Output format:
{
  "summary": "String (engaging summary)",
  "keyTakeaways": ["Key 1", "Key 2", "Key 3"]
}`;
    }

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
        max_tokens: 2048,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Session Assist Error:", errText);
      return NextResponse.json({ error: "Failed to generate session assistance" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Session AI Assist Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
