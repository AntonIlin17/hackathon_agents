require("dotenv").config();

const { answerQuestion } = require("./agents/knowledgeAgent");

async function run() {
  const question = "What is the protocol for suspected opioid overdose?";
  const role = "PCP";

  const response = await answerQuestion(question, role);
  console.log("ParaHelper response:\n");
  console.log(response);
}

run().catch((error) => {
  console.error("Test query failed:", error);
  process.exit(1);
});
