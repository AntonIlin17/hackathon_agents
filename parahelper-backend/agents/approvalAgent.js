const { getOpenRouterClient } = require("../utils/openrouterClient");
const { getDb } = require("../utils/mongodb");

function buildDefaultRequest(message) {
  return {
    type: "general_request",
    details: { message },
    urgency: "normal",
  };
}

function inferTypeFromMessage(message) {
  const text = String(message || "").toLowerCase();
  if (text.includes("uniform")) return "uniform";
  if (text.includes("vacation")) return "vacation";
  if (text.includes("overtime")) return "overtime";
  if (text.includes("missed meal")) return "missed_meal";
  if (text.includes("certification")) return "certification";
  if (text.includes("equipment")) return "equipment";
  return "";
}

function extractUniformDetails(message) {
  const text = String(message || "").toLowerCase();
  const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|small|medium|large)\b/);
  const itemMatch = text.match(/\b(jacket|shirt|pants|boots|gloves|hat|vest)\b/);
  return {
    size: sizeMatch ? sizeMatch[1] : "",
    item: itemMatch ? itemMatch[1] : "",
  };
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function getMissingFields(request) {
  const missing = [];
  const details = request.details || {};
  switch (request.type) {
    case "uniform":
      if (!details.item) missing.push("item");
      if (!details.size) missing.push("size");
      break;
    case "vacation":
      if (!details.startDate) missing.push("start date");
      if (!details.endDate) missing.push("end date");
      break;
    case "overtime":
      if (!details.date) missing.push("date");
      if (!details.hours) missing.push("hours");
      break;
    case "missed_meal":
      if (!details.date) missing.push("date");
      if (!details.time) missing.push("time");
      if (!details.location) missing.push("location");
      break;
    case "certification":
      if (!details.item) missing.push("certification");
      break;
    case "equipment":
      if (!details.item) missing.push("equipment");
      if (!details.quantity) missing.push("quantity");
      break;
    default:
      break;
  }
  return missing;
}

async function saveApprovalRequest(paramedicId, request) {
  const db = await getDb("parahelper_operations");
  await db.collection("approval_requests").insertOne({
    paramedic_id: paramedicId,
    ...request,
    status: "pending",
    created_at: new Date(),
  });
}

async function extractApprovalRequest(message) {
  const client = getOpenRouterClient();
  const prompt = [
    "Extract an approval-needed request from the paramedic message.",
    "Return ONLY JSON with this schema:",
    "{",
    '  "type": "uniform|vacation|overtime|missed_meal|certification|equipment|general_request",',
    '  "details": {',
    '     "item"?: string,',
    '     "size"?: string,',
    '     "quantity"?: number,',
    '     "startDate"?: string,',
    '     "endDate"?: string,',
    '     "date"?: string,',
    '     "time"?: string,',
    '     "location"?: string,',
    '     "hours"?: number,',
    '     "notes"?: string',
    "  },",
    '  "urgency": "low|normal|high"',
    "}",
  ].join("\n");

  const response = await client.chat.completions.create({
    model: "google/gemini-2.5-pro",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: message },
    ],
    temperature: 0.1,
  });

  const content = response?.choices?.[0]?.message?.content || "";
  return parseJsonSafe(content);
}

async function handleApprovalRequest(paramedicId, message) {
  console.log("[ApprovalAgent] Handling approval request");
  const extracted =
    (await extractApprovalRequest(message)) || buildDefaultRequest(message);
  if (extracted.type === "general_request") {
    const inferred = inferTypeFromMessage(message);
    if (inferred) {
      extracted.type = inferred;
    }
  }
  if (extracted.type === "uniform") {
    const { size, item } = extractUniformDetails(message);
    extracted.details = {
      ...extracted.details,
      ...(size ? { size } : {}),
      ...(item ? { item } : {}),
    };
  }
  await saveApprovalRequest(paramedicId, extracted);

  const missing = getMissingFields(extracted);
  if (missing.length > 0) {
    return {
      response: `Got it — I can submit that. I just need ${missing.join(", ")}.`,
      guardrail: { approved: false, issues: missing },
    };
  }

  return {
    response: `Done — I’ve submitted the ${extracted.type.replace(/_/g, " ")} request for approval.`,
    guardrail: { approved: true, issues: [] },
  };
}

module.exports = { handleApprovalRequest };
