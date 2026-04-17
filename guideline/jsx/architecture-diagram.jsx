import { useState } from "react";

const stores = [
  {
    title: "Technical knowledge",
    subtitle: "Hiểu biết kỹ thuật",
    color: { bg: "#EEEDFE", border: "#534AB7", title: "#3C3489", text: "#534AB7" },
    registry: "_registry.yaml",
    files: ["language/csharp-async.md", "framework/efcore-patterns.md", "patterns/repository.md"],
  },
  {
    title: "Domain knowledge",
    subtitle: "Hiểu biết nghiệp vụ",
    color: { bg: "#E1F5EE", border: "#0F6E56", title: "#085041", text: "#0F6E56" },
    registry: "_registry.yaml",
    files: ["payment/workflow.md", "order/lifecycle.md", "glossary.md"],
  },
  {
    title: "Rules",
    subtitle: "Ràng buộc dự án",
    color: { bg: "#FAECE7", border: "#993C1D", title: "#712B13", text: "#993C1D" },
    registry: "_registry.yaml",
    files: ["coding/coding-standards.md", "security/security.md", "api/api-design.md"],
  },
];

const solid = [
  { letter: "S", desc: "Mỗi store = 1 loại memory. Mỗi file = 1 chủ đề." },
  { letter: "O", desc: "Thêm file + entry. Không sửa gì khác." },
  { letter: "I", desc: "Chỉ load files cần, không dump toàn bộ." },
  { letter: "D", desc: "Truy xuất qua registry, không trỏ thẳng file." },
];

const roles = [
  { role: "Xây dựng memory stores", who: "Tech lead, BA, domain expert" },
  { role: "Cung cấp context", who: "Dev, mỗi lần invoke skill" },
  { role: "Review output (sensor)", who: "Human-as-sensor, giai đoạn đầu" },
];

function StoreCard({ store }) {
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${store.color.border}`,
        borderRadius: 12,
        background: store.color.bg,
        padding: "16px 14px",
        minWidth: 0,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 15, color: store.color.title, marginBottom: 2 }}>
        {store.title}
      </div>
      <div style={{ fontSize: 12, color: store.color.text, marginBottom: 12 }}>{store.subtitle}</div>

      <div
        style={{
          border: `1px dashed ${store.color.border}`,
          borderRadius: 6,
          background: "#fff",
          padding: "6px 10px",
          fontSize: 12,
          fontWeight: 500,
          color: store.color.title,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        {store.registry}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {store.files.map((f) => (
          <div key={f} style={{ fontSize: 11, color: store.color.text, fontFamily: "monospace" }}>
            {f}
          </div>
        ))}
        <div style={{ fontSize: 11, color: "#999" }}>...</div>
      </div>
    </div>
  );
}

export default function ArchitectureDiagram() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary, #2C2C2A)" }}>
          Memory architecture
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary, #888)", marginTop: 4 }}>
          Mỗi store độc lập, truy xuất qua registry
        </div>
      </div>

      {/* SOLID badges */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {solid.map((s) => (
          <div
            key={s.letter}
            style={{
              flex: 1,
              minWidth: 140,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--color-background-secondary, #F5F5F0)",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#534AB7",
                width: 22,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {s.letter}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary, #666)", lineHeight: 1.3 }}>
              {s.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Memory Stores */}
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        {stores.map((store) => (
          <StoreCard key={store.title} store={store} />
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--color-text-tertiary, #999)",
          padding: "6px 0",
        }}
      >
        Mỗi store mở cho thêm file mới, đóng cho sửa cấu trúc (O)
      </div>

      {/* Registry = interface */}
      <div
        style={{
          textAlign: "center",
          padding: "10px 0",
          margin: "8px 0",
          borderTop: "1px dashed var(--color-border-tertiary, #ddd)",
          borderBottom: "1px dashed var(--color-border-tertiary, #ddd)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary, #333)" }}>
          Truy xuất qua registry — không trỏ thẳng vào file (D)
        </div>
      </div>

      {/* Context + AI Model */}
      <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 16 }}>
        {/* Context */}
        <div
          style={{
            flex: 1,
            border: "1.5px dashed #BA7517",
            borderRadius: 10,
            background: "#FAEEDA",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: "#633806" }}>Context</div>
          <div style={{ fontSize: 12, color: "#854F0B", marginTop: 4 }}>
            Ephemeral — con người cung cấp mỗi lần invoke
          </div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
            Task description, acceptance criteria
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            color: "var(--color-text-tertiary, #999)",
            flexShrink: 0,
          }}
        >
          →
        </div>

        {/* AI Model */}
        <div
          style={{
            flex: 1,
            border: "1px solid var(--color-border-tertiary, #ccc)",
            borderRadius: 10,
            background: "var(--color-background-secondary, #F5F5F0)",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary, #333)" }}>
            AI Model (bộ não)
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary, #666)", marginTop: 4 }}>
            Nhận memory + context → xử lý → output
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary, #999)", marginTop: 2 }}>
            Claude / GPT / Gemini / ...
          </div>
        </div>
      </div>

      {/* Human roles */}
      <div
        style={{
          borderTop: "1px dashed var(--color-border-tertiary, #ddd)",
          paddingTop: 16,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary, #333)",
            marginBottom: 10,
          }}
        >
          Vai trò con người
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {roles.map((r) => (
            <div
              key={r.role}
              style={{
                flex: 1,
                background: "var(--color-background-secondary, #F5F5F0)",
                borderRadius: 8,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary, #444)" }}>
                {r.role}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary, #999)", marginTop: 3 }}>
                {r.who}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--color-text-tertiary, #aaa)",
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--color-border-tertiary, #eee)",
        }}
      >
        Harness = Memory system cho AI — tổ chức, duy trì bởi con người, nạp vào model mỗi phiên làm
        việc
      </div>
    </div>
  );
}
