import { useState } from "react";
import { COLORS, styles } from "./styles";
import { exportForms } from "../api";

export default function TeddyBearForm() {
  const now = new Date();
  const [form, setForm] = useState({
    dateTime: now.toISOString().slice(0, 16),
    firstName: "",
    lastName: "",
    medicNumber: "",
    secondFirstName: "",
    secondLastName: "",
    secondMedicNumber: "",
    recipientAge: "",
    recipientGender: "",
    recipientType: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const formNum = `PTB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  const u = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async () => {
    setStatus({ loading: true, message: "", error: "" });
    try {
      const childName =
        form.recipientType ||
        `${form.recipientAge || ""} ${form.recipientGender || ""}`.trim() ||
        "Recipient";
      const payload = {
        teddyBearTracking: {
          childName: { value: childName },
          raw: { ...form, formNum },
        },
      };
      const res = await exportForms(payload);
      if (res.success) {
        setStatus({ loading: false, message: res.message, error: "" });
        setSubmitted(true);
      } else {
        setStatus({
          loading: false,
          message: "",
          error: res.message || "Export failed.",
        });
      }
    } catch (err) {
      setStatus({
        loading: false,
        message: "",
        error: err.message || "Export failed.",
      });
    }
  };

  if (submitted)
    return (
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.submitted}>
            <span style={{ fontSize: 24 }}>🧸</span>{" "}
            {status.message || "Teddy Bear Record Submitted"} — {formNum}
          </div>
          <div style={styles.btnRow}>
            <button
              style={styles.btnSecondary}
              onClick={() => setSubmitted(false)}
            >
              Submit Another
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
          <span style={{ fontSize: 28 }}>🧸</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              Teddy Bear Comfort Program
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              Emergency Medical Services — Patient Comfort Tracking
            </div>
          </div>
        </div>
        <div style={styles.cardHeaderBadge}>Form #{formNum}</div>
      </div>
      <div style={styles.cardBody}>
        <div
          style={{
            textAlign: "center",
            padding: "12px 0 4px",
            color: COLORS.grey500,
            fontSize: 13,
            fontStyle: "italic",
          }}
        >
          "Providing comfort when it matters most"
        </div>

        <div style={styles.sectionTitle}>
          ⏱ Date &amp; Time of Distribution
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>Date / Time</label>
            <input
              type="datetime-local"
              style={styles.input}
              value={form.dateTime}
              onChange={u("dateTime")}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>
          👤 Primary Medic (Required)
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              First Name<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="First name"
              value={form.firstName}
              onChange={u("firstName")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>
              Last Name<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="Last name"
              value={form.lastName}
              onChange={u("lastName")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>
              Medic Number<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="e.g. 10452"
              value={form.medicNumber}
              onChange={u("medicNumber")}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>
          👥 Second Medic (Optional)
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLORS.grey500,
            marginBottom: 12,
            marginTop: -8,
          }}
        >
          Complete only if a second medic is on the call.
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>First Name</label>
            <input
              style={styles.input}
              placeholder="First name"
              value={form.secondFirstName}
              onChange={u("secondFirstName")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Last Name</label>
            <input
              style={styles.input}
              placeholder="Last name"
              value={form.secondLastName}
              onChange={u("secondLastName")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Medic Number</label>
            <input
              style={styles.input}
              placeholder="e.g. 10453"
              value={form.secondMedicNumber}
              onChange={u("secondMedicNumber")}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>❤️ Teddy Bear Recipient</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>Age</label>
            <input
              type="number"
              style={styles.input}
              placeholder="Age"
              value={form.recipientAge}
              onChange={u("recipientAge")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Gender</label>
            <select
              style={styles.select}
              value={form.recipientGender}
              onChange={u("recipientGender")}
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Recipient Type</label>
            <select
              style={styles.select}
              value={form.recipientType}
              onChange={u("recipientType")}
            >
              <option value="">Select recipient type</option>
              <option>Patient</option>
              <option>Family</option>
              <option>Bystander</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div style={styles.btnRow}>
          <button
            style={styles.btnSecondary}
            onClick={() =>
              setForm({
                dateTime: now.toISOString().slice(0, 16),
                firstName: "",
                lastName: "",
                medicNumber: "",
                secondFirstName: "",
                secondLastName: "",
                secondMedicNumber: "",
                recipientAge: "",
                recipientGender: "",
                recipientType: "",
              })
            }
          >
            Clear
          </button>
          <button
            style={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={status.loading}
          >
            {status.loading ? "Submitting..." : "Submit Record"}
          </button>
        </div>
        {status.error && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: COLORS.accent,
            }}
          >
            {status.error}
          </div>
        )}
      </div>
    </div>
  );
}
