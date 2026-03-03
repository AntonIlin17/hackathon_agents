import { useState } from "react";
import { COLORS, styles } from "./styles";

export default function EmptyForm() {
  const now = new Date();
  
  // State structure optimized for AI bot extraction
  const [form, setForm] = useState({
    requestType: "", // e.g., Giveaway, Trade, Vacation
    requesterName: "",
    requesterMedicNum: "",
    coveringMedicName: "", // Optional
    originalShiftDate: "",
    originalShiftTime: "07:00-19:00",
    reason: "", // Narrative for the AI to populate
    supervisorApproval: false,
    emergencyRequest: false
  });

  const [submitted, setSubmitted] = useState(false);

  const u = (key) => (e) =>
    setForm((p) => ({
      ...p,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  if (submitted)
    return (
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.submitted}>
            <span style={{ fontSize: 24 }}>📅</span> Request Logged
            Awaiting Administrative Review — {now.toLocaleDateString()}
          </div>
          <div style={styles.btnRow}>
            <button style={styles.btnSecondary} onClick={() => setSubmitted(false)}>
              Submit New Request
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.cardHeader,
          background: `linear-gradient(135deg, ${COLORS.grey900} 0%, ${COLORS.primary} 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>📄</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              Administrative Request Form
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              EffectiveAI Paramedic Services — Workforce Management
            </div>
          </div>
        </div>
        <div style={styles.cardHeaderBadge}>
          {now.toLocaleDateString()}
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={{ textAlign: "center", padding: "12px 0 4px", color: COLORS.grey500, fontSize: 13, fontStyle: "italic" }}>
          "Ensuring seamless operational transitions"
        </div>

        {/* SECTION: Request Basics */}
        <div style={styles.sectionTitle}>📋 Request Classification</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>Type of Request</label>
            <select style={styles.select} value={form.requestType} onChange={u("requestType")}>
              <option value="">— Select —</option>
              <option>Giveaway</option>
              <option>Trade / Swap</option>
              <option>Vacation Day</option>
              <option>Sick Leave Notification</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", paddingLeft: 12 }}>
            <label style={styles.checkbox}>
              <input type="checkbox" checked={form.emergencyRequest} onChange={u("emergencyRequest")} />
              Urgent / Emergency
            </label>
          </div>
        </div>

        {/* SECTION: Personnel */}
        <div style={styles.sectionTitle}>👤 Involved Personnel</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>Requester Name</label>
            <input style={styles.input} placeholder="e.g. Adams, J." value={form.requesterName} onChange={u("requesterName")} />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Covering Medic (Optional)</label>
            <input style={styles.input} placeholder="e.g. Chen, L." value={form.coveringMedicName} onChange={u("coveringMedicName")} />
          </div>
        </div>

        {/* SECTION: Timing */}
        <div style={styles.sectionTitle}>⏱ Timing & Scheduling</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>Date of Change</label>
            <input type="date" style={styles.input} value={form.originalShiftDate} onChange={u("originalShiftDate")} />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Shift Hours</label>
            <select style={styles.select} value={form.originalShiftTime} onChange={u("originalShiftTime")}>
              <option>07:00 - 19:00</option>
              <option>19:00 - 07:00</option>
              <option>Custom / OT</option>
            </select>
          </div>
        </div>

        {/* SECTION: Justification - AI Narrative Target */}
        <div style={styles.sectionTitle}>📝 Reasoning & Justification</div>
        <div style={styles.row}>
          <div style={styles.field("100%")}>
            <label style={styles.label}>Details</label>
            <textarea
              style={{...styles.input, height: '80px', paddingTop: '8px'}}
              placeholder="AI Bot will transcribe the reason for the request here..."
              value={form.reason}
              onChange={u("reason")}
            />
          </div>
        </div>

        <div style={styles.btnRow}>
          <button
            style={styles.btnSecondary}
            onClick={() => setForm({
                requestType: "",
                requesterName: "",
                requesterMedicNum: "",
                coveringMedicName: "",
                originalShiftDate: "",
                originalShiftTime: "07:00-19:00",
                reason: "",
                supervisorApproval: false,
                emergencyRequest: false
            })}
          >
            Reset
          </button>
          <button style={styles.btnPrimary} onClick={() => setSubmitted(true)}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
