import { useState } from "react";
import { Card, Btn, Avatar, AIBadge, SectionHeader, StatCard } from "./design-system";
import { QA_REVIEWS, TECHNICIANS } from "./mock-data";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { exportData } from "../src/utils/export-data";

export function QADashboard({ onViewTicket, onNewTicket, onShowToast }: {
  onViewTicket?: (id: string) => void;
  onNewTicket?: () => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
}) {
  const [activeTab, setActiveTab]         = useState("Reviews");
  const [selectedTech, setSelectedTech]   = useState("T001");
  const [coachingNote, setCoachingNote]   = useState<string | null>(null);
  const [filterTech, setFilterTech]       = useState("all");
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
  const [editingDraft, setEditingDraft]   = useState<number | null>(null);
  const [draftContent, setDraftContent]   = useState("");

  const tech = TECHNICIANS.find(t => t.id === selectedTech) || TECHNICIANS[0];
  const techReviews = QA_REVIEWS.filter(r => r.tech === tech.name);

  const filteredReviews = filterTech === "all"
    ? QA_REVIEWS
    : QA_REVIEWS.filter(r => r.tech === filterTech);

  const exportScorecards = () => {
    exportData({
      filename: "qa-scorecards",
      title: "QA Review Scorecards",
      format: "CSV",
      rows: QA_REVIEWS.map(review => ({
        reviewId: review.id,
        ticket: review.ticket,
        technician: review.tech,
        reviewer: review.reviewer,
        date: review.date,
        communication: review.scores.communication,
        accuracy: review.scores.accuracy,
        documentation: review.scores.documentation,
        timeliness: review.scores.timeliness,
        totalPercent: review.total,
        result: review.pass ? "Passed" : "Failed",
        notes: review.notes,
      })),
    });
    onShowToast?.("QA scorecards downloaded", "success");
  };

  const radarData = [
    { metric: "CSAT",        value: (tech.csat / 5) * 100 },
    { metric: "QA Score",    value: tech.qaScore },
    { metric: "SLA Comp.",   value: tech.slaCompliance },
    { metric: "Docs",        value: 85 },
    { metric: "1st Contact", value: 72 },
    { metric: "No Reopen",   value: 100 - tech.reopenRate * 10 },
  ];

  const KB_SUGGESTIONS = [
    { ticket: "TKT-1006", title: "How to provision M365 license for new employee (Azure AD)", resolution: "Assigned E3 license via Microsoft Admin Center, enabled Exchange Online, waited 15 min for sync.", potential: 12 },
    { ticket: "TKT-0891", title: "Rebuilding Outlook OST file for sync issues", resolution: "Navigate to Control Panel → Mail → Email Accounts → Data Files, remove OST, restart Outlook.", potential: 8 },
    { ticket: "TKT-0812", title: "Fixing HP LaserJet offline status on Windows 11", resolution: "Remove printer, clear print spooler service, re-add using TCP/IP port instead of Windows driver.", potential: 15 },
  ];

  const visibleSuggestions = KB_SUGGESTIONS.filter((_, i) => !dismissedSuggestions.includes(i));

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QA Review & Scorecards</h1>
          <p className="text-sm text-gray-500">Quality assurance sampling, technician performance, and continuous improvement</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Btn size="sm" variant="secondary" className="w-full" onClick={exportScorecards}>📥 Export</Btn>
          <Btn size="sm" variant="primary" className="w-full" onClick={() => onShowToast?.("QA Review form opened — select a closed ticket to begin.", "info")}>+ Start Review</Btn>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
        <StatCard label="Avg Team CSAT" value="4.5★" sub="Last 30 days" color="amber" />
        <StatCard label="Avg QA Score" value="88%" sub="8 techs, sampled" color="blue" />
        <StatCard label="Reviews Done" value={24} sub="This month" color="teal" />
        <StatCard label="Failed Reviews" value={3} sub="Below 70% threshold" color="red" />
        <StatCard label="KB Articles Created" value={5} sub="From QA suggestions" color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["Reviews", "Scorecards", "Survey Results", "KB Suggestions"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Reviews Tab ── */}
      {activeTab === "Reviews" && (
        <div className="space-y-4">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""} · sampling rate: 10% of closed tickets
            </p>
            <div className="flex gap-2">
              <select
                value={filterTech}
                onChange={e => setFilterTech(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="all">All Technicians</option>
                {TECHNICIANS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm italic">No reviews found for this technician.</div>
          ) : filteredReviews.map(r => (
            <Card key={r.id}>
              <div className="p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-blue-600 font-bold">{r.id}</span>
                      <span className="text-xs text-gray-400">→ Ticket {r.ticket}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {r.pass ? "✓ PASSED" : "✕ FAILED"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar initials={r.tech.split(" ").map(n => n[0]).join("")} size="sm" />
                      <span className="text-sm font-semibold text-gray-800">{r.tech}</span>
                      <span className="text-xs text-gray-400">reviewed by {r.reviewer}</span>
                      <span className="text-xs text-gray-400">· {r.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3 text-right sm:block">
                    <p className="text-3xl font-bold text-gray-900">{r.total}%</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div className={`h-2 rounded-full ${r.total >= 80 ? "bg-green-500" : r.total >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${r.total}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {Object.entries(r.scores).map(([key, val]) => (
                    <div key={key} className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 capitalize mb-1">{key}</p>
                      <div className="flex justify-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-base ${s <= val ? "text-amber-400" : "text-gray-200"}`}>★</span>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">{val}/5</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-0.5">Reviewer Notes:</p>
                  <p className="text-sm text-gray-700">{r.notes}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Btn size="sm" variant="secondary" onClick={() => onViewTicket?.(r.ticket)}>View Ticket</Btn>
                  {!r.pass && (
                    <Btn size="sm" variant="primary" onClick={() => {
                      setCoachingNote(coachingNote === r.id ? null : r.id);
                      onShowToast?.(`Coaching note opened for ${r.tech}`, "info");
                    }}>Coaching Note</Btn>
                  )}
                  <Btn size="sm" variant="ghost" onClick={() => onShowToast?.(`Feedback shared with ${r.tech} ✓`, "success")}>Share Feedback</Btn>
                </div>
                {coachingNote === r.id && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-2">📝 Coaching Note for {r.tech}</p>
                    <textarea
                      className="w-full text-xs border border-amber-200 rounded-lg p-2 bg-white resize-none outline-none focus:border-amber-400"
                      rows={3}
                      placeholder="Write coaching note here..."
                      defaultValue={`Re: ${r.ticket} — ${r.notes}`}
                    />
                    <div className="flex gap-2 mt-2">
                      <Btn size="sm" variant="primary" onClick={() => { setCoachingNote(null); onShowToast?.(`Coaching note saved and sent to ${r.tech}`, "success"); }}>Send Note</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => setCoachingNote(null)}>Cancel</Btn>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Scorecards Tab ── */}
      {activeTab === "Scorecards" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select Technician:</p>
            {TECHNICIANS.map(t => (
              <button key={t.id} onClick={() => setSelectedTech(t.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${selectedTech === t.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <Avatar initials={t.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{t.qaScore}%</p>
                  <p className="text-xs text-gray-400">{t.csat}★</p>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card title={`${tech.name} — Quality Scorecard`}>
              <div className="p-4 grid md:grid-cols-2 gap-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name={tech.name} dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "CSAT Score", value: `${tech.csat}★ / 5.0`, color: "text-amber-600" },
                    { label: "QA Score", value: `${tech.qaScore}%`, color: tech.qaScore >= 80 ? "text-green-600" : "text-red-600" },
                    { label: "SLA Compliance", value: `${tech.slaCompliance}%`, color: tech.slaCompliance >= 90 ? "text-green-600" : "text-amber-600" },
                    { label: "Reopen Rate", value: `${tech.reopenRate}%`, color: tech.reopenRate <= 2 ? "text-green-600" : "text-red-600" },
                    { label: "Resolved This Month", value: tech.thisMonth, color: "text-blue-600" },
                    { label: "Total Resolved", value: tech.totalResolved, color: "text-gray-700" },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{m.label}</span>
                      <span className={`font-bold ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Badges Earned:</p>
                <div className="flex flex-wrap gap-2">
                  {tech.badges.map(b => (
                    <span key={b} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800">
                      🏆 {b}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                  🔥 Current Streak: <strong className="text-gray-700">{tech.streak} days</strong> without SLA breach
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Survey Results Tab ── */}
      {activeTab === "Survey Results" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-5">
            <Card title="CSAT Distribution">
              <div className="p-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { stars: "⭐ 1", count: 2 },
                    { stars: "⭐⭐ 2", count: 4 },
                    { stars: "⭐⭐⭐ 3", count: 12 },
                    { stars: "⭐⭐⭐⭐ 4", count: 45 },
                    { stars: "⭐⭐⭐⭐⭐ 5", count: 78 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="stars" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Responses" radius={[3,3,0,0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="md:col-span-2" title="Recent Survey Comments">
              <div className="divide-y divide-gray-50">
                {[
                  { name: "Clara Park", score: 5, comment: "Ana fixed my MacBook so fast! She explained everything clearly.", tech: "Ana Reyes" },
                  { name: "Tom Richards", score: 5, comment: "Priya provisioned Sarah's account within 2.5 hours. Amazing service.", tech: "Priya Sharma" },
                  { name: "Patrick Moore", score: 3, comment: "Still waiting on my Zoom issue, assigned 2 days ago...", tech: "Sam Torres" },
                  { name: "Kevin Walsh", score: 4, comment: "Waiting on part but Jordan kept me updated. Good communication.", tech: "Jordan Kim" },
                ].map((s, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                        <span className="text-amber-400">{"★".repeat(s.score)}{"☆".repeat(5 - s.score)}</span>
                        <span className="text-xs text-gray-400">→ {s.tech}</span>
                      </div>
                      <p className="text-sm text-gray-600">{s.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── KB Suggestions Tab ── */}
      {activeTab === "KB Suggestions" && (
        <div className="space-y-4">
          {visibleSuggestions.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm italic">All suggestions have been handled.</div>
          )}
          {visibleSuggestions.map((s, i) => {
            const originalIndex = KB_SUGGESTIONS.indexOf(s);
            return (
              <Card key={originalIndex}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-blue-600">{s.ticket}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-green-600">{s.potential}</p>
                      <p className="text-xs text-gray-400">similar tickets/mo</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Resolution summary (AI-drafted):</p>
                    <p className="text-sm text-gray-700">{s.resolution}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setDismissedSuggestions(prev => [...prev, originalIndex]);
                        onShowToast?.(`KB article "${s.title.slice(0, 40)}…" created and published.`, "success");
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Create KB Article
                    </button>
                    <button
                      onClick={() => { setEditingDraft(originalIndex); setDraftContent(s.resolution); }}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                      Edit Draft
                    </button>
                    <button
                      onClick={() => {
                        setDismissedSuggestions(prev => [...prev, originalIndex]);
                        onShowToast?.("Suggestion dismissed.", "info");
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-500 text-xs font-semibold rounded-lg transition-colors">
                      Dismiss
                    </button>
                  </div>

                  {/* Inline draft editor */}
                  {editingDraft === originalIndex && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-2">✏️ Edit Draft — {s.title.slice(0, 50)}…</p>
                      <textarea
                        value={draftContent}
                        onChange={e => setDraftContent(e.target.value)}
                        className="w-full text-xs border border-blue-200 rounded-lg p-2 bg-white resize-none outline-none focus:border-blue-400"
                        rows={4}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditingDraft(null);
                            onShowToast?.("Draft saved successfully.", "success");
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                          Save Draft
                        </button>
                        <button
                          onClick={() => setEditingDraft(null)}
                          className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
