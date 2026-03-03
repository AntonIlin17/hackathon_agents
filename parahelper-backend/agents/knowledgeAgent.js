require("dotenv").config();

const { ChromaClient } = require("chromadb");
const { createEmbedding } = require("../utils/embeddings");
const { COLLECTION_NAME } = require("../setupChromaDB");
const { getOpenRouterClient } = require("../utils/openrouterClient");

function getChromaClient() {
  const chromaUrl = process.env.CHROMA_URL;
  if (!chromaUrl) {
    throw new Error("Missing CHROMA_URL in environment.");
  }
  return new ChromaClient({ path: chromaUrl });
}

function normalizeRole(role) {
  const upper = String(role || "").trim().toUpperCase();
  if (upper !== "ACP" && upper !== "PCP") {
    throw new Error("Invalid role. Expected ACP or PCP.");
  }
  return upper;
}

async function answerQuestion(question, role) {
  if (!question || !String(question).trim()) {
    throw new Error("Question is required.");
  }

  const paramedicRole = normalizeRole(role);
  const client = getOpenRouterClient();
  const chromaClient = getChromaClient();
  const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
  });

  const questionEmbedding = await createEmbedding(question);
  const queryResults = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: 5,
    where: { role: paramedicRole },
  });

  const documents = queryResults?.documents?.[0] || [];
  const knowledgeContext =
    documents.length > 0
      ? documents.map((doc, index) => `Source ${index + 1}: ${doc}`).join("\n")
      : "No relevant knowledge found in the database.";

  const response = await client.chat.completions.create({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You are ParaHelper, a calm and concise medical knowledge assistant for paramedics. " +
          "Use the provided knowledge sources first. Answer in clear, practical steps. " +
          "Include safety reminders and advise following local protocols. If unsure, say so.",
      },
      {
        role: "user",
        content:
          `Paramedic role: ${paramedicRole}\n` +
          `Question: ${question}\n\n` +
          `Knowledge sources:\n${knowledgeContext}`,
      },
    ],
    temperature: 0.2,
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response from Claude.");
  }
  return content;
}

module.exports = { answerQuestion };
