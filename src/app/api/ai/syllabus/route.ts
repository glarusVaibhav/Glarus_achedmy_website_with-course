import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key not found' }, { status: 500 });
    }

    const systemPrompt = `You are an expert curriculum designer. Based on the topic provided, generate a detailed syllabus structured as valid JSON without markdown wrapping. 
    The JSON structure MUST exactly match this format:
    {
      "modules": [
        {
          "title": "Module Title Here",
          "lessons": ["Lesson 1 Title", "Lesson 2 Title"]
        }
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
          { role: "user", content: `Generate a syllabus for: ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
       const errResponse = await response.text();
       console.error("Groq Error:", errResponse);
       return NextResponse.json({ error: 'Error generating syllabus from Groq' }, { status: 500 });
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    
    return new NextResponse(resultContent, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("AI Generation Error", error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
