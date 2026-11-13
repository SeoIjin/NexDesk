import { Fragment, useState } from "react";
import { Card, Btn, Avatar, SkillBar, StatCard } from "./design-system";
import { TECHNICIANS, SHIFTS } from "./mock-data";
import { X, CheckCircle, UserPlus, BookOpen, Pencil, ChevronDown } from "lucide-react";
import { exportData } from "../src/utils/export-data";

const CATEGORIES = ["Hardware", "Software", "Network", "Account/Access", "Printer", "Security"];
const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayKeys    = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

// ── Training course suggestions per skill ─────────────────────────────────────
const TRAINING_COURSES: Record<string, { title: string; provider: string; hours: number; level: string }[]> = {
  Hardware:          [{ title: "CompTIA A+ Certification",         provider: "CompTIA",          hours: 40, level: "Intermediate" },
                      { title: "Hardware Troubleshooting Pro",      provider: "Pluralsight",      hours: 12, level: "Advanced"     }],
  Software:          [{ title: "Windows 11 IT Pro Training",       provider: "Microsoft Learn",  hours: 20, level: "Intermediate" },
                      { title: "macOS Support Essentials",         provider: "Apple Training",   hours: 16, level: "Intermediate" }],
  Network:           [{ title: "CompTIA Network+",                  provider: "CompTIA",          hours: 60, level: "Intermediate" },
                      { title: "Cisco CCNA Routing & Switching",   provider: "Cisco Academy",    hours: 80, level: "Advanced"     }],
  "Account/Access":  [{ title: "Active Directory Administration",  provider: "Microsoft Learn",  hours: 18, level: "Intermediate" },
                      { title: "Azure AD & SSO Fundamentals",      provider: "Microsoft Learn",  hours: 10, level: "Beginner"     }],
  Printer:           [{ title: "Enterprise Print Management",       provider: "HP Academy",       hours: 8,  level: "Beginner"    },
                      { title: "Network Printer Config & Repair",  provider: "Udemy",            hours: 6,  level: "Intermediate" }],
  Security:          [{ title: "CompTIA Security+",                 provider: "CompTIA",          hours: 60, level: "Intermediate" },
                      { title: "CrowdStrike Falcon Responder",     provider: "CrowdStrike",      hours: 24, level: "Advanced"     }],
};

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", width: "100%", maxWidth: wide ? 680 : 520, maxHeight: "90vh", overflow: "auto", margin: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>{title}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4, borderRadius: 6 }}
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

const inputStyle: React.CSSProperties  = { width: "100%", height: 40, padding: "8px 11px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" };
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 36 };

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

// ── Component ─────────────────────────────────────────────────────────────────
export function SkillsAndShifts() {
  const [activeTab,    setActiveTab]    = useState("Skills Matrix");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [toast,        setToast]        = useState<string | null>(null);

  // Modal visibility
  const [showAddTech,    setShowAddTech]    = useState(false);
  const [showEditSkills, setShowEditSkills] = useState(false);
  const [showTraining,   setShowTraining]   = useState(false);

  // Add-technician form
  const [addForm, setAddForm] = useState({
    name: "", role: "Tier 1 Support", tier: "1", location: "Floor 1", onCall: false,
    skills: Object.fromEntries(CATEGORIES.map(c => [c, 50])) as Record<string, number>,
  });

  // Edit-skills state — seeded from selected tech when modal opens
  const [editSkills, setEditSkills] = useState<Record<string, number>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const selectedTechObj = selectedTech ? TECHNICIANS.find(t => t.id === selectedTech) ?? null : null;

  const openEditSkills = () => {
    if (!selectedTechObj) return;
    setEditSkills({ ...(selectedTechObj.skills as Record<string, number>) });
    setShowEditSkills(true);
  };

  const getShiftColor = (val: string) =>
    val === "OFF"     ? "bg-gray-100 text-gray-400" :
    val === "ON-CALL" ? "bg-purple-100 text-purple-700 font-semibold" :
    "bg-blue-50 text-blue-700";

  // Skills below Advanced threshold (< 75) for Training Plan
  const weakSkills = selectedTechObj
    ? CATEGORIES.filter(c => ((selectedTechObj.skills as Record<string, number>)[c] || 0) < 75)
    : [];

  const exportSkillsAndShifts = () => {
    exportData({
      filename: "skills-and-shifts",
      title: "Technician Skills and Shift Schedule",
      format: "CSV",
      rows: TECHNICIANS.map(technician => {
        const shift = SHIFTS.find(item => item.tech === technician.id);
        return {
          technicianId: technician.id,
          name: technician.name,
          role: technician.role,
          tier: technician.tier,
          location: technician.location,
          available: technician.available ? "Yes" : "No",
          onCallEligible: technician.onCall ? "Yes" : "No",
          ...technician.skills,
          monday: shift?.mon ?? "",
          tuesday: shift?.tue ?? "",
          wednesday: shift?.wed ?? "",
          thursday: shift?.thu ?? "",
          friday: shift?.fri ?? "",
          saturday: shift?.sat ?? "",
          sunday: shift?.sun ?? "",
          onCallSchedule: shift?.onCall ?? "",
        };
      }),
    });
    showToast("Skills and shifts report downloaded");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Matrix & Shift Scheduling</h1>
          <p className="text-sm text-gray-500">Manage technician skills, availability, and on-call rotations</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Btn size="sm" variant="secondary" className="w-full" onClick={exportSkillsAndShifts}>Export</Btn>
          <Btn size="sm" variant="primary" className="w-full" onClick={() => setShowAddTech(true)}>+ Technician</Btn>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard label="Total Technicians" value={8}  sub="3 on-call capable"           color="blue"   />
        <StatCard label="Available Now"     value={6}  sub="Jordan & Devon — off shift"  color="green"  />
        <StatCard label="On Call (Tonight)" value={2}  sub="Lena Novak, Robin Walsh"     color="purple" />
        <StatCard label="Skill Gaps"        value={2}  sub="Security, Hardware Tier 3"   color="red"    />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["Skills Matrix", "Shift Calendar", "On-Call Rotation"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Skills Matrix ── */}
      {activeTab === "Skills Matrix" && (
        <div className="space-y-4">
          <Card title="Skills Proficiency Heatmap (0–100)">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Technician</th>
                    <th className="px-2 py-3 text-center text-xs text-gray-500">Tier</th>
                    {CATEGORIES.map(cat => (
                      <th key={cat} className="px-3 py-3 text-center text-xs font-semibold text-gray-500">{cat}</th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs text-gray-500">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TECHNICIANS.map(tech => {
                    const avg = Math.round(Object.values(tech.skills).reduce((a, b) => a + b, 0) / 6);
                    const isSelected = selectedTech === tech.id;
                    return (
                      <Fragment key={tech.id}>
                        <tr
                          onClick={() => setSelectedTech(isSelected ? null : tech.id)}
                          className={`hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar initials={tech.avatar} size="sm" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{tech.name}</p>
                                <p className="text-xs text-gray-400">{tech.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${tech.tier === 3 ? "bg-purple-100 text-purple-700" : tech.tier === 2 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                              T{tech.tier}
                            </span>
                          </td>
                          {CATEGORIES.map(cat => {
                            const level = (tech.skills as Record<string, number>)[cat] || 0;
                            const bg    = level >= 90 ? "bg-emerald-500 text-white" : level >= 75 ? "bg-blue-400 text-white" : level >= 55 ? "bg-amber-300 text-gray-800" : level >= 30 ? "bg-orange-200 text-gray-700" : "bg-gray-100 text-gray-400";
                            return (
                              <td key={cat} className="px-3 py-3 text-center">
                                <span className={`inline-block w-10 py-1 rounded text-xs font-bold ${bg}`}>{level}</span>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center">
                            <span className={`text-sm font-bold ${avg >= 80 ? "text-green-600" : avg >= 65 ? "text-blue-600" : "text-amber-600"}`}>{avg}</span>
                          </td>
                        </tr>

                        {isSelected && (
                          <tr className="bg-blue-50/40">
                            <td colSpan={CATEGORIES.length + 3} className="p-0">
                              <div className="sticky left-0 w-[calc(100vw-3rem)] border-y border-blue-100 bg-white md:static md:w-auto">
                                <div className="border-b border-gray-100 px-4 py-3">
                                  <p className="text-sm font-bold text-gray-900">{tech.name} — Skill Detail</p>
                                </div>
                                <div className="grid gap-6 p-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    {CATEGORIES.map(cat => (
                                      <SkillBar key={cat} skill={cat} level={(tech.skills as Record<string, number>)[cat] || 0} />
                                    ))}
                                  </div>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">Tier</p>
                                        <p className="font-bold text-gray-800">Tier {tech.tier}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">Location</p>
                                        <p className="font-bold text-gray-800">{tech.location}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">On Call</p>
                                        <p className={`font-bold ${tech.onCall ? "text-green-700" : "text-gray-500"}`}>{tech.onCall ? "✓ Yes" : "No"}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">Available</p>
                                        <p className={`font-bold ${tech.available ? "text-green-700" : "text-red-600"}`}>{tech.available ? "✓ Yes" : "In shift"}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                      <Btn size="sm" variant="primary" onClick={openEditSkills}>✏️ Edit Skills</Btn>
                                      <Btn size="sm" variant="secondary" onClick={() => setShowTraining(true)}>📚 Training Plan</Btn>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
              <span className="text-gray-500">Proficiency scale:</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-500 inline-block"/>Expert (90+)</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-400 inline-block"/>Advanced (75–89)</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-300 inline-block"/>Intermediate (55–74)</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-orange-200 inline-block"/>Beginner (30–54)</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-100 inline-block"/>None (&lt;30)</span>
            </div>
          </Card>

          {/* Skill gap alert */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-bold text-red-800 mb-2">⚠ Identified Skill Gaps</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-white rounded border border-red-100">
                <p className="font-semibold text-red-700">Security (Tier 3) — 1 qualified tech</p>
                <p className="text-red-600 text-xs">Only Lena Novak at ≥90. Single point of failure. Recommend training Robin Walsh to 90+.</p>
              </div>
              <div className="p-3 bg-white rounded border border-red-100">
                <p className="font-semibold text-red-700">Hardware (Expert) — 1 qualified tech</p>
                <p className="text-red-600 text-xs">Only Jordan Kim at ≥95. Jordan on leave today. Auto-fallback active to Robin Walsh (85).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shift Calendar ── */}
      {activeTab === "Shift Calendar" && (
        <Card title="Weekly Shift Schedule — Week of Nov 2, 2026">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Technician</th>
                  {DAYS.map(d => (
                    <th key={d} className={`px-3 py-3 text-center text-xs font-semibold ${d === "Mon" ? "text-blue-600 bg-blue-50" : "text-gray-500"}`}>
                      {d}{d === "Mon" ? " (Today)" : ""}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs text-gray-500">On-Call Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SHIFTS.map(s => (
                  <tr key={s.tech} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {s.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    {dayKeys.map(dk => (
                      <td key={dk} className="px-2 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getShiftColor(s[dk])}`}>{s[dk]}</span>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center text-xs">
                      {s.onCall
                        ? <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">{s.onCall}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-50 border border-blue-200 inline-block"/>Regular shift</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-purple-100 inline-block"/>On-call</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-100 inline-block"/>Day off</span>
          </div>
        </Card>
      )}

      {/* ── On-Call Rotation ── */}
      {activeTab === "On-Call Rotation" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card title="Tonight's On-Call Coverage">
              <div className="p-4 space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs font-semibold text-purple-700 mb-2">AFTER HOURS P1 ESCALATION (Tonight: Sat–Sun)</p>
                  <div className="flex items-center gap-3">
                    <Avatar initials="LN" size="md" />
                    <div>
                      <p className="font-semibold text-gray-800">Lena Novak</p>
                      <p className="text-xs text-gray-500">Security Analyst · Tier 3</p>
                      <p className="text-xs text-purple-600 font-medium">On-call: Sat–Sun</p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-xs rounded font-bold">PRIMARY</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-2">BACKUP ESCALATION</p>
                  <div className="flex items-center gap-3">
                    <Avatar initials="RW" size="md" />
                    <div>
                      <p className="font-semibold text-gray-800">Robin Walsh</p>
                      <p className="text-xs text-gray-500">Tier 3 / Escalation · All skills</p>
                      <p className="text-xs text-gray-500">On-call: Fri–Sat</p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-gray-400 text-white text-xs rounded font-bold">BACKUP</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="On-Call Rules">
              <div className="p-4 space-y-3 text-sm">
                {[
                  { rule: "P1 after hours → auto-page on-call technician via SMS + Slack", icon: "📱" },
                  { rule: "If on-call doesn't respond in 10 min → escalate to backup",     icon: "🔄" },
                  { rule: "P2+ after hours → wait until next shift unless requester is VIP", icon: "⭐" },
                  { rule: "P1 outage → also notify IT Manager immediately",                 icon: "📊" },
                  { rule: "On-call tech receives 1.5× ticket credit for quality scoring",   icon: "🏆" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                    <span>{r.icon}</span>
                    <p className="text-gray-700 text-xs">{r.rule}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}

      {/* ── Add Technician ── */}
      {showAddTech && (
        <Modal title="👤 Add New Technician" onClose={() => setShowAddTech(false)} wide>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Field label="Full Name">
              <input style={inputStyle} placeholder="e.g. Alex Rivera" value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Role">
              <SelectControl value={addForm.role} onChange={role => setAddForm(f => ({ ...f, role }))}>
                {["Tier 1 Support", "Tier 2 Support", "Security Analyst", "Network Engineer", "Tier 3 / Escalation"].map(o => <option key={o}>{o}</option>)}
              </SelectControl>
            </Field>
            <Field label="Tier">
              <SelectControl value={addForm.tier} onChange={tier => setAddForm(f => ({ ...f, tier }))}>
                {["1", "2", "3"].map(o => <option key={o} value={o}>Tier {o}</option>)}
              </SelectControl>
            </Field>
            <Field label="Location">
              <SelectControl value={addForm.location} onChange={location => setAddForm(f => ({ ...f, location }))}>
                {["Floor 1", "Floor 2", "Floor 3", "Remote", "Data Center"].map(o => <option key={o}>{o}</option>)}
              </SelectControl>
            </Field>
          </div>

          {/* On-call toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>On-Call Eligible</p>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Can be scheduled for after-hours on-call rotation</p>
            </div>
            <div onClick={() => setAddForm(f => ({ ...f, onCall: !f.onCall }))}
              style={{ width: 44, height: 24, borderRadius: 12, background: addForm.onCall ? "#2563eb" : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: addForm.onCall ? "auto" : 3, right: addForm.onCall ? 3 : "auto", width: 18, height: 18, borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "all 0.2s" }} />
            </div>
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Initial Skill Levels</p>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "#4b5563" }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{addForm.skills[cat]}</span>
                </div>
                <input type="range" min={0} max={100} value={addForm.skills[cat]}
                  onChange={e => setAddForm(f => ({ ...f, skills: { ...f.skills, [cat]: Number(e.target.value) } }))}
                  className="w-full accent-blue-600" />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8, borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
            <Btn variant="ghost" onClick={() => setShowAddTech(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => {
              if (!addForm.name.trim()) { showToast("Please enter a technician name"); return; }
              setShowAddTech(false);
              showToast(`${addForm.name} added to the technician roster`);
            }}>Add Technician</Btn>
          </div>
        </Modal>
      )}

      {/* ── Edit Skills ── */}
      {showEditSkills && selectedTechObj && (
        <Modal title={`✏️ Edit Skills — ${selectedTechObj.name}`} onClose={() => setShowEditSkills(false)}>
          <div style={{ padding: "8px 12px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", marginBottom: 16, fontSize: 12, color: "#1d4ed8" }}>
            Adjust the proficiency sliders. Changes update the skills heatmap and auto-dispatch scoring.
          </div>
          <div className="space-y-4">
            {CATEGORIES.map(cat => {
              const val   = editSkills[cat] ?? 0;
              const color = val >= 90 ? "#10b981" : val >= 75 ? "#3b82f6" : val >= 55 ? "#f59e0b" : val >= 30 ? "#f97316" : "#9ca3af";
              const label = val >= 90 ? "Expert" : val >= 75 ? "Advanced" : val >= 55 ? "Intermediate" : val >= 30 ? "Beginner" : "None";
              return (
                <div key={cat}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{cat}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color, padding: "1px 7px", borderRadius: 4, background: color + "20" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28, textAlign: "right" }}>{val}</span>
                    </div>
                  </div>
                  <input type="range" min={0} max={100} value={val}
                    onChange={e => setEditSkills(s => ({ ...s, [cat]: Number(e.target.value) }))}
                    className="w-full accent-blue-600" />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18, borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
            <Btn variant="ghost" onClick={() => setShowEditSkills(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => {
              setShowEditSkills(false);
              showToast(`Skills updated for ${selectedTechObj.name}`);
            }}>💾 Save Skills</Btn>
          </div>
        </Modal>
      )}

      {/* ── Training Plan ── */}
      {showTraining && selectedTechObj && (
        <Modal title={`📚 Training Plan — ${selectedTechObj.name}`} onClose={() => setShowTraining(false)} wide>
          {/* Status banner */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: weakSkills.length === 0 ? "#f0fdf4" : "#fffbeb", borderRadius: 10, border: `1px solid ${weakSkills.length === 0 ? "#bbf7d0" : "#fde68a"}`, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>{weakSkills.length === 0 ? "🏆" : "📋"}</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: weakSkills.length === 0 ? "#166534" : "#92400e" }}>
                {weakSkills.length === 0
                  ? `${selectedTechObj.name} has no skill gaps — all categories are Advanced or Expert!`
                  : `${weakSkills.length} skill gap${weakSkills.length > 1 ? "s" : ""} identified: ${weakSkills.join(", ")}`}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: weakSkills.length === 0 ? "#4ade80" : "#b45309" }}>
                {weakSkills.length === 0 ? "Consider advanced certification paths to maintain expert status." : "Recommended courses listed below. Click Assign to start tracking progress."}
              </p>
            </div>
          </div>

          {weakSkills.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
              No training courses required at this time.
            </div>
          ) : (
            <div className="space-y-5">
              {weakSkills.map(cat => {
                const currentLevel = (selectedTechObj.skills as Record<string, number>)[cat] || 0;
                const courses      = TRAINING_COURSES[cat] || [];
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{cat}</span>
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: "#fef3c7", color: "#92400e", fontWeight: 600 }}>
                        Current: {currentLevel} ({currentLevel >= 55 ? "Intermediate" : currentLevel >= 30 ? "Beginner" : "None"})
                      </span>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>→ Target: 75+ (Advanced)</span>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {courses.map((course, ci) => (
                        <div key={ci} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{course.title}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{course.provider} · {course.hours}h · {course.level}</p>
                          </div>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#dbeafe", color: "#1e40af", fontWeight: 600, flexShrink: 0 }}>{course.hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Total hours */}
              <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>Total estimated training time</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>
                  {weakSkills.reduce((total, cat) => total + (TRAINING_COURSES[cat] || []).reduce((s, c) => s + c.hours, 0), 0)}h
                </span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18, borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
            <Btn variant="ghost" onClick={() => setShowTraining(false)}>Close</Btn>
            {weakSkills.length > 0 && (
              <Btn variant="primary" onClick={() => {
                setShowTraining(false);
                showToast(`Training plan assigned to ${selectedTechObj.name} — ${weakSkills.length} course${weakSkills.length > 1 ? "s" : ""} queued`);
              }}>📋 Assign Training Plan</Btn>
            )}
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
