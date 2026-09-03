import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const {
      lessonTitle,
      contentType = "quiz",
      courseTitle = "",
      moduleTitle = "",
      difficulty = "Intermediate",
      customPrompt = "",
      currentData = {}
    } = await req.json();

    if (!lessonTitle) {
      return NextResponse.json({ error: "Lesson title is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // Helper for fallback generation
    const getFallbackContent = () => {
      const title = lessonTitle.trim();
      const course = courseTitle ? ` (${courseTitle})` : "";

      if (contentType === "quiz") {
        return {
          quizQuestion: `What is the key principle or foundational concept covered in "${title}"?`,
          options: [
            `Primary rule and standard implementation method for ${title}`,
            `A legacy deprecated approach rarely used in production`,
            `An unrelated theoretical syntax with no practical relevance`,
            `A performance bottleneck to be avoided in modern architectures`
          ],
          correctIndex: 0,
          explanation: `In "${title}", understanding the foundational mechanics and standard implementation is essential for correct usage.`,
          hint: `Think about how "${title}" applies directly to core workflows.`
        };
      }

      if (contentType === "article") {
        return {
          content: `# ${title}\n\n## Overview\nWelcome to this comprehensive guide on **${title}**${course}. In this lesson, we break down the core theory, real-world patterns, and practical implementation steps.\n\n---\n\n## Key Concepts\n1. **Core Mechanism:** Understanding how the fundamentals operate under the hood.\n2. **Best Practices:** Writing maintainable, robust, and idiomatic code/architecture.\n3. **Edge Cases:** Handling common pitfalls and unexpected errors gracefully.\n\n---\n\n## Practical Example\n\`\`\`typescript\n// Example demonstration for: ${title}\nfunction executeWorkflow(input: string) {\n  console.log("Processing ${title}:", input);\n  return { success: true, timestamp: Date.now() };\n}\n\`\`\`\n\n---\n\n## Summary & Key Takeaways\n- Mastered the core tenets of **${title}**.\n- Applied best-practice implementations ready for production.\n- Prepared for the hands-on exercises and quizzes in the next section.`,
          summary: `Comprehensive educational guide and walkthrough on ${title}.`,
          estimatedReadTime: "6 min read"
        };
      }

      if (contentType === "sandbox" || contentType === "code") {
        return {
          starterCode: `/**\n * Code Lab Exercise: ${title}\n * Course: ${courseTitle || "Mastery Series"}\n */\n\n// TODO: 1. Initialize your parameters\nconst config = {\n  lesson: "${title}",\n  maxRetries: 3,\n  timeoutMs: 5000\n};\n\n// TODO: 2. Implement the primary function\nexport function solveChallenge(inputData: any) {\n  // Your code here...\n  if (!inputData) {\n    throw new Error("Input data is required for ${title}");\n  }\n\n  return {\n    status: "COMPLETED",\n    result: inputData\n  };\n}\n\n// Test invocation\nconsole.log(solveChallenge({ task: "${title} Demo" }));\n`,
          instructions: `Complete the ${title} challenge by implementing the required handler and passing all assertions.`,
          testCases: `expect(solveChallenge({ task: "${title}" })).toHaveProperty("status", "COMPLETED");`
        };
      }

      if (contentType === "video") {
        return {
          suggestedDuration: "14m 30s",
          outline: [
            `00:00 - Introduction to ${title}`,
            `02:30 - Core Architecture & Problem Statement`,
            `06:45 - Live Coding & Walkthrough`,
            `11:20 - Common Pitfalls & Optimization`,
            `13:50 - Recap & Next Steps`
          ],
          scriptTalkingPoints: `Start with a compelling real-world hook about why ${title} matters. Walk through the architecture step-by-step, highlight common developer misconceptions, and conclude with an actionable practice prompt.`,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        };
      }

      // Default: resource
      return {
        resourceFileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-cheatsheet.pdf`,
        resourceTitle: `${title} - Quick Reference Guide & Cheatsheet`,
        resourceDescription: `Downloadable reference sheet containing syntax cheat-sheets, diagram architectures, and troubleshooting steps for ${title}.`,
        keyPoints: [
          `Full architecture diagram & flow breakdown for ${title}`,
          `Quick reference cheat sheet and API parameters`,
          `Production checklist and troubleshooting guide`
        ]
      };
    };

    if (!apiKey) {
      // Return rich fallback when API key is not present
      const generated = getFallbackContent();
      return NextResponse.json({ success: true, generated, isFallback: true });
    }

    // Build specialized prompt depending on contentType
    let systemPrompt = `You are an elite educational AI assistant for Glarus Academy LMS.
Generate high-impact, pedagogical content for an online course lesson.
Return ONLY valid JSON without markdown wrapping.`;

    let userPrompt = `Course: ${courseTitle || "Professional Series"}
Module: ${moduleTitle || "Core Module"}
Lesson Title: ${lessonTitle}
Content Format: ${contentType}
Target Difficulty: ${difficulty}
${customPrompt ? `Special Instructions: ${customPrompt}` : ""}`;

    if (contentType === "quiz") {
      systemPrompt += `
Format required:
{
  "quizQuestion": "Clear, challenging question testing understanding of the lesson",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Why this option is correct and others are incorrect",
  "hint": "Pedagogical clue helping the learner"
}`;
    } else if (contentType === "article") {
      systemPrompt += `
Format required:
{
  "content": "Rich markdown article text with headers (# and ##), bold terms, code blocks, bullet points, and practical real-world takeaways",
  "summary": "2-sentence summary of the article",
  "estimatedReadTime": "e.g. 5 min read"
}`;
    } else if (contentType === "sandbox" || contentType === "code") {
      systemPrompt += `
Format required:
{
  "starterCode": "Complete TypeScript/JavaScript starter template with comments and // TODO markers for the student to fill in",
  "instructions": "Step-by-step instructions for the coding challenge",
  "testCases": "Assertion examples"
}`;
    } else if (contentType === "video") {
      systemPrompt += `
Format required:
{
  "suggestedDuration": "e.g. 12m 45s",
  "outline": ["00:00 - Intro", "03:00 - Core Logic", "08:00 - Demo", "11:00 - Wrap-up"],
  "scriptTalkingPoints": "Key points the instructor should cover on camera",
  "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
}`;
    } else {
      systemPrompt += `
Format required:
{
  "resourceFileName": "clean-filename.pdf",
  "resourceTitle": "Clear descriptive title for the resource",
  "resourceDescription": "Detailed overview of what the resource contains",
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}`;
    }

    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: "json_object" }
        })
      });

      if (!res.ok) {
        console.warn("Groq API error, using fallback content");
        const generated = getFallbackContent();
        return NextResponse.json({ success: true, generated, isFallback: true });
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content ?? "{}";
      const generated = JSON.parse(rawContent);

      return NextResponse.json({ success: true, generated });
    } catch (apiErr) {
      console.warn("Groq execution failed, falling back gracefully", apiErr);
      const generated = getFallbackContent();
      return NextResponse.json({ success: true, generated, isFallback: true });
    }
  } catch (error: any) {
    console.error("Lesson assist error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
