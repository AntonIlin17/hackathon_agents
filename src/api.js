const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || data?.message || "Request failed.";
    throw new Error(message);
  }
  return data;
}

export async function login(paramedicId) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramedicId }),
  });
  return handleResponse(res);
}

export async function sendChatMessage({
  paramedicId,
  role,
  message,
  recentMessages = [],
  context = {},
  inputType = "text",
}) {
  const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paramedicId,
      role,
      message,
      recentMessages,
      context,
      inputType,
    }),
  });
  return handleResponse(res);
}

export async function exportForms(forms) {
  const res = await fetch(`${API_BASE_URL}/api/forms/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forms }),
  });
  return handleResponse(res);
}

