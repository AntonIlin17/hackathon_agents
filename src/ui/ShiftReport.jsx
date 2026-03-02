import { useState } from "react";
import { COLORS, styles } from "./styles";

export default function ShiftReport() {
  const shifts = [
    { id: 1, name: "Adams, J.", unit: "4012", partner: "Baker, T.", start: "07:00", end: "19:00", status: "Active", calls: 6, area: "North", base: "Station 1", notes: "" },
    { id: 2, name: "Chen, L.", unit: "4018", partner: "Diaz, R.", start: "07:00", end: "19:00", status: "Active", calls: 4, area: "South", base: "Station 3", notes: "Vehicle check required" },
    { id: 3, name: "Evans, M.", unit: "4025", partner: "Foster, K.", start: "19:00", end: "07:00", status: "Scheduled", calls: 0, area: "East", base: "Station 2", notes: "" },
    { id: 4, name: "Garcia, S.", unit: "4031", partner: "Hall, P.", start: "07:00", end: "19:00", status: "Complete", calls: 8, area: "West", base: "Station 4", notes: "OT approved" },
    { id: 5, name: "Ingram, D.", unit: "4009", partner: "Jones, A.", start: "19:00", end: "07:00", status: "Scheduled", calls: 0, area: "Central", base: "Station 1", notes: "" },
    { id: 6, name: "Kim, Y.", unit: "4044", partner: "Lopez, C.", start: "07:00", end: "19:00", status: "Active", calls: 5, area: "North", base: "Station 2", notes: "" },
    { id: 7, name: "Martin, R.", unit: "4015", partner: "Nguyen, H.", start: "07:00", end: "19:00", status: "Complete", calls: 7, area: "South", base: "Station 3", notes: "Late finish" },
    { id: 8, name: "O'Brien, T.", unit: "4022", partner: "Patel, N.", start: "19:00", end: "07:00", status: "Scheduled", calls: 0, area: "East", base: "Station 1", notes: "" },
  ];

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = shifts.filter((s) => {
    const matchStatus = filter === "All" || s.status === filter;
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.unit.includes(search) ||
      s.partner.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusColor = (s) =>
    s === "Active"
      ? COLORS.primaryLight
      : s === "Complete"
      ? COLORS.good
      : COLORS.grey500;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardHeaderTitle}>
            📋 Online Paramedic Shift Report
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
            EAI Ambulance Service
          </div>
        </div>
        <div style={styles.cardHeaderBadge}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.grey100}` }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ ...styles.input, maxWidth: 260, flex: "1 1 200px" }}
            placeholder="Search by name, unit, or partner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {["All", "Active", "Scheduled", "Complete"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border:
                  filter === s
                    ? `2px solid ${COLORS.primary}`
                    : `1.5px solid ${COLORS.grey200}`,
                background: filter === s ? COLORS.primary : COLORS.white,
                color: filter === s ? COLORS.white : COLORS.grey700,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Paramedic</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Partner</th>
              <th style={styles.th}>Shift</th>
              <th style={styles.th}>Area</th>
              <th style={styles.th}>Base</th>
              <th style={styles.th}>Calls</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                style={i % 2 === 1 ? styles.trAlt : {}}
              >
                <td style={{ ...styles.td, fontWeight: 600 }}>{s.name}</td>
                <td style={styles.td}>{s.unit}</td>
                <td style={styles.td}>{s.partner}</td>
                <td style={styles.td}>
                  {s.start} – {s.end}
                </td>
                <td style={styles.td}>{s.area}</td>
                <td style={styles.td}>{s.base}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{s.calls}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.white,
                      background: statusColor(s.status),
                    }}
                  >
                    {s.status}
                  </span>
                </td>
                <td style={{ ...styles.td, color: COLORS.grey500, fontSize: 12 }}>
                  {s.notes || "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    padding: 32,
                    color: COLORS.grey500,
                  }}
                >
                  No matching shifts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div
        style={{
          padding: "12px 24px",
          background: COLORS.grey50,
          fontSize: 12,
          color: COLORS.grey500,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          Showing {filtered.length} of {shifts.length} records
        </span>
        <span>Content updated in real-time</span>
      </div>
    </div>
  );
}
