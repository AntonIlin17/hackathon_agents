import { useState } from "react";
import { COLORS, styles } from "./styles";

export default function OccurrenceReport() {
  const now = new Date();
  const [form, setForm] = useState({
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().slice(0, 5),
    callNumber: "",
    classification: "",
    classificationDetails: "",
    occurrenceType: "",
    occurrenceRef: "",
    briefDescription: "",
    service: "",
    role: "",
    vehicleNum: "",
    vehicleDesc: "",
    roleDesc: "",
    badgeNum: "",
    fireDept: false,
    police: false,
    observation: "",
    actionTaken: "",
    suggestedResolution: "",
    managementNotes: "",
    requestedBy: "",
    requestedByDetails: "",
    reportCreator: "",
    creatorDetails: "",
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
            <span style={{ fontSize: 24 }}>✓</span> Occurrence Report Submitted
            Successfully
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
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardHeaderTitle}>
            🛡️ EMS Occurrence Report
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
            Meridian County Emergency Medical Services — Incident Documentation
          </div>
        </div>
        <div style={styles.cardHeaderBadge}>
          {now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          {now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      <div style={styles.cardBody}>
        <div style={styles.sectionTitle}>Incident Overview</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Date<span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              style={styles.input}
              value={form.date}
              onChange={u("date")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>
              Time<span style={styles.required}>*</span>
            </label>
            <input
              type="time"
              style={styles.input}
              value={form.time}
              onChange={u("time")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Call Number</label>
            <input
              style={styles.input}
              placeholder="e.g. 2026-00412"
              value={form.callNumber}
              onChange={u("callNumber")}
            />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Classification<span style={styles.required}>*</span>
            </label>
            <select
              style={styles.select}
              value={form.classification}
              onChange={u("classification")}
            >
              <option value="">— Select —</option>
              <option>Vehicle Incident</option>
              <option>Equipment Failure</option>
              <option>Workplace Injury</option>
              <option>Patient Complaint</option>
              <option>Near Miss</option>
              <option>Other</option>
            </select>
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Classification Details</label>
            <input
              style={styles.input}
              placeholder="Additional classification details"
              value={form.classificationDetails}
              onChange={u("classificationDetails")}
            />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Occurrence Type<span style={styles.required}>*</span>
            </label>
            <select
              style={styles.select}
              value={form.occurrenceType}
              onChange={u("occurrenceType")}
            >
              <option value="">— Select —</option>
              <option>Call Related</option>
              <option>Non-Call Related</option>
              <option>Station Related</option>
              <option>Vehicle Related</option>
            </select>
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Occurrence Reference #</label>
            <input
              style={styles.input}
              placeholder="e.g. OCC-2026-0087"
              value={form.occurrenceRef}
              onChange={u("occurrenceRef")}
            />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Brief Description<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="Short summary of the occurrence"
              value={form.briefDescription}
              onChange={u("briefDescription")}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>Service &amp; Vehicle</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Service<span style={styles.required}>*</span>
            </label>
            <select
              style={styles.select}
              value={form.service}
              onChange={u("service")}
            >
              <option value="">— Select —</option>
              <option>Muskoka Paramedic Services</option>
              <option>EAI Ambulance Service</option>
              <option>County EMS</option>
            </select>
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>
              Vehicle #<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="4-digit (e.g. 4012)"
              value={form.vehicleNum}
              onChange={u("vehicleNum")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Vehicle Description</label>
            <input
              style={styles.input}
              placeholder="e.g. Type III Ambulance"
              value={form.vehicleDesc}
              onChange={u("vehicleDesc")}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>Personnel</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Role<span style={styles.required}>*</span>
            </label>
            <select
              style={styles.select}
              value={form.role}
              onChange={u("role")}
            >
              <option value="">— Select —</option>
              <option>Primary Care Paramedic</option>
              <option>Advanced Care Paramedic</option>
              <option>Supervisor</option>
              <option>Driver</option>
            </select>
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Role Description</label>
            <input
              style={styles.input}
              placeholder="Additional role details"
              value={form.roleDesc}
              onChange={u("roleDesc")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>
              Badge #<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="e.g. B-3047"
              value={form.badgeNum}
              onChange={u("badgeNum")}
            />
          </div>
        </div>
        <div style={styles.row}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.grey700,
                textTransform: "uppercase",
              }}
            >
              Other Services Involved:
            </span>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.fireDept}
                onChange={u("fireDept")}
              />
              Fire Department
            </label>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.police}
                onChange={u("police")}
              />
              Police
            </label>
          </div>
        </div>

        <div style={styles.sectionTitle}>Report Details</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Observation / Description of Event
              <span style={styles.required}>*</span>
            </label>
            <textarea
              style={styles.textarea}
              placeholder="Describe in detail what was observed during the occurrence..."
              value={form.observation}
              onChange={u("observation")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Action Taken</label>
            <textarea
              style={styles.textarea}
              placeholder="Describe any immediate actions taken in response..."
              value={form.actionTaken}
              onChange={u("actionTaken")}
            />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>Suggested Resolution</label>
            <textarea
              style={styles.textarea}
              placeholder="Recommended steps to resolve or prevent recurrence..."
              value={form.suggestedResolution}
              onChange={u("suggestedResolution")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Management Notes</label>
            <textarea
              style={styles.textarea}
              placeholder="Notes for supervisory / management review..."
              value={form.managementNotes}
              onChange={u("managementNotes")}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>Submission Information</div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Requested By<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="Name of requester"
              value={form.requestedBy}
              onChange={u("requestedBy")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Requested By — Details</label>
            <input
              style={styles.input}
              placeholder="Title, department, or contact info"
              value={form.requestedByDetails}
              onChange={u("requestedByDetails")}
            />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field()}>
            <label style={styles.label}>
              Report Creator<span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              placeholder="Name of person completing this form"
              value={form.reportCreator}
              onChange={u("reportCreator")}
            />
          </div>
          <div style={styles.field()}>
            <label style={styles.label}>Creator — Details</label>
            <input
              style={styles.input}
              placeholder="Title, badge #, or contact info"
              value={form.creatorDetails}
              onChange={u("creatorDetails")}
            />
          </div>
        </div>

        <div style={styles.btnRow}>
          <button
            style={styles.btnSecondary}
            onClick={() =>
              setForm((p) => {
                const fresh = {};
                Object.keys(p).forEach((k) => {
                  fresh[k] =
                    typeof p[k] === "boolean"
                      ? false
                      : k === "date"
                      ? now.toISOString().split("T")[0]
                      : k === "time"
                      ? now.toTimeString().slice(0, 5)
                      : "";
                });
                return fresh;
              })
            }
          >
            Clear Form
          </button>
          <button style={styles.btnPrimary} onClick={() => setSubmitted(true)}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
