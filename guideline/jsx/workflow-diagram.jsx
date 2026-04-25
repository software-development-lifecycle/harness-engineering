import { useState } from "react";

const steps = [
  {
    command: "memory:scan",
    label: "Assess",
    desc: "Check memory state, detect tech stack, recommend next step",
    color: { bg: "#EEF2FF", border: "#6366F1", title: "#4338CA", text: "#6366F1" },
    number: 1,
  },
  {
    command: "memory:analyze",
    label: "Analyze",
    desc: "Analyze source code, documents, or conversational knowledge — produces spec + plan",
    color: { bg: "#EEEDFE", border: "#534AB7", title: "#3C3489", text: "#534AB7" },
    number: 2,
  },
  {
    command: "memory:building",
    label: "Build",
    desc: "Execute approved plan to build memory files with two-stage review",
    color: { bg: "#E1F5EE", border: "#0F6E56", title: "#085041", text: "#0F6E56" },
    number: 3,
  },
];

function StepCard({ step }) {
  return (
    <div
      style={{
        flex: 1,
        border: `1.5px solid ${step.color.border}`,
        borderRadius: 12,
        background: step.color.bg,
        padding: "14px 16px",
        minWidth: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -10,
          left: 14,
          background: step.color.border,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          width: 20,
          height: 20,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {step.number}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: step.color.title,
          fontFamily: "monospace",
          marginBottom: 2,
        }}
      >
        {step.command}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: step.color.text,
          marginBottom: 6,
        }}
      >
        {step.label}
      </div>
      <div style={{ fontSize: 11, color: step.color.text, lineHeight: 1.4, opacity: 0.85 }}>
        {step.desc}
      </div>
    </div>
  );
}

function Arrow({ vertical }) {
  if (vertical) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "4px 0",
        }}
      >
        <svg width="24" height="28" viewBox="0 0 24 28">
          <path d="M12 0 L12 20 M6 16 L12 24 L18 16" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        padding: "0 2px",
      }}
    >
      <svg width="28" height="24" viewBox="0 0 28 24">
        <path d="M0 12 L20 12 M16 6 L24 12 L16 18" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function WorkflowDiagram() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#2C2C2A" }}>
          Recommended workflow
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          Run skills in sequence — each builds on the previous output
        </div>
      </div>

      {/* Horizontal flow: scan → analyze → building */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <StepCard step={steps[0]} />
        <Arrow />
        <StepCard step={steps[1]} />
        <Arrow />
        <StepCard step={steps[2]} />
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "#F9FAFB",
          borderRadius: 8,
          border: "1px solid #E5E7EB",
        }}
      >
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {steps.map((s) => (
            <div key={s.number} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  background: s.color.border,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.number}
              </div>
              <span style={{ fontSize: 11, color: "#555" }}>
                <strong>{s.label}</strong> — {s.command}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
