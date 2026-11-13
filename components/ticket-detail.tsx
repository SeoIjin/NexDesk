import { useState } from "react";
import { Card, Btn, PriorityBadge, StatusBadge, SLAChip, Avatar } from "./design-system";
import { TICKETS } from "./mock-data";

const INITIAL_TIMELINE = [
  { time: "09:50 AM", user: "System",       type: "escalation", text: "⚠️ SLA breach risk detected (78%). Auto-escalation queued in 30 min." },
  { time: "09:45 AM", user: "Marcus Chen",  type: "update",     text: "Checked BGP tables — route leak on AS65001. Coordinating with ISP. ETA 45 min." },
  { time: "09:30 AM", user: "Marcus Chen",  type: "internal",   text: "🔒 Internal: Auth log shows RADIUS timeout. Possible certificate expiry on VPN concentrator." },
  { time: "09:15 AM", user: "System",       type: "assignment", text: "Assigned to Marcus Chen (Network Specialist, Building B, 7 open tickets)." },
  { time: "09:10 AM", user: "Ana Reyes",    type: "comment",    text: "Confirmed with 3 more users in Sales — all affected. Upgrading to Major Incident." },
  { time: "08:45 AM", user: "Priya Sharma", type: "comment",    text: "Checked Active Directory — not an auth issue on our end. Routing to Network team." },
  { time: "08:23 AM", user: "System",       type: "created",    text: "Ticket created. Priority set to P1 (Critical). SLA response timer started." },
  { time: "08:15 AM", user: "James Burton", type: "requester",  text: "Submitted: 'VPN outage affecting entire sales floor. All 120 users cannot connect. CRM is also down.'" },
];

type Role = "employee" | "technician" | "dispatcher" | "manager";

export function TicketDetail({
  ticketId,
  role = "technician",
  onBack,
  onShowToast,
  onNewTicket,
  onViewTicket,
}: {
  ticketId: string;
  role?: Role;
  onBack: () => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
  onNewTicket?: () => void;
  onViewTicket?: (id: string) => void;
}) {
  const ticket = TICKETS.find(t => t.id === ticketId) || TICKETS[0];

  const [activeTab, setActiveTab]         = useState("Timeline");
  const [newComment, setNewComment]       = useState("");
  const [replyTab, setReplyTab]           = useState<"public" | "internal" | "canned">("public");
  const [showReassign, setShowReassign]   = useState(false);
  const [ticketStatus, setTicketStatus]   = useState(ticket.status);
  const [isMajorInc, setIsMajorInc]       = useState(ticket.isMajorIncident ?? false);
  const [showResolve, setShowResolve]     = useState(false);
  const [resolveNote, setResolveNote]     = useState("");
  const [timelineEvents, setTimelineEvents] = useState(INITIAL_TIMELINE);
  const [localToast, setLocalToast]       = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);

  const isEmployee = role === "employee";

  const allTabs      = ["Timeline", "Details", "Linked", "Time Log", "Assets"];
  const employeeTabs = ["Timeline", "Details", "Linked"];
  const tabs = isEmployee ? employeeTabs : allTabs;

  const WORKFLOW    = ["New", "Triaged", "Assigned", "In Progress", "Pending", "Resolved", "Verified/Closed"];
  const currentStep = WORKFLOW.indexOf(ticketStatus);

  const visibleEvents = isEmployee
    ? timelineEvents.filter(ev => ev.type !== "internal")
    : timelineEvents;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const pushEvent = (user: string, type: string, text: string) => {
    setTimelineEvents(prev => [{ time: timeStr, user, type, text }, ...prev]);
  };

  const showFeedback = (msg: string, type: "success" | "info" | "error" = "success") => {
    onShowToast?.(msg, type);
    // Also show a local inline banner for instant feedback
    setLocalToast({ msg, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  const handleStartProgress = () => {
    setTicketStatus("In Progress");
    pushEvent("System", "assignment", "Ticket moved to In Progress by current user.");
    showFeedback("Ticket is now In Progress", "success");
  };

  const handleEscalate = () => {
    setTicketStatus("Escalated");
    pushEvent("System", "escalation", "⬆ Ticket escalated to Tier 3 by dispatcher.");
    showFeedback("Ticket escalated to Tier 3", "info");
  };

  const handlePending = () => {
    setTicketStatus("Pending");
    pushEvent("System", "update", "⏸ Ticket set to Pending — awaiting requester response.");
    showFeedback("Ticket set to Pending", "info");
  };

  const handleResolve = () => {
    if (!showResolve) { setShowResolve(true); return; }
    setTicketStatus("Resolved");
    setShowResolve(false);
    pushEvent("System", "created", `✓ Ticket resolved. ${resolveNote ? `Resolution note: ${resolveNote}` : ""}`);
    setResolveNote("");
    showFeedback("Ticket marked as Resolved ✓", "success");
  };

  const handleMajorIncident = () => {
    const next = !isMajorInc;
    setIsMajorInc(next);
    pushEvent("System", "escalation", next ? "⚡ Ticket declared as Major Incident." : "Major Incident flag removed.");
    showFeedback(next ? "Major Incident mode activated" : "Major Incident mode deactivated", next ? "error" : "info");
  };

  const handleBulkNotify = () => {
    const recipientCount = ticket.affectedUsers || 1;
    pushEvent(
      "System",
      "notification",
      `Status update broadcast to ${recipientCount} affected user${recipientCount === 1 ? "" : "s"} by email and Slack.`,
    );
    showFeedback(`Notification sent to ${recipientCount} affected user${recipientCount === 1 ? "" : "s"}`, "success");
  };

  const handleViewParentIncident = () => {
    const parentIncident = TICKETS.find(candidate => {
      const linkedTicketIds: readonly string[] = candidate.linkedTickets ?? [];
      return candidate.isMajorIncident &&
        (candidate.id === ticket.id || linkedTicketIds.includes(ticket.id));
    });

    if (!parentIncident || parentIncident.id === ticket.id) {
      setActiveTab("Linked");
      showFeedback("This is the parent incident — showing linked tickets", "info");
      return;
    }

    onViewTicket?.(parentIncident.id);
  };

  const handleSendReply = () => {
    if (!newComment.trim()) return;
    const isInternal = replyTab === "internal";
    const author = role === "employee" ? "Ana Reyes"
      : role === "technician" ? "Marcus Chen"
      : role === "dispatcher" ? "Lena Novak"
      : "Robin Walsh";
    pushEvent(author, isInternal ? "internal" : "comment",
      isInternal ? `🔒 Internal: ${newComment.trim()}` : newComment.trim()
    );
    setNewComment("");
    showFeedback(isInternal ? "Internal note added" : "Reply sent successfully", "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
        <button onClick={onBack} className="hover:text-blue-600 transition-colors font-medium">
          {isEmployee ? "My Tickets" : "All Tickets"}
        </button>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-800 font-semibold">{ticket.id}</span>
      </nav>

      {/* ── Local inline feedback banner ─────────────────────────────── */}
      {localToast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          localToast.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
          : localToast.type === "error"   ? "bg-red-50 border border-red-200 text-red-800"
          :                                 "bg-blue-50 border border-blue-200 text-blue-800"
        }`}>
          <span>{localToast.type === "success" ? "✓" : localToast.type === "error" ? "⚠" : "ℹ"}</span>
          {localToast.msg}
        </div>
      )}

      {/* ── Employee read-only notice ─────────────────────────────────── */}
      {isEmployee && (
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-blue-500 text-lg flex-shrink-0 mt-0.5">👁</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">View-only — Ticket tracking</p>
            <p className="text-xs text-blue-600 mt-0.5">
              You can track the status and timeline of your ticket here. Only IT staff can update, assign, or resolve tickets.
              If you have new information, please{" "}
              <button onClick={onNewTicket ?? onBack} className="underline font-medium hover:text-blue-800">submit a new ticket</button>.
            </p>
          </div>
        </div>
      )}

      {/* Major Incident Banner */}
      {isMajorInc && (
        <div className="bg-red-600 text-white rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold">MAJOR INCIDENT MODE</p>
              <p className="text-red-100 text-sm mt-0.5">120 users affected · Grouped with TKT-1008, TKT-1015, TKT-1023</p>
            </div>
          </div>
          {!isEmployee && (
            <div className="flex gap-2 mt-3 justify-end flex-wrap">
              <button onClick={handleBulkNotify} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                📢 Bulk Notify Users
              </button>
              <button onClick={handleViewParentIncident} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                {ticket.isMajorIncident ? "View Linked Incidents" : "View Parent Incident"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 min-w-0">
        {/* ── Main Content ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4 min-w-0">

          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-mono text-blue-600 font-bold flex-shrink-0">{ticket.id}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticketStatus} />
              {isMajorInc && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded font-semibold">⚡ Major Incident</span>
              )}
              {"isSecurityRestricted" in ticket && ticket.isSecurityRestricted && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-semibold">🔒 Security Restricted</span>
              )}
              <div className="ml-auto flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <SLAChip remaining={ticket.slaResolve.remaining} breached={ticket.slaResolve.breached} paused={(ticket as any).slapaused} />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>

            {/* Workflow stepper */}
            <div className="mt-4 overflow-x-auto w-full" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="flex items-center min-w-max gap-0 pb-1">
                {WORKFLOW.map((step, i) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex flex-col items-center gap-1 ${i <= currentStep ? "" : "opacity-40"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        i < currentStep  ? "bg-blue-600 border-blue-600 text-white" :
                        i === currentStep ? "bg-blue-100 border-blue-500 text-blue-700" :
                                            "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {i < currentStep ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs whitespace-nowrap ${i === currentStep ? "text-blue-600 font-semibold" : "text-gray-400"}`}>{step}</span>
                    </div>
                    {i < WORKFLOW.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 mb-4 ${i < currentStep ? "bg-blue-500" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action buttons ── */}
            {!isEmployee && (
              <>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Btn size="sm" variant="primary"    onClick={handleStartProgress}>▶ Start Progress</Btn>
                  <Btn size="sm" variant="secondary"  onClick={() => { setShowReassign(!showReassign); setShowResolve(false); }}>↕ Reassign</Btn>
                  <Btn size="sm" variant="secondary"  onClick={handleEscalate}>⬆ Escalate</Btn>
                  <Btn size="sm" variant="secondary"  onClick={handlePending}>⏸ Pending</Btn>
                  <Btn size="sm" variant="success"    onClick={handleResolve}>✓ Resolve</Btn>
                  <Btn size="sm" variant={isMajorInc ? "secondary" : "danger"} onClick={handleMajorIncident}>
                    {isMajorInc ? "⚡ Clear Major Inc." : "! Major Incident"}
                  </Btn>
                </div>

                {/* Resolve confirmation panel */}
                {showResolve && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-800 mb-2">Confirm Resolution</p>
                    <textarea
                      value={resolveNote}
                      onChange={e => setResolveNote(e.target.value)}
                      placeholder="Optional resolution note…"
                      className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white outline-none focus:ring-2 focus:ring-emerald-400 resize-none h-16"
                    />
                    <div className="flex gap-2 mt-2 justify-end">
                      <Btn size="sm" variant="ghost" onClick={() => setShowResolve(false)}>Cancel</Btn>
                      <Btn size="sm" variant="success" onClick={handleResolve}>Confirm Resolved</Btn>
                    </div>
                  </div>
                )}

                {/* Reassign panel */}
                {showReassign && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Recommended Assignees</p>
                    {[
                      { name: "Ana Reyes",   reason: "92% skill match, 3 open tickets, same building", score: 92 },
                      { name: "Robin Walsh", reason: "88% match, Tier 3 escalation specialist, 2 open",  score: 88 },
                      { name: "Sam Torres",  reason: "75% match, network experience, 6 open tickets",   score: 75 },
                    ].map(r => (
                      <div key={r.name} className="flex items-center justify-between py-1.5 border-b border-blue-100 last:border-0">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{r.name}</span>
                          <p className="text-xs text-blue-600">{r.reason}</p>
                        </div>
                        <Btn size="sm" variant="primary" onClick={() => {
                          setShowReassign(false);
                          pushEvent("System", "assignment", `Ticket reassigned to ${r.name} (${r.score}% match).`);
                          showFeedback(`Reassigned to ${r.name}`, "success");
                        }}>
                          Assign ({r.score}%)
                        </Btn>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex gap-1 border-b border-gray-100 px-3 sm:px-4 pt-2 overflow-x-auto">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5">

              {/* ── Timeline ────────────────────────────────────────── */}
              {activeTab === "Timeline" && (
                <div className="space-y-0">
                  {visibleEvents.map((ev, i) => (
                    <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                      <div className="relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          ev.type === "escalation" ? "bg-red-100 text-red-600" :
                          ev.type === "internal"   ? "bg-yellow-100 text-yellow-600" :
                          ev.type === "assignment" ? "bg-purple-100 text-purple-600" :
                          ev.type === "created"    ? "bg-green-100 text-green-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          {ev.user.charAt(0)}
                        </div>
                        {i < visibleEvents.length - 1 && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100" />}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-800">{ev.user}</span>
                          <span className="text-xs text-gray-400">{ev.time}</span>
                          {ev.type === "internal"   && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Internal</span>}
                          {ev.type === "escalation" && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">System Alert</span>}
                        </div>
                        <p className="text-sm text-gray-600">{ev.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* ── Comment box — HIDDEN for employees ── */}
                  {!isEmployee ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Reply tabs */}
                      <div className="flex gap-1 mb-3">
                        <button
                          onClick={() => setReplyTab("public")}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${replyTab === "public" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}>
                          Public Reply
                        </button>
                        <button
                          onClick={() => setReplyTab("internal")}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${replyTab === "internal" ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:bg-gray-100"}`}>
                          🔒 Internal Note
                        </button>
                        <button
                          onClick={() => setReplyTab("canned")}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${replyTab === "canned" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}>
                          ⚡ Canned Response
                        </button>
                      </div>

                      {/* Canned responses picker */}
                      {replyTab === "canned" && (
                        <div className="mb-3 space-y-1">
                          {[
                            "Thank you for contacting IT support. We are currently investigating the issue.",
                            "Your ticket has been escalated to our specialist team. Expected resolution time is 2 hours.",
                            "We've resolved the issue on our end. Please restart your device and let us know if the problem persists.",
                          ].map((cr, idx) => (
                            <button key={idx}
                              onClick={() => { setNewComment(cr); setReplyTab("public"); }}
                              className="w-full text-left text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg px-3 py-2 transition-colors">
                              {cr}
                            </button>
                          ))}
                        </div>
                      )}

                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder={replyTab === "internal" ? "Internal note — not visible to requester…" : "Reply to requester…"}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 placeholder-gray-400 ${
                          replyTab === "internal" ? "bg-yellow-50 border-yellow-300" : "border-gray-300"
                        }`}
                        style={{ color: "#1f2937" }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                          📎 Attach file
                        </button>
                        <Btn
                          size="sm"
                          variant={replyTab === "internal" ? "ghost" : "primary"}
                          disabled={!newComment.trim()}
                          onClick={handleSendReply}
                        >
                          Send {replyTab === "internal" ? "Note" : "Reply"}
                        </Btn>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-gray-300 text-lg">💬</span>
                        <p className="text-xs text-gray-400">
                          Comments and updates are handled by IT staff. You'll receive email notifications when there's an update on your ticket.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Details ─────────────────────────────────────────── */}
              {activeTab === "Details" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Category",      value: ticket.category },
                    { label: "Affected Users", value: ticket.affectedUsers },
                    { label: "Asset Tag",      value: ticket.assetTag || "—" },
                    { label: "Location",       value: ticket.location },
                    { label: "Created",        value: new Date(ticket.createdAt).toLocaleString() },
                    { label: "Last Updated",   value: new Date(ticket.updatedAt).toLocaleString() },
                    { label: "Response Time",  value: ticket.slaResponse.responseTime ? `${ticket.slaResponse.responseTime} min` : "—" },
                    { label: "Time Logged",    value: `${ticket.timeLogged}h` },
                  ].map(row => (
                    <div key={row.label} className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{row.label}</span>
                      <span className="text-gray-800 font-medium break-words">{String(row.value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Linked tickets ──────────────────────────────────── */}
              {activeTab === "Linked" && (
                <div className="space-y-2">
                  {ticket.linkedTickets.length > 0 ? ticket.linkedTickets.map(id => {
                    const lt = TICKETS.find(t => t.id === id);
                    return lt ? (
                      <div key={id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs font-mono text-blue-600 font-bold">{lt.id}</span>
                        <span className="text-sm text-gray-700 flex-1">{lt.title}</span>
                        <PriorityBadge priority={lt.priority} />
                        <StatusBadge status={lt.status} />
                      </div>
                    ) : null;
                  }) : <p className="text-sm text-gray-400 italic">No linked tickets.</p>}
                </div>
              )}

              {/* ── Time Log ────────────────────────────────────────── */}
              {activeTab === "Time Log" && !isEmployee && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Total logged: {ticket.timeLogged}h</p>
                    <Btn size="sm" variant="secondary">+ Log Time</Btn>
                  </div>
                  <div className="space-y-2">
                    {[{ tech: "Marcus Chen", duration: "1.5h", note: "Diagnosing VPN concentrator", date: "Today 09:45 AM" }].map((l, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium text-gray-700">{l.tech}</span>
                        <span className="text-blue-600 font-bold">{l.duration}</span>
                        <span className="text-gray-500 flex-1">{l.note}</span>
                        <span className="text-gray-400 text-xs">{l.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Assets ──────────────────────────────────────────── */}
              {activeTab === "Assets" && !isEmployee && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 italic">No assets linked to this ticket.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Requester */}
          <Card title="Requester">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {ticket.requester.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ticket.requester.name}</p>
                  <p className="text-xs text-gray-500 truncate">{ticket.requester.dept} · {ticket.requester.email}</p>
                </div>
                {ticket.requester.vip && <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-bold">VIP</span>}
              </div>
            </div>
          </Card>

          {/* Assignment */}
          <Card title="Assignment">
            <div className="p-4 space-y-3">
              {ticket.assigneeName ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {ticket.assigneeName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{ticket.assigneeName}</p>
                    <p className="text-xs text-gray-500">Tier 2 · Network Specialist</p>
                  </div>
                </div>
              ) : <p className="text-sm text-gray-400 italic">Unassigned</p>}

              {!isEmployee && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {["M", "A", "R"].map((init, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-xs">
                        {init}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">3 watching · Live presence</span>
                </div>
              )}
            </div>
          </Card>

          {/* SLA Status */}
          <Card title="SLA Status">
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2 flex-wrap text-sm">
                <span className="text-gray-500 flex-shrink-0">Response SLA</span>
                <span className={`font-medium text-right ${ticket.slaResponse.met ? "text-green-600" : "text-red-600"}`}>
                  {ticket.slaResponse.met ? "✓ Met" : "✕ Missed"} ({ticket.slaResponse.responseTime || "—"} min)
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 flex-wrap text-sm">
                <span className="text-gray-500 flex-shrink-0">Resolve SLA</span>
                <SLAChip remaining={ticket.slaResolve.remaining} breached={ticket.slaResolve.breached} />
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card title="Tags">
            <div className="p-4 flex flex-wrap gap-2">
              {ticket.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>
              ))}
              {!isEmployee && (
                <button className="px-2 py-1 border border-dashed border-gray-300 text-gray-400 rounded text-xs hover:text-gray-600 hover:border-gray-400">
                  + Add tag
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
