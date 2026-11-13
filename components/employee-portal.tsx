import { useState } from "react";
import { Search } from "lucide-react";
import { Card, Btn, PriorityBadge, StatusBadge, SLAChip, StatCard } from "./design-system";
import { TICKETS, KNOWLEDGE_ARTICLES } from "./mock-data";

export function EmployeePortal({ onNewTicket, onViewTicket, onShowToast, onViewKB }: {
  onNewTicket: () => void;
  onViewTicket: (id: string) => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
  onViewKB?: (searchTerm?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [surveyDone, setSurveyDone] = useState(false);
  const myTickets = TICKETS.slice(0, 6).map((t) => ({ ...t, requester: { name: "You", dept: "Marketing", email: "me@company.com", vip: false } }));

  const filtered = search.length > 2
    ? KNOWLEDGE_ARTICLES.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  const toast = (msg: string, type: "success" | "info" | "error" = "info") => onShowToast?.(msg, type);

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Good morning, Sarah! 👋</h1>
            <p className="text-blue-100 text-sm">How can we help you today?</p>
          </div>
          <div className="flex gap-3">
            <Btn variant="secondary" onClick={onNewTicket} className="!bg-white !text-blue-700 hover:!bg-blue-50">
              + Report a Problem
            </Btn>
            <button
              onClick={() => toast("QR scanning is available on the NexDesk mobile app.", "info")}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📱 Scan QR Asset
            </button>
          </div>
        </div>

        {/* KB Search */}
        <div className="mt-6 relative">
          <div className="relative group">
            <div className={`flex items-center gap-3 bg-white/15 backdrop-blur-sm border-2 rounded-2xl px-4 py-3 transition-all duration-200 ${search.length > 0 ? "border-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]" : "border-white/30 hover:border-white/60"}`}>
              <Search className="w-4 h-4 text-white/70 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggestions(e.target.value.length > 2); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search knowledge base or describe your problem..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-sm"
              />
              {search ? (
                <button
                  onClick={() => { setSearch(""); setShowSuggestions(false); }}
                  className="text-white/50 hover:text-white transition-colors text-lg leading-none flex-shrink-0"
                >×</button>
              ) : null}
            </div>
          </div>
          {showSuggestions && filtered.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden" style={{ zIndex: 500 }}>
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <p className="text-xs font-semibold text-blue-700">📖 Suggested articles — try these before submitting a ticket:</p>
              </div>
              {filtered.map(a => (
                <button key={a.id} onClick={() => onViewKB?.(a.title)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors">
                  <span className="text-lg">📖</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.helpful}% found this helpful · {a.views.toLocaleString()} views</p>
                  </div>
                  <span className="ml-auto text-xs text-blue-600 font-medium">Read →</span>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-gray-100">
                <button onClick={onNewTicket} className="text-xs text-gray-500 hover:text-blue-600">
                  Still need help? → Submit a ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard label="My Open Tickets"      value={3}      sub="2 In Progress"         color="blue"   />
        <StatCard label="Pending My Input"     value={1}      sub="Awaiting confirmation"  color="amber"  />
        <StatCard label="Resolved This Month"  value={8}      sub="100% resolved"          color="green"  />
        <StatCard label="Avg CSAT Given"       value="4.7★"   sub="Last 10 tickets"        color="purple" />
      </div>

      {/* Major Incident Banner */}
      <div className="bg-red-600 text-white rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl animate-pulse flex-shrink-0">⚡</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold">MAJOR INCIDENT: VPN Outage Affecting 120 Users</p>
            <p className="text-red-100 text-sm mt-0.5">TKT-1001 · Marcus Chen is working on it · Started 08:15 AM · ETA: 11:00 AM</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={() => onViewTicket("TKT-1001")}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >Track</button>
          <button
            onClick={() => toast("You'll receive email & push notifications for TKT-1001 updates.", "success")}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >Notify Me</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* My Tickets */}
        <div className="md:col-span-2 min-w-0">
          <Card title="My Tickets" action={
            <button
              onClick={() => toast("Showing all your tickets.", "info")}
              className="text-xs text-blue-600 hover:underline"
            >View All</button>
          }>
            <div className="divide-y divide-gray-50">
              {myTickets.map(t => (
                <div key={t.id} onClick={() => onViewTicket(t.id)}
                  className="px-3 sm:px-5 py-3 hover:bg-blue-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-blue-600 font-semibold flex-shrink-0">{t.id}</span>
                    <PriorityBadge priority={t.priority} />
                    <div className="ml-auto flex-shrink-0">
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate min-w-0">{t.title}</p>
                    <div className="flex-shrink-0">
                      <SLAChip remaining={t.slaResolve.remaining} breached={t.slaResolve.breached} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 min-w-0">
          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { icon: "💻", label: "Hardware Issue" },
                { icon: "⚙️", label: "Software Bug"  },
                { icon: "🌐", label: "Network/VPN"   },
                { icon: "🔑", label: "Access Request" },
                { icon: "🖨️", label: "Printer Issue" },
                { icon: "🔒", label: "Security Alert" },
              ].map(a => (
                <button key={a.label} onClick={onNewTicket}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Popular KB */}
          <Card title="Popular Articles">
            <div className="divide-y divide-gray-50">
              {KNOWLEDGE_ARTICLES.slice(0, 4).map(a => (
                <div key={a.id} onClick={() => onViewKB?.(a.title)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.helpful}% helpful</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Pending Survey */}
      {!surveyDone ? (
        <Card className="border-l-4 border-l-amber-400">
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">⭐ Was your issue really fixed? — TKT-0891</p>
              <p className="text-xs text-gray-500 mt-0.5">"Outlook sync issues resolved" · Resolved by Priya Sharma on Oct 30</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="text-2xl transition-transform hover:scale-110"
                    style={{ color: s <= (hoverRating || rating) ? "#f59e0b" : "#d1d5db" }}
                  >★</button>
                ))}
              </div>
              <Btn size="sm" variant="success" onClick={() => { setSurveyDone(true); toast("Thanks! Marked as resolved ✓", "success"); }}>
                Mark Fixed ✓
              </Btn>
              <Btn size="sm" variant="danger" onClick={() => { setSurveyDone(true); toast("TKT-0891 has been reopened and assigned back to the team.", "info"); }}>
                Reopen
              </Btn>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-emerald-400">
          <div className="p-5">
            <p className="text-sm font-semibold text-emerald-700">✓ Survey submitted — thank you for your feedback!</p>
          </div>
        </Card>
      )}
    </div>
  );
}

