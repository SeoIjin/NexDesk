import { useRef, useState } from "react";
import { Card, Btn, PriorityBadge, StatusBadge, SLAChip, Avatar, AIBadge, ProgressBar, InnovationCallout } from "./design-system";
import { TICKETS, TECHNICIANS } from "./mock-data";

const KANBAN_COLS = ["New", "Triaged", "Assigned", "In Progress", "Pending", "Resolved"];

export function DispatcherBoard({ onViewTicket, onNewTicket, onShowToast }: {
  onViewTicket: (id: string) => void;
  onNewTicket?: () => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
}) {
  const [view, setView]       = useState("kanban");
  const [dragging, setDragging] = useState<string | null>(null);
  const [columns, setColumns] = useState<Record<string, typeof TICKETS>>(() => {
    const cols: Record<string, typeof TICKETS> = {};
    KANBAN_COLS.forEach(col => { cols[col] = TICKETS.filter(t => t.status === col); });
    return cols;
  });
  const [selectedTech, setSelectedTech]   = useState<string | null>(null);
  const [showIncident, setShowIncident]   = useState(false);
  const [showTransfer, setShowTransfer]   = useState<string | null>(null); // tech id being transferred from
  const [showQueue, setShowQueue]         = useState<string | null>(null); // tech id whose queue to show
  const [transferTarget, setTransferTarget] = useState("");
  const [activeColumn, setActiveColumn] = useState(KANBAN_COLS[0]);
  const boardRef = useRef<HTMLDivElement>(null);

  const colColors: Record<string, string> = {
    "New": "bg-gray-100 border-gray-300",
    "Triaged": "bg-purple-50 border-purple-200",
    "Assigned": "bg-blue-50 border-blue-200",
    "In Progress": "bg-indigo-50 border-indigo-200",
    "Pending": "bg-yellow-50 border-yellow-200",
    "Resolved": "bg-green-50 border-green-200",
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    if (!dragging) return;
    const newCols = { ...columns };
    let ticket: (typeof TICKETS)[0] | undefined;
    for (const c of KANBAN_COLS) {
      const idx = newCols[c].findIndex(t => t.id === dragging);
      if (idx !== -1) { [ticket] = newCols[c].splice(idx, 1); break; }
    }
    if (ticket) { newCols[col] = [...(newCols[col] || []), { ...ticket, status: col }]; }
    setColumns(newCols);
    setDragging(null);
  };

  const sourceTech  = TECHNICIANS.find(t => t.id === showTransfer);
  const queueTech   = TECHNICIANS.find(t => t.id === showQueue);
  const queueTickets = queueTech ? TICKETS.filter(t => t.assignee === queueTech.id) : [];
  const availableTechs = TECHNICIANS.filter(t => t.id !== showTransfer && t.available);

  const scrollToColumn = (column: string) => {
    const board = boardRef.current;
    const target = board?.querySelector<HTMLElement>(`[data-kanban-column="${column}"]`);
    if (!board || !target) return;
    board.scrollTo({ left: target.offsetLeft - board.offsetLeft, behavior: "smooth" });
    setActiveColumn(column);
  };

  const syncActiveColumn = () => {
    const board = boardRef.current;
    if (!board) return;

    const nearest = KANBAN_COLS.reduce((best, column) => {
      const element = board.querySelector<HTMLElement>(`[data-kanban-column="${column}"]`);
      const distance = element ? Math.abs(element.offsetLeft - board.offsetLeft - board.scrollLeft) : Number.POSITIVE_INFINITY;
      return distance < best.distance ? { column, distance } : best;
    }, { column: activeColumn, distance: Number.POSITIVE_INFINITY });

    if (nearest.column !== activeColumn) setActiveColumn(nearest.column);
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dispatcher Board</h1>
          <p className="text-sm text-gray-500">Manage ticket flow, workload, and assignments in real time</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          <div className="grid w-full grid-cols-3 overflow-hidden rounded-lg border border-gray-300 sm:flex sm:w-auto">
            {["kanban", "heatmap", "table"].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 ${view === v ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                {v === "kanban" ? "🗂 Tickets" : v === "heatmap" ? "🔥 Heatmap" : "📋 Table"}
              </button>
            ))}
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Btn size="sm" variant="secondary" onClick={() => onShowToast?.("Auto-assigning all new tickets via Smart Dispatch Engine…", "info")}>🔄 Auto-Assign</Btn>
            <Btn size="sm" variant="primary" onClick={onNewTicket}>+ New Ticket</Btn>
          </div>
        </div>
      </div>

      {/* Major Incident Banner */}
      <div className="flex flex-col gap-3 rounded-xl bg-red-600 p-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <span className="animate-pulse text-xl">⚡</span>
          <div className="min-w-0">
            <span className="block text-sm font-bold sm:inline">ACTIVE MAJOR INCIDENT: VPN Outage</span>
            <span className="mt-0.5 block text-xs text-red-100 sm:ml-2 sm:mt-0 sm:inline">TKT-1001 · 120 users · Marcus Chen · 45 min to SLA breach</span>
          </div>
        </div>
        <button onClick={() => setShowIncident(true)}
          className="w-full rounded bg-white/20 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/30 active:bg-white/40 sm:w-auto sm:flex-shrink-0 sm:py-1">
          Manage Incident
        </button>
      </div>

      {/* ── Kanban ── */}
      {view === "kanban" && (
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 w-full text-xs font-semibold text-gray-500 sm:w-auto">Ticket stages</span>
              {KANBAN_COLS.map(column => (
                <button
                  key={column}
                  onClick={() => scrollToColumn(column)}
                  aria-pressed={activeColumn === column}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeColumn === column
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {column}
                  <span className={`ml-1.5 ${activeColumn === column ? "text-blue-100" : "text-gray-400"}`}>
                    {columns[column]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            ref={boardRef}
            onScroll={syncActiveColumn}
            className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth"
            aria-label="Ticket stages board"
          >
          <div className="flex min-w-max gap-3 pb-2">
            {KANBAN_COLS.map(col => (
              <div key={col}
                data-kanban-column={col}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, col)}
                className={`flex w-[calc(100vw-3rem)] max-w-72 snap-start flex-col rounded-xl border-2 sm:w-72 ${colColors[col]}`}>
                <div className="px-3 py-2 border-b border-current/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{col}</span>
                    <span className="text-xs bg-white/80 text-gray-600 rounded-full px-2 py-0.5 font-medium">{columns[col]?.length || 0}</span>
                  </div>
                </div>
                <div className="flex-1 p-2 space-y-2 min-h-32">
                  {(columns[col] || []).map(ticket => (
                    <div key={ticket.id}
                      draggable
                      onDragStart={() => setDragging(ticket.id)}
                      onClick={() => onViewTicket(ticket.id)}
                      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-blue-300 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-blue-600 font-bold">{ticket.id}</span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-2">{ticket.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs">
                            {ticket.assigneeName ? ticket.assigneeName.charAt(0) : "?"}
                          </div>
                          <span className="text-xs text-gray-500">{ticket.assigneeName?.split(" ")[0] || "Unassigned"}</span>
                        </div>
                        <SLAChip remaining={ticket.slaResolve.remaining} breached={ticket.slaResolve.breached} />
                      </div>
                      {ticket.isMajorIncident && (
                        <div className="mt-1.5 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded text-center font-semibold">⚡ Major Incident</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-current/10">
                  <button
                    onClick={() => onNewTicket?.()}
                    className="w-full text-xs text-gray-400 hover:text-blue-600 py-1 rounded hover:bg-white/50 transition-colors">
                    + Add ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* ── Heatmap ── */}
      {view === "heatmap" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="Technician Workload Heatmap">
            <div className="p-4 space-y-3">
              {TECHNICIANS.map(tech => {
                const load = (tech.openTickets / 10) * 100;
                return (
                  <div key={tech.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTech === tech.id ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:border-gray-300"}`}
                    onClick={() => setSelectedTech(selectedTech === tech.id ? null : tech.id)}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{tech.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-semibold text-gray-800">{tech.name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`w-2 h-2 rounded-full ${tech.available ? "bg-green-400" : "bg-gray-300"}`}/>
                            <span className="text-xs text-gray-500">{tech.openTickets} tickets · {tech.estimatedHours}h</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{tech.role} · Tier {tech.tier}</span>
                      </div>
                    </div>
                    <ProgressBar value={tech.openTickets} max={10} />
                    {load > 80 && <p className="text-xs text-red-600 mt-1 font-medium">⚠ Overloaded — consider redistributing</p>}
                    {selectedTech === tech.id && (
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-xs">
                        <div className="text-center"><p className="text-gray-500">CSAT</p><p className="font-bold text-gray-800">{tech.csat}★</p></div>
                        <div className="text-center"><p className="text-gray-500">QA Score</p><p className="font-bold text-gray-800">{tech.qaScore}%</p></div>
                        <div className="text-center"><p className="text-gray-500">SLA Comp.</p><p className="font-bold text-gray-800">{tech.slaCompliance}%</p></div>
                        <div className="col-span-3 mt-2 flex flex-col gap-2 sm:flex-row">
                          <button onClick={e => { e.stopPropagation(); setShowTransfer(tech.id); setTransferTarget(""); }}
                            className="flex-1 py-1.5 text-xs font-semibold text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Transfer Ticket
                          </button>
                          <button onClick={e => { e.stopPropagation(); setShowQueue(tech.id); }}
                            className="flex-1 py-1.5 text-xs font-semibold text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                            View Queue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-4">
            <Card title="Unassigned Tickets (AI Ready)">
              <div className="p-4 space-y-3">
                {TICKETS.filter(t => !t.assignee).map(t => (
                  <div key={t.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-blue-600">{t.id}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="text-xs text-gray-700 font-medium mb-2">{t.title}</p>
                    <p className="text-xs text-gray-500 mb-2">Recommended: Ana Reyes (3 tickets, same floor)</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <Btn size="sm" variant="primary" onClick={() => onViewTicket(t.id)}>Work</Btn>
                      <Btn size="sm" variant="secondary" onClick={() => onShowToast?.(`Reassigning ${t.id} to best available technician…`, "info")}>↕</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <InnovationCallout
              title="Smart Dispatch Engine"
              description="Scores technicians by skill match, workload, shift, location, and past performance. Each assignment shows an explainable reason like 'Assigned to Ana: 92% skill match, 3 open tickets, same building'."
              icon="🤖"
            />
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {view === "table" && (
        <Card title="All Tickets">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["ID", "Title", "Priority", "Status", "Assignee", "SLA", "Created"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TICKETS.slice(0, 20).map(t => (
                  <tr key={t.id} onClick={() => onViewTicket(t.id)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-blue-600 font-bold">{t.id}</span>
                        {t.isMajorIncident && <span className="text-red-500">⚡</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-800 font-medium truncate max-w-xs">{t.title}</p></td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{t.assigneeName || <span className="text-gray-400 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3"><SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Manage Incident Modal ─────────────────────────────────────────── */}
      {showIncident && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowIncident(false); }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", width: "100%", maxWidth: 520, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "white" }}>Major Incident — VPN Outage</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>TKT-1001 · P1 · Opened 2h 15m ago</p>
                </div>
              </div>
              <button onClick={() => setShowIncident(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "white", fontSize: 18, lineHeight: 1, padding: "4px 8px", borderRadius: 6 }}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              {/* Stats row */}
              <div className="mb-[18px] grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { label: "Users Affected", value: "120", color: "#dc2626" },
                  { label: "Time to SLA", value: "45 min", color: "#f59e0b" },
                  { label: "Assignee", value: "M. Chen", color: "#2563eb" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", textAlign: "center", border: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Status */}
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#dc2626" }}>Current Status</p>
                <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>VPN concentrator experiencing packet loss on Building A & B floors. ISP incident confirmed. Marcus Chen diagnosing concentrator failover settings.</p>
              </div>
              {/* Actions */}
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "📢 Broadcast Status Update", color: "#2563eb", action: "status-update" },
                  { label: "⬆ Escalate to Tier 3", color: "#7c3aed", action: "escalate" },
                  { label: "👥 Add Technician", color: "#0891b2", action: "add-tech" },
                  { label: "✅ Resolve Incident", color: "#059669", action: "resolve" },
                ].map(a => (
                  <button key={a.action}
                    onClick={() => {
                      setShowIncident(false);
                      const msgs: Record<string, string> = {
                        "status-update": "Status broadcast sent to all 120 affected users.",
                        "escalate": "Incident escalated to Tier 3 and management notified.",
                        "add-tech": "Additional technician assigned to the incident.",
                        "resolve": "Incident marked as resolved. Post-mortem scheduled.",
                      };
                      onShowToast?.(msgs[a.action], a.action === "resolve" ? "success" : "info");
                    }}
                    style={{ padding: "10px 12px", background: a.color, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "opacity 150ms" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.85"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Transfer Ticket Modal ─────────────────────────────────────────── */}
      {showTransfer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowTransfer(null); }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.25)", width: "100%", maxWidth: 440, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>↕ Transfer Tickets</p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>From {sourceTech?.name} · {TICKETS.filter(t => t.assignee === showTransfer).length} tickets</p>
              </div>
              <button onClick={() => setShowTransfer(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", padding: "2px 6px" }}>×</button>
            </div>
            <div style={{ padding: "16px 20px 20px" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>Select destination technician:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {availableTechs.map(t => (
                  <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `2px solid ${transferTarget === t.id ? "#3b82f6" : "#f1f5f9"}`, background: transferTarget === t.id ? "#eff6ff" : "#fafafa", borderRadius: 10, cursor: "pointer", transition: "all 150ms" }}>
                    <input type="radio" name="transfer-target" value={t.id} checked={transferTarget === t.id} onChange={() => setTransferTarget(t.id)} style={{ accentColor: "#3b82f6" }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{t.openTickets} open · {t.estimatedHours}h est.</p>
                    </div>
                    <span style={{ fontSize: 11, color: t.openTickets < 5 ? "#059669" : "#f59e0b", fontWeight: 600 }}>
                      {t.openTickets < 5 ? "✓ Low load" : "⚠ Medium"}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowTransfer(null)}
                  style={{ flex: 1, padding: "10px", background: "#f3f4f6", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  disabled={!transferTarget}
                  onClick={() => {
                    const targetName = availableTechs.find(t => t.id === transferTarget)?.name;
                    setShowTransfer(null);
                    onShowToast?.(`All tickets from ${sourceTech?.name} transferred to ${targetName}.`, "success");
                  }}
                  style={{ flex: 2, padding: "10px", background: transferTarget ? "#2563eb" : "#93c5fd", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "white", cursor: transferTarget ? "pointer" : "not-allowed", transition: "background 150ms" }}>
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Queue Modal ──────────────────────────────────────────────── */}
      {showQueue && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowQueue(null); }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.25)", width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>📋 {queueTech?.name}'s Queue</p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{queueTickets.length} active tickets · {queueTech?.estimatedHours}h estimated</p>
              </div>
              <button onClick={() => setShowQueue(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", padding: "2px 6px" }}>×</button>
            </div>
            <div style={{ overflowY: "auto", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {queueTickets.length === 0 ? (
                <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "24px 0" }}>No tickets in queue.</p>
              ) : queueTickets.map(t => (
                <div key={t.id}
                  onClick={() => { setShowQueue(null); onViewTicket(t.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #f1f5f9", borderRadius: 10, cursor: "pointer", background: "#fafafa", transition: "all 150ms" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eff6ff"; (e.currentTarget as HTMLElement).style.borderColor = "#93c5fd"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fafafa"; (e.currentTarget as HTMLElement).style.borderColor = "#f1f5f9"; }}>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "#2563eb", fontWeight: 700, width: 68, flexShrink: 0 }}>{t.id}</span>
                  <span style={{ fontSize: 13, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
