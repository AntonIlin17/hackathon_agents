const { getOpenRouterClient } = require("../utils/openrouterClient");
const { getDb } = require("../utils/mongodb");
const { getParamedicState, updateParamedicState } = require("../utils/memoryStore");
const { cleanTranscription } = require("./transcriptionCleaner");
const { detectForms } = require("./formDetectiveAgent");
const { extractFormFields } = require("./extractionAgent");
const { evaluateGuardrails } = require("./guardrailAgent");
const { summarizeConversation } = require("./summarizerAgent");
const { answerQuestion } = require("./knowledgeAgent");
const { handleAdminTask } = require("./adminAgent");
const { getMockWeather, getMockDirections } = require("../utils/mockLiveData");

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
const weatherKeywords = ["weather", "forecast", "temperature", "snow", "rain", "wind"];
const directionsKeywords = ["directions", "route", "fastest way", "eta", "drive to"];
const stressKeywords = [
  "tough call",
  "rough",
  "hard one",
  "bad call",
  "shaken",
  "overwhelmed",
];

const silenceTokens = ["...", "..", "…"];

const microChecklists = [
  {
    match: ["stroke", "fast", "cincinnati"],
    steps: [
      "FAST/Cincinnati check + last known well",
      "Check glucose + maintain oxygenation",
      "Rapid transport + pre-notify stroke center",
    ],
  },
  {
    match: ["overdose", "opioid", "naloxone"],
    steps: [
      "Airway + assist ventilation",
      "Naloxone titrate to respirations",
      "Monitor + transport, watch for re-sedation",
    ],
  },
  {
    match: ["anaphylaxis", "allergic", "epi"],
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

function detectSilence(text) {
  const trimmed = String(text || "").trim();
  if (trimmed.length === 0) return true;
  if (silenceTokens.includes(trimmed)) return true;
  return /^[.\u2026]+$/.test(trimmed);
}

function getMicroChecklist(text) {
  const lower = text.toLowerCase();
  for (const checklist of microChecklists) {
    if (checklist.match.some((term) => lower.includes(term))) {
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

function buildSupportLine() {
  return "That sounded like a hard one. Take a breath — I've got the paperwork.";
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
  return `${city} weather: ${weather.condition}, ${weather.tempC}°C, wind ${weather.windKph} kph.${alertPart}`;
}

function buildDirectionsReply(fromCity, toCity) {
  const route = getMockDirections(fromCity, toCity);
  if (!route) {
    return `I don't have a route estimate from ${fromCity} to ${toCity} yet.`;
  }
  return `${route.summary}. ETA ${route.durationMin} mins (${route.distanceKm} km).`;
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
    ? `You're on with ${state.partnerName} today.`
    : "";
  const weatherLine = context.weatherAlert ? `${context.weatherAlert} ` : "";
  const stationLine = profile?.station ? `Station ${profile.station}.` : "";
  return `Morning ${name}! ${partnerLine} ${stationLine} ${weatherLine}`.trim();
}

function buildShiftEndSummary({ name, state, summary }) {
  const openForms = state.openForms.length;
  const openLine =
    openForms > 0
      ? `You've got ${openForms} form${openForms > 1 ? "s" : ""} still open.`
      : "All forms are done.";
  const patternLine =
    state.missedMeals >= 3
      ? "Noticed a few missed meals this week — want me to file them?"
      : "";
  return `Good shift today ${name}. ${openLine} ${patternLine} ${summary || ""}`.trim();
}

async function generateBuddyResponse({ profile, message, crisisMode, summary }) {
  const client = getOpenRouterClient();
  const name = profile?.first_name || "there";
  const modeInstruction = crisisMode
    ? "Use short, sharp responses. No small talk. Give only critical info."
    : "Be conversational, friendly, and concise. Sound like a shift buddy.";

  const response = await client.chat.completions.create({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You are ParaHelper, a voice-first AI companion for paramedics. " +
          modeInstruction,
      },
      {
        role: "user",
        content:
          `Paramedic name: ${name}\n` +
          `Conversation summary: ${summary || "None"}\n` +
          `Message: ${message}`,
      },
    ],
    temperature: crisisMode ? 0.1 : 0.4,
  });

  return response?.choices?.[0]?.message?.content || "";
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

  if (detectSilence(cleaned)) {
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
  const formUpdates = extractFormFields(cleaned, detectedForms);
  const guardrail = evaluateGuardrails(formUpdates);

  if (detectedForms.length > 0) {
    state.openForms = Array.from(new Set([...state.openForms, ...detectedForms]));
  }

  let responseText = "";
  if (context.event === "shift_end") {
    const summary = await summarizeConversation(recentMessages);
    responseText = buildShiftEndSummary({
      name: profile?.first_name || "there",
      state,
      summary,
    });
  } else if (detectWeatherIntent(cleaned)) {
    const city = extractCity(cleaned, cities) || profile?.station || "Huntsville";
    responseText = buildWeatherReply(city);
  } else if (detectDirectionsIntent(cleaned)) {
    const fromCity = extractCity(cleaned, cities) || profile?.station || "Huntsville";
    const toCity = extractCity(cleaned.replace(fromCity, ""), cities) || "Barrie";
    responseText = buildDirectionsReply(fromCity, toCity);
  } else if (detectMedicalIntent(cleaned)) {
    responseText = await answerQuestion(cleaned, role);
  } else if (detectAdminIntent(cleaned)) {
    responseText = handleAdminTask(cleaned);
  } else {
    const summary = await summarizeConversation(recentMessages);
    responseText = await generateBuddyResponse({
      profile,
      message: cleaned,
      crisisMode: state.crisisMode,
      summary,
    });
  }

  const checklist = getMicroChecklist(cleaned);
  if (checklist) {
    responseText = `${responseText}\nMini-checklist: ${checklist.join(" | ")}`;
  }

  if (detectStressCue(cleaned) && !state.crisisMode) {
    responseText = `${buildSupportLine()} ${responseText}`.trim();
  }

  const fixPrompt = buildOneTapFix(guardrail);
  if (fixPrompt) {
    responseText = `${responseText}\n${fixPrompt}`;
  }

  if (context.isLogin) {
    const greeting = buildLoginGreeting({ profile, state, context });
    const proactive = buildProactiveNudge(state);
    responseText = `${greeting} ${proactive} ${responseText}`.trim();
  }

  state.lastSeenAt = new Date().toISOString();
  updateParamedicState(paramedicId, state);
  await saveMemoryToMongo(paramedicId, state);

  return {
    response: responseText,
    crisisMode: state.crisisMode,
    detectedForms,
    formUpdates,
    guardrail,
    autoExport: guardrail.approved && detectedForms.length > 0,
  };
}

module.exports = { handleConversation };
