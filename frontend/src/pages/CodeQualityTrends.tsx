import { useState, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type TrendPeriod = "7d" | "30d" | "90d" | "6m" | "1y";
type MetricType = "complexity" | "coverage" | "duplication" | "debt" | "bugs" | "smells";
type RegressionSeverity = "none" | "minor" | "moderate" | "major" | "critical";

interface QualityMetric {
  id: string;
  name: string;
  type: MetricType;
  icon: string;
  color: string;
  currentValue: number;
  previousValue: number;
  target: number;
  unit: string;
  trend: "improving" | "stable" | "declining";
  trendPercent: number;
}

interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

interface Regression {
  id: string;
  title: string;
  severity: RegressionSeverity;
  metric: string;
  detectedAt: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  impact: string;
  status: "open" | "investigating" | "resolved";
}

interface Improvement {
  id: string;
  title: string;
  metric: string;
  improvement: number;
  achievedAt: string;
  description: string;
  contributor: string;
}

interface QualityGate {
  name: string;
  status: "pass" | "warn" | "fail";
  current: number;
  threshold: number;
  trend: "improving" | "stable" | "declining";
}

// ─── Constants ──────────────────────────────────────────────────────────────

const METRIC_CONFIG: Record<MetricType, { label: string; icon: string; color: string; target: number; threshold: { warn: number; fail: number } }> = {
  complexity: { label: "Cyclomatic Complexity", icon: "🔢", color: "#8b5cf6", target: 5, threshold: { warn: 10, fail: 15 } },
  coverage: { label: "Test Coverage", icon: "🧪", color: "#10b981", target: 90, threshold: { warn: 70, fail: 60 } },
  duplication: { label: "Code Duplication", icon: "📋", color: "#f59e0b", target: 3, threshold: { warn: 8, fail: 12 } },
  debt: { label: "Tech Debt Hours", icon: "⏱️", color: "#ef4444", target: 20, threshold: { warn: 50, fail: 100 } },
  bugs: { label: "Bug Count", icon: "🐛", color: "#ec4899", target: 0, threshold: { warn: 5, fail: 10 } },
  smells: { label: "Code Smells", icon: "👃", color: "#06b6d4", target: 10, threshold: { warn: 30, fail: 50 } },
};

const SEVERITY_MAP: Record<RegressionSeverity, { label: string; color: string; icon: string }> = {
  none: { label: "None", color: "#10b981", icon: "✅" },
  minor: { label: "Minor", color: "#f59e0b", icon: "⚠️" },
  moderate: { label: "Moderate", color: "#f97316", icon: "🔶" },
  major: { label: "Major", color: "#ef4444", icon: "🛑" },
  critical: { label: "Critical", color: "#7e0023", icon: "🚨" },
};

// ─── Sample Data ────────────────────────────────────────────────────────────

function generateTrendData(baseValue: number, volatility: number, points: number, trend: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const startDate = new Date("2026-06-01");
  for (let i = 0; i < points; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 3600000);
    const noise = (Math.random() - 0.5) * volatility;
    const trendEffect = trend * i;
    const value = Math.max(0, Math.round(baseValue + noise + trendEffect));
    data.push({
      date: date.toISOString().split("T")[0],
      value,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return data;
}

const QUALITY_METRICS: QualityMetric[] = [
  { id: "q1", name: "Cyclomatic Complexity", type: "complexity", icon: "🔢", color: "#8b5cf6", currentValue: 4.2, previousValue: 5.1, target: 5, unit: "avg", trend: "improving", trendPercent: -17.6 },
  { id: "q2", name: "Test Coverage", type: "coverage", icon: "🧪", color: "#10b981", currentValue: 85, previousValue: 82, target: 90, unit: "%", trend: "improving", trendPercent: 3.7 },
  { id: "q3", name: "Code Duplication", type: "duplication", icon: "📋", color: "#f59e0b", currentValue: 5.2, previousValue: 6.8, target: 3, unit: "%", trend: "improving", trendPercent: -23.5 },
  { id: "q4", name: "Tech Debt", type: "debt", icon: "⏱️", color: "#ef4444", currentValue: 32, previousValue: 45, target: 20, unit: "hrs", trend: "improving", trendPercent: -28.9 },
  { id: "q5", name: "Bug Count", type: "bugs", icon: "🐛", color: "#ec4899", currentValue: 3, previousValue: 2, target: 0, unit: "open", trend: "declining", trendPercent: 50 },
  { id: "q6", name: "Code Smells", type: "smells", icon: "👃", color: "#06b6d4", currentValue: 18, previousValue: 22, target: 10, unit: "total", trend: "improving", trendPercent: -18.2 },
];

const TREND_DATA: Record<MetricType, TrendDataPoint[]> = {
  complexity: generateTrendData(6, 1.5, 30, -0.06),
  coverage: generateTrendData(78, 3, 30, 0.25),
  duplication: generateTrendData(8, 1, 30, -0.1),
  debt: generateTrendData(55, 5, 30, -0.8),
  bugs: generateTrendData(5, 2, 30, -0.08),
  smells: generateTrendData(28, 3, 30, -0.35),
};

const REGRESSIONS: Regression[] = [
  { id: "r1", title: "Complexity spike in payment module", severity: "major", metric: "Cyclomatic Complexity", detectedAt: "2026-08-25", commitSha: "a1b2c3d", commitMessage: "feat: add multi-currency support", author: "Alex Kim", impact: "Average complexity increased from 4.8 to 6.2 in payment module", status: "investigating" },
  { id: "r2", title: "Coverage drop after refactor", severity: "moderate", metric: "Test Coverage", detectedAt: "2026-08-22", commitSha: "e4f5g6h", commitMessage: "refactor: extract shared utilities", author: "Priya Patel", impact: "Coverage dropped 5% in refactored modules", status: "resolved" },
  { id: "r3", title: "New code smells introduced", severity: "minor", metric: "Code Smells", detectedAt: "2026-08-20", commitSha: "i7j8k9l", commitMessage: "feat: implement notification system", author: "Alex Kim", impact: "3 new long methods detected in notification handler", status: "open" },
  { id: "r4", title: "Tech debt increase", severity: "moderate", metric: "Tech Debt", detectedAt: "2026-08-18", commitSha: "m0n1o2p", commitMessage: "feat: add real-time updates", author: "Marcus Johnson", impact: "Tech debt increased by 8 hours due to TODO comments", status: "resolved" },
];

const IMPROVEMENTS: Improvement[] = [
  { id: "i1", title: "Complexity reduction", metric: "Cyclomatic Complexity", improvement: 17.6, achievedAt: "2026-08-28", description: "Refactored complex conditionals into strategy pattern", contributor: "Sarah Chen" },
  { id: "i2", title: "Coverage boost", metric: "Test Coverage", improvement: 3.7, achievedAt: "2026-08-27", description: "Added integration tests for auth module", contributor: "Marcus Johnson" },
  { id: "i3", title: "Duplication cleanup", metric: "Code Duplication", improvement: 23.5, achievedAt: "2026-08-26", description: "Extracted shared utilities into common module", contributor: "Priya Patel" },
  { id: "i4", title: "Tech debt reduction", metric: "Tech Debt", improvement: 28.9, achievedAt: "2026-08-25", description: "Addressed 12 TODO items and removed deprecated code", contributor: "Sarah Chen" },
  { id: "i5", title: "Smell elimination", metric: "Code Smells", improvement: 18.2, achievedAt: "2026-08-24", description: "Refactored long methods and extracted constants", contributor: "Jordan Lee" },
];

const QUALITY_GATES: QualityGate[] = [
  { name: "Complexity < 10", status: "pass", current: 4.2, threshold: 10, trend: "improving" },
  { name: "Coverage > 80%", status: "pass", current: 85, threshold: 80, trend: "improving" },
  { name: "Duplication < 5%", status: "warn", current: 5.2, threshold: 5, trend: "improving" },
  { name: "Tech Debt < 40hrs", status: "pass", current: 32, threshold: 40, trend: "improving" },
  { name: "Bugs = 0", status: "warn", current: 3, threshold: 0, trend: "declining" },
  { name: "Smells < 15", status: "warn", current: 18, threshold: 15, trend: "improving" },
];

// ─── Chart Components ───────────────────────────────────────────────────────

function TrendLineChart({ data, color, height = 150, showTarget = false, targetValue = 0 }: { data: TrendDataPoint[]; color: string; height?: number; showTarget?: boolean; targetValue?: number }) {
  const padding = { top: 15, right: 10, bottom: 25, left: 40 };
  const width = 500;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), showTarget ? targetValue : 0) * 1.1;
  const minVal = Math.min(...data.map((d) => d.value), showTarget ? targetValue : 0) * 0.9;
  const range = maxVal - minVal || 1;

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
  const getY = (v: number) => padding.top + chartH - ((v - minVal) / range) * chartH;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.value)}`).join(" ");
  const areaD = `${pathD} L ${getX(data.length - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`trend-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + chartH * (1 - pct);
        const val = minVal + range * pct;
        return (
          <g key={pct}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="rgba(255,255,255,0.05)" />
            <text x={padding.left - 5} y={y + 3} textAnchor="end" fill="rgba(148,163,184,0.4)" fontSize="9">
              {Math.round(val)}
            </text>
          </g>
        );
      })}

      {/* Target line */}
      {showTarget && (
        <>
          <line x1={padding.left} y1={getY(targetValue)} x2={padding.left + chartW} y2={getY(targetValue)} stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" opacity={0.5} />
          <text x={padding.left + chartW + 2} y={getY(targetValue) + 3} fill="#10b981" fontSize="8" opacity={0.7}>target</text>
        </>
      )}

      {/* Area */}
      <path d={areaD} fill={`url(#trend-${color.replace("#", "")})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* First and last points */}
      <circle cx={getX(0)} cy={getY(data[0].value)} r="3" fill={color} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx={getX(data.length - 1)} cy={getY(data[data.length - 1].value)} r="3" fill={color} stroke="#0f172a" strokeWidth="1.5" />

      {/* X-axis labels */}
      {[0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(data.length * 3 / 4), data.length - 1].map((i) => (
        <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" fill="rgba(148,163,184,0.4)" fontSize="8">
          {data[i]?.label || ""}
        </text>
      ))}
    </svg>
  );
}

function BarChart({ data, color, height = 120 }: { data: { label: string; value: number }[]; color: string; height?: number }) {
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.1;
  const barWidth = Math.max(20, Math.min(40, 400 / data.length));

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${Math.max(400, data.length * (barWidth + 8))} ${height}`}>
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * (height - 30);
        const x = 10 + i * (barWidth + 8);
        const y = height - 25 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="3" fill={color} opacity={0.7} />
            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">
              {d.value}
            </text>
            <text x={x + barWidth / 2} y={height - 5} textAnchor="middle" fill="#6b7280" fontSize="8">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CodeQualityTrends() {
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "regressions" | "improvements" | "gates">("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>("30d");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("complexity");

  const overallScore = useMemo(() => {
    const scores = QUALITY_METRICS.map((m) => {
      if (m.type === "coverage") return m.currentValue;
      if (m.type === "complexity") return Math.max(0, 100 - m.currentValue * 10);
      if (m.type === "duplication") return Math.max(0, 100 - m.currentValue * 10);
      if (m.type === "debt") return Math.max(0, 100 - m.currentValue);
      if (m.type === "bugs") return Math.max(0, 100 - m.currentValue * 15);
      if (m.type === "smells") return Math.max(0, 100 - m.currentValue * 3);
      return 80;
    });
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "📊" },
    { id: "trends" as const, label: "Trend Analysis", icon: "📈" },
    { id: "regressions" as const, label: "Regressions", icon: "⚠️" },
    { id: "improvements" as const, label: "Improvements", icon: "✅" },
    { id: "gates" as const, label: "Quality Gates", icon: "🚧" },
  ];

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "10px",
    border: active ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
    background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
    color: active ? "#8b5cf6" : "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "24px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px", background: "linear-gradient(135deg, #10b981, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📈 Code Quality Trends
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>Track code quality metrics, detect regressions, and measure improvements</p>
        </div>
        <div style={{ textAlign: "center", padding: "12px 24px", borderRadius: "16px", background: `${overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444"}15`, border: `2px solid ${overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444"}40` }}>
          <div style={{ fontSize: "36px", fontWeight: "900", color: overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444" }}>{overallScore}</div>
          <div style={{ fontSize: "12px", color: overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444", fontWeight: "600" }}>{overallScore >= 80 ? "Healthy" : overallScore >= 60 ? "Needs Attention" : "Critical"}</div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Quality Score</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button key={tab.id} style={{ ...btnStyle(activeTab === tab.id), padding: "10px 20px" }} onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === "overview" && (
        <div>
          {/* Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
            {QUALITY_METRICS.map((metric) => {
              const config = METRIC_CONFIG[metric.type];
              const isGood = metric.type === "coverage" ? metric.currentValue >= 80 : metric.currentValue <= config.threshold.warn;
              return (
                <div key={metric.id} style={{ ...cardStyle, cursor: "pointer" }} onClick={() => { setSelectedMetric(metric.type); setActiveTab("trends"); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px" }}>{metric.icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>{metric.name}</span>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", background: metric.trend === "improving" ? "rgba(16,185,129,0.15)" : metric.trend === "declining" ? "rgba(239,68,68,0.15)" : "rgba(107,114,128,0.15)", color: metric.trend === "improving" ? "#10b981" : metric.trend === "declining" ? "#ef4444" : "#6b7280", fontSize: "10px", fontWeight: "700" }}>
                      {metric.trend === "improving" ? "↓" : metric.trend === "declining" ? "↑" : "→"} {Math.abs(metric.trendPercent)}%
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ fontSize: "24px", fontWeight: "900", color: isGood ? "#10b981" : "#f59e0b" }}>{metric.currentValue}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Target: {metric.target} {metric.unit}</span>
                  </div>

                  {/* Mini trend */}
                  <div style={{ height: "40px" }}>
                    <TrendLineChart data={TREND_DATA[metric.type].slice(-14)} color={metric.color} height={40} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
                    <span>Previous: {metric.previousValue} {metric.unit}</span>
                    <span style={{ color: isGood ? "#10b981" : "#f59e0b" }}>{isGood ? "✓ On track" : "⚠ Needs work"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quality Gates Summary */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>🚧 Quality Gates Status</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
              {QUALITY_GATES.map((gate) => {
                const statusColors = { pass: "#10b981", warn: "#f59e0b", fail: "#ef4444" };
                const trendIcons = { improving: "📈", stable: "➡️", declining: "📉" };
                return (
                  <div key={gate.name} style={{ textAlign: "center", padding: "12px", borderRadius: "10px", background: `${statusColors[gate.status]}10`, border: `1px solid ${statusColors[gate.status]}30` }}>
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>{gate.status === "pass" ? "✅" : gate.status === "warn" ? "⚠️" : "❌"}</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: statusColors[gate.status] }}>{gate.current}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>{gate.name}</div>
                    <div style={{ fontSize: "10px", marginTop: "4px" }}>{trendIcons[gate.trend]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRENDS TAB ═══ */}
      {activeTab === "trends" && (
        <div>
          {/* Period Selector */}
          <div style={{ ...cardStyle, marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>Period:</span>
            {(["7d", "30d", "90d", "6m", "1y"] as TrendPeriod[]).map((p) => (
              <button key={p} style={btnStyle(selectedPeriod === p)} onClick={() => setSelectedPeriod(p)}>
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : p === "6m" ? "6 Months" : "1 Year"}
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <div style={{ ...cardStyle, marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(METRIC_CONFIG).map(([key, config]) => (
              <button key={key} style={btnStyle(selectedMetric === key)} onClick={() => setSelectedMetric(key as MetricType)}>
                {config.icon} {config.label}
              </button>
            ))}
          </div>

          {/* Trend Chart */}
          <div style={{ ...cardStyle, marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>
              {METRIC_CONFIG[selectedMetric].icon} {METRIC_CONFIG[selectedMetric].label} Trend
            </h3>
            <TrendLineChart data={TREND_DATA[selectedMetric]} color={METRIC_CONFIG[selectedMetric].color} height={200} showTarget targetValue={METRIC_CONFIG[selectedMetric].target} />
          </div>

          {/* All Metrics Mini Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {Object.entries(METRIC_CONFIG).map(([key, config]) => (
              <div key={key} style={{ ...cardStyle, cursor: "pointer", border: selectedMetric === key ? `1px solid ${config.color}40` : "1px solid rgba(255,255,255,0.06)" }} onClick={() => setSelectedMetric(key as MetricType)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>{config.icon} {config.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: config.color }}>{QUALITY_METRICS.find((m) => m.type === key)?.currentValue}</span>
                </div>
                <TrendLineChart data={TREND_DATA[key as MetricType].slice(-14)} color={config.color} height={60} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ REGRESSIONS TAB ═══ */}
      {activeTab === "regressions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {REGRESSIONS.map((reg) => {
            const sev = SEVERITY_MAP[reg.severity];
            const statusColors = { open: "#ef4444", investigating: "#f59e0b", resolved: "#10b981" };
            return (
              <div key={reg.id} style={{ ...cardStyle, border: `1px solid ${sev.color}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "16px" }}>{sev.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: "700" }}>{reg.title}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>
                      Metric: <strong style={{ color: "#e2e8f0" }}>{reg.metric}</strong> • Detected: {reg.detectedAt}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{reg.impact}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "6px", background: `${sev.color}20`, color: sev.color, fontSize: "10px", fontWeight: "700" }}>
                      {sev.label}
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: "6px", background: `${statusColors[reg.status]}20`, color: statusColors[reg.status], fontSize: "10px", fontWeight: "700" }}>
                      {reg.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "10px", color: "#6b7280" }}>
                  <span>SHA: <code style={{ color: "#8b5cf6" }}>{reg.commitSha}</code></span>
                  <span>Author: {reg.author}</span>
                  <span>Message: {reg.commitMessage}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ IMPROVEMENTS TAB ═══ */}
      {activeTab === "improvements" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {IMPROVEMENTS.map((imp) => (
            <div key={imp.id} style={{ ...cardStyle, borderTop: "3px solid #10b981" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{imp.title}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{imp.metric}</div>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "14px", fontWeight: "800" }}>
                  ↓{imp.improvement}%
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>{imp.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6b7280" }}>
                <span>👤 {imp.contributor}</span>
                <span>📅 {imp.achievedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ QUALITY GATES TAB ═══ */}
      {activeTab === "gates" && (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>🚧 Quality Gate Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {QUALITY_GATES.map((gate) => {
                const statusColors = { pass: "#10b981", warn: "#f59e0b", fail: "#ef4444" };
                const trendIcons = { improving: "📈", stable: "➡️", declining: "📉" };
                const statusLabels = { pass: "PASSED", warn: "WARNING", fail: "FAILED" };
                return (
                  <div key={gate.name} style={{ padding: "16px", borderRadius: "12px", background: `${statusColors[gate.status]}08`, border: `1px solid ${statusColors[gate.status]}20` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>{gate.status === "pass" ? "✅" : gate.status === "warn" ? "⚠️" : "❌"}</span>
                        <span style={{ fontWeight: "700", fontSize: "14px" }}>{gate.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{trendIcons[gate.trend]}</span>
                        <span style={{ padding: "3px 10px", borderRadius: "6px", background: `${statusColors[gate.status]}20`, color: statusColors[gate.status], fontSize: "10px", fontWeight: "700" }}>
                          {statusLabels[gate.status]}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                      <span>Current: <strong style={{ color: statusColors[gate.status] }}>{gate.current}</strong></span>
                      <span>Threshold: <strong>{gate.threshold}</strong></span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (gate.current / Math.max(gate.threshold, 1)) * 100)}%`, background: statusColors[gate.status], borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
