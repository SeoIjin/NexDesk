import { useState } from "react";
import { Card, Btn, StatCard } from "./design-system";
import { MONTHLY_TRENDS, CATEGORY_BREAKDOWN, TECHNICIANS } from "./mock-data";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { X, CheckCircle, Calendar, AlertTriangle, ChevronDown } from "lucide-react";
import { exportData, type ExportFormat } from "../src/utils/export-data";

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", margin: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>{title}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f3f4f6"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ padding: "18px 22px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties  = { width: "100%", padding: "8px 11px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: 72 };

// ── Backlog data ─────────────────────────────────────────────────────────────
const BACKLOG_TICKETS = [
  { id: "TKT-1010", title: "Password reset not working for contractor", age: "3 days", priority: "P2", tech: "Priya Sharma" },
  { id: "TKT-1011", title: "Office PC won't wake from sleep",           age: "3 days", priority: "P3", tech: "Ana Reyes"    },
  { id: "TKT-1012", title: "No audio after Windows update",             age: "4 days", priority: "P3", tech: "Sam Torres"   },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function ReportsAnalytics() {
  const [activeTab, setActiveTab]     = useState("Overview");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("PDF");

  // Modal states
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [escalateTicket, setEscalateTicket] = useState<typeof BACKLOG_TICKETS[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Schedule form
  const [schedForm, setSchedForm] = useState({
    reportType: "Full Performance Report",
    frequency:  "Weekly",
    day:        "Monday",
    time:       "08:00",
    format:     "PDF",
    recipients: "",
  });

  // Escalate form
  const [escalateNote, setEscalateNote] = useState("");
  const [escalateTo,   setEscalateTo]   = useState("Team Lead");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  // ── existing data ──────────────────────────────────────────────────────────
  const weeklyData = [
    { day: "Mon Oct 27", created: 35, resolved: 31 },
    { day: "Tue Oct 28", created: 28, resolved: 33 },
    { day: "Wed Oct 29", created: 42, resolved: 38 },
    { day: "Thu Oct 30", created: 31, resolved: 29 },
    { day: "Fri Oct 31", created: 38, resolved: 35 },
    { day: "Mon Nov 2",  created: 43, resolved: 31 },
  ];

  const slaByPriority = [
    { priority: "P1 Critical", compliance: 89, target: 95, met: 8,   breached: 1 },
    { priority: "P2 High",     compliance: 93, target: 95, met: 28,  breached: 2 },
    { priority: "P3 Medium",   compliance: 96, target: 95, met: 142, breached: 6 },
    { priority: "P4 Low",      compliance: 98, target: 95, met: 98,  breached: 2 },
  ];

  const fcrData = [
    { month: "May", fcr: 68 }, { month: "Jun", fcr: 71 }, { month: "Jul", fcr: 74 },
    { month: "Aug", fcr: 72 }, { month: "Sep", fcr: 76 }, { month: "Oct", fcr: 73 }, { month: "Nov", fcr: 78 },
  ];

  const exportReport = () => {
    exportData({
      filename: `reports-analytics-${activeTab}`,
      title: `Reports & Analytics — ${activeTab}`,
      format: exportFormat,
      rows: MONTHLY_TRENDS.map(month => ({
        month: month.month,
        ticketsCreated: month.created,
        ticketsResolved: month.resolved,
        resolutionRatePercent: Math.round((month.resolved / month.created) * 100),
        slaBreached: month.slaBreached,
        csat: month.csat,
        mttrHours: month.mttr,
      })),
    });
    showToast(`${exportFormat} report downloaded`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Exportable insights, trends, and performance metrics</p>
        </div>
        <div className="grid w-full grid-cols-[auto_1fr_1fr] items-center gap-2 sm:flex sm:w-auto">
          <div className="relative">
            <select
              aria-label="Export format"
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as ExportFormat)}
              className="h-9 min-w-[82px] appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>PDF</option>
              <option>CSV</option>
              <option>Excel</option>
              <option>JSON</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          </div>
          <Btn size="sm" variant="secondary" className="w-full" onClick={exportReport}>Export</Btn>
          <Btn size="sm" variant="primary" className="w-full" onClick={() => setShowSchedule(true)}>Schedule</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["Overview", "SLA Compliance", "MTTR & FCR", "Team Performance", "Backlog Analysis", "Trend Comparison"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <StatCard label="Total Tickets (Nov)" value={43} sub="43 created, 31 resolved" color="blue" />
            <StatCard label="SLA Compliance" value="94.2%" sub="Above 90% target ✓" color="green" />
            <StatCard label="Avg MTTR" value="4.8h" sub="P1 avg: 3.2h" color="teal" />
            <StatCard label="CSAT Nov" value="4.5★" sub="Based on 28 surveys" color="amber" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card title="Daily Ticket Volume (Last 6 Days)">
              <div className="p-4 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="created"  fill="#3B82F6" name="Created"  radius={[3,3,0,0]} />
                    <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Category Breakdown">
              <div className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="h-44 w-full sm:w-[55%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={CATEGORY_BREAKDOWN} cx="50%" cy="50%" outerRadius={72} innerRadius={28} dataKey="count" nameKey="name" paddingAngle={2}>
                          {CATEGORY_BREAKDOWN.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [value + " tickets", name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex w-full flex-col gap-1.5 sm:w-[45%]">
                    {CATEGORY_BREAKDOWN.map((entry, i) => {
                      const total = CATEGORY_BREAKDOWN.reduce((s, c) => s + c.count, 0);
                      const pct   = Math.round((entry.count / total) * 100);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, background: entry.color, flexShrink: 0, display: "inline-block" }} />
                          <span style={{ fontSize: 12, color: "#374151", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#111827", flexShrink: 0 }}>{entry.count}</span>
                          <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0, width: 30, textAlign: "right" }}>{pct}%</span>
                        </div>
                      );
                    })}
                    <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 2, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>Total</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{CATEGORY_BREAKDOWN.reduce((s, c) => s + c.count, 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card title="6-Month Performance Summary">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Month", "Created", "Resolved", "SLA Breached", "CSAT", "MTTR (h)", "Compliance %"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MONTHLY_TRENDS.map(m => (
                    <tr key={m.month} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{m.month} 2026</td>
                      <td className="px-4 py-3 text-gray-700">{m.created}</td>
                      <td className="px-4 py-3 text-gray-700">{m.resolved}</td>
                      <td className="px-4 py-3"><span className={`font-semibold ${m.slaBreached > 10 ? "text-red-600" : "text-amber-600"}`}>{m.slaBreached}</span></td>
                      <td className="px-4 py-3"><span className={`font-semibold ${m.csat >= 4.5 ? "text-green-600" : "text-amber-600"}`}>{m.csat}★</span></td>
                      <td className="px-4 py-3 text-gray-700">{m.mttr}h</td>
                      <td className="px-4 py-3"><span className={`font-semibold ${((m.resolved / m.created) * 100) >= 90 ? "text-green-600" : "text-amber-600"}`}>{Math.round((m.resolved / m.created) * 100)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "SLA Compliance" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <Card title="SLA Compliance by Priority">
              <div className="p-4 space-y-4">
                {slaByPriority.map(s => (
                  <div key={s.priority}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{s.priority}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${s.compliance >= s.target ? "text-green-600" : "text-red-600"}`}>{s.compliance}%</span>
                        <span className="text-xs text-gray-400">target: {s.target}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${s.compliance >= s.target ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${s.compliance}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{s.met} met · {s.breached} breached</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="SLA Compliance Trend (6 months)">
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_TRENDS.map(m => ({ month: m.month, compliance: Math.round((m.resolved / m.created) * 100), target: 90 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="compliance" stroke="#3B82F6" strokeWidth={2.5} name="Actual" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Target (90%)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "MTTR & FCR" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="Mean Time to Resolve (MTTR) by Priority">
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { priority: "P1", actual: 3.2, target: 4   },
                  { priority: "P2", actual: 6.1, target: 8   },
                  { priority: "P3", actual: 42,  target: 72  },
                  { priority: "P4", actual: 89,  target: 120 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" fill="#3B82F6" name="Actual (h)"      radius={[3,3,0,0]} />
                  <Bar dataKey="target" fill="#E5E7EB" name="SLA Target (h)"  radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="First Contact Resolution Rate (%)">
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fcrData}>
                  <defs>
                    <linearGradient id="fcr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[60, 85]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="fcr" stroke="#8B5CF6" fill="url(#fcr)" strokeWidth={2.5} name="FCR %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Team Performance" && (
        <div className="space-y-5">
          <Card title="Technician Performance Comparison">
            <div className="p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TECHNICIANS.map(t => ({
                  name: t.name.split(" ")[0],
                  "CSAT ×20": Math.round(t.csat * 20),
                  "QA Score":   t.qaScore,
                  "SLA Comp.":  t.slaCompliance,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="CSAT ×20"  fill="#F59E0B" radius={[2,2,0,0]} />
                  <Bar dataKey="QA Score"   fill="#8B5CF6" radius={[2,2,0,0]} />
                  <Bar dataKey="SLA Comp."  fill="#10B981" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Technician Metrics Table">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Technician", "Role", "Resolved (Mo)", "CSAT", "QA Score", "SLA Comp.", "Reopen Rate", "Streak"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TECHNICIANS.sort((a, b) => b.csat - a.csat).map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                          <span className="font-medium text-gray-800">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{t.role}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{t.thisMonth}</td>
                      <td className="px-4 py-3"><span className={`font-bold ${t.csat >= 4.7 ? "text-green-600" : t.csat >= 4.3 ? "text-amber-600" : "text-red-600"}`}>{t.csat}★</span></td>
                      <td className="px-4 py-3"><span className={`font-bold ${t.qaScore >= 90 ? "text-green-600" : t.qaScore >= 80 ? "text-blue-600" : "text-red-600"}`}>{t.qaScore}%</span></td>
                      <td className="px-4 py-3"><span className={`font-bold ${t.slaCompliance >= 95 ? "text-green-600" : t.slaCompliance >= 88 ? "text-amber-600" : "text-red-600"}`}>{t.slaCompliance}%</span></td>
                      <td className="px-4 py-3"><span className={`font-bold ${t.reopenRate <= 1.5 ? "text-green-600" : t.reopenRate <= 3 ? "text-amber-600" : "text-red-600"}`}>{t.reopenRate}%</span></td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1 font-bold text-orange-600">🔥 {t.streak}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Backlog Analysis" && (
        <Card title="Backlog Age Distribution">
          <div className="p-5">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "0–1 days",          count: 28, color: "bg-green-100 text-green-700"  },
                { label: "1–3 days",          count: 9,  color: "bg-amber-100 text-amber-700"  },
                { label: "3–7 days",          count: 5,  color: "bg-orange-100 text-orange-700"},
                { label: "7+ days (Critical)", count: 2,  color: "bg-red-100 text-red-700"      },
              ].map(b => (
                <div key={b.label} className={`p-4 rounded-xl text-center ${b.color}`}>
                  <p className="text-3xl font-bold">{b.count}</p>
                  <p className="text-xs font-medium mt-1">{b.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-3">⚠ Tickets older than 3 days (action needed):</p>
            <div className="space-y-2">
              {BACKLOG_TICKETS.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <span className="text-xs font-mono text-red-600 font-bold">{t.id}</span>
                  <span className="text-sm text-gray-800 flex-1">{t.title}</span>
                  <span className="text-xs font-medium text-red-600">{t.age}</span>
                  <span className="text-xs text-gray-500">{t.tech}</span>
                  <Btn size="sm" variant="danger" onClick={() => { setEscalateNote(""); setEscalateTo("Team Lead"); setEscalateTicket(t); }}>Escalate</Btn>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "Trend Comparison" && (
        <div className="space-y-5">
          <Card title="Multi-metric 6-Month Trend">
            <div className="p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_TRENDS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[3.5, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left"  type="monotone" dataKey="created"     stroke="#3B82F6" strokeWidth={2} name="Tickets Created"  />
                  <Line yAxisId="left"  type="monotone" dataKey="resolved"    stroke="#10B981" strokeWidth={2} name="Tickets Resolved" />
                  <Line yAxisId="left"  type="monotone" dataKey="slaBreached" stroke="#EF4444" strokeWidth={2} name="SLA Breaches"     />
                  <Line yAxisId="right" type="monotone" dataKey="csat"        stroke="#F59E0B" strokeWidth={2} name="CSAT (right)"     />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}

      {/* Schedule Report */}
      {showSchedule && (
        <Modal title="📧 Schedule Report" onClose={() => setShowSchedule(false)}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", marginBottom: 16 }}>
            <Calendar style={{ width: 15, height: 15, color: "#2563eb", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8" }}>Scheduled reports are emailed automatically on your chosen cadence.</p>
          </div>
          <Field label="Report Type">
            <select style={selectStyle} value={schedForm.reportType} onChange={e => setSchedForm(f => ({ ...f, reportType: e.target.value }))}>
              {["Full Performance Report", "SLA Compliance Summary", "Team Performance", "Backlog Analysis", "Trend Comparison"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label="Format">
              <select style={selectStyle} value={schedForm.format} onChange={e => setSchedForm(f => ({ ...f, format: e.target.value }))}>
                {["PDF", "CSV", "Excel", "JSON"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Frequency">
              <select style={selectStyle} value={schedForm.frequency} onChange={e => setSchedForm(f => ({ ...f, frequency: e.target.value }))}>
                {["Daily", "Weekly", "Bi-weekly", "Monthly"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          {schedForm.frequency !== "Daily" && (
            <Field label="Send on">
              <select style={selectStyle} value={schedForm.day} onChange={e => setSchedForm(f => ({ ...f, day: e.target.value }))}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          )}
          <Field label="Time">
            <input type="time" style={inputStyle} value={schedForm.time} onChange={e => setSchedForm(f => ({ ...f, time: e.target.value }))} />
          </Field>
          <Field label="Recipients (comma-separated emails)">
            <input style={inputStyle} placeholder="e.g. manager@nexdesk.com, lead@nexdesk.com" value={schedForm.recipients} onChange={e => setSchedForm(f => ({ ...f, recipients: e.target.value }))} />
          </Field>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: 16, fontSize: 12, color: "#4b5563" }}>
            <strong>Preview:</strong> "{schedForm.reportType}" as {schedForm.format}, sent {schedForm.frequency.toLowerCase()}{schedForm.frequency !== "Daily" ? ` on ${schedForm.day}` : ""} at {schedForm.time}.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowSchedule(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setShowSchedule(false); showToast(`Report scheduled — first delivery ${schedForm.frequency === "Daily" ? "tomorrow" : `next ${schedForm.day}`} at ${schedForm.time}`); }}>Save Schedule</Btn>
          </div>
        </Modal>
      )}

      {/* Escalate Ticket */}
      {escalateTicket && (
        <Modal title={`Escalate Ticket — ${escalateTicket.id}`} onClose={() => setEscalateTicket(null)}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", marginBottom: 16 }}>
            <AlertTriangle style={{ width: 15, height: 15, color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#991b1b" }}>{escalateTicket.title}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "#b91c1c" }}>Age: {escalateTicket.age} · Priority: {escalateTicket.priority} · Assigned: {escalateTicket.tech}</p>
            </div>
          </div>
          <Field label="Escalate To">
            <select style={selectStyle} value={escalateTo} onChange={e => setEscalateTo(e.target.value)}>
              {["Team Lead", "IT Manager", "Tier 2 Support", "Tier 3 / Engineering", "External Vendor"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Reason / Notes">
            <textarea style={textareaStyle} placeholder="Explain why this ticket is being escalated…" value={escalateNote} onChange={e => setEscalateNote(e.target.value)} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setEscalateTicket(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { setEscalateTicket(null); showToast(`${escalateTicket.id} escalated to ${escalateTo}`); }}>Confirm Escalation</Btn>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 12, right: 12, left: 12, maxWidth: 420, marginLeft: "auto", zIndex: 99999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 10, background: "#059669", color: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle style={{ width: 15, height: 15 }} />
          {toast}
        </div>
      )}
    </div>
  );
}
