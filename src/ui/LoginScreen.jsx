import { useState } from "react";
import { COLORS, styles } from "./styles";
import { login } from "../api";

export default function LoginScreen({ onLogin }) {
  const [paramedicId, setParamedicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paramedicId.trim()) {
      setError("Please enter your paramedic ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await login(paramedicId.trim());
      onLogin(user);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...styles.app,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ ...styles.card, maxWidth: 420, width: "100%" }}>
        <div
          style={{
            ...styles.cardHeader,
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.grey900} 100%)`,
          }}
        >
          <div>
            <div style={styles.cardHeaderTitle}>ParaHelper Login</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
              Sign in with your paramedic ID to start your shift.
            </div>
          </div>
          <div style={styles.cardHeaderBadge}>EffectiveAI EMS</div>
        </div>
        <form style={styles.cardBody} onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.field("100%")}>
              <label style={styles.label}>
                Paramedic ID<span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                placeholder="e.g. 10452"
                value={paramedicId}
                onChange={(e) => setParamedicId(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          {error && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: COLORS.accent,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ ...styles.btnRow, justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Start Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

