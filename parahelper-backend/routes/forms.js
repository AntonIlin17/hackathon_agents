const express = require("express");
const { exportForms } = require("../agents/exportAgent");

const router = express.Router();

router.post("/export", async (req, res) => {
  try {
    const { forms } = req.body || {};
    if (!forms) {
      return res.status(400).json({ error: "forms payload is required." });
    }

    const result = await exportForms(forms);
    return res.json(result);
  } catch (error) {
    console.error("[Forms] Export failed:", error);
    return res.status(500).json({ error: "Export failed." });
  }
});

module.exports = router;
