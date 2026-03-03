const formTriggers = [
  {
    form: "occurrenceReport",
    keywords: ["accident", "incident", "hit", "damage", "collision"],
  },
  {
    form: "teddyBearTracking",
    keywords: ["teddy", "bear", "comfort", "scared kid", "stuffed"],
  },
  {
    form: "shiftReport",
    keywords: ["shift", "schedule", "when do i work", "partner today"],
  },
  {
    form: "statusReport",
    keywords: ["status", "certification", "vacation", "compliance"],
  },
];

function detectForms(message) {
  console.log("[FormDetectiveAgent] Detecting form intent");
  const text = String(message || "").toLowerCase();
  const detected = new Set();

  for (const trigger of formTriggers) {
    if (trigger.keywords.some((keyword) => text.includes(keyword))) {
      detected.add(trigger.form);
    }
  }

  return Array.from(detected);
}

module.exports = { detectForms };
