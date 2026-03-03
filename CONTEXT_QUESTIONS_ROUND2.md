# ParaHelper — Round 2: Codebase-Informed Implementation Questions

I've analyzed every file in both your frontend and backend. Here's the reality:

**Frontend:** 5 tabbed forms (Occurrence, Teddy Bear, Shift, Status, AI Empty Form) with zero backend calls. All data is local/hardcoded. No chat UI, no voice, no login, no export.

**Backend:** Express server with 8+ agents, MongoDB, ChromaDB, OpenRouter. The `conversationAgent` is the most complete — it orchestrates everything. But `exportAgent` is a stub (no real PDF/email), `guardrailAgent.js` is orphaned (never imported), and the `extractionAgent` + `formDetectiveAgent` are regex-only (no LLM).

**The gap:** Frontend and backend don't talk to each other at all.

These questions target the exact decisions needed to wire everything together in ~36 hours.

---

## Section A: The Chat Interface (Nothing exists yet)

**Q1. There is no chat UI anywhere in the frontend. Where should it live — a dedicated full-screen "Chat Mode" tab, a persistent sidebar panel next to the forms, a floating overlay/drawer that slides in from the right, or a bottom sheet (mobile-style)? Should the chat and the form be visible AT THE SAME TIME so judges can see fields filling in real-time?**
> Honestly Im just waiting for my group members to finish the frontend and then the UI so we can wire it all together. 

**Q2. When the AI responds in the chat, should it be plain text bubbles, or should it include rich elements like form field cards ("I captured: Vehicle #4012 — tap to edit"), action buttons ("Export PDF", "Switch to Teddy Bear form"), and status indicators (confidence: high/medium/low)?**
> Dont worry about the ui right now, as my group members are working on the frontend and the ui. we will worry about the ui later. 

**Q3. The `conversationAgent` already returns `detectedForms`, `formUpdates`, `guardrail`, and `autoExport` alongside the text response. How should the frontend REACT to each of these? For example: when `detectedForms` includes "teddyBearTracking", should the form tab auto-switch? When `guardrail.issues` has items, should they appear as inline warnings on the form?**
> It should auto switch to the teddy bear form when the conversationAgent detects that user is talking about it, then it should begin to fill out the form based on the conversation. It should display itself typing in the response into the form fields. 

## Section B: Voice Pipeline (Nothing is wired)

**Q4. You said Deepgram Nova 3. Should the audio stream from the browser directly to Deepgram's WebSocket API (client-side), or should the browser send audio chunks to your Express server which then forwards to Deepgram (server-side proxy)? Client-side is simpler and lower latency; server-side gives you more control and keeps the API key hidden.**
> My group member already made something for this so were going to be using that, he just hasnt finished it yet. 

**Q5. There's an `ELEVENLABS_API_KEY` in your `.env` but no code uses it. Do you want ParaHelper to SPEAK responses back (text-to-speech), or is text-on-screen sufficient for the demo? If TTS, should it auto-play every response, or only when the user taps a "play" button?**
> It shouldn't auto play every response, only when the user taps the play button. The eleven labs api must have been added by one of my group members, its not important for the demo i think. 

**Q6. The `transcriptionCleaner` currently does basic regex replacements (e.g., "nitro" → "nitroglycerin"). But the challenge forms are administrative, not clinical — a paramedic is more likely to say "I backed into the bay door" than "gave two of nitro." Should the cleaner be updated to handle administrative terminology (e.g., "ACR" misheard as "acre", "CME" misheard as "see me"), or is the current medical dictionary fine for the demo?**
> _Your answer here_

---

## Section C: Frontend ↔ Backend Wiring (The critical gap)

**Q7. The frontend has no HTTP client (no fetch, no axios). Do you want to use the browser's native `fetch`, install `axios`, or use something like `@tanstack/react-query` for caching? For a hackathon, what's the fastest to wire up?**
> _Your answer here_

**Q8. The backend auth route (`POST /api/auth/login`) expects a `paramedicId` and returns profile data from MongoDB. What should the login screen look like — a simple text input for medic number, a dropdown of pre-seeded paramedics, or just a hardcoded "Demo Medic" button that skips login entirely?**
> _Your answer here_

**Q9. Right now each form component manages its own local state independently. When the AI extracts data (e.g., `{ occurrenceReport: { location: { value: "Station 7 bay door", confidence: "high" } } }`), how should that data reach the form? Options: (a) React Context that all forms subscribe to, (b) a global state manager like Zustand, (c) prop drilling from a parent component, (d) direct DOM manipulation. Which fits a hackathon speed-build best?**
> _Your answer here_

---

## Section D: Export & Email (Currently a stub)

**Q10. The `exportAgent` currently just returns `{ success: true, message: "Forms exported" }` — no actual PDF or email. For the demo, do you want REAL working PDF generation (Puppeteer rendering the form HTML to PDF on the server), or a simulated PDF (pre-made template with field values injected)? Real is more impressive but takes more time.**
> _Your answer here_

**Q11. The challenge doc says to email to `Team00@EffectiveAI.net` (with your actual team number). For Resend, you need a verified sending domain. Do you have a domain ready, or should we fall back to Nodemailer + a Gmail app password? What's your sending email address?**
> _Your answer here_

**Q12. The Teddy Bear form specifically requires XML output alongside the print-ready format. Should the XML be a simple flat structure, or do you want it to match any specific schema? Should it be attached to the email as a `.xml` file, embedded in the email body, or both?**
> _Your answer here_

---

## Section E: Agent Architecture Decisions

**Q13. The `guardrailAgent.js` file is completely orphaned — nothing imports it. The `extractionAgent` has its own `validateFormUpdates()` with the same logic. Should we delete `guardrailAgent.js` and keep validation in the extraction agent, or properly integrate the guardrail as a separate step in the pipeline (which matches your 8-agent architecture story for the presentation)?**
> _Your answer here_

**Q14. The `extractionAgent` and `formDetectiveAgent` are pure regex — no LLM calls. The extraction patterns are basic (e.g., matching "station" for location, "accident" for incident type). For the demo, should these be upgraded to use Gemini for smarter extraction (e.g., understanding "I scraped the bay door backing in" → `{ location: "ambulance bay", incidentType: "Vehicle Incident" }`), or is regex sufficient if the demo script uses predictable phrasing?**
> _Your answer here_

**Q15. There are TWO overlapping agents: `adminAgent` (handles uniform, vacation, overtime, meals with regex) and `approvalAgent` (uses Gemini 2.5 Pro to extract structured requests). They both save to different MongoDB collections for similar request types. Should we merge them into one, keep both, or drop one entirely?**
> _Your answer here_

**Q16. The `conversationAgent` is a 300+ line monolith that handles intent detection, routing, crisis mode, scene sessions, weather, directions, micro-checklists, stress detection, guardrails, and memory persistence — all in one function. For reliability in the demo, should we simplify it to focus on the core flow (voice → extract → fill form → validate → export), or is the current breadth important for the "wow factor"?**
> _Your answer here_

---

## Section F: Data & Knowledge

**Q17. The Shift Report tab has 8 hardcoded shifts. The challenge says the real schedule is on effectiveAI.net and "may change during the hackathon." Should we scrape/fetch the live schedule from the website and store it in MongoDB, or is hardcoded data acceptable for the demo? If scraping, should it happen on app startup, on a timer, or on-demand when a paramedic asks?**
> _Your answer here_

**Q18. The `medicalKnowledge.json` has ~20 clinical entries (shock, cardiac, stroke, etc.) for the RAG system. But the challenge forms are administrative. Should the knowledge base be expanded with administrative knowledge (how to fill out an occurrence report, what counts as a "near miss," uniform ordering policy, vacation request rules), or is the medical knowledge sufficient to impress judges?**
> _Your answer here_

**Q19. MongoDB needs pre-seeded paramedic profiles for login to work. How many demo paramedics should we create, and what data should each have? For example: `{ paramedic_id: "10452", first_name: "Alex", last_name: "Rivera", role: "PCP", station: "Station 7", unit: "4012" }`. Should we create 2-3 profiles, or just one "demo medic"?**
> _Your answer here_

---

## Section G: The 5th Form & Scope

**Q20. There's an `EmptyFormAI.jsx` component (the "AI Empty Form" tab) that renders an administrative request form for Giveaway, Trade, Vacation, Sick Leave. This isn't one of the 4 challenge forms. Where did it come from, and is it in scope? Should it stay, be removed, or be repurposed as a "catch-all" form that the AI fills for non-standard requests?**
> _Your answer here_

**Q21. The challenge doc says "each team can decide which forms to support and to what extent." Given ~36 hours left, which forms should be FULLY functional (voice → extract → fill → validate → export → email) vs. display-only? Rank: Occurrence Report, Teddy Bear, Shift Report, Paramedic Status, AI Empty Form.**
> _Your answer here_

---

## Section H: Map & Routing Feature

**Q22. There's already a `mapboxDirections.js` utility in the backend that calls the Mapbox Geocoding + Directions API, with a mock data fallback. Do you have a Mapbox API key? If yes, should the map render in the frontend (using `react-map-gl` or a Mapbox iframe), or just return text directions in the chat ("Sunnybrook is 42 min, 38 km via Highway 11")?**
> _Your answer here_

---

## Section I: Demo Resilience

**Q23. What should happen when things BREAK during the live demo? For example: (a) Deepgram fails → should there be a text input fallback always visible? (b) OpenRouter rate-limits → should there be cached/pre-generated responses? (c) MongoDB is slow → should the app work without it using in-memory state only? Which failure modes are you most worried about?**
> _Your answer here_

**Q24. Should there be a "demo mode" toggle that uses pre-scripted responses and pre-filled data, so you can rehearse the exact demo flow without burning API credits or risking live failures?**
> _Your answer here_

---

## Section J: Presentation & Architecture Story

**Q25. You have 20 minutes. The backend has 8+ agents but the judges can't see code running. How do you want to VISUALIZE the agent pipeline for judges — a live "agent activity" panel in the UI showing which agent is processing (e.g., "🎙️ Transcription Cleaner → 🔍 Form Detective → 🧠 Extraction Agent → ✅ Guardrail"), or a static architecture slide? The live panel is much more impressive but takes build time.**
> _Your answer here_

**Q26. The `knowledgeAgent` error message says "I'll check with Claude" but you're using Gemini. There are also hardcoded references to specific hospitals (Huntsville, Bracebridge, Barrie). Should these details be cleaned up for the demo, or are they irrelevant since judges won't see the code?**
> _Your answer here_

---

_Answer these 26 questions and I'll generate the final **PARAHELPER_CONTEXT.md** — a single document that gives any LLM complete expert-level understanding of what you're building, why, and exactly how._
