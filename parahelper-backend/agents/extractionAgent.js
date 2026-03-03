function extractField(pattern, text) {
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function extractAny(patterns, text) {
  for (const pattern of patterns) {
    const value = extractField(pattern, text);
    if (value) return value;
  }
  return "";
}

function buildConfidence(value) {
  if (!value) return "low";
  if (value.length < 4) return "medium";
  return "high";
}

function extractFormFields(message, detectedForms = []) {
  console.log("[ExtractionAgent] Extracting form fields");
  const text = String(message || "");
  const updates = {};

  if (detectedForms.includes("occurrenceReport")) {
    const location = extractAny(
      [/location[:\s]+([a-z0-9\s-]+)/i, /at\s+([a-z0-9\s-]+)/i],
      text
    );
    const incidentType = extractAny(
      [/incident[:\s]+([a-z0-9\s-]+)/i, /accident[:\s]+([a-z0-9\s-]+)/i],
      text
    );
    const time = extractAny([/time[:\s]+([0-9:\sapm]+)/i, /at\s+([0-9:\sapm]+)/i], text);
    const unit = extractAny([/unit[:\s]+([a-z0-9-]+)/i], text);
    const description = extractAny([/details[:\s]+(.+)/i, /notes[:\s]+(.+)/i], text);
    updates.occurrenceReport = {
      location: { value: location, confidence: buildConfidence(location) },
      incidentType: { value: incidentType, confidence: buildConfidence(incidentType) },
      time: { value: time, confidence: buildConfidence(time) },
      unit: { value: unit, confidence: buildConfidence(unit) },
      description: { value: description, confidence: buildConfidence(description) },
    };
  }

  if (detectedForms.includes("teddyBearTracking")) {
    const childName = extractAny(
      [/child[:\s]+([a-z\s-]+)/i, /named\s+([a-z\s-]+)/i],
      text
    );
    const age = extractAny([/age[:\s]+([0-9]+)/i, /([0-9]+)\s+year/i], text);
    const location = extractAny(
      [/location[:\s]+([a-z0-9\s-]+)/i, /at\s+([a-z0-9\s-]+)/i],
      text
    );
    const reason = extractAny([/reason[:\s]+(.+)/i, /because\s+(.+)/i], text);
    updates.teddyBearTracking = {
      childName: { value: childName, confidence: buildConfidence(childName) },
      age: { value: age, confidence: buildConfidence(age) },
      location: { value: location, confidence: buildConfidence(location) },
      reason: { value: reason, confidence: buildConfidence(reason) },
    };
  }

  if (detectedForms.includes("shiftReport")) {
    const date = extractAny([/date[:\s]+([0-9/-]+)/i], text);
    const partner = extractAny([/partner[:\s]+([a-z\s-]+)/i, /with\s+([a-z\s-]+)/i], text);
    const station = extractAny([/station[:\s]+([0-9a-z\s-]+)/i], text);
    updates.shiftReport = {
      date: { value: date, confidence: buildConfidence(date) },
      partner: { value: partner, confidence: buildConfidence(partner) },
      station: { value: station, confidence: buildConfidence(station) },
    };
  }

  if (detectedForms.includes("statusReport")) {
    const certification = extractAny(
      [/certification[:\s]+([a-z0-9\s-]+)/i, /certifications[:\s]+([a-z0-9\s-]+)/i],
      text
    );
    const vacation = extractAny([/vacation[:\s]+([a-z0-9\s-]+)/i], text);
    updates.statusReport = {
      certification: { value: certification, confidence: buildConfidence(certification) },
      vacation: { value: vacation, confidence: buildConfidence(vacation) },
    };
  }

  return updates;
}

module.exports = { extractFormFields };
