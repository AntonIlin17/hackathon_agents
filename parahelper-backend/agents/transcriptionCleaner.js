const replacements = [
  { pattern: /\bepi pen\b/gi, replacement: "epinephrine" },
  { pattern: /\bnarcan\b/gi, replacement: "naloxone" },
  { pattern: /\bdex\b/gi, replacement: "dextrose" },
  { pattern: /\basa\b/gi, replacement: "aspirin" },
  { pattern: /\bnitro\b/gi, replacement: "nitroglycerin" },
  { pattern: /\bstemi\b/gi, replacement: "STEMI" },
  { pattern: /\bcpap\b/gi, replacement: "CPAP" },
  { pattern: /\bbvm\b/gi, replacement: "BVM" },
];

function cleanTranscription(text) {
  console.log("[TranscriptionCleaner] Cleaning transcript");
  let cleaned = text || "";
  for (const { pattern, replacement } of replacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned.trim();
}

module.exports = { cleanTranscription };
