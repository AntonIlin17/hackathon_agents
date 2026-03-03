import { useState } from "react";
import { COLORS, styles } from "./styles";
import OccurrenceReport from "./OccurrenceReport";
import TeddyBearForm from "./TeddyBearForm";
import ShiftReport from "./ShiftReport";
import ParamedicStatus from "./ParamedicStatus";
// 1. Import your new AI form component
import EmptyFormAI from "./EmptyFormAI"; 

export default function EMSForms() {
  const [activeTab, setActiveTab] = useState(0);

  // 2. Add the "AI Empty Form" to the tabs list
  const tabs = [
    { label: "Occurrence Report", icon: "🛡️" },
    { label: "Teddy Bear Tracking", icon: "🧸" },
    { label: "Shift Report", icon: "📋" },
    { label: "Paramedic Status", icon: "📊" },
    { label: "AI Empty Form", icon: "🤖" }, 
  ];

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>⚕</div>
        <div>
          <div style={styles.headerTitle}>EMS Digital Forms</div>
          <div style={styles.headerSub}>
            Meridian County Emergency Medical Services
          </div>
        </div>
      </div>
      <div style={styles.tabs}>
        {tabs.map((t, i) => (
          <button
            key={i}
            style={styles.tab(activeTab === i)}
            onClick={() => setActiveTab(i)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={styles.formContainer}>
        {activeTab === 0 && <OccurrenceReport />}
        {activeTab === 1 && <TeddyBearForm />}
        {activeTab === 2 && <ShiftReport />}
        {activeTab === 3 && <ParamedicStatus />}
        {/* 3. This line tells the browser to show the new form when clicked */}
        {activeTab === 4 && <EmptyFormAI />}
      </div>
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: 11,
          color: COLORS.grey500,
        }}
      >
        EffectiveAI Paramedic Services © 2026 — Hackathon Build
      </div>
    </div>
  );
}
