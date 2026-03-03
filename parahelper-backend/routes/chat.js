const express = require("express");
const { handleConversation } = require("../agents/conversationAgent");

const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    const { paramedicId, role, message, recentMessages, context, inputType } =
      req.body || {};
    const hasEvent = Boolean(context?.event);
    if (!paramedicId || !role || (!message && !hasEvent)) {
      return res
        .status(400)
        .json({ error: "paramedicId, role, and message are required." });
    }

    const response = await handleConversation({
      paramedicId,
      role,
      message,
      recentMessages,
      context,
      inputType,
    });

    return res.json(response);
  } catch (error) {
    console.error("[Chat] Message failed:", error);
    return res.status(500).json({ error: "Chat message failed." });
  }
});

module.exports = router;
