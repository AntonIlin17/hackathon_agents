import { useState } from "react";
import { COLORS } from "./styles";
import { sendChatMessage } from "../api";

export default function ChatAssistant({ paramedic }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !paramedic) return;

    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await sendChatMessage({
        paramedicId: paramedic.paramedic_id,
        role: paramedic.role,
        message: text,
        recentMessages: history,
      });
      const botMsg = { role: "assistant", content: res.response || "" };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || "Chat failed. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  if (!paramedic) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: 340,
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.grey900} 100%)`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>ParaHelper Buddy</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            {paramedic.first_name} {paramedic.last_name} · {paramedic.unit} ·{" "}
            {paramedic.role}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 10,
          overflowY: "auto",
          flex: 1,
          background: "#f5f7fa",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.grey500,
              padding: 8,
            }}
          >
            Start a conversation with ParaHelper — ask for medical quick checks,
            directions, or help with forms.
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent:
                m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: 12,
                lineHeight: 1.4,
                background:
                  m.role === "user" ? COLORS.primary : "#ffffff",
                color: m.role === "user" ? "#ffffff" : COLORS.grey900,
                boxShadow:
                  m.role === "user"
                    ? "0 1px 4px rgba(0,0,0,0.15)"
                    : "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              fontSize: 11,
              color: COLORS.grey500,
              padding: 4,
            }}
          >
            ParaHelper is thinking...
          </div>
        )}
        {error && (
          <div
            style={{
              fontSize: 11,
              color: COLORS.accent,
              padding: 4,
              marginTop: 4,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        style={{
          padding: 8,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          background: "#fff",
          display: "flex",
          gap: 6,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a shift question..."
          disabled={loading}
          style={{
            flex: 1,
            fontSize: 12,
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid #d0d4dd",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "none",
            background: COLORS.accent,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

