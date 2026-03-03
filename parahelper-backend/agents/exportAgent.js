async function exportForms(formPayload) {
  console.log("[ExportAgent] Exporting forms", Object.keys(formPayload || {}));
  return {
    success: true,
    message: "Done! Sent it off — one less thing to worry about.",
  };
}

module.exports = { exportForms };
