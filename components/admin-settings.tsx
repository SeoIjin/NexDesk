import { useState } from "react";
import { Card, Btn, Input, StatCard } from "./design-system";
import { SLA_POLICIES, AUDIT_LOG } from "./mock-data";
import { X, CheckCircle, AlertTriangle, Settings, Plug, PlugZap } from "lucide-react";
import { exportData } from "../src/utils/export-data";

// ── Modal shell ───────────────────────────────────────────────────────────────
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

const inputStyle: React.CSSProperties   = { width: "100%", padding: "8px 11px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" };
const selectStyle: React.CSSProperties  = { ...inputStyle, cursor: "pointer" };

// ── Integration configs ────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: "Slack",                  icon: "💬", desc: "Post ticket notifications, SLA alerts, and major incident banners to Slack channels.",           status: "Connected",    fields: [{ label: "Webhook URL", value: "https://hooks.slack.com/services/T00/B00/xxxx" }, { label: "Default Channel", value: "#it-alerts" }, { label: "Alert on SLA Breach", value: "true" }] },
  { name: "Microsoft Teams",        icon: "👥", desc: "Create Teams messages for ticket updates and on-call alerts.",                                     status: "Connected",    fields: [{ label: "Webhook URL", value: "https://outlook.office.com/webhook/xxxx" }, { label: "Notify on P1/P2", value: "true" }] },
  { name: "Email (SMTP/IMAP)",      icon: "📧", desc: "Email-to-ticket conversion, automated notifications, and CSAT surveys.",                          status: "Connected",    fields: [{ label: "SMTP Host", value: "smtp.acmecorp.com" }, { label: "Port", value: "587" }, { label: "From Address", value: "helpdesk@acmecorp.com" }] },
  { name: "Active Directory / SSO", icon: "🔐", desc: "Azure AD sync for user management, group-based auto-VIP detection, and SAML 2.0 SSO.",            status: "Connected",    fields: [{ label: "Tenant ID", value: "acme.onmicrosoft.com" }, { label: "SSO Mode", value: "SAML 2.0" }, { label: "Sync Interval", value: "Every 15 min" }] },
  { name: "Google Calendar",        icon: "📅", desc: "Sync on-call schedules and shift rotations with Google Calendar.",                                 status: "Disconnected", fields: [{ label: "Calendar ID", value: "" }, { label: "Sync Direction", value: "Two-way" }] },
  { name: "Jira / Azure DevOps",    icon: "🔗", desc: "Escalate tickets to dev teams by creating linked Jira issues.",                                   status: "Disconnected", fields: [{ label: "Jira URL", value: "" }, { label: "Project Key", value: "" }, { label: "API Token", value: "" }] },
  { name: "Twilio / SMS",           icon: "📱", desc: "SMS alerts for on-call technicians on P1 incidents after hours.",                                  status: "Connected",    fields: [{ label: "Account SID", value: "ACxxxxxxxxxxxx" }, { label: "From Number", value: "+1-555-0100" }, { label: "Trigger", value: "P1 after 18:00" }] },
  { name: "CrowdStrike EDR",        icon: "🛡", desc: "Pull security scan status into security tickets automatically.",                                   status: "Connected",    fields: [{ label: "API Base URL", value: "https://api.crowdstrike.com" }, { label: "Client ID", value: "cs_xxxxxxxxxxxx" }, { label: "Auto-isolate", value: "Enabled" }] },
];

const DEFAULT_WEIGHTS = [
  { factor: "Skill Match",                weight: 40, desc: "How well the technician's skills match the ticket category" },
  { factor: "Current Workload",           weight: 25, desc: "Inverse of current open ticket count and estimated hours" },
  { factor: "Availability / Shift",       weight: 20, desc: "Is the technician currently on shift and marked available?" },
  { factor: "Location Proximity",         weight: 10, desc: "Same building or floor as the requester" },
  { factor: "Past Performance (Category)", weight: 5, desc: "Historical CSAT and resolve rate for this ticket category" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("SLA Rules");
  const [slaEdit,   setSlaEdit]   = useState(false);
  const [toast, setToast]         = useState<string | null>(null);

  // Routing weights state
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS.map(f => ({ ...f })));

  // Integration modals
  const [configIntg,     setConfigIntg]     = useState<typeof INTEGRATIONS[0] | null>(null);
  const [disconnectIntg, setDisconnectIntg] = useState<typeof INTEGRATIONS[0] | null>(null);
  const [connectIntg,    setConnectIntg]    = useState<typeof INTEGRATIONS[0] | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
  const exportAuditLog = () => {
    exportData({
      filename: "audit-log",
      title: "NexDesk Audit Log",
      format: "CSV",
      rows: AUDIT_LOG.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        user: entry.user,
        action: entry.action,
        resource: entry.resource,
        detail: entry.detail,
        ipAddress: entry.ip,
      })),
    });
    showToast("Audit log downloaded");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500">Configure SLA rules, routing, roles, integrations, and system preferences</p>
        </div>
        <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">🔑 Admin Access Only</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["SLA Rules", "Routing Rules", "Roles & Permissions", "Integrations", "Audit Log", "System"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── SLA Rules ── */}
      {activeTab === "SLA Rules" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">SLA policies define response and resolution time targets per priority level.</p>
            <div className="flex gap-2">
              {slaEdit && (
                <Btn size="sm" variant="ghost" onClick={() => { setSlaEdit(false); showToast("Changes discarded"); }}>Discard</Btn>
              )}
              <Btn size="sm" variant="primary" onClick={() => {
                if (slaEdit) { showToast("SLA policies saved successfully"); }
                setSlaEdit(!slaEdit);
              }}>
                {slaEdit ? "💾 Save Changes" : "✏️ Edit Policies"}
              </Btn>
            </div>
          </div>
          {slaEdit && (
            <div style={{ padding: "10px 14px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
              ✏️ Edit mode active — modify values then click "Save Changes" to apply.
            </div>
          )}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Priority", "Response Time", "Resolve Time", "Escalate At", "Color", "Auto-Escalate Tier", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {SLA_POLICIES.map(p => (
                    <tr key={p.priority} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded font-bold text-sm ${
                          p.priority === "P1" ? "bg-red-100 text-red-700"    :
                          p.priority === "P2" ? "bg-orange-100 text-orange-700" :
                          p.priority === "P3" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{p.priority} {p.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {slaEdit ? (
                          <input defaultValue={p.responseMin} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" />
                        ) : (
                          <span className="font-medium text-gray-800">{p.responseMin < 60 ? `${p.responseMin} min` : `${p.responseMin / 60}h`}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {slaEdit ? (
                          <input defaultValue={p.resolveHours} className="w-20 border border-gray-300 rounded px-2 py-1 text-sm" />
                        ) : (
                          <span className="font-medium text-gray-800">{p.resolveHours < 24 ? `${p.resolveHours}h` : `${Math.floor(p.resolveHours / 24)} days`}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.escalateMin < 60 ? `${p.escalateMin} min` : `${p.escalateMin / 60}h`}</td>
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 rounded-full" style={{ background: p.color === "red" ? "#EF4444" : p.color === "orange" ? "#F97316" : p.color === "yellow" ? "#EAB308" : "#3B82F6" }} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">Tier 1 → 2 → 3 → Manager</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Escalation Rules">
            <div className="p-4 space-y-3">
              {[
                { trigger: "P1 not responded in 15 min",  action: "Page on-call technician + alert manager"          },
                { trigger: "P1 SLA at 75% elapsed",        action: "Auto-escalate to Tier 3"                          },
                { trigger: "P2 SLA at 80% elapsed",        action: "Auto-escalate to Tier 2"                          },
                { trigger: "P3 unassigned for 4h",         action: "Auto-assign via engine + alert dispatcher"        },
                { trigger: "Requester is VIP",             action: "Upgrade priority by 1 level, notify dispatcher"   },
                { trigger: "Affected users > 50",          action: "Trigger Major Incident mode"                      },
              ].map((r, i) => (
                <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 p-3 sm:flex-nowrap">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">IF: {r.trigger}</p>
                    <p className="text-xs text-blue-600">THEN: {r.action}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Active</span>
                  <Btn size="sm" variant="ghost" onClick={() => showToast(`Editing rule: "${r.trigger}"`)}>Edit</Btn>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Routing Rules ── */}
      {activeTab === "Routing Rules" && (
        <Card title="Auto-Assignment Routing Engine">
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">The AI auto-assignment engine scores technicians on the following factors. Adjust weights to tune dispatch behavior.</p>
            <div style={{ padding: "8px 12px", borderRadius: 8, background: totalWeight === 100 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${totalWeight === 100 ? "#bbf7d0" : "#fecaca"}`, fontSize: 12, color: totalWeight === 100 ? "#166534" : "#991b1b", marginBottom: 8 }}>
              Total weight: <strong>{totalWeight}%</strong> {totalWeight === 100 ? "✓ Valid — weights sum to 100%" : `⚠ Weights must sum to 100% (currently ${totalWeight > 100 ? "over" : "under"} by ${Math.abs(totalWeight - 100)}%)`}
            </div>
            <div className="space-y-4">
              {weights.map((f, idx) => (
                <div key={f.factor} className="flex items-center gap-4">
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-800">{f.factor}</p>
                    <p className="text-xs text-gray-400">{f.desc}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={60} value={f.weight}
                        onChange={e => setWeights(prev => prev.map((w, i) => i === idx ? { ...w, weight: Number(e.target.value) } : w))}
                        className="flex-1 accent-blue-600" />
                      <span className="text-sm font-bold text-blue-600 w-10 text-right">{f.weight}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Btn size="sm" variant="secondary" onClick={() => {
                setWeights(DEFAULT_WEIGHTS.map(f => ({ ...f })));
                showToast("Routing weights reset to defaults");
              }}>Reset Defaults</Btn>
              <Btn size="sm" variant="primary" onClick={() => {
                if (totalWeight !== 100) { showToast(`⚠ Weights must sum to 100% (currently ${totalWeight}%)`); return; }
                showToast("Routing weights saved successfully");
              }}>Save Weights</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* ── Roles & Permissions ── */}
      {activeTab === "Roles & Permissions" && (
        <Card title="Role-Based Access Control">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Permission</th>
                  {["Employee", "Technician", "Dispatcher", "IT Manager", "Admin"].map(r => (
                    <th key={r} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { perm: "Submit ticket",           employee: true,  tech: true,  dispatch: true,  manager: true,  admin: true  },
                  { perm: "View own tickets",         employee: true,  tech: true,  dispatch: true,  manager: true,  admin: true  },
                  { perm: "View all tickets",         employee: false, tech: true,  dispatch: true,  manager: true,  admin: true  },
                  { perm: "Assign/reassign tickets",  employee: false, tech: false, dispatch: true,  manager: true,  admin: true  },
                  { perm: "Resolve ticket",           employee: false, tech: true,  dispatch: true,  manager: true,  admin: true  },
                  { perm: "View security tickets",    employee: false, tech: false, dispatch: false, manager: true,  admin: true  },
                  { perm: "View analytics/reports",  employee: false, tech: false, dispatch: true,  manager: true,  admin: true  },
                  { perm: "Manage SLA rules",         employee: false, tech: false, dispatch: false, manager: false, admin: true  },
                  { perm: "User management",          employee: false, tech: false, dispatch: false, manager: false, admin: true  },
                  { perm: "Audit log access",         employee: false, tech: false, dispatch: false, manager: true,  admin: true  },
                ].map(p => (
                  <tr key={p.perm} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{p.perm}</td>
                    {[p.employee, p.tech, p.dispatch, p.manager, p.admin].map((allowed, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <span className={`text-lg ${allowed ? "text-green-500" : "text-gray-200"}`}>{allowed ? "✓" : "✕"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Integrations ── */}
      {activeTab === "Integrations" && (
        <div className="grid md:grid-cols-2 gap-4">
          {INTEGRATIONS.map(intg => (
            <Card key={intg.name}>
              <div className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {intg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{intg.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${intg.status === "Connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {intg.status === "Connected" ? "✓ " : ""}{intg.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{intg.desc}</p>
                  <div className="flex gap-2 mt-3">
                    {intg.status === "Connected" ? (
                      <>
                        <Btn size="sm" variant="secondary" onClick={() => setConfigIntg(intg)}>Configure</Btn>
                        <Btn size="sm" variant="ghost"     onClick={() => setDisconnectIntg(intg)}>Disconnect</Btn>
                      </>
                    ) : (
                      <Btn size="sm" variant="primary" onClick={() => setConnectIntg(intg)}>Connect</Btn>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Audit Log ── */}
      {activeTab === "Audit Log" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input placeholder="Filter by user, action, or resource..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Btn size="sm" variant="secondary" onClick={exportAuditLog}>📥 Export Log</Btn>
          </div>
          <Card title="Audit Trail">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Timestamp", "User", "Action", "Resource", "Detail", "IP Address"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {AUDIT_LOG.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{log.user}</td>
                      <td className="px-4 py-3 text-gray-600">{log.action}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{log.resource}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{log.detail}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── System ── */}
      {activeTab === "System" && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card title="General Settings">
            <div className="p-4 space-y-4">
              <Input label="Company Name"       value="Acme Corporation IT"      />
              <Input label="IT Support Email"   value="helpdesk@acmecorp.com"    />
              <Input label="Default Timezone"   value="America/New_York (EST)"   />
              {[
                { label: "Dark Mode",             sub: "Enable dark theme for all users",           on: true  },
                { label: "Multi-language Support", sub: "English, Spanish, French, German",          on: true  },
                { label: "WCAG AA Accessibility",  sub: "High contrast mode, screen reader support", on: true  },
              ].map(toggle => (
                <div key={toggle.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{toggle.label}</p>
                    <p className="text-xs text-gray-400">{toggle.sub}</p>
                  </div>
                  <div className={`w-12 h-6 ${toggle.on ? "bg-blue-600" : "bg-gray-300"} rounded-full relative cursor-pointer`}>
                    <div className={`absolute ${toggle.on ? "right-1" : "left-1"} top-1 w-4 h-4 bg-white rounded-full shadow`} />
                  </div>
                </div>
              ))}
              <Btn variant="primary" className="w-full justify-center" onClick={() => showToast("System settings saved")}>Save Settings</Btn>
            </div>
          </Card>

          <Card title="System Health">
            <div className="p-4 space-y-3">
              {[
                { service: "API Gateway (NestJS)",  status: "Healthy", uptime: "99.98%", latency: "42ms"   },
                { service: "MySQL Primary",          status: "Healthy", uptime: "99.99%", latency: "2ms"    },
                { service: "MySQL Read Replica",     status: "Healthy", uptime: "99.97%", latency: "4ms"    },
                { service: "Redis Cache",            status: "Healthy", uptime: "100%",   latency: "0.5ms"  },
                { service: "Job Queue Worker",       status: "Healthy", uptime: "99.95%", latency: "—"      },
                { service: "Meilisearch",            status: "Healthy", uptime: "99.9%",  latency: "15ms"   },
                { service: "Object Storage (S3)",    status: "Healthy", uptime: "99.99%", latency: "—"      },
                { service: "Last Backup",            status: "OK",      uptime: "Nov 2, 01:00 AM", latency: "—" },
              ].map(s => (
                <div key={s.service} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === "Healthy" || s.status === "OK" ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="flex-1 text-gray-700">{s.service}</span>
                  <span className="text-xs text-gray-400">{s.latency !== "—" ? s.latency : s.uptime}</span>
                  <span className={`text-xs font-medium ${s.status === "Healthy" || s.status === "OK" ? "text-green-600" : "text-red-600"}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}

      {/* Configure Integration */}
      {configIntg && (
        <Modal title={`⚙️ Configure — ${configIntg.name}`} onClose={() => setConfigIntg(null)}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>{configIntg.icon}</span>
            <p style={{ margin: 0, fontSize: 12, color: "#166534", fontWeight: 500 }}>{configIntg.name} is currently <strong>connected</strong>. Update settings below.</p>
          </div>
          {configIntg.fields.map(f => (
            <Field key={f.label} label={f.label}>
              <input style={inputStyle} defaultValue={f.value} placeholder={`Enter ${f.label.toLowerCase()}…`} />
            </Field>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setConfigIntg(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setConfigIntg(null); showToast(`${configIntg.name} configuration saved`); }}>Save Configuration</Btn>
          </div>
        </Modal>
      )}

      {/* Disconnect Integration */}
      {disconnectIntg && (
        <Modal title={`Disconnect — ${disconnectIntg.name}`} onClose={() => setDisconnectIntg(null)}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", marginBottom: 16 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#991b1b" }}>Confirm disconnection</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#b91c1c" }}>Disconnecting <strong>{disconnectIntg.name}</strong> will stop all automated notifications and syncs via this integration. This can be re-connected at any time.</p>
            </div>
          </div>
          <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{disconnectIntg.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{disconnectIntg.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{disconnectIntg.desc}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setDisconnectIntg(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { setDisconnectIntg(null); showToast(`${disconnectIntg.name} disconnected`); }}>Disconnect</Btn>
          </div>
        </Modal>
      )}

      {/* Connect Integration */}
      {connectIntg && (
        <Modal title={`Connect — ${connectIntg.name}`} onClose={() => setConnectIntg(null)}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>{connectIntg.icon}</span>
            <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8" }}>Fill in the credentials below to connect <strong>{connectIntg.name}</strong> to NexDesk.</p>
          </div>
          {connectIntg.fields.map(f => (
            <Field key={f.label} label={f.label}>
              <input style={inputStyle} placeholder={`Enter ${f.label.toLowerCase()}…`} />
            </Field>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setConnectIntg(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { setConnectIntg(null); showToast(`${connectIntg.name} connected successfully`); }}>Connect</Btn>
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
