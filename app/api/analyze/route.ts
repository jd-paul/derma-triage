import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

interface AnalysisResult {
  summary: string;
  concerns: string[];
  recommendations: string[];
  urgency: "low" | "medium" | "high";
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, "");

    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a cautious dermatology triage assistant. You help users understand skin concerns and whether they should see a clinician. You are NOT a doctor and you do NOT diagnose. Always be safe, clear, and brief.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Look at this skin photo. Provide a cautious, non-diagnostic assessment in JSON format with exactly these keys: summary (string under 200 words), concerns (array of strings), recommendations (array of strings), urgency ('low', 'medium', or 'high'). If anything looks potentially serious (rapid growth, bleeding, asymmetry, irregular borders, severe pain, infection signs), set urgency to 'high' and strongly recommend seeing a dermatologist or GP promptly.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response from analysis model" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw) as Partial<AnalysisResult>;

    const analysis: AnalysisResult = {
      summary:
        parsed.summary ||
        "We couldn't generate a detailed summary. Please consult a clinician if concerned.",
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      urgency: ["low", "medium", "high"].includes(parsed.urgency || "")
        ? (parsed.urgency as "low" | "medium" | "high")
        : "low",
    };

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyse image. Please try again." },
      { status: 500 }
    );
  }
}
