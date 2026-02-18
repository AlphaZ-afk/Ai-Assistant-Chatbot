import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return Response.json({ error: "Invalid question" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful, friendly AI assistant. Answer clearly and concisely.\n\nUser: ${question}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();
    console.log("Gemini RAW:", data); // debug

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI did not return any text.";

    return Response.json({ text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}