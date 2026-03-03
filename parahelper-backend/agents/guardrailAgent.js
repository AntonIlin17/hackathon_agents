const requiredFields = {
  occurrenceReport: ["location", "incidentType"],
  teddyBearTracking: ["childName"],
};

function evaluateGuardrails(formUpdates = {}) {
  console.log("[GuardrailAgent] Validating required fields");
  const issues = [];

  for (const [formName, fields] of Object.entries(formUpdates)) {
    const required = requiredFields[formName] || [];
    for (const field of required) {
      const value = fields[field]?.value;
      const confidence = fields[field]?.confidence;
      if (!value) {
        issues.push({ form: formName, field, issue: "missing" });
      } else if (confidence === "low") {
        issues.push({ form: formName, field, issue: "low_confidence" });
      }
    }
  }

  return {
    approved: issues.length === 0,
    issues,
  };
}

module.exports = { evaluateGuardrails };
