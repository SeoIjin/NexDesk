import { useState } from "react";
import { Card, StatCard, Btn, PriorityBadge, StatusBadge, SLAChip, Avatar, AIBadge, ProgressBar } from "./design-system";
import { TICKETS, TECHNICIANS } from "./mock-data";

// ── helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_ORDER: Record<string, number> = { P1: 0, P2: 1, P3: 2, P4: 3 };

export function TechnicianWorkspace({ onViewTicket }: { onViewTicket: (id: string) => void }) {
  const tech = TECHNICIANS[0];
  const myTickets = TICKETS.filter(t => t.assignee === tech.id);
  const [activeTab, setActiveTab]       = useState("Queue");
  const [sortBy, setSortBy]             = useState("Priority");
  const [showFilter, setShowFilter]     = useState(false);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterStatus, setFilterStatus]     = useState<string[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [logHours, setLogHours]         = useState("");
  const [logNote, setLogNote]           = useState("");
  const [logTicket, setLogTicket]       = useState("TKT-1001");
  const [logEntries, setLogEntries]     = useState([
    { ticket: "TKT-1001", hours: 1.5, note: "Diagnosing VPN concentrator", time: "09:30 AM" },
    { ticket: "TKT-1011", hours: 0.5, note: "Checked power settings, scheduled callback", time: "Yesterday 02:00 PM" },
  ]);
  const [actNowToast, setActNowToast] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // ── sorting ───────────────────────────────────────────────────────────────
  const sortedTickets = [...myTickets]
    .filter(t => {
      const okPriority = filterPriority.length === 0 || filterPriority.includes(t.priority);
      const okStatus   = filterStatus.length   === 0 || filterStatus.includes(t.status);
      return okPriority && okStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Priority") return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      if (sortBy === "SLA Due")  return a.slaResolve.remaining - b.slaResolve.remaining;
      if (sortBy === "Created")  return a.id.localeCompare(b.id);
      return 0;
    });

  // ── log submit ────────────────────────────────────────────────────────────
  const handleLog = () => {
    if (!logHours || parseFloat(logHours) <= 0) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setLogEntries(prev => [{ ticket: logTicket, hours: parseFloat(logHours), note: logNote || "—", time: now }, ...prev]);
    setLogHours("");
    setLogNote("");
  };

  const totalLoggedHours = logEntries.reduce((s, e) => s + e.hours, 0);

  // ── act now ───────────────────────────────────────────────────────────────
  const handleActNow = (id: string) => {
    setActNowToast(`Opening ${id}…`);
    setTimeout(() => { setActNowToast(null); onViewTicket(id); }, 600);
  };

  // ── toggle filter helpers ─────────────────────────────────────────────────
  const togglePriority = (p: string) =>
    setFilterPriority(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleStatus = (s: string) =>
    setFilterStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const SCHEDULE = [
    { time: "09:00", title: "Team Stand-up", type: "meeting", duration: "15m" },
    { time: "09:30", title: "TKT-1004 — Phishing response", type: "ticket", duration: "1h" },
    { time: "11:00", title: "TKT-1020 — Teams calling issue", type: "ticket", duration: "45m" },
    { time: "13:00", title: "Lunch break", type: "break", duration: "1h" },
    { time: "14:00", title: "TKT-1028 — Screen brightness", type: "ticket", duration: "30m" },
    { time: "15:00", title: "Knowledge Base review", type: "task", duration: "30m" },
    { time: "16:00", title: "QA documentation", type: "task", duration: "1h" },
  ];

  const NOTIFICATIONS = [
    { id: 1, icon: "🚨", title: "SLA breach imminent", body: "TKT-1020 breaches in 20 minutes.", time: "2m ago",  unread: true  },
    { id: 2, icon: "💬", title: "New comment on TKT-1004", body: "Robert Lee: 'Still experiencing issues…'", time: "14m ago", unread: true  },
    { id: 3, icon: "📋", title: "Ticket assigned to you", body: "TKT-1031 assigned by Lena Novak.", time: "1h ago",  unread: true  },
    { id: 4, icon: "✅", title: "TKT-1003 resolved", body: "You resolved this ticket successfully.", time: "3h ago",  unread: false },
    { id: 5, icon: "🏆", title: "Badge earned!", body: "You earned the 'Speed Demon' badge.", time: "Yesterday",   unread: false },
  ];
  const [readNotifs, setReadNotifs] = useState<number[]>([]);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread && !readNotifs.includes(n.id)).length;

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">

      {/* ── Act Now toast ── */}
      {actNowToast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: "#1e40af", color: "white", borderRadius: 10, padding: "10px 22px",
          fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", pointerEvents: "none" }}>
          {actNowToast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white sm:h-12 sm:w-12 sm:text-lg">AR</div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">My Workspace — {tech.name}</h1>
            <p className="text-sm text-gray-500">{tech.role} · Tier {tech.tier} · {today}</p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <div className="col-span-2 rounded-lg bg-green-100 px-3 py-1.5 text-center text-sm font-medium text-green-700 sm:col-span-1">🟢 Available</div>
          <button onClick={() => setShowSchedule(true)}
            className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5">
            📅 My Schedule
          </button>
          <button onClick={() => setShowNotifs(true)}
            className="relative px-3 py-1.5 text-sm font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1.5">
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="ml-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
        <StatCard label="Open Tickets" value={tech.openTickets} sub="My queue" color="blue" />
        <StatCard label="Est. Hours" value={`${tech.estimatedHours}h`} sub="Today" color="amber" />
        <StatCard label="CSAT" value={`${tech.csat}★`} sub="Last 30 days" color="green" />
        <StatCard label="SLA Compliance" value={`${tech.slaCompliance}%`} sub="This month" color="teal" />
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wide opacity-80">Streak</p>
          <p className="text-2xl font-bold mt-1">🔥 {tech.streak}</p>
          <p className="text-xs opacity-70">No breach days</p>
        </div>
      </div>

      {/* Capacity */}
      <Card title="Today's Capacity">
        <div className="p-4 space-y-3">
          <ProgressBar value={tech.openTickets} max={10} label="Queue load (3/10 tickets)" color="blue" />
          <ProgressBar value={tech.estimatedHours} max={8} label={`Estimated hours (${tech.estimatedHours}h / 8h)`} color="teal" />
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/>Warning</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Overloaded</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-100 px-4 pt-2">
          {["Queue", "Today's Priorities", "Time Log", "Badges"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-4">

          {/* ── Queue Tab ── */}
          {activeTab === "Queue" && (
            <div className="space-y-2">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  {sortedTickets.length} ticket{sortedTickets.length !== 1 ? "s" : ""} in your queue
                  {(filterPriority.length > 0 || filterStatus.length > 0) && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">Filtered</span>
                  )}
                </p>
                <div className="flex w-full gap-2 sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="Priority">Sort: Priority</option>
                    <option value="SLA Due">Sort: SLA Due</option>
                    <option value="Created">Sort: Created</option>
                  </select>
                  <button onClick={() => setShowFilter(v => !v)}
                    className={`text-xs px-3 py-1 rounded border font-medium transition-colors ${showFilter || filterPriority.length > 0 || filterStatus.length > 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                    Filter {(filterPriority.length + filterStatus.length) > 0 ? `(${filterPriority.length + filterStatus.length})` : ""}
                  </button>
                </div>
              </div>

              {/* Filter panel */}
              {showFilter && (
                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-6 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Priority</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {["P1", "P2", "P3", "P4"].map(p => (
                          <button key={p} onClick={() => togglePriority(p)}
                            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${filterPriority.includes(p) ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {["New", "In Progress", "Pending", "Resolved"].map(s => (
                          <button key={s} onClick={() => toggleStatus(s)}
                            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${filterStatus.includes(s) ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(filterPriority.length > 0 || filterStatus.length > 0) && (
                      <button onClick={() => { setFilterPriority([]); setFilterStatus([]); }}
                        className="self-end text-xs text-red-500 hover:text-red-700 font-medium underline">
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}

              {sortedTickets.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">No tickets match the current filters.</p>
              ) : sortedTickets.map(t => (
                <div key={t.id} onClick={() => onViewTicket(t.id)}
                  className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-blue-600 font-bold">{t.id}</span>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                      {t.isMajorIncident && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">⚡ Major</span>}
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.requester.name} · {t.location}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-start gap-1 sm:items-end">
                    <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} paused={(t as any).slapaused} />
                  </div>
                  <div className="flex w-full flex-shrink-0 gap-1 sm:w-auto">
                    <Btn size="sm" variant="primary" onClick={(e) => { e?.stopPropagation(); onViewTicket(t.id); }}>Work</Btn>
                    <Btn size="sm" variant="secondary">↕</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Today's Priorities Tab ── */}
          {activeTab === "Today's Priorities" && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-bold text-red-700 mb-2">🚨 Immediate Action Required</p>
                {myTickets.filter(t => t.priority === "P1" || (t.slaResolve.remaining < 60 && !t.slaResolve.breached)).map(t => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 py-1.5 sm:gap-3">
                    <span className="text-xs font-mono text-red-600">{t.id}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                    <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} />
                    <button onClick={() => handleActNow(t.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors">
                      Act Now
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-bold text-amber-700 mb-2">⚠ At Risk</p>
                {myTickets.filter(t => t.breachLikelihood > 30 && t.priority !== "P1").map(t => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 py-1.5 sm:gap-3">
                    <span className="text-xs font-mono text-amber-600">{t.id}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                    <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} />
                    <button onClick={() => handleActNow(t.id)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Act Now
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-bold text-green-700 mb-2">✅ On Track</p>
                {myTickets.filter(t => t.breachLikelihood <= 30 && t.priority !== "P1").map(t => (
                  <div key={t.id} className="flex flex-wrap items-center gap-2 py-1.5 sm:gap-3">
                    <span className="text-xs font-mono text-green-600">{t.id}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Time Log Tab ── */}
          {activeTab === "Time Log" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg flex-wrap">
                <select value={logTicket} onChange={e => setLogTicket(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1.5 flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {myTickets.map(t => (
                    <option key={t.id} value={t.id}>{t.id} — {t.title.slice(0, 40)}</option>
                  ))}
                </select>
                <input type="number" placeholder="Hours" value={logHours} onChange={e => setLogHours(e.target.value)} min="0.1" step="0.5"
                  className="w-20 text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <input type="text" placeholder="Notes..." value={logNote} onChange={e => setLogNote(e.target.value)}
                  className="flex-1 min-w-[120px] text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <button onClick={handleLog} disabled={!logHours || parseFloat(logHours) <= 0}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors">
                  Log
                </button>
              </div>
              <div className="space-y-2">
                {logEntries.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg text-sm">
                    <span className="font-mono text-blue-600 font-semibold w-20">{l.ticket}</span>
                    <span className="text-blue-600 font-bold w-10">{l.hours}h</span>
                    <span className="text-gray-600 flex-1">{l.note}</span>
                    <span className="text-gray-400 text-xs">{l.time}</span>
                  </div>
                ))}
              </div>
              <div className="text-right text-sm font-semibold text-gray-700">Total today: {totalLoggedHours.toFixed(1)}h</div>
            </div>
          )}

          {/* ── Badges Tab ── */}
          {activeTab === "Badges" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Your achievements and current standing on the leaderboard:</p>
              <div className="flex flex-wrap gap-3">
                {tech.badges.map(b => (
                  <div key={b} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">{b}</p>
                      <p className="text-xs text-amber-600">Earned badge</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">🏅 Leaderboard (Quality-weighted)</p>
                <div className="space-y-2">
                  {TECHNICIANS.sort((a, b) => b.csat - a.csat).slice(0, 5).map((t, i) => (
                    <div key={t.id} className={`flex items-center gap-3 p-2 rounded-lg ${t.id === tech.id ? "bg-blue-100 border border-blue-300" : ""}`}>
                      <span className="text-sm font-bold w-5 text-gray-500">{i + 1}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-blue-500">{t.avatar}</div>
                      <span className="text-sm font-medium text-gray-800 flex-1">{t.name}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>CSAT: <strong className="text-gray-800">{t.csat}</strong></span>
                        <span>QA: <strong className="text-gray-800">{t.qaScore}%</strong></span>
                        <span>🔥 {t.streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── My Schedule Modal ───────────────────────────────────────────────── */}
      {showSchedule && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowSchedule(false); }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.25)", width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>📅 My Schedule</p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{today}</p>
              </div>
              <button onClick={() => setShowSchedule(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", lineHeight: 1, padding: "2px 6px", borderRadius: 6 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "16px 20px 20px" }}>
              <div>
                {SCHEDULE.map((item, i) => {
                  const colors: Record<string, string> = { meeting: "#3b82f6", ticket: "#ef4444", break: "#10b981", task: "#f59e0b" };
                  const bg: Record<string, string>     = { meeting: "#eff6ff", ticket: "#fef2f2", break: "#f0fdf4", task: "#fffbeb" };
                  const isLast = i === SCHEDULE.length - 1;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                      {/* Time column */}
                      <div style={{ width: 44, flexShrink: 0, textAlign: "right", paddingRight: 10, paddingTop: 9 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{item.time}</span>
                      </div>
                      {/* Dot + line column */}
                      <div style={{ width: 20, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: colors[item.type] ?? "#6b7280", border: "2px solid white", boxShadow: `0 0 0 2px ${colors[item.type] ?? "#6b7280"}`, marginTop: 8, flexShrink: 0, zIndex: 1 }} />
                        {!isLast && <div style={{ flex: 1, width: 2, background: "#e5e7eb", marginTop: 2 }} />}
                      </div>
                      {/* Card column */}
                      <div style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 12 }}>
                        <div style={{ background: bg[item.type] ?? "#f9fafb", border: `1px solid ${colors[item.type]}33`, borderRadius: 10, padding: "8px 12px" }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#111827" }}>{item.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 10, background: colors[item.type] + "22", color: colors[item.type], padding: "2px 7px", borderRadius: 20, fontWeight: 600, textTransform: "capitalize" }}>{item.type}</span>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>⏱ {item.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Panel ─────────────────────────────────────────────── */}
      {showNotifs && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowNotifs(false); }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.25)", width: "100%", maxWidth: 420, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>🔔 Notifications</p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{unreadCount} unread</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {unreadCount > 0 && (
                  <button onClick={() => setReadNotifs(NOTIFICATIONS.map(n => n.id))}
                    style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", lineHeight: 1, padding: "2px 6px", borderRadius: 6 }}>×</button>
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: "8px 0" }}>
              {NOTIFICATIONS.map(n => {
                const isUnread = n.unread && !readNotifs.includes(n.id);
                return (
                  <div key={n.id} onClick={() => setReadNotifs(prev => prev.includes(n.id) ? prev : [...prev, n.id])}
                    style={{ display: "flex", gap: 12, padding: "12px 20px", cursor: "pointer", background: isUnread ? "#f0f7ff" : "white", borderBottom: "1px solid #f8fafc", transition: "background 150ms" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isUnread ? "#f0f7ff" : "white"}>
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                        <p style={{ margin: 0, fontWeight: isUnread ? 700 : 500, fontSize: 13, color: "#111827" }}>{n.title}</p>
                        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", marginLeft: 8 }}>{n.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.body}</p>
                    </div>
                    {isUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }} />}
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
