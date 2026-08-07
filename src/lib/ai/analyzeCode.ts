// lib/ai/analyzeCode.ts

interface AnalyzeCodeParams {
  lessonTitle: string;
  concept: string;
  userCode: string;
  expectedOutput: string;
  actualOutput: string;
  errorMessage: string | null;
  attemptCount: number;
}

export async function analyzeCode(params: AnalyzeCodeParams) {
  // In a real application, this would call your AI backend.
  // We'll simulate the AI's response format here or make a fetch call to an API endpoint.
  
  const payload = {
    model: "gemini-1.5-pro",
    messages: [
      {
        role: "system",
        content: `You are an AI Python tutor. Analyze the student's code and return STRICT JSON.
Never give the full answer before 3 attempts. Use simple language. Focus on WHY.`
      },
      {
        role: "user",
        content: JSON.stringify(params)
      }
    ]
  };

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      // Fallback response for demonstration
      return generateFallbackAnalysis(params);
    }
    
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content); // Assuming OpenAI/Gemini format API
  } catch (err) {
    return generateFallbackAnalysis(params);
  }
}

function generateFallbackAnalysis(params: AnalyzeCodeParams) {
  return {
    error_type: params.errorMessage ? "syntax" : "logic",
    explanation: "There seems to be an issue with your code execution.",
    hint_level_1: "Check the syntax carefully.",
    hint_level_2: "Compare your code against the required variables or structure.",
    step_by_step_fix: ["Read the error", "Fix the typo", "Run again"],
    correct_code: params.attemptCount >= 3 ? "print('fixed')" : null,
    analogy: "It's like missing a puzzle piece.",
    encouragement: "Keep going, you'll get it!",
    why_it_works: "Programming is exact."
  };
}
