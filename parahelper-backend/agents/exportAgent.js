function validateForms(formPayload = {}) {
  const issues = [];
  if (formPayload.occurrenceReport) {
    if (!formPayload.occurrenceReport.location?.value) {
      issues.push({ form: "occurrenceReport", field: "location" });
    }
    if (!formPayload.occurrenceReport.incidentType?.value) {
      issues.push({ form: "occurrenceReport", field: "incidentType" });
    }
  }
  if (formPayload.teddyBearTracking) {
    if (!formPayload.teddyBearTracking.childName?.value) {
      issues.push({ form: "teddyBearTracking", field: "childName" });
    }
  }
  return { approved: issues.length === 0, issues };
}

async function exportForms(formPayload) {
  console.log("[ExportAgent] Exporting forms", Object.keys(formPayload || {}));
  const guardrail = validateForms(formPayload);
  if (!guardrail.approved) {
    return {
      success: false,
      message: "Cannot export yet — missing required fields.",
      guardrail,
    };
  }
  return {
    success: true,
    message: "Done! Sent it off — one less thing to worry about.",
    guardrail,
  };
}

module.exports = { exportForms, validateForms };
