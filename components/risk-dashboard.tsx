import { useState } from "react";
import { Card, Btn, PriorityBadge, StatusBadge, SLAChip, AIBadge, RiskBadge, SectionHeader, InnovationCallout } from "./design-system";
import { TICKETS, RISK_ITEMS, TECHNICIANS } from "./mock-data";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { X, AlertTriangle, CheckCircle, Link, RefreshCw, ChevronDown } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Problem {
  id: string;
  title: string;
  linkedTickets: number;
  status: string;
  rootCause: string;
  permanentFix: string;
  owner: string;
}

interface RiskItem {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  owner: string;
  status: string;
  mitigation: string;
}

// ── Static data ──────────────────────────────────────────────────────────────
const PROBLEMS: Problem[] = [
  { id: "PRB-001", title: "Recurring VPN authentication failures",             linkedTickets: 8, status: "Investigating",   rootCause: "RADIUS certificate nearing expiry, not monitored",            permanentFix: "Implement automated cert renewal via ACME protocol",                owner: "Marcus Chen" },
  { id: "PRB-002", title: "Office PCs intermittently failing to wake from sleep", linkedTickets: 5, status: "Known Error",  rootCause: "Windows 11 22H2 power management regression",                   permanentFix: "Apply Microsoft hotfix KB5033375, GPO change for wake timers",       owner: "Jordan Kim"  },
  { id: "PRB-003", title: "Outlook sync failures after Exchange update",        linkedTickets: 4, status: "Fix in Progress", rootCause: "Exchange throttling policy too aggressive for large mailboxes", permanentFix: "Update throttling policy and rebuild affected OST files",            owner: "Sam Torres"  },
];

const PROBLEM_STATUSES = ["Investigating", "Known Error", "Fix in Progress", "Resolved", "Closed"];

const RISK_CATEGORIES = ["Network", "Hardware", "Software", "Security", "Process", "Vendor", "People"];
const RISK_STATUSES   = ["Open", "Mitigating", "Closed"];

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", margin: "0 16px" }}>
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

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 11px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" };
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 36 };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: 72 };

function SelectControl({ value, onChange, children }: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select style={selectStyle} value={value} onChange={e => onChange(e.target.value)}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        style={{ position: "absolute", top: "50%", right: 12, width: 16, height: 16, color: "#4b5563", pointerEvents: "none", transform: "translateY(-50%)" }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function RiskDashboard({ onViewTicket }: { onViewTicket: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState("Overview");

  // ── Modal states ─────────────────────────────────────────────────────────
  const [showNewRisk,    setShowNewRisk]    = useState(false);
  const [showNewProblem, setShowNewProblem] = useState(false);
  const [editRisk,       setEditRisk]       = useState<RiskItem | null>(null);
  const [closeRisk,      setCloseRisk]      = useState<RiskItem | null>(null);
  const [viewLinked,     setViewLinked]     = useState<Problem | null>(null);
  const [updateStatus,   setUpdateStatus]   = useState<Problem | null>(null);

  // ── Form states: New Risk ─────────────────────────────────────────────────
  const [riskForm, setRiskForm] = useState({ title: "", category: "Network", likelihood: "3", impact: "3", owner: "", mitigation: "" });

  // ── Form states: New Problem ──────────────────────────────────────────────
  const [probForm, setProbForm] = useState({ title: "", rootCause: "", permanentFix: "", owner: "", status: "Investigating" });

  // ── Form states: Edit Risk ────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({ title: "", category: "", likelihood: "3", impact: "3", owner: "", status: "Open", mitigation: "" });

  // ── Form states: Update Status ────────────────────────────────────────────
  const [newStatus,  setNewStatus]  = useState("");
  const [statusNote, setStatusNote] = useState("");

  // ── Saved toasts ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const riskMatrix = RISK_ITEMS.map(r => ({
    x: r.likelihood, y: r.impact, id: r.id, title: r.title, score: r.score,
    color: r.score >= 15 ? "#EF4444" : r.score >= 9 ? "#F59E0B" : "#10B981"
  }));

  const breachedTickets = TICKETS.filter(t => t.slaResolve.breached || t.breachLikelihood > 60);
  const hotspots = [
    { type: "Asset",    name: "NET-SWI-042 (Cisco Catalyst)",  tickets: 8, trend: "↑ +3 this week"        },
    { type: "Location", name: "Building B, Server Room",        tickets: 5, trend: "↑ Recurring"           },
    { type: "Software", name: "Windows 11 22H2",                tickets: 5, trend: "Known regression"      },
    { type: "Category", name: "Network (VPN)",                  tickets: 4, trend: "Major incident active" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk & Problem Management</h1>
          <p className="text-sm text-gray-500">Proactive risk detection, root-cause analysis, and mitigation tracking</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Btn size="sm" variant="secondary" className="w-full" onClick={() => setShowNewRisk(true)}>+ New Risk</Btn>
          <Btn size="sm" variant="secondary" className="w-full" onClick={() => setShowNewProblem(true)}>+ Problem</Btn>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["Overview", "Risk Register", "Problem Records", "Hotspots", "Security"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "Security" ? "🔒 Security" : t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "Overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="Risk Matrix (Likelihood × Impact)">
            <div className="p-4">
              <div className="h-64 relative">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                  <div className="bg-amber-50 border border-amber-100 rounded-tl" />
                  <div className="bg-red-50 border border-red-100 rounded-tr" />
                  <div className="bg-green-50 border border-green-100 rounded-bl" />
                  <div className="bg-amber-50 border border-amber-100 rounded-br" />
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 28, left: 28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="x" type="number" domain={[0, 6]} label={{ value: "Likelihood →", position: "insideBottom", offset: -8, fontSize: 10 }} tick={{ fontSize: 9 }} />
                    <YAxis dataKey="y" type="number" domain={[0, 6]} label={{ value: "Impact ↑", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }} tick={{ fontSize: 9 }} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs max-w-48">
                            <p className="font-semibold text-gray-800">{d.id}</p>
                            <p className="text-gray-600">{d.title}</p>
                            <p className="text-gray-500">Score: {d.score}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Scatter data={riskMatrix} name="Risks">
                      {riskMatrix.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:gap-4">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Critical (≥15)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"/>High (9–14)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>Medium (&lt;9)</span>
              </div>
            </div>
          </Card>

          <Card title="Tickets at Risk of SLA Breach" action={<AIBadge label="Predictive" />}>
            <div className="divide-y divide-gray-50">
              {breachedTickets.slice(0, 6).map(t => (
                <div key={t.id} onClick={() => onViewTicket(t.id)}
                  className="flex cursor-pointer flex-col gap-2 px-4 py-3 transition-colors hover:bg-red-50 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-blue-600 font-bold">{t.id}</span>
                      <PriorityBadge priority={t.priority} />
                      {t.slaResolve.breached && <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs rounded font-bold">BREACHED</span>}
                    </div>
                    <p className="text-sm text-gray-800 truncate">{t.title}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center justify-between gap-2 text-left sm:block sm:text-right">
                    <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} />
                    <p className="text-xs text-gray-400 mt-0.5">{t.assigneeName || "Unassigned"}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recurring Problem Hotspots">
            <div className="p-4 space-y-3">
              {hotspots.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${i === 0 ? "bg-red-100" : i === 1 ? "bg-orange-100" : "bg-amber-100"}`}>
                    {i === 0 ? "🖥" : i === 1 ? "📍" : i === 2 ? "💿" : "🌐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{h.name}</p>
                    <p className="text-xs text-gray-500">{h.type} · {h.trend}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-orange-600">{h.tickets}</p>
                    <p className="text-xs text-gray-400">tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Single Points of Failure">
            <div className="p-4 space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-red-800">🔒 Security Analysis</p>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-bold">CRITICAL</span>
                </div>
                <p className="text-xs text-red-600">Only <strong>Lena Novak</strong> has Security expertise ≥90. If unavailable, no Tier 3 security response.</p>
                <p className="text-xs text-red-500 mt-1">Mitigation: Cross-train Robin Walsh (currently 92% Security, progressing)</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-amber-800">🔧 Hardware Repair (Tier 3)</p>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-bold">HIGH</span>
                </div>
                <p className="text-xs text-amber-700">Jordan Kim is the only Hardware specialist at ≥95. On sick leave today.</p>
                <p className="text-xs text-amber-600 mt-1">Mitigation: Auto-fallback to Robin Walsh for P1/P2 hardware</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-green-800">🌐 Network (Covered)</p>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-bold">OK</span>
                </div>
                <p className="text-xs text-green-700">Marcus Chen (98%) + Robin Walsh (90%). Two qualified network techs.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Risk Register ── */}
      {activeTab === "Risk Register" && (
        <Card title="Risk Register">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Risk ID", "Title", "Category", "Likelihood", "Impact", "Score", "Owner", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                  <th className="pl-4 pr-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RISK_ITEMS.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-blue-600 font-bold">{r.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.mitigation}</p>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{r.category}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded-sm ${i < r.likelihood ? "bg-orange-400" : "bg-gray-200"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded-sm ${i < r.impact ? "bg-red-400" : "bg-gray-200"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><RiskBadge score={r.score} /></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.owner}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === "Open" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="pl-4 pr-6 py-3">
                      <div className="flex gap-1 whitespace-nowrap">
                        <Btn size="sm" variant="secondary" onClick={() => {
                          setEditForm({ title: r.title, category: r.category, likelihood: String(r.likelihood), impact: String(r.impact), owner: r.owner, status: r.status, mitigation: r.mitigation });
                          setEditRisk(r as any);
                        }}>Edit</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setCloseRisk(r as any)}>Close</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Problem Records ── */}
      {activeTab === "Problem Records" && (
        <div className="space-y-4">
          {PROBLEMS.map(p => (
            <Card key={p.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-purple-600 font-bold">{p.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === "Investigating"   ? "bg-blue-100 text-blue-700"   :
                        p.status === "Known Error"     ? "bg-amber-100 text-amber-700" :
                        "bg-teal-100 text-teal-700"
                      }`}>{p.status}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-orange-500">{p.linkedTickets}</p>
                    <p className="text-xs text-gray-400">linked incidents</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-1">🔍 Root Cause</p>
                    <p className="text-sm text-red-600">{p.rootCause}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-semibold text-green-700 mb-1">🔧 Permanent Fix</p>
                    <p className="text-sm text-green-600">{p.permanentFix}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Owner: <strong>{p.owner}</strong></p>
                  <div className="flex gap-2">
                    <Btn size="sm" variant="secondary" onClick={() => setViewLinked(p)}>View Linked Tickets</Btn>
                    <Btn size="sm" variant="primary" onClick={() => { setNewStatus(p.status); setStatusNote(""); setUpdateStatus(p); }}>Update Status</Btn>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Hotspots ── */}
      {activeTab === "Hotspots" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="Asset Hotspots (Most Tickets)">
            <div className="p-4 space-y-3">
              {[
                { asset: "NET-SWI-042", desc: "Cisco Catalyst 9200 — Server Room B",     tickets: 8, lastSeen: "Today"      },
                { asset: "WIN-PC-0033", desc: "Dell OptiPlex — Linda Chang, Finance",     tickets: 4, lastSeen: "2 days ago" },
                { asset: "PRN-HP-0021", desc: "HP LaserJet Pro — Building A Floor 2",     tickets: 5, lastSeen: "Today"      },
                { asset: "AP-CONFB-001", desc: "Cisco AP — Conference Room B",            tickets: 3, lastSeen: "Yesterday"  },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${i === 0 ? "bg-red-100" : "bg-orange-100"}`}>
                    {i === 0 ? "🌐" : i === 2 ? "🖨" : "💻"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-bold text-gray-800">{a.asset}</p>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                    <p className="text-xs text-gray-400">Last: {a.lastSeen}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-500">{a.tickets}</p>
                    <p className="text-xs text-gray-400">tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Location Hotspots">
            <div className="p-4 space-y-3">
              {[
                { location: "Building B, Server Room", tickets: 10, category: "Network/Infrastructure" },
                { location: "Building A, Floor 2",     tickets: 7,  category: "Hardware/Printer"       },
                { location: "Building C, Floor 1",     tickets: 5,  category: "Software"               },
                { location: "Remote/Mobile",            tickets: 4,  category: "VPN/Access"             },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📍</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{l.location}</p>
                    <p className="text-xs text-gray-400">{l.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-500">{l.tickets}</p>
                    <p className="text-xs text-gray-400">tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Security ── */}
      {activeTab === "Security" && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-bold text-red-800">Security Incident Track — Restricted Access</p>
                <p className="text-sm text-red-600">Only Security team and IT Manager can view this section</p>
              </div>
            </div>
          </div>
          <Card title="Active Security Incidents">
            <div className="p-4 space-y-3">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-red-700 font-bold">TKT-1004</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-bold">🔒 SEC · P1</span>
                  </div>
                  <StatusBadge status="In Progress" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Suspected phishing email with malicious attachment</p>
                <p className="text-xs text-gray-600 mt-1">Robert Lee, HR Dept · WIN-PC-0056 isolated · Lena Novak investigating</p>
                <div className="mt-3 p-2 bg-white rounded border border-red-100 text-xs">
                  <p className="font-semibold text-gray-700">Actions taken:</p>
                  <ul className="text-gray-600 mt-1 space-y-0.5">
                    <li>✓ Machine isolated from network at 09:05 AM</li>
                    <li>✓ CrowdStrike scan initiated — results in 20 min</li>
                    <li>⏳ Memory dump in progress</li>
                    <li>⏳ Email headers analyzed — phishing campaign origin</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
          <InnovationCallout
            title="Security Incident Restricted Track"
            description="Phishing, malware, and data-loss tickets are automatically flagged and restricted to authorized personnel only. Full audit trail maintained for compliance."
            icon="🔒"
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════ */}

      {/* ── New Risk Item ── */}
      {showNewRisk && (
        <Modal title="+ New Risk Item" onClose={() => setShowNewRisk(false)}>
          <Field label="Risk Title">
            <input style={inputStyle} placeholder="e.g. Single firewall SPOF" value={riskForm.title} onChange={e => setRiskForm(f => ({ ...f, title: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label="Category">
              <SelectControl value={riskForm.category} onChange={category => setRiskForm(f => ({ ...f, category }))}>
                {RISK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </SelectControl>
            </Field>
            <Field label="Owner">
              <input style={inputStyle} placeholder="Assignee name" value={riskForm.owner} onChange={e => setRiskForm(f => ({ ...f, owner: e.target.value }))} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label={`Likelihood: ${riskForm.likelihood}/5`}>
              <input type="range" min={1} max={5} value={riskForm.likelihood} onChange={e => setRiskForm(f => ({ ...f, likelihood: e.target.value }))} style={{ width: "100%", accentColor: "#f59e0b" }} />
            </Field>
            <Field label={`Impact: ${riskForm.impact}/5`}>
              <input type="range" min={1} max={5} value={riskForm.impact} onChange={e => setRiskForm(f => ({ ...f, impact: e.target.value }))} style={{ width: "100%", accentColor: "#ef4444" }} />
            </Field>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fef9c3", border: "1px solid #fde047", marginBottom: 14, fontSize: 13, color: "#713f12" }}>
            Risk Score: <strong>{Number(riskForm.likelihood) * Number(riskForm.impact)}</strong> — {Number(riskForm.likelihood) * Number(riskForm.impact) >= 15 ? "🔴 Critical" : Number(riskForm.likelihood) * Number(riskForm.impact) >= 9 ? "🟡 High" : "🟢 Medium"}
          </div>
          <Field label="Mitigation Plan">
            <textarea style={textareaStyle} placeholder="Describe the mitigation strategy…" value={riskForm.mitigation} onChange={e => setRiskForm(f => ({ ...f, mitigation: e.target.value }))} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setShowNewRisk(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setShowNewRisk(false); showToast("Risk item created successfully"); setRiskForm({ title: "", category: "Network", likelihood: "3", impact: "3", owner: "", mitigation: "" }); }}>Create Risk Item</Btn>
          </div>
        </Modal>
      )}

      {/* ── New Problem Record ── */}
      {showNewProblem && (
        <Modal title="+ New Problem Record" onClose={() => setShowNewProblem(false)}>
          <Field label="Problem Title">
            <input style={inputStyle} placeholder="e.g. Recurring login failures on VDI" value={probForm.title} onChange={e => setProbForm(f => ({ ...f, title: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label="Initial Status">
              <SelectControl value={probForm.status} onChange={status => setProbForm(f => ({ ...f, status }))}>
                {PROBLEM_STATUSES.map(s => <option key={s}>{s}</option>)}
              </SelectControl>
            </Field>
            <Field label="Owner">
              <input style={inputStyle} placeholder="Assignee name" value={probForm.owner} onChange={e => setProbForm(f => ({ ...f, owner: e.target.value }))} />
            </Field>
          </div>
          <Field label="Root Cause Analysis">
            <textarea style={textareaStyle} placeholder="Describe the identified root cause…" value={probForm.rootCause} onChange={e => setProbForm(f => ({ ...f, rootCause: e.target.value }))} />
          </Field>
          <Field label="Permanent Fix / Workaround">
            <textarea style={textareaStyle} placeholder="Describe the permanent fix or workaround…" value={probForm.permanentFix} onChange={e => setProbForm(f => ({ ...f, permanentFix: e.target.value }))} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setShowNewProblem(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setShowNewProblem(false); showToast("Problem record created successfully"); setProbForm({ title: "", rootCause: "", permanentFix: "", owner: "", status: "Investigating" }); }}>Create Problem Record</Btn>
          </div>
        </Modal>
      )}

      {/* ── Edit Risk ── */}
      {editRisk && (
        <Modal title={`Edit Risk — ${editRisk.id}`} onClose={() => setEditRisk(null)}>
          <Field label="Risk Title">
            <input style={inputStyle} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label="Category">
              <SelectControl value={editForm.category} onChange={category => setEditForm(f => ({ ...f, category }))}>
                {RISK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </SelectControl>
            </Field>
            <Field label="Status">
              <SelectControl value={editForm.status} onChange={status => setEditForm(f => ({ ...f, status }))}>
                {RISK_STATUSES.map(s => <option key={s}>{s}</option>)}
              </SelectControl>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
            <Field label={`Likelihood: ${editForm.likelihood}/5`}>
              <input type="range" min={1} max={5} value={editForm.likelihood} onChange={e => setEditForm(f => ({ ...f, likelihood: e.target.value }))} style={{ width: "100%", accentColor: "#f59e0b" }} />
            </Field>
            <Field label={`Impact: ${editForm.impact}/5`}>
              <input type="range" min={1} max={5} value={editForm.impact} onChange={e => setEditForm(f => ({ ...f, impact: e.target.value }))} style={{ width: "100%", accentColor: "#ef4444" }} />
            </Field>
          </div>
          <Field label="Owner">
            <input style={inputStyle} value={editForm.owner} onChange={e => setEditForm(f => ({ ...f, owner: e.target.value }))} />
          </Field>
          <Field label="Mitigation Plan">
            <textarea style={textareaStyle} value={editForm.mitigation} onChange={e => setEditForm(f => ({ ...f, mitigation: e.target.value }))} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setEditRisk(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setEditRisk(null); showToast(`Risk ${editRisk.id} updated`); }}>Save Changes</Btn>
          </div>
        </Modal>
      )}

      {/* ── Close Risk Confirmation ── */}
      {closeRisk && (
        <Modal title={`Close Risk — ${closeRisk.id}`} onClose={() => setCloseRisk(null)}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", marginBottom: 16 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#991b1b" }}>Confirm risk closure</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#b91c1c" }}>This will mark <strong>{closeRisk.id}</strong> as Closed and archive it from the active register.</p>
            </div>
          </div>
          <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{closeRisk.title}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Score: {closeRisk.score} · Owner: {closeRisk.owner}</p>
          </div>
          <Field label="Closure Notes (optional)">
            <textarea style={textareaStyle} placeholder="Why is this risk being closed? What resolved it?" />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setCloseRisk(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setCloseRisk(null); showToast(`Risk ${closeRisk.id} closed successfully`); }}>Confirm Close</Btn>
          </div>
        </Modal>
      )}

      {/* ── View Linked Tickets ── */}
      {viewLinked && (
        <Modal title={`Linked Tickets — ${viewLinked.id}`} onClose={() => setViewLinked(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f5f3ff", borderRadius: 10, border: "1px solid #e9d5ff", marginBottom: 16 }}>
            <Link style={{ width: 15, height: 15, color: "#7c3aed" }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#5b21b6" }}>{viewLinked.title}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#7c3aed" }}>{viewLinked.linkedTickets} linked incidents · Owner: {viewLinked.owner}</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TICKETS.filter((_, i) => i < viewLinked.linkedTickets).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }}
                onClick={() => { setViewLinked(null); onViewTicket(t.id); }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#eff6ff"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>{t.id}</span>
                <p style={{ margin: 0, fontSize: 12, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setViewLinked(null)}>Close</Btn>
          </div>
        </Modal>
      )}

      {/* ── Update Status ── */}
      {updateStatus && (
        <Modal title={`Update Status — ${updateStatus.id}`} onClose={() => setUpdateStatus(null)}>
          <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{updateStatus.title}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Owner: {updateStatus.owner}</p>
          </div>
          <Field label="Current Status">
            <div style={{ padding: "7px 11px", borderRadius: 8, background: "#f3f4f6", fontSize: 13, color: "#6b7280", border: "1px solid #e5e7eb" }}>{updateStatus.status}</div>
          </Field>
          <Field label="New Status">
            <SelectControl value={newStatus} onChange={setNewStatus}>
              {PROBLEM_STATUSES.map(s => <option key={s}>{s}</option>)}
            </SelectControl>
          </Field>
          <Field label="Update Notes">
            <textarea style={textareaStyle} placeholder="Describe what changed or what actions were taken…" value={statusNote} onChange={e => setStatusNote(e.target.value)} />
          </Field>
          {newStatus === "Resolved" && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", marginBottom: 14 }}>
              <CheckCircle style={{ width: 15, height: 15, color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 12, color: "#15803d" }}>Marking as Resolved will notify all {updateStatus.linkedTickets} linked ticket owners and update their records.</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setUpdateStatus(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setUpdateStatus(null); showToast(`${updateStatus.id} status updated to "${newStatus}"`); }}>Save Status</Btn>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 12, right: 12, left: 12, maxWidth: 420, marginLeft: "auto", zIndex: 99999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 10, background: "#059669", color: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle style={{ width: 15, height: 15 }} />
          {toast}
        </div>
      )}
    </div>
  );
}
