const express = require("express");
const { handleConversation } = require("../agents/conversationAgent");
const { getDb } = require("../utils/mongodb");
const { summarizeConversation } = require("../agents/summarizerAgent");

const router = express.Router();
const HISTORY_LIMIT = 50;
const SUMMARY_LIMIT = 12;

async function loadRecentMessages(paramedicId, limit = HISTORY_LIMIT) {
  const db = await getDb("parahelper_conversations");
  const records = await db
    .collection("chat_messages")
    .find({ paramedic_id: paramedicId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
  return records
    .reverse()
    .map((record) => ({ role: record.role, content: record.content }));
}

async function loadSummary(paramedicId) {
  const db = await getDb("parahelper_conversations");
  const record = await db
    .collection("paramedic_summaries")
    .findOne({ paramedic_id: paramedicId });
  return record?.summary || "";
}

async function saveSummary(paramedicId, summary) {
  const db = await getDb("parahelper_conversations");
  await db.collection("paramedic_summaries").updateOne(
    { paramedic_id: paramedicId },
    {
      $set: {
        paramedic_id: paramedicId,
        summary,
        updated_at: new Date(),
      },
    },
    { upsert: true }
  );
}

async function updateRollingSummary(paramedicId, history, existingSummary) {
  const recentLines = (history || [])
    .slice(-SUMMARY_LIMIT)
    .map((message) => `${message.role}: ${message.content}`);
  const summaryInput = [];
  if (existingSummary) {
    summaryInput.push(`Previous summary: ${existingSummary}`);
  }
  summaryInput.push(...recentLines);
  const summary = await summarizeConversation(summaryInput);
  if (summary) {
    await saveSummary(paramedicId, summary);
  }
}

async function saveMessages(paramedicId, messages, context = {}) {
  const payload = (messages || [])
    .map((message) => ({
      paramedic_id: paramedicId,
      role: message.role,
      content: String(message.content || ""),
      created_at: new Date(),
      context,
    }))
    .filter((message) => message.content.trim().length > 0);

  if (payload.length === 0) return;

  const db = await getDb("parahelper_conversations");
  await db.collection("chat_messages").insertMany(payload);
}

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

    const storedSummary = await loadSummary(paramedicId);
    const storedRecent =
      Array.isArray(recentMessages) && recentMessages.length > 0
        ? recentMessages
        : await loadRecentMessages(paramedicId);
    const history =
      message && String(message).trim().length > 0
        ? [...storedRecent, { role: "user", content: message }]
        : storedRecent;

    const response = await handleConversation({
      paramedicId,
      role,
      message,
      recentMessages: history,
      context: { ...(context || {}), summary: storedSummary },
      inputType,
    });

    await saveMessages(
      paramedicId,
      [
        { role: "user", content: message },
        { role: "assistant", content: response?.response || "" },
      ],
      context
    );

    const summaryHistory = [
      ...history,
      { role: "assistant", content: response?.response || "" },
    ];
    await updateRollingSummary(paramedicId, summaryHistory, storedSummary);

    return res.json(response);
  } catch (error) {
    console.error("[Chat] Message failed:", error);
    return res.status(500).json({ error: "Chat message failed." });
  }
});

module.exports = router;
