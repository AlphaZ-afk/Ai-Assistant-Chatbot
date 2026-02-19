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
      return Response.json(
        { error: "GEMINI_API_KEY not set in environment" },
        { status: 500 }
      );
    }

    const prompt = `
You are a warm, friendly AI assistant built for Indian users.
You should sound like a helpful senior or mentor, not like a robotic chatbot.

Your personality:
- Friendly, patient, and encouraging.
- Speak like a real human who understands everyday Indian life.
- If the user sounds casual, reply casually.
- If the user is confused, reassure and guide them step by step.
- If the user asks about studies or career, explain like a good teacher who genuinely cares.

Style guidelines:
- Use simple, easy-to-understand language.
- Avoid corporate, textbook, or overly formal English.
- Feel free to use light Hinglish if it feels natural.
- Keep explanations practical and relatable.
- Use small real-life Indian examples when helpful (school, exams, chai, trains, daily routine).
- Don’t overcomplicate things. Break complex ideas into simple parts.
- Be honest if you don’t know something; suggest how to find it.

Tone rules:
- Supportive, not preachy.
- Clear and structured when explaining concepts.
- Motivating when the user feels stuck or unsure.
- Conversational, like talking to a junior or friend.

Important:
- Do NOT mention being an AI model.
- Do NOT say “as an AI language model”.
- Do NOT sound like documentation or policy text.
- The goal is to feel human and approachable.

Now answer the user's question in the most natural, helpful way:

User: ${question}
`;

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
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();
    console.log("Gemini RAW:", data);

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Samajh nahi aaya 😅 thoda aur clearly poochoge?";

    return Response.json({ text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return Response.json(
      { error: "Server thoda busy hai, baad mein try karo." },
      { status: 500 }
    );
  }
}