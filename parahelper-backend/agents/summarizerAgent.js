const { getOpenRouterClient } = require("../utils/openrouterClient");

async function summarizeConversation(messages = []) {
  console.log("[SummarizerAgent] Summarizing conversation");
  if (!messages.length) {
    return "";
  }

  const client = getOpenRouterClient();
  const formatted = messages.map((msg) => `- ${msg}`).join("\n");

  const response = await client.chat.completions.create({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "Summarize paramedic conversation in 3-5 bullet points. " +
          "Highlight key incidents, forms, and emotional context.",
      },
      {
        role: "user",
        content: formatted,
      },
    ],
    temperature: 0.2,
  });

  return response?.choices?.[0]?.message?.content || "";
}

module.exports = { summarizeConversation };
