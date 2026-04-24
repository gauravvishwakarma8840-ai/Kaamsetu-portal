exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "OPENAI_API_KEY missing" }) };
    }

    const payload = JSON.parse(event.body || "{}");
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const normalized = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "")
    }));

    const systemPrompt =
      "You are KaamSetu AI for Indian rural jobs. Give practical, concise help in the same language as user.";
    const requestBody = {
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [{ role: "system", content: systemPrompt }, ...normalized]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.error || "OpenAI API error" }) };
    }

    const reply = data.choices?.[0]?.message?.content || "Mujhe abhi reply generate karne mein issue aa raha hai.";
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: String(error.message || error) })
    };
  }
};
