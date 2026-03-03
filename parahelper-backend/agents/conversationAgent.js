const { getOpenRouterClient } = require("../utils/openrouterClient");
const { getDb } = require("../utils/mongodb");
const { getParamedicState, updateParamedicState } = require("../utils/memoryStore");
const { cleanTranscription } = require("./transcriptionCleaner");
const { detectForms } = require("./formDetectiveAgent");
const { extractFormFields } = require("./extractionAgent");
const { summarizeConversation } = require("./summarizerAgent");
const { answerQuestion } = require("./knowledgeAgent");
const { handleAdminTask } = require("./adminAgent");
const { handleApprovalRequest } = require("./approvalAgent");
const {
  getMockWeather,
  getMockDirections,
  getStationCity,
  getDestinationRecommendation,
} = require("../utils/mockLiveData");
const { getDirections: getMapboxDirections } = require("../utils/mapboxDirections");
const { getScene, upsertScene, appendAudit } = require("../utils/sceneSessions");

const crisisKeywords = [
  "cardiac arrest",
  "unresponsive",
  "cpr",
  "shock",
  "code",
  "airway",
  "no pulse",
  "bleeding",
  "stemi",
];

const calmKeywords = [
  "back at station",
  "clear",
  "cleared",
  "available",
  "back in service",
  "at station",
  "transport complete",
  "patient handed off",
];

const medicalKeywords = [
  "dose",
  "protocol",
  "airway",
  "stroke",
  "shock",
  "overdose",
  "epinephrine",
  "atropine",
  "nitroglycerin",
  "aspirin",
  "naloxone",
  "dextrose",
];

const adminKeywords = ["uniform", "vacation", "overtime", "missed meal"];
const approvalKeywords = [
  "uniform",
  "vacation",
  "overtime",
  "missed meal",
  "certification",
  "training",
  "equipment",
  "order",
  "request",
  "approval",
];
const weatherKeywords = ["weather", "forecast", "temperature", "snow", "rain", "wind"];
const directionsKeywords = [
  "directions",
  "route",
  "fastest",
  "eta",
  "drive to",
];
const stressKeywords = [
  "tough call",
  "rough",
  "hard one",
  "bad call",
  "shaken",
  "overwhelmed",
];
const redFlagKeywords = [
  "unresponsive",
  "unequal pupils",
  "chest pain radiating",
  "stroke signs",
  "severe bleeding",
  "no pulse",
  "gcs",
];
const sceneSafetyKeywords = [
  "aggressive bystander",
  "scene not safe",
  "fire not out",
  "traffic not controlled",
  "weapon",
];
const destinationKeywords = ["destination", "where should we go", "closest hospital"];
const formHelpKeywords = ["form", "which form", "what form", "form should i use", "help filling"];
const pediatricKeywords = ["pediatric", "infant", "child", "toddler", "year old"];

const questionStarters = ["what", "how", "dose", "protocol", "should", "can", "when", "where"];

const silenceTokens = ["...", "..", "…"];

const microChecklists = [
  {
    match: [/\\bstroke\\b/i, /\\bcincinnati\\b/i, /\\bfast\\b/i],
    steps: [
      "FAST/Cincinnati check + last known well",
      "Check glucose + maintain oxygenation",
      "Rapid transport + pre-notify stroke center",
    ],
  },
  {
    match: [/\\boverdose\\b/i, /\\bopioid\\b/i, /\\bnaloxone\\b/i],
    steps: [
      "Airway + assist ventilation",
      "Naloxone titrate to respirations",
      "Monitor + transport, watch for re-sedation",
    ],
  },
  {
    match: [/\\banaphylaxis\\b/i, /\\ballergic\\b/i, /\\bepi\\b/i],
    steps: [
      "IM epinephrine + high-flow O2",
      "Monitor airway + consider adjuncts",
      "Rapid transport + reassess",
    ],
  },
];

function detectCrisisMode(text) {
  const lower = text.toLowerCase();
  return crisisKeywords.some((keyword) => lower.includes(keyword));
}

function detectCalmMode(text) {
  const lower = text.toLowerCase();
  return calmKeywords.some((keyword) => lower.includes(keyword));
}

function detectMedicalIntent(text) {
  const lower = text.toLowerCase();
  return medicalKeywords.some((keyword) => lower.includes(keyword));
}

function detectAdminIntent(text) {
  const lower = text.toLowerCase();
  return adminKeywords.some((keyword) => lower.includes(keyword));
}

function detectApprovalIntent(text) {
  const lower = text.toLowerCase();
  return approvalKeywords.some((keyword) => lower.includes(keyword));
}

function detectWeatherIntent(text) {
  const lower = text.toLowerCase();
  return weatherKeywords.some((keyword) => lower.includes(keyword));
}

function detectDirectionsIntent(text) {
  const lower = text.toLowerCase();
  return directionsKeywords.some((keyword) => lower.includes(keyword));
}

function detectStressCue(text) {
  const lower = text.toLowerCase();
  return stressKeywords.some((keyword) => lower.includes(keyword));
}

function detectRedFlags(text) {
  const lower = text.toLowerCase();
  return redFlagKeywords.filter((keyword) => lower.includes(keyword));
}

function detectSceneSafety(text) {
  const lower = text.toLowerCase();
  return sceneSafetyKeywords.filter((keyword) => lower.includes(keyword));
}

function detectDestinationIntent(text) {
  const lower = text.toLowerCase();
  return destinationKeywords.some((keyword) => lower.includes(keyword));
}

function detectFormHelp(text) {
  const lower = text.toLowerCase();
  return formHelpKeywords.some((keyword) => lower.includes(keyword));
}

function buildFormHelpResponse(detectedForms) {
  if (detectedForms.includes("occurrenceReport")) {
    return "Occurrence Report. Call-related, station-related, or vehicle-related?";
  }
  if (detectedForms.includes("teddyBearTracking")) {
    return "Teddy Bear Tracking. Who got it and where?";
  }
  if (detectedForms.includes("shiftReport")) {
    return "Shift Report. Which date or month?";
  }
  if (detectedForms.includes("statusReport")) {
    return "Paramedic Status Report. Which item?";
  }
  return "Which form: Occurrence, Teddy Bear, Shift, or Status?";
}

function extractVitals(text) {
  const vitals = {};
  const bp = text.match(/bp\s*(\d{2,3})\s*\/\s*(\d{2,3})/i);
  const hr = text.match(/hr\s*(\d{2,3})/i);
  const rr = text.match(/rr\s*(\d{1,2})/i);
  const spo2 = text.match(/spo2\s*(\d{2,3})/i);
  const gcs = text.match(/gcs\s*(\d{1,2})/i);
  if (bp) vitals.bp = `${bp[1]}/${bp[2]}`;
  if (hr) vitals.hr = hr[1];
  if (rr) vitals.rr = rr[1];
  if (spo2) vitals.spo2 = spo2[1];
  if (gcs) vitals.gcs = gcs[1];
  return vitals;
}

function buildDestinationAdvisor(text) {
  const lower = text.toLowerCase();
  if (lower.includes("stroke")) return getDestinationRecommendation("stroke");
  if (lower.includes("trauma") || lower.includes("mva")) return getDestinationRecommendation("trauma");
  if (lower.includes("cardiac") || lower.includes("stemi")) return getDestinationRecommendation("cardiac");
  if (detectPediatric(text)) return getDestinationRecommendation("pediatric");
  return "";
}

function extractDestinationFromRecommendation(recommendation) {
  const match = String(recommendation || "").match(/:\s*(.+)$/);
  return match ? match[1].trim() : "";
}

function detectPediatric(text) {
  const lower = text.toLowerCase();
  if (pediatricKeywords.some((keyword) => lower.includes(keyword))) return true;
  const ageMatch = lower.match(/\b(\d{1,2})\s*year/);
  if (ageMatch) {
    const age = Number(ageMatch[1]);
    return Number.isFinite(age) && age < 12;
  }
  return false;
}

function buildDispatchBrief(message) {
  const flags = detectRedFlags(message);
  const suggestions = [];
  if (message.toLowerCase().includes("mva")) suggestions.push("Trauma protocol");
  if (message.toLowerCase().includes("seizure")) suggestions.push("Seizure protocol");
  if (message.toLowerCase().includes("stroke")) suggestions.push("Stroke protocol");
  const equipment = [];
  if (message.toLowerCase().includes("pediatric")) {
    equipment.push("Pediatric airway kit");
    equipment.push("Weight-based dosing chart");
  }
  return {
    highlights: flags,
    suggestions,
    equipment,
  };
}

async function buildHandoffSummary(message) {
  const client = getOpenRouterClient();
  const response = await client.chat.completions.create({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "Create a concise SBAR handoff summary (4 short lines). " +
          "Use the provided notes only.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.2,
  });
  return response?.choices?.[0]?.message?.content || "";
}
function isQuestion(text) {
  const trimmed = String(text || "").trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.endsWith("?")) return true;
  return questionStarters.some((starter) => trimmed.startsWith(starter));
}

function detectSilence(text) {
  const trimmed = String(text || "").trim();
  if (trimmed.length === 0) return true;
  if (silenceTokens.includes(trimmed)) return true;
  return /^[.\u2026]+$/.test(trimmed);
}

function getMicroChecklist(text) {
  for (const checklist of microChecklists) {
    if (checklist.match.some((term) => term.test(text))) {
      return checklist.steps;
    }
  }
  return null;
}

function buildOneTapFix(guardrail) {
  if (!guardrail || guardrail.approved || guardrail.issues.length === 0) {
    return "";
  }
  const [issue] = guardrail.issues;
  const fieldLabel = issue.field.replace(/([A-Z])/g, " $1").toLowerCase();
  return `Quick check: what's the ${fieldLabel} for the ${issue.form}?`;
}

function buildMissingFieldsPrompt(guardrail) {
  if (!guardrail || guardrail.approved || guardrail.issues.length === 0) {
    return "";
  }
  const fields = guardrail.issues.map((issue) =>
    issue.field.replace(/([A-Z])/g, " $1").toLowerCase()
  );
  const uniqueFields = Array.from(new Set(fields));
  if (uniqueFields.length === 1) {
    return `What's the ${uniqueFields[0]}?`;
  }
  if (uniqueFields.length === 2) {
    return `I need the ${uniqueFields[0]} and ${uniqueFields[1]}.`;
  }
  return `I need the ${uniqueFields.join(", ")}.`;
}

function buildSupportLine() {
  return "That was rough. I've got the paperwork.";
}

function detectSceneTask(text) {
  const lower = text.toLowerCase();
  if (lower.includes("airway")) return "airway";
  if (lower.includes("iv")) return "iv";
  if (lower.includes("monitor")) return "monitoring";
  if (lower.includes("transport")) return "transport";
  if (lower.includes("docs") || lower.includes("documentation")) return "documentation";
  return "";
}

function buildSceneSummary(scene) {
  if (!scene) return "";
  const participants = (scene.participants || [])
    .map((p) => p.name || p.paramedic_id)
    .join(", ");
  const tasks = scene.tasks || {};
  const taskLines = Object.entries(tasks)
    .map(([task, owner]) => `${task}: ${owner}`)
    .join(" | ");
  return `Scene ${scene.scene_id}. Participants: ${participants || "unknown"}. Tasks: ${
    taskLines || "unassigned"
  }.`;
}

function extractCity(text, cities) {
  const lower = text.toLowerCase();
  return cities.find((city) => lower.includes(city.toLowerCase())) || "";
}

function buildWeatherReply(city) {
  const weather = getMockWeather(city);
  if (!weather) {
    return "I don't have a weather snapshot for your area yet.";
  }
  const alertPart = weather.alert ? ` ${weather.alert}.` : "";
  return `${city}: ${weather.condition}, ${weather.tempC}°C, wind ${weather.windKph} kph.${alertPart}`;
}

async function buildDirectionsReply(fromCity, toCity) {
  let origin = fromCity;
  let destination = toCity;
  if (/^toronto$/i.test(origin)) origin = "Toronto, Ontario";
  if (/^ottawa$/i.test(origin)) origin = "Ottawa, Ontario";
  if (!destination.includes(",") && /\\d+/.test(destination)) {
    destination = `${destination}, Toronto, Ontario`;
  }

  const liveRoute = await getMapboxDirections(origin, destination);
  const route = liveRoute || getMockDirections(fromCity, toCity);
  if (!route) {
    return `I don't have a route estimate from ${origin} to ${destination} yet.`;
  }
  return `${route.summary}. ETA ${route.durationMin} mins (${route.distanceKm} km).`;
}

function parseRouteFromMessage(text) {
  const match = text.match(/from\s+(.+?)\s+to\s+(.+)/i);
  if (!match) return null;
  return {
    from: match[1].trim(),
    to: match[2].trim(),
  };
}

function extractDestination(text) {
  const match = text.match(/(?:to|towards)\s+(.+)/i);
  return match ? match[1].trim() : "";
}

function normalizeOrigin(origin) {
  if (!origin) return origin;
  if (/station\\s*\\d+/i.test(origin)) {
    return "Toronto, Ontario";
  }
  return origin;
}

function normalizeDestination(destination, cities) {
  if (!destination) return destination;
  const hasCity = cities.some((city) =>
    destination.toLowerCase().includes(city.toLowerCase())
  );
  const hasComma = destination.includes(",");
  const hasStreetNumber = /\\d+/.test(destination);
  if (!hasCity && !hasComma && hasStreetNumber) {
    return `${destination}, Toronto, Ontario`;
  }
  return destination;
}

async function getParamedicProfile(paramedicId) {
  try {
    const db = await getDb("parahelper_users");
    return await db.collection("paramedics").findOne({ paramedic_id: paramedicId });
  } catch (error) {
    console.log("[ConversationAgent] Mongo lookup failed:", error.message);
    return null;
  }
}

async function loadMemoryFromMongo(paramedicId) {
  try {
    const db = await getDb("parahelper_conversations");
    const record = await db
      .collection("paramedic_memory")
      .findOne({ paramedic_id: paramedicId });
    return record?.state || null;
  } catch (error) {
    console.log("[ConversationAgent] Memory load failed:", error.message);
    return null;
  }
}

async function saveMemoryToMongo(paramedicId, state) {
  try {
    const db = await getDb("parahelper_conversations");
    await db.collection("paramedic_memory").updateOne(
      { paramedic_id: paramedicId },
      {
        $set: {
          paramedic_id: paramedicId,
          state,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.log("[ConversationAgent] Memory save failed:", error.message);
  }
}

function buildProactiveNudge(state) {
  const nudges = [];
  if (state.openForms.length > 0) {
    nudges.push(`You've got ${state.openForms.length} forms still open.`);
  }
  if (state.missedMeals >= 3) {
    nudges.push("You've had 3 missed meals this week — want me to file them?");
  }
  if (state.overtimeCount >= 3) {
    nudges.push("This is your 3rd overtime this month.");
  }
  if (state.teddyBearsGiven >= 10) {
    nudges.push(`You've given ${state.teddyBearsGiven} teddy bears this year.`);
  }
  if (state.lastToughCall) {
    nudges.push(`Rough one yesterday — ${state.lastToughCall}. How are you doing?`);
  }
  return nudges.join(" ");
}

function buildLoginGreeting({ profile, state, context }) {
  const name = profile?.first_name || "there";
  const partnerLine = state.partnerName
    ? `Partner: ${state.partnerName}.`
    : "";
  const weatherLine = context.weatherAlert ? `${context.weatherAlert} ` : "";
  const stationLine = profile?.station ? `Station ${profile.station}.` : "";
  return `Morning ${name}. ${partnerLine} ${stationLine} ${weatherLine}`.trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsName(text, name) {
  if (!name) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, "i");
  return pattern.test(text);
}

function scrubName(text, name) {
  if (!name) return text;
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi");
  return text
    .replace(pattern, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/^[,\s]+/g, "")
    .replace(/\s+\./g, ".")
    .trim();
}

function buildShiftEndSummary({ name, state, summary }) {
  const openForms = state.openForms.length;
  const openLine =
    openForms > 0
      ? `${openForms} form${openForms > 1 ? "s" : ""} still open.`
      : "All forms are done.";
  const patternLine =
    state.missedMeals >= 3
      ? "Missed a few meals this week. Want me to file them?"
      : "";
  return `Good shift, ${name}. ${openLine} ${patternLine} ${summary || ""}`.trim();
}

function formatRecentMessages(recentMessages, limit = 8) {
  if (!Array.isArray(recentMessages) || recentMessages.length === 0) return "";
  const slice = recentMessages.slice(-limit);
  return slice
    .map((m) => {
      const role = m.role === "assistant" ? "ParaHelper" : "Medic";
      const content = String(m.content || "").trim();
      return `${role}: ${content}`;
    })
    .join("\n");
}

async function generateBuddyResponse({
  profile,
  message,
  crisisMode,
  summary,
  recentMessages = [],
  allowName = true,
}) {
  const client = getOpenRouterClient();
  const name = profile?.first_name || "there";
  const modeInstruction = crisisMode
    ? "Use short, sharp responses. No small talk. Give only critical info."
    : "Keep it natural, short, and direct. No filler. Sound like a shift buddy.";
  const recentContext = formatRecentMessages(recentMessages);
  const nameInstruction = allowName
    ? "You may use their name sparingly."
    : "Do not use the paramedic's name in this reply.";

  const response = await client.chat.completions.create({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You are ParaHelper, a voice-first AI companion for paramedics. " +
          modeInstruction +
          "Mirror the user's tone, slang, and brevity without overdoing it. " +
          "Do not repeat the user's greeting or address yourself. Respond directly. " +
          "Avoid repeating the paramedic's name in every reply. Use their name at most once per 4 messages. " +
          nameInstruction +
          " Keep replies short, direct, and human. " +
          "Stay consistent with the recent conversation and continue the thread.",
      },
      {
        role: "user",
        content:
          (allowName ? `Paramedic name: ${name}\n` : "") +
          `Conversation summary: ${summary || "None"}\n` +
          (recentContext ? `Recent messages:\n${recentContext}\n` : "") +
          `Message: ${message}`,
      },
    ],
    temperature: crisisMode ? 0.1 : 0.4,
  });

  const content = response?.choices?.[0]?.message?.content || "";
  return allowName ? content : scrubName(content, name);
}

async function handleConversation({
  paramedicId,
  role,
  message,
  recentMessages = [],
  context = {},
  inputType = "text",
}) {
  console.log("[ConversationAgent] Handling message");
  const cleaned =
    inputType === "voice" ? cleanTranscription(message) : String(message || "").trim();
  const state = getParamedicState(paramedicId);
  const profile = await getParamedicProfile(paramedicId);
  const cities = ["Huntsville", "Bracebridge", "Barrie", "Toronto", "Ottawa"];
  const sceneId = context.sceneId || "";
  const roleOnScene = context.roleOnScene || "";
  const allowMedical = detectMedicalIntent(cleaned) && !(sceneId && !isQuestion(cleaned));
  const redFlags = detectRedFlags(cleaned);
  const pediatricMode = detectPediatric(cleaned);
  const safetyFlags = detectSceneSafety(cleaned);
  const vitals = extractVitals(cleaned);

  let sceneState = null;
  if (sceneId) {
    sceneState = await getScene(sceneId);
    const task = detectSceneTask(cleaned);
    const participantName = profile?.first_name || paramedicId;
    const participants = sceneState?.participants || [];
    const existing = participants.find((p) => p.paramedic_id === paramedicId);
    const updatedParticipants = existing
      ? participants.map((p) =>
          p.paramedic_id === paramedicId
            ? {
                ...p,
                name: participantName,
                roleOnScene: roleOnScene || p.roleOnScene,
                lastUpdate: new Date(),
              }
            : p
        )
      : [
          ...participants,
          {
            paramedic_id: paramedicId,
            name: participantName,
            roleOnScene,
            lastUpdate: new Date(),
          },
        ];
    const tasks = { ...(sceneState?.tasks || {}) };
    if (task) {
      tasks[task] = participantName;
    }
    const notes = [
      ...(sceneState?.notes || []),
      { at: new Date(), by: participantName, text: cleaned },
    ].slice(-20);

    const vitalsLog = [
      ...(sceneState?.vitals || []),
      Object.keys(vitals).length > 0
        ? { at: new Date(), by: participantName, ...vitals }
        : null,
    ].filter(Boolean);

    sceneState = await upsertScene(sceneId, {
      participants: updatedParticipants,
      tasks,
      notes,
      vitals: vitalsLog,
    });
    if (safetyFlags.length > 0) {
      await appendAudit(sceneId, {
        type: "scene_safety",
        by: participantName,
        flags: safetyFlags,
      });
    }
  }

  if (detectSilence(cleaned) && !context.event) {
    return {
      response: "I'm here when you're ready.",
      crisisMode: state.crisisMode,
      detectedForms: [],
      formUpdates: {},
      guardrail: { approved: true, issues: [] },
      autoExport: false,
    };
  }

  if (context.isLogin || !state.lastSeenAt) {
    const persisted = await loadMemoryFromMongo(paramedicId);
    if (persisted) {
      Object.assign(state, persisted);
    }
  }

  if (context.event === "dispatch") {
    state.callCount += 1;
  }
  if (redFlags.length > 0) {
    state.highAcuityCount += 1;
  }

  if (context.partnerName) {
    state.partnerName = context.partnerName;
  }

  if (detectCalmMode(cleaned)) {
    state.crisisMode = false;
  } else if (detectCrisisMode(cleaned)) {
    state.crisisMode = true;
  }

  if (/missed meal/i.test(cleaned)) {
    state.missedMeals += 1;
  }
  if (/overtime/i.test(cleaned)) {
    state.overtimeCount += 1;
  }
  if (/teddy bear/i.test(cleaned)) {
    state.teddyBearsGiven += 1;
  }
  if (/tough call/i.test(cleaned)) {
    state.lastToughCall = cleaned;
  }

  const detectedForms = detectForms(cleaned);
  if (detectedForms.length > 0) {
    state.activeForm = detectedForms[0];
  }
  const formFocus =
    detectedForms.length > 0
      ? detectedForms
      : state.activeForm
        ? [state.activeForm]
        : state.openForms || [];
  const { updates: formUpdates, guardrail } = extractFormFields(cleaned, formFocus);

  if (detectedForms.length > 0) {
    state.openForms = Array.from(new Set([...state.openForms, ...detectedForms]));
  }

  let responseText = "";
  let handledByForm = false;
  if (formFocus.length > 0 && (!context.event || context.event === "checkin" || context.event === "post_call")) {
    const missingPrompt = buildMissingFieldsPrompt(guardrail);
    const fixPrompt = buildOneTapFix(guardrail);
    responseText =
      missingPrompt ||
      fixPrompt ||
      buildFormHelpResponse(formFocus) ||
      "Got it. What else should I add to the form?";
    handledByForm = true;
  } else if (context.event === "dispatch") {
    const brief = buildDispatchBrief(cleaned);
    responseText = `Dispatch brief: ${brief.highlights.join(", ") || "No immediate red flags"}.`;
    if (brief.suggestions.length > 0) {
      responseText += ` Suggested: ${brief.suggestions.join(", ")}.`;
    }
    if (brief.equipment.length > 0) {
      responseText += ` Prep: ${brief.equipment.join(", ")}.`;
    }
  } else if (context.event === "post_call" || context.event === "checkin") {
    const busyNote =
      state.callCount >= 4
        ? `Busy stretch: ${state.callCount} calls.`
        : "Quick check-in.";
    const acuityNote =
      state.highAcuityCount >= 2
        ? `High-acuity: ${state.highAcuityCount}.`
        : "";
    responseText = `${busyNote} ${acuityNote} Need anything before the next call?`.trim();
    state.lastCheckInAt = new Date().toISOString();
  } else if (context.event === "handoff") {
    responseText = await buildHandoffSummary(cleaned);
    if (sceneState?.vitals?.length === 0) {
      responseText += "\nDocumentation check: vitals not logged.";
    }
  } else if (context.event === "shift_end") {
    const summary = context.summary || (await summarizeConversation(recentMessages));
    responseText = buildShiftEndSummary({
      name: profile?.first_name || "there",
      state,
      summary,
    });
  } else if (detectWeatherIntent(cleaned)) {
    const city = extractCity(cleaned, cities) || profile?.station || "Huntsville";
    responseText = buildWeatherReply(city);
  } else if (detectDestinationIntent(cleaned)) {
    const suggestion = buildDestinationAdvisor(cleaned);
    if (!suggestion) {
      responseText = "I can suggest a destination if you provide the condition.";
    } else {
      const stationOrigin = getStationCity(profile?.station) || profile?.station || "Huntsville";
      const destination = extractDestinationFromRecommendation(suggestion);
      const route = destination
        ? await buildDirectionsReply(normalizeOrigin(stationOrigin), destination)
        : "";
      responseText = route ? `${suggestion}\n${route}` : suggestion;
    }
  } else if (detectFormHelp(cleaned)) {
    responseText = buildFormHelpResponse(detectedForms);
  } else if (detectDirectionsIntent(cleaned)) {
    const parsed = parseRouteFromMessage(cleaned);
    const stationOrigin = getStationCity(profile?.station) || profile?.station || "";
    const origin = normalizeOrigin(parsed?.from || stationOrigin || "Huntsville");
    const destinationRaw =
      parsed?.to ||
      extractDestination(cleaned) ||
      extractCity(cleaned, cities) ||
      "Barrie";
    const destination = normalizeDestination(destinationRaw, cities);
    responseText = await buildDirectionsReply(origin, destination);
  } else if (allowMedical) {
    try {
      responseText = await answerQuestion(cleaned, role);
    } catch (error) {
      responseText =
        "The medical knowledge base is temporarily unavailable. Please start ChromaDB and try again.";
    }
  } else if (detectApprovalIntent(cleaned)) {
    const approvalResult = await handleApprovalRequest(paramedicId, cleaned);
    responseText = approvalResult.response;
  } else if (detectAdminIntent(cleaned)) {
    const adminResult = await handleAdminTask(paramedicId, cleaned);
    responseText = adminResult.response;
  } else {
    const summary = context.summary || (await summarizeConversation(recentMessages));
    const sceneSummary = buildSceneSummary(sceneState);
    const allowName = (state.nameUseCounter || 0) >= 3;
    responseText = await generateBuddyResponse({
      profile,
      message: sceneSummary ? `${sceneSummary}\n${cleaned}` : cleaned,
      crisisMode: state.crisisMode,
      summary,
      recentMessages,
      allowName,
    });
  }

  const checklist = detectDirectionsIntent(cleaned) ? null : getMicroChecklist(cleaned);
  if (checklist) {
    responseText = `${responseText}\nMini-checklist: ${checklist.join(" | ")}`;
  }

  if (detectStressCue(cleaned) && !state.crisisMode) {
    responseText = `${buildSupportLine()} ${responseText}`.trim();
  }

  if (safetyFlags.length > 0) {
    responseText = `${responseText} Scene safety not confirmed. Log police involvement?`;
  }

  const fixPrompt = buildOneTapFix(guardrail);
  if (fixPrompt && !responseText.includes(fixPrompt) && !handledByForm) {
    responseText = `${responseText}\n${fixPrompt}`;
  }

  if (context.isLogin) {
    const greeting = buildLoginGreeting({ profile, state, context });
    const proactive = buildProactiveNudge(state);
    responseText = `${greeting} ${proactive} ${responseText}`.trim();
  }

  if (state.highAcuityCount >= 4) {
    responseText = `${responseText} ${state.highAcuityCount} high-acuity calls today—hydrate when you can.`;
  }

  const name = profile?.first_name || "";
  if (containsName(responseText, name)) {
    state.nameUseCounter = 0;
  } else {
    state.nameUseCounter = (state.nameUseCounter || 0) + 1;
  }
  if (formFocus.length > 0 && guardrail.approved) {
    state.openForms = state.openForms.filter((form) => !formFocus.includes(form));
    if (state.activeForm && formFocus.includes(state.activeForm)) {
      state.activeForm = "";
    }
  }
  state.lastSeenAt = new Date().toISOString();
  updateParamedicState(paramedicId, state);
  await saveMemoryToMongo(paramedicId, state);

  return {
    response: responseText,
    crisisMode: state.crisisMode,
    detectedForms: formFocus,
    formUpdates,
    guardrail,
    autoExport: guardrail.approved && detectedForms.length > 0,
    scene: sceneState,
  };
}

module.exports = { handleConversation };
