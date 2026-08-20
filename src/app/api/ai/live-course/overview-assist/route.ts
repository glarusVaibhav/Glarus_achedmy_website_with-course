import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      title,
      category = "Generative AI",
      level = "Intermediate",
      currentDescription = "",
      targetAudience = "",
      customInstructions = "",
      sessionCount = 6
    } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Course title is required for AI overview generation" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an elite curriculum architect and copywriter for Glarus Academy, a world-class AI engineering education platform.
Generate an engaging, technically rigorous, and structured Detailed Course Overview for a live cohort course.

Output MUST be strictly valid JSON without markdown wrapping or code blocks.
Format:
{
  "description": "A comprehensive 2-3 paragraph course overview detailing the technical learning trajectory, hands-on pair-programming expectations, live coding workshops, capstone architecture project, and real-world production deliverables.",
  "shortDescription": "A punchy 1-2 sentence summary of what learners will master and build.",
  "targetAudience": "Specific profiles of developers, engineers, or leaders who will get maximum value from this cohort.",
  "prerequisites": [
    "Prerequisite 1",
    "Prerequisite 2",
    "Prerequisite 3"
  ],
  "objectives": [
    "Measurable objective 1",
    "Measurable objective 2",
    "Measurable objective 3",
    "Measurable objective 4"
  ],
  "tags": [
    "Tag1",
    "Tag2",
    "Tag3",
    "Tag4"
  ]
}`;

    const userPrompt = `Course Title: ${title}
Category: ${category}
Level: ${level}
Session Count: ${sessionCount} Sessions
Current Draft Description: ${currentDescription || "None"}
Current Target Audience: ${targetAudience || "None"}
Custom Guidelines from Admin: ${customInstructions || "Make it technical, inspiring, and focused on live building."}

Generate the detailed overview in the exact JSON schema.`;

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
        max_tokens: 2500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Overview Assist Error:", errText);
      return NextResponse.json({ error: "Failed to generate course overview with AI" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Overview AI Assist Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
