const { getDb } = require("../utils/mongodb");

async function saveAdminRequest(paramedicId, type, details = {}) {
  const db = await getDb("parahelper_operations");
  await db.collection("admin_requests").insertOne({
    paramedic_id: paramedicId,
    type,
    details,
    status: "pending",
    created_at: new Date(),
  });
}

function getAdminGuardrail(type, message) {
  const text = String(message || "");
  const issues = [];
  if (type === "uniform" && !/size|small|medium|large|xl|xxl/i.test(text)) {
    issues.push("size");
  }
  if (type === "overtime" && !/\b[0-9]+\b/.test(text)) {
    issues.push("hours");
  }
  if (type === "vacation" && !/date|week|month|day/i.test(text)) {
    issues.push("dates");
  }
  if (type === "missed_meal" && !/time|call|location/i.test(text)) {
    issues.push("time/location");
  }
  return { approved: issues.length === 0, issues };
}

async function handleAdminTask(paramedicId, message) {
  console.log("[AdminAgent] Handling admin request");
  const text = String(message || "").toLowerCase();

  if (text.includes("uniform")) {
    await saveAdminRequest(paramedicId, "uniform", { message });
    const guardrail = getAdminGuardrail("uniform", message);
    const response = guardrail.approved
      ? "Got it. I can submit that uniform order."
      : "Got it. I can submit a uniform order request. What size and item?";
    return { response, guardrail };
  }
  if (text.includes("vacation")) {
    await saveAdminRequest(paramedicId, "vacation", { message });
    const guardrail = getAdminGuardrail("vacation", message);
    const response = guardrail.approved
      ? "Got it. I can file that vacation request."
      : "I can file a vacation request. What dates do you want off?";
    return { response, guardrail };
  }
  if (text.includes("overtime")) {
    await saveAdminRequest(paramedicId, "overtime", { message });
    const guardrail = getAdminGuardrail("overtime", message);
    const response = guardrail.approved
      ? "Got it. I can log that overtime request."
      : "I can log the overtime request. How many hours and which day?";
    return { response, guardrail };
  }
  if (text.includes("missed meal")) {
    await saveAdminRequest(paramedicId, "missed_meal", { message });
    const guardrail = getAdminGuardrail("missed_meal", message);
    const response = guardrail.approved
      ? "Got it. I can file that missed meal claim."
      : "I can file a missed meal claim. What call time and location?";
    return { response, guardrail };
  }

  return {
    response:
      "I can handle admin tasks like uniforms, vacation, overtime, and meal claims. What should I file?",
    guardrail: { approved: true, issues: [] },
  };
}

module.exports = { handleAdminTask };
