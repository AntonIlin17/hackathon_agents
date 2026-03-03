function handleAdminTask(message) {
  console.log("[AdminAgent] Handling admin request");
  const text = String(message || "").toLowerCase();

  if (text.includes("uniform")) {
    return "Got it. I can submit a uniform order request. What size and item?";
  }
  if (text.includes("vacation")) {
    return "I can file a vacation request. What dates do you want off?";
  }
  if (text.includes("overtime")) {
    return "I can log the overtime request. How many hours and which day?";
  }
  if (text.includes("missed meal")) {
    return "I can file a missed meal claim. What call time and location?";
  }

  return "I can handle admin tasks like uniforms, vacation, overtime, and meal claims. What should I file?";
}

module.exports = { handleAdminTask };
