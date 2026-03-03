require("dotenv").config();

const { setupChroma } = require("./setupChromaDB");
const { answerQuestion } = require("./agents/knowledgeAgent");

async function run() {
  const setupResult = await setupChroma();
  console.log(
    `Setup complete: ${setupResult.documentsAdded} documents in ${setupResult.collectionName}`
  );

  const question =
    "What should I do for suspected stroke and where should I transport in Barrie?";
  const role = "ACP";

  const response = await answerQuestion(question, role);
  console.log("\nParaHelper response:\n");
  console.log(response);
}

run().catch((error) => {
  console.error("Full test failed:", error);
  process.exit(1);
});
