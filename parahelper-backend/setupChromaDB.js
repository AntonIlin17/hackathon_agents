require("dotenv").config();

const { ChromaClient } = require("chromadb");
const medicalKnowledge = require("./knowledge/medicalKnowledge.json");
const { createEmbedding } = require("./utils/embeddings");

const COLLECTION_NAME = "parahelper-medical-knowledge";

function getChromaClient() {
  const chromaUrl = process.env.CHROMA_URL;
  if (!chromaUrl) {
    throw new Error("Missing CHROMA_URL in environment.");
  }
  return new ChromaClient({ path: chromaUrl });
}

async function buildRoleExpandedKnowledge() {
  const expanded = [];
  for (const entry of medicalKnowledge) {
    for (const role of entry.roles) {
      expanded.push({
        id: `${entry.id}-${role.toLowerCase()}`,
        role,
        text: entry.text,
        baseId: entry.id,
      });
    }
  }
  return expanded;
}

async function setupChroma() {
  const client = getChromaClient();
  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
  });

  const expandedKnowledge = await buildRoleExpandedKnowledge();
  const embeddings = await Promise.all(
    expandedKnowledge.map((entry) => createEmbedding(entry.text))
  );

  await collection.upsert({
    ids: expandedKnowledge.map((entry) => entry.id),
    documents: expandedKnowledge.map((entry) => entry.text),
    embeddings,
    metadatas: expandedKnowledge.map((entry) => ({
      role: entry.role,
      baseId: entry.baseId,
    })),
  });

  return {
    collectionName: COLLECTION_NAME,
    documentsAdded: expandedKnowledge.length,
  };
}

if (require.main === module) {
  setupChroma()
    .then((result) => {
      console.log(
        `ChromaDB setup complete for ${result.collectionName}. Added ${result.documentsAdded} documents.`
      );
    })
    .catch((error) => {
      console.error("ChromaDB setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupChroma, COLLECTION_NAME };
