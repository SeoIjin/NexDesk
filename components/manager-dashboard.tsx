import { useState } from "react";
import { Card, StatCard, Btn, PriorityBadge, StatusBadge, SLAChip, AIBadge, SectionHeader } from "./design-system";
import { TICKETS, MONTHLY_TRENDS, CATEGORY_BREAKDOWN, TECHNICIANS } from "./mock-data";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { X, CheckCircle, Bell, Users, AlertTriangle } from "lucide-react";
import { exportData } from "../src/utils/export-data";

// ── Period-aware data slices ─────────────────────────────────────────────────
const PERIOD_CONFIG = {
  "7d": {
    label: "Last 7 days",
    chartData: [
      { month: "Mon", created: 8,  resolved: 7,  slaBreached: 1, mttr: 4.9, csat: 4.4 },
      { month: "Tue", created: 6,  resolved: 8,  slaBreached: 0, mttr: 4.6, csat: 4.6 },
      { month: "Wed", created: 10, resolved: 9,  slaBreached: 2, mttr: 5.1, csat: 4.3 },
      { month: "Thu", created: 7,  resolved: 6,  slaBreached: 1, mttr: 4.8, csat: 4.5 },
      { month: "Fri", created: 9,  resolved: 8,  slaBreached: 1, mttr: 4.7, csat: 4.7 },
      { month: "Sat", created: 2,  resolved: 3,  slaBreached: 0, mttr: 3.9, csat: 4.8 },
      { month: "Sun", created: 1,  resolved: 2,  slaBreached: 0, mttr: 3.5, csat: 5.0 },
    ],
    open: 12, resolved: 43, breached: 2, slaComp: 95.1, mttr: 4.6, csat: 4.6, backlog: 3,
  },
  "30d": {
    label: "Last 30 days",
    chartData: MONTHLY_TRENDS.slice(-2),
    open: 28, resolved: 187, breached: 3, slaComp: 94.2, mttr: 4.8, csat: 4.5, backlog: 7,
  },
  "90d": {
    label: "Last 90 days",
    chartData: MONTHLY_TRENDS.slice(-3),
    open: 41, resolved: 521, breached: 11, slaComp: 93.1, mttr: 5.1, csat: 4.4, backlog: 14,
  },
  "6m": {
    label: "Last 6 months",
    chartData: MONTHLY_TRENDS,
    open: 28, resolved: 1043, breached: 19, slaComp: 92.7, mttr: 5.3, csat: 4.3, backlog: 22,
  },
} as const;

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto", margin: "0 16px" }}>
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

const inputStyle: React.CSSProperties    = { width: "100%", padding: "8px 11px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" };
const selectStyle: React.CSSProperties  = { ...inputStyle, cursor: "pointer" };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: 80 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function ManagerDashboard({ onViewTicket }: { onViewTicket: (id: string) => void }) {
  const [period, setPeriod]       = useState<keyof typeof PERIOD_CONFIG>("30d");
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMsg, setNotifyMsg]  = useState("⚡ MAJOR INCIDENT — VPN Outage is currently affecting 120 users. Our team is actively working on a fix. ETA: 30 minutes. Please avoid VPN usage until further notice.");
  const [notifyTarget, setNotifyTarget] = useState("All Users");
  const [notifyChannel, setNotifyChannel] = useState("Slack + Email");
  const [toast, setToast]         = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const cfg      = PERIOD_CONFIG[period];
  const atRisk   = TICKETS.filter(t => t.breachLikelihood > 50 && !t.slaResolve.breached).slice(0, 5);
  const exportManagerReport = () => {
    exportData({
      filename: `manager-dashboard-${period}`,
      title: `IT Manager Dashboard — ${cfg.label}`,
      format: "CSV",
      rows: cfg.chartData.map(point => ({
        period: point.month,
        created: point.created,
        resolved: point.resolved,
        slaBreached: point.slaBreached,
        mttrHours: point.mttr,
        csat: point.csat,
        openTickets: cfg.open,
        slaCompliancePercent: cfg.slaComp,
        backlog: cfg.backlog,
      })),
    });
    showToast(`${cfg.label} report downloaded`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IT Manager Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time operations overview · Monday, November 2, 2026</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {(["7d", "30d", "90d", "6m"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${period === p ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {p}
            </button>
          ))}
          <Btn size="sm" variant="secondary" className="ml-auto sm:ml-0" onClick={exportManagerReport}>📥 Export</Btn>
        </div>
      </div>

      {/* Period label */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
        Showing data for: <strong style={{ color: "#1e40af" }}>{cfg.label}</strong>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Open Tickets"   value={cfg.open}              sub="Active queue"          color="blue"   />
        <StatCard label="Resolved"        value={cfg.resolved}          sub={cfg.label}             color="green"  />
        <StatCard label="SLA Breached"    value={cfg.breached}          sub="tickets"               color="red"    />
        <StatCard label="SLA Compliance"  value={`${cfg.slaComp}%`}    sub="Compliance rate"       color="teal"   />
        <StatCard label="Avg MTTR"        value={`${cfg.mttr}h`}        sub="Mean time to resolve"  color="amber"  />
        <StatCard label="CSAT Score"      value={`${cfg.csat}★`}       sub={cfg.label}             color="purple" />
        <StatCard label="Backlog"         value={cfg.backlog}           sub="Tickets >3 days old"   color="red"    />
      </div>

      {/* Major Incident Alert */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl animate-pulse flex-shrink-0">⚡</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold">ACTIVE MAJOR INCIDENT — VPN Outage</p>
            <p className="text-red-100 text-sm mt-0.5">TKT-1001 · P1 Critical · 120 users affected · 45 min to SLA breach · Marcus Chen assigned</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button onClick={() => onViewTicket("TKT-1001")} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">View Incident</button>
          <button onClick={() => setShowNotify(true)} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">📢 Notify All</button>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" title={`Ticket Volume & SLA Trend (${cfg.label})`}>
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cfg.chartData}>
                <defs>
                  <linearGradient id="cCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="cResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="created"  stroke="#3B82F6" fill="url(#cCreated)"  name="Created"  strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" fill="url(#cResolved)" name="Resolved" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="By Category">
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_BREAKDOWN} cx="50%" cy="45%" outerRadius={70} dataKey="count" nameKey="name">
                  {CATEGORY_BREAKDOWN.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title={`MTTR Trend (${cfg.label})`}>
          <div className="p-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cfg.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[3, 7]} />
                <Tooltip />
                <Line type="monotone" dataKey="mttr" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} name="MTTR (h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={`CSAT Trend (${cfg.label})`}>
          <div className="p-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cfg.chartData}>
                <defs>
                  <linearGradient id="cCSAT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[3.5, 5]} />
                <Tooltip />
                <Area type="monotone" dataKey="csat" stroke="#F59E0B" fill="url(#cCSAT)" name="CSAT" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={`SLA Breaches (${cfg.label})`}>
          <div className="p-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cfg.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="slaBreached" fill="#EF4444" name="Breaches" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="At-Risk Tickets">
          <div className="divide-y divide-gray-50">
            {atRisk.map(t => (
              <div key={t.id} onClick={() => onViewTicket(t.id)}
                className="px-4 py-3 hover:bg-red-50 cursor-pointer flex items-center gap-3 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-blue-600 font-bold">{t.id}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="text-sm text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.assigneeName || "Unassigned"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Technician Performance Snapshot">
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TECHNICIANS.map(t => ({ name: t.name.split(" ")[0], csat: t.csat, sla: t.slaCompliance / 25, qa: t.qaScore / 25 }))} margin={{ top: 5, right: 5, bottom: 45, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, angle: -35, textAnchor: "end" }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Bar dataKey="csat" fill="#3B82F6" name="CSAT (×5)"       radius={[2,2,0,0]} />
                <Bar dataKey="sla"  fill="#10B981" name="SLA Comp (÷25)"  radius={[2,2,0,0]} />
                <Bar dataKey="qa"   fill="#8B5CF6" name="QA Score (÷25)"  radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Notify All Modal ── */}
      {showNotify && (
        <Modal title="📢 Broadcast Notification" onClose={() => setShowNotify(false)}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", marginBottom: 16 }}>
            <AlertTriangle style={{ width: 15, height: 15, color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#991b1b" }}>This will immediately broadcast a message to the selected audience across the chosen channels.</p>
          </div>
          <Field label="Incident / Subject">
            <input style={inputStyle} defaultValue="⚡ ACTIVE MAJOR INCIDENT — VPN Outage" />
          </Field>
          <Field label="Message">
            <textarea style={textareaStyle} value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label="Target Audience">
              <select style={selectStyle} value={notifyTarget} onChange={e => setNotifyTarget(e.target.value)}>
                {["All Users", "Affected Department", "IT Team Only", "VIP Users", "All Technicians"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Channels">
              <select style={selectStyle} value={notifyChannel} onChange={e => setNotifyChannel(e.target.value)}>
                {["Slack + Email", "Email Only", "Slack Only", "SMS + Email", "All Channels"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: 16, fontSize: 12, color: "#4b5563" }}>
            <strong>Preview:</strong> Sending to <strong>{notifyTarget}</strong> via <strong>{notifyChannel}</strong>.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowNotify(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setShowNotify(false); showToast(`Notification broadcast to ${notifyTarget} via ${notifyChannel}`); }}>📢 Send Now</Btn>
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
