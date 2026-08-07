import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const {
      topic,
      numQuestions = 5,
      difficulty = "Medium",
      questionTypes = ["Multiple Choice"],
      generateBasedOn = "Lesson Title",
      customPrompt = "",
      additionalInstructions = "",
      singleQuestionRegen = false,
      singleQuestionContext = ""
    } = await req.json();

    if (!topic && !singleQuestionContext) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const count = singleQuestionRegen ? 1 : numQuestions;
    const typesStr = Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes.join(", ") : "Multiple Choice";

    const systemPrompt = `You are an expert educational quiz creator. Generate exactly ${count} high-quality quiz question(s) about the provided topic.

Target Difficulty: ${difficulty}
Allowed Question Types: ${typesStr}
Source Context Basis: ${generateBasedOn}
${customPrompt ? `Custom User Instructions: ${customPrompt}` : ""}
${additionalInstructions ? `Regeneration Tweaks: ${additionalInstructions}` : ""}

For each question, return a JSON object with:
- "question": string (the question text)
- "options": array of strings (for Multiple Choice / True-False, provide 2 to 4 distinct options)
- "correctIndex": number (0-based index of the correct answer)
- "explanation": string (clear pedagogical explanation of why this answer is correct)
- "hint": string (a subtle hint to help students if stuck)
- "difficulty": string ("${difficulty}")
- "points": number (usually 10)

Example format:
[
  {
    "question": "What is the primary function of a let statement in JavaScript?",
    "options": ["Declares a block-scoped variable", "Declares a global constant", "Executes an asynchronous loop", "Deletes an object property"],
    "correctIndex": 0,
    "explanation": "The 'let' keyword declares a re-assignable variable that is block-scoped.",
    "hint": "Think about variable scoping introduced in ES6.",
    "difficulty": "${difficulty}",
    "points": 10
  }
]

Return ONLY a valid JSON array. No markdown wrapper, no extra text.`;

    const userPrompt = singleQuestionRegen
      ? `Regenerate a fresh, replacement question for: ${singleQuestionContext || topic}. Ensure it is distinct and has 4 clean choices.`
      : `Generate a ${difficulty} difficulty quiz (${count} questions) on topic: ${topic}.`;

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
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

    let questions;
    try {
      questions = JSON.parse(content);
    } catch {
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
