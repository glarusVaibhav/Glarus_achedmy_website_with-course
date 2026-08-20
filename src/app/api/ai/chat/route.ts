import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { message, context } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const systemPrompt = `You are an expert AI learning assistant for an EdTech platform called EduAI. 
You help students understand concepts, answer questions about their courses, summarize lessons, and suggest learning paths.
Be concise, helpful, and encouraging. Use examples when explaining complex topics.
If the student provides course context, tailor your response to that specific course material.
Format your responses with markdown for readability.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          ...(context ? [{ role: "system", content: `Current course context: ${context}` }] : []),
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm unable to respond right now.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
