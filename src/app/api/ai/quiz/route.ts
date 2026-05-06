import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { topic, numQuestions = 5 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const systemPrompt = `You are an expert quiz creator for an educational platform. Generate exactly ${numQuestions} multiple-choice quiz questions about the given topic.

Each question MUST have exactly 4 options labeled A, B, C, D. One option must be the correct answer.

Return your response as a valid JSON array. Each object has:
- "question": the question text
- "options": an array of exactly 4 strings (the choices)
- "correctIndex": the 0-based index of the correct answer (0-3)
- "explanation": a brief explanation of why the answer is correct

Example format:
[
  {
    "question": "What is X?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Because..."
  }
]

Return ONLY the JSON array. No markdown, no backticks, no extra text.`;

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a quiz about: ${topic}` },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq quiz error:", errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from the response
    let questions;
    try {
      // Try direct parse
      questions = JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: "Failed to parse AI quiz response" }, { status: 500 });
      }
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
