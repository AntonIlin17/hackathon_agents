const express = require("express");
const { getDb } = require("../utils/mongodb");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { paramedicId } = req.body || {};
    if (!paramedicId) {
      return res.status(400).json({ error: "paramedicId is required." });
    }

    const db = await getDb("parahelper_users");
    const paramedic = await db.collection("paramedics").findOne({
      paramedic_id: paramedicId,
    });

    if (!paramedic) {
      return res.status(401).json({ error: "Invalid paramedic ID." });
    }

    return res.json({
      paramedic_id: paramedic.paramedic_id,
      first_name: paramedic.first_name,
      last_name: paramedic.last_name,
      role: paramedic.role,
      station: paramedic.station,
      unit: paramedic.unit,
      email: paramedic.email,
      shift_status: paramedic.shift_status,
    });
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    return res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
