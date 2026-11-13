import { useState, useEffect } from "react";
import { Card, Btn, Input, AIBadge, InnovationCallout, PriorityBadge } from "./design-system";
import { KNOWLEDGE_ARTICLES } from "./mock-data";

const CATEGORIES = ["Hardware", "Software", "Network", "Account/Access", "Printer", "Security"];
const URGENCIES = [
  { id: "low", label: "Low — Can wait a few days", color: "blue" },
  { id: "medium", label: "Medium — Need it today", color: "yellow" },
  { id: "high", label: "High — Work is blocked", color: "orange" },
  { id: "critical", label: "Critical — Outage / Many users affected", color: "red" },
];

const DRAFT_KEY = "nexdesk_ticket_draft";

export function NewTicketForm({ onSubmit, onCancel, onShowToast }: {
  onSubmit: (id: string) => void;
  onCancel: () => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: "", description: "", urgency: "", assetTag: "", affectedUsers: "1",
    title: "", attachments: [] as string[],
  });
  const [deflections, setDeflections] = useState<typeof KNOWLEDGE_ARTICLES>([]);
  const [aiPriority, setAIPriority] = useState<"P1" | "P2" | "P3" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [draftBanner, setDraftBanner] = useState<"restored" | "saved" | null>(null);

  // ── Restore saved draft on mount ────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.form) {
          setForm(saved.form);
          if (saved.step) setStep(saved.step);
          setDraftBanner("restored");
          setTimeout(() => setDraftBanner(null), 4000);
        }
      }
    } catch {}
  }, []);

  const handleDescChange = (val: string) => {
    setForm(f => ({ ...f, description: val }));
    if (val.length > 10) {
      const matches = KNOWLEDGE_ARTICLES.filter(a =>
        a.title.toLowerCase().split(" ").some(w => val.toLowerCase().includes(w))
      ).slice(0, 3);
      setDeflections(matches);
      // AI priority simulation
      const lower = val.toLowerCase();
      if (lower.includes("outage") || lower.includes("120") || lower.includes("vpn")) setAIPriority("P1");
      else if (lower.includes("email") || lower.includes("sync") || lower.includes("crash")) setAIPriority("P2");
      else setAIPriority("P3");
    }
  };

  const calcPriority = (): "P1" | "P2" | "P3" | "P4" => {
    const urgMap: Record<string, "P1" | "P2" | "P3" | "P4"> = { critical: "P1", high: "P2", medium: "P3", low: "P4" };
    return aiPriority || urgMap[form.urgency] || "P3";
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, savedAt: new Date().toISOString() }));
    } catch {}
    onShowToast?.("Draft saved! Your progress has been stored — continue anytime from Report Problem.", "success");
    setDraftBanner("saved");
    setTimeout(() => onCancel(), 1200);
  };

  if (submitted) {
    const ticketId = "TKT-" + Math.floor(1040 + Math.random() * 100);
    const eta = form.urgency === "critical" ? "4 hours" : form.urgency === "high" ? "8 hours" : "3 days";
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Your request has been received and will be assigned shortly.</p>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ticket ID</span>
              <span className="font-mono font-bold text-blue-600 text-lg">{ticketId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Priority</span>
              <PriorityBadge priority={calcPriority()} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Expected Response</span>
              <span className="text-sm font-semibold text-gray-800">{form.urgency === "critical" ? "15 minutes" : form.urgency === "high" ? "1 hour" : "4 hours"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Expected Resolution</span>
              <span className="text-sm font-semibold text-gray-800">{eta}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Assigned To</span>
              <span className="text-sm font-semibold text-gray-800">Ana Reyes</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Btn variant="primary" onClick={() => onSubmit(ticketId)}>View Ticket Status →</Btn>
            <Btn variant="secondary" onClick={onCancel}>Back to Portal</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Draft restored / saved banner */}
      {draftBanner && (
        <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          draftBanner === "restored"
            ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-emerald-50 border border-emerald-200 text-emerald-800"
        }`}>
          <span>{draftBanner === "restored" ? "📋" : "✓"}</span>
          {draftBanner === "restored"
            ? "Draft restored — we picked up where you left off."
            : "Draft saved! Your progress is stored — continue anytime."}
          <button onClick={() => setDraftBanner(null)} className="ml-auto text-current opacity-50 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      )}

      {/* Progress stepper */}
      <div className="mb-5 flex items-center gap-1 sm:mb-6 sm:gap-2">
        {["Category & Device", "Describe Issue", "Urgency & Submit"].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
              i + 1 < step ? "bg-green-500 text-white" : i + 1 === step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
            }`}>{i + 1 < step ? "✓" : i + 1}</div>
            <span className={`text-sm font-medium hidden md:block ${i + 1 === step ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
            {i < 2 && <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">What type of problem is this?</h2>
              <p className="text-sm text-gray-500">Select the category that best describes your issue.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {CATEGORIES.map(cat => {
                const icons: Record<string, string> = { Hardware: "💻", Software: "⚙️", Network: "🌐", "Account/Access": "🔑", Printer: "🖨️", Security: "🔒" };
                const descs: Record<string, string> = {
                  Hardware: "Laptop, desktop, monitor, keyboard...",
                  Software: "App crashes, install issues, bugs...",
                  Network: "VPN, WiFi, internet, connectivity...",
                  "Account/Access": "Password, login, permissions...",
                  Printer: "Not printing, offline, paper jam...",
                  Security: "Phishing, malware, data breach...",
                };
                return (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                      form.category === cat ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}>
                    <span className="text-3xl">{icons[cat]}</span>
                    <span className="text-sm font-semibold text-gray-800">{cat}</span>
                    <span className="text-xs text-gray-400">{descs[cat]}</span>
                    {cat === "Security" && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-semibold">Urgent Track</span>}
                  </button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Input label="Asset Tag / Device ID (optional)" placeholder="e.g. WIN-PC-0124 or scan QR"
                  value={form.assetTag} onChange={v => setForm(f => ({ ...f, assetTag: v }))} />
                <p className="text-xs text-gray-400 mt-1">📱 Or scan the QR sticker on your device</p>
              </div>
              <Input label="How many users are affected?" placeholder="1" type="number"
                value={form.affectedUsers} onChange={v => setForm(f => ({ ...f, affectedUsers: v }))} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <Btn variant="secondary" className="w-full" onClick={onCancel}>Cancel</Btn>
              <Btn disabled={!form.category} className="w-full" onClick={() => setStep(2)}>Continue →</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Describe your problem</h2>
                <p className="text-sm text-gray-500">Be as specific as possible — error messages, when it started, what you tried.</p>
              </div>
            </div>

            <Input label="Brief title" placeholder="e.g. Outlook not loading emails"
              value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full description</label>
              <textarea
                value={form.description}
                onChange={e => handleDescChange(e.target.value)}
                placeholder="Describe the issue in detail. When did it start? What error message do you see? What have you already tried?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
              />
            </div>

            {/* Knowledge Base suggestions */}
            {deflections.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-800 mb-2">📖 These articles might solve your problem:</p>
                {deflections.map(a => (
                  <div key={a.id} className="flex items-center gap-2 py-2 border-b border-blue-100 last:border-0">
                    <span className="text-blue-500">📖</span>
                    <p className="text-sm text-blue-700 flex-1">{a.title}</p>
                    <button className="text-xs text-blue-600 font-semibold hover:underline flex-shrink-0">Read →</button>
                  </div>
                ))}
                <p className="text-xs text-blue-500 mt-2 italic">Did one of these solve it? If yes, you don't need to submit a ticket!</p>
              </div>
            )}

            {/* File upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <span className="text-2xl">📎</span>
              <p className="text-sm text-gray-600 mt-1">Drag & drop screenshot or file, or <span className="text-blue-600 underline">browse</span></p>
              <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
            </div>

            <div className="flex justify-between">
              <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
              <Btn disabled={!form.description} onClick={() => setStep(3)}>Continue →</Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Urgency & Review</h2>
              <p className="text-sm text-gray-500">How urgently do you need this resolved?</p>
            </div>

            <div className="space-y-2">
              {URGENCIES.map(u => {
                const colors: Record<string, string> = { blue: "border-blue-400 bg-blue-50", yellow: "border-yellow-400 bg-yellow-50", orange: "border-orange-400 bg-orange-50", red: "border-red-400 bg-red-50" };
                return (
                  <button key={u.id} onClick={() => setForm(f => ({ ...f, urgency: u.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      form.urgency === u.id ? colors[u.color] : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${form.urgency === u.id ? "border-blue-500 bg-blue-500" : "border-gray-300"}`} />
                    <span className="text-sm font-medium text-gray-800">{u.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Review your ticket:</p>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-800">{form.category}</span></div>
                <div><span className="text-gray-500">Priority:</span> <PriorityBadge priority={calcPriority()} /></div>
                <div><span className="text-gray-500">Asset:</span> <span className="font-medium text-gray-800">{form.assetTag || "Not specified"}</span></div>
                <div><span className="text-gray-500">Affected users:</span> <span className="font-medium text-gray-800">{form.affectedUsers}</span></div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Btn variant="secondary" onClick={handleSaveDraft}>Save Draft</Btn>
                <Btn disabled={!form.urgency} onClick={() => { try { localStorage.removeItem(DRAFT_KEY); } catch {} setSubmitted(true); }}>
                  🚀 Submit Ticket
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
