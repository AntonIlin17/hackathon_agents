const { getOpenRouterClient } = require("./openrouterClient");

async function createEmbedding(input) {
  const client = getOpenRouterClient();
  const response = await client.embeddings.create({
    model: "openai/text-embedding-3-small",
    input,
  });
  const [result] = response.data || [];
  if (!result?.embedding) {
    throw new Error("Embedding response missing data.");
  }
  return result.embedding;
}

module.exports = { createEmbedding };
