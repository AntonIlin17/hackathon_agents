const memoryState = new Map();

function getParamedicState(paramedicId) {
  if (!memoryState.has(paramedicId)) {
    memoryState.set(paramedicId, {
      summary: "",
      missedMeals: 0,
      overtimeCount: 0,
      teddyBearsGiven: 0,
      lastToughCall: "",
      partnerName: "",
      crisisMode: false,
      lastModeSwitchAt: null,
      openForms: [],
      lastSeenAt: null,
    });
  }
  return memoryState.get(paramedicId);
}

function updateParamedicState(paramedicId, updates) {
  const current = getParamedicState(paramedicId);
  const next = { ...current, ...updates };
  memoryState.set(paramedicId, next);
  return next;
}

module.exports = { getParamedicState, updateParamedicState };
