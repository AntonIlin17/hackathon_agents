import { COLORS, styles } from "./styles";

export default function ParamedicStatus() {
  const items = [
    { item: "ACRc", type: "ACR Completion", desc: "Number of ACRs/PCRs that are unfinished", status: "BAD", issues: 2, notes: "Each must be completed with 24 hours of call completion" },
    { item: "ACEr", type: "ACE Response", desc: "Number of ACE reviews requiring comment", status: "GOOD", issues: 0, notes: "Complete outstanding within 1 week of BH review" },
    { item: "CERT-DL", type: "Drivers License", desc: "Drivers License Validity", status: "GOOD", issues: 0, notes: "Drivers License Status" },
    { item: "CERT-Va", type: "Vaccinations", desc: "Required vaccinations up to date", status: "BAD", issues: 1, notes: "Vaccination Status as per guidelines" },
    { item: "CERT-CE", type: "Education", desc: "Continuous Education Status", status: "GOOD", issues: 0, notes: "CME outstanding" },
    { item: "UNIF", type: "Uniform", desc: "Uniform credits", status: "GOOD", issues: 5, notes: "Available Uniform order Credits" },
    { item: "CRIM", type: "CRC", desc: "Criminal Record Check", status: "GOOD", issues: 0, notes: "Criminal Issue Free" },
    { item: "ACP", type: "ACP Status", desc: "If ACP, Cert Valid", status: "GOOD", issues: 0, notes: "ACP Status is good if ACP" },
    { item: "VAC", type: "Vacation", desc: "Vacation Requested and approved", status: "GOOD", issues: 0, notes: "Yearly vacation approved" },
    { item: "MEALS", type: "Missed Meals", desc: "Missed Meal Claims", status: "GOOD", issues: 0, notes: "Missed Meal Claims outstanding" },
    { item: "OVER", type: "Overtime Req.", desc: "Overtime Requests outstanding", status: "BAD", issues: 1, notes: "Overtime claims outstanding" },
  ];

  const badCount = items.filter((i) => i.status === "BAD").length;

  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.cardHeader,
          background: `linear-gradient(135deg, ${COLORS.grey900} 0%, ${COLORS.primary} 100%)`,
        }}
      >
        <div>
          <div style={styles.cardHeaderTitle}>
            📊 Paramedic Status Report
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
            EffectiveAI Paramedic Services — Paramedic: ALL
          </div>
        </div>
        <div style={styles.cardHeaderBadge}>Rev 20260225</div>
      </div>
      <div
        style={{
          padding: "12px 24px",
          background: badCount > 0 ? "#fdf2f2" : "#f0fdf4",
          borderBottom: `1px solid ${COLORS.grey100}`,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 700, color: badCount > 0 ? COLORS.bad : COLORS.good }}>
          {badCount > 0 ? `⚠ ${badCount} item(s) require attention` : "✓ All items in good standing"}
        </span>
        <span style={{ fontSize: 12, color: COLORS.grey500, marginLeft: "auto" }}>
          All items must be checked before the start of each shift
        </span>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}># Issues</th>
              <th style={styles.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.item}
                style={{
                  ...(i % 2 === 1 ? styles.trAlt : {}),
                  ...(item.status === "BAD"
                    ? { background: "#fef8f8" }
                    : {}),
                }}
              >
                <td style={{ ...styles.td, fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>
                  {item.item}
                </td>
                <td style={{ ...styles.td, fontWeight: 600 }}>{item.type}</td>
                <td style={styles.td}>{item.desc}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td
                  style={{
                    ...styles.td,
                    fontWeight: 700,
                    color:
                      item.status === "BAD" ? COLORS.bad : COLORS.dark,
                  }}
                >
                  {item.issues}
                </td>
                <td style={{ ...styles.td, fontSize: 12, color: COLORS.grey700 }}>
                  {item.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
