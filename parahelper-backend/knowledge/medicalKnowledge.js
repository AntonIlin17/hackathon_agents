const medicalKnowledge = [
  {
    id: "shock-protocols",
    roles: ["ACP", "PCP"],
    text:
      "Shock protocols: recognize hypotension, tachycardia, altered LOC, cool clammy skin. Treat with high-flow oxygen as needed, control bleeding, keep warm, establish IV access if permitted, consider fluid bolus per protocol, and rapid transport with frequent reassessment.",
  },
  {
    id: "cardiac-protocols",
    roles: ["ACP", "PCP"],
    text:
      "Cardiac protocols: assess chest pain, obtain 12-lead ECG if available, monitor vitals, give oxygen if hypoxic, administer aspirin if not contraindicated, consider nitroglycerin for suspected ischemic pain with adequate BP, and prepare for rapid transport to PCI-capable facility.",
  },
  {
    id: "airway-management",
    roles: ["ACP", "PCP"],
    text:
      "Airway management: ensure patency with positioning, suction, OPA/NPA as indicated. Provide BVM ventilation for inadequate breathing. Advanced airway may be considered for ACP per local protocols. Confirm placement with ETCO2 if available.",
  },
  {
    id: "drug-dosages",
    roles: ["ACP", "PCP"],
    text:
      "Drug dosages: epinephrine 0.3-0.5 mg IM 1:1000 for anaphylaxis; atropine 0.5 mg IV q3-5 min to max 3 mg for symptomatic bradycardia; nitroglycerin 0.4 mg SL q5 min if SBP > 100 and no contraindications; aspirin 160-325 mg PO chew; naloxone 0.4-2 mg IV/IM/IN titrate to respirations; dextrose 25 g IV (D50) or per protocol.",
  },
  {
    id: "pediatric-protocols",
    roles: ["ACP", "PCP"],
    text:
      "Pediatric protocols: use age-appropriate airway adjuncts, weight-based dosing, consider pediatric assessment triangle. Treat hypoglycemia with weight-based dextrose or glucagon per protocol. Maintain warmth and minimize stress.",
  },
  {
    id: "stroke-protocols",
    roles: ["ACP", "PCP"],
    text:
      "Stroke protocols: perform FAST or Cincinnati exam, record last known well, check glucose, maintain oxygenation, avoid hypotension, and transport rapidly to stroke center with pre-notification.",
  },
  {
    id: "diabetic-emergencies",
    roles: ["ACP", "PCP"],
    text:
      "Diabetic emergencies: check glucose, treat hypoglycemia with oral glucose if alert, or IV dextrose/IM glucagon if altered. For suspected hyperglycemia with dehydration, provide supportive care and transport.",
  },
  {
    id: "overdose-protocols",
    roles: ["ACP", "PCP"],
    text:
      "Overdose protocols: ensure airway and ventilation, consider naloxone for suspected opioid overdose, monitor ECG and vitals, treat hypoglycemia, and transport with continuous monitoring.",
  },
  {
    id: "hospital-huntsville",
    roles: ["ACP", "PCP"],
    text:
      "Hospital info: Huntsville District Memorial Hospital, Huntsville, Ontario. Small community hospital with emergency department; consider transport time and air/ground availability.",
  },
  {
    id: "hospital-bracebridge",
    roles: ["ACP", "PCP"],
    text:
      "Hospital info: South Muskoka Memorial Hospital, Bracebridge, Ontario. Community hospital with emergency department; consider capabilities and transport time.",
  },
  {
    id: "hospital-barrie",
    roles: ["ACP", "PCP"],
    text:
      "Hospital info: Royal Victoria Regional Health Centre, Barrie, Ontario. Regional hospital with emergency services and specialty care; consider as destination for higher acuity.",
  },
];

module.exports = { medicalKnowledge };
