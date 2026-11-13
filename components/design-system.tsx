import React, { useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";

// ── Priority Badge ──────────────────────────────────────────────────────────
export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    P1: "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-100",
    P2: "bg-orange-50 text-orange-700 border border-orange-200",
    P3: "bg-amber-50 text-amber-700 border border-amber-200",
    P4: "bg-sky-50 text-sky-700 border border-sky-200",
  };
  const label: Record<string, string> = {
    P1: "P1 Critical", P2: "P2 High", P3: "P3 Medium", P4: "P4 Low",
  };
  const dots: Record<string, string> = {
    P1: "bg-red-500", P2: "bg-orange-500", P3: "bg-amber-400", P4: "bg-sky-400",
  };
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 py-0.5 rounded-md text-xs font-semibold ${map[priority] || "bg-gray-100 text-gray-700"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[priority] || "bg-gray-400"}`} />
      {label[priority] || priority}
    </span>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "New":              "bg-gray-100 text-gray-600 border border-gray-200",
    "Triaged":          "bg-purple-50 text-purple-700 border border-purple-200",
    "Assigned":         "bg-blue-50 text-blue-700 border border-blue-200",
    "In Progress":      "bg-indigo-50 text-indigo-700 border border-indigo-200",
    "Pending":          "bg-amber-50 text-amber-700 border border-amber-200",
    "Resolved":         "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Verified/Closed":  "bg-teal-50 text-teal-700 border border-teal-200",
    "Reopened":         "bg-red-50 text-red-700 border border-red-200",
    "Escalated":        "bg-rose-50 text-rose-700 border border-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── SLA Timer Chip ────────────────────────────────────────────────────────────
export function SLAChip({ remaining, breached, paused }: { remaining: number; breached?: boolean; paused?: boolean }) {
  if (paused) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
      ⏸ Paused
    </span>
  );
  if (breached || remaining < 0) {
    const over = Math.abs(remaining);
    const h = Math.floor(over / 60); const m = over % 60;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
        ⚠ BREACHED +{h}h {m}m
      </span>
    );
  }
  const h = Math.floor(remaining / 60); const m = remaining % 60;
  const color = remaining < 60
    ? "bg-red-50 text-red-700 border border-red-200"
    : remaining < 180
    ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  const dot = remaining < 60 ? "bg-red-500" : remaining < 180 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {h}h {m}m left
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = "md", color }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const colors = ["bg-blue-500", "bg-teal-500", "bg-purple-500", "bg-rose-500", "bg-orange-500", "bg-emerald-500", "bg-indigo-500", "bg-pink-500"];
  const idx = initials.charCodeAt(0) % colors.length;
  const bg = color || colors[idx];
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div className={`${sizes[size]} ${bg} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, trend, color = "blue", icon }: {
  label: string; value: string | number; sub?: string; trend?: string; color?: string; icon?: React.ReactNode
}) {
  const accents: Record<string, { bar: string; icon: string }> = {
    blue:   { bar: "bg-blue-500",    icon: "text-blue-400" },
    green:  { bar: "bg-emerald-500", icon: "text-emerald-400" },
    red:    { bar: "bg-red-500",     icon: "text-red-400" },
    amber:  { bar: "bg-amber-500",   icon: "text-amber-400" },
    purple: { bar: "bg-violet-500",  icon: "text-violet-400" },
    teal:   { bar: "bg-teal-500",    icon: "text-teal-400" },
  };
  const a = accents[color] || accents.blue;
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:p-5">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${a.bar}`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        {icon && <div className={`${a.icon} opacity-70 group-hover:opacity-100 transition-opacity`}>{icon}</div>}
      </div>
      <p className="mb-1 text-2xl font-bold leading-none text-gray-900 sm:text-[28px]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {trend && (
        <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${trend.startsWith("+") ? "text-red-500" : "text-emerald-500"}`}>
          {trend}
        </p>
      )}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", title, action }: {
  children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode
}) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_10px_30px_rgba(15,23,42,0.045)] ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/60 px-4 py-3 sm:px-5 sm:py-4">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {badge && (
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{badge}</span>
        )}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── AI Badge ──────────────────────────────────────────────────────────────────
export function AIBadge({ label = "AI Assisted" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}

// ── Innovation Callout ────────────────────────────────────────────────────────
export function InnovationCallout({ title, description, icon = "🚀" }: { title: string; description: string; icon?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 shadow-sm">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = "blue", label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-emerald-500", red: "bg-red-500",
    amber: "bg-amber-500", purple: "bg-violet-500", teal: "bg-teal-500",
  };
  const barColor = pct > 85 ? "bg-red-500" : pct > 65 ? "bg-amber-500" : colors[color];
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{label}</span>
          <span className="font-medium text-gray-700">{pct}%</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Skill Bar ─────────────────────────────────────────────────────────────────
export function SkillBar({ skill, level }: { skill: string; level: number }) {
  const color = level >= 90 ? "bg-emerald-500" : level >= 70 ? "bg-blue-500" : level >= 50 ? "bg-amber-400" : "bg-gray-300";
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 flex-shrink-0 text-xs text-gray-600 sm:w-28">{skill}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right font-medium">{level}</span>
    </div>
  );
}

// ── Ticket Row ────────────────────────────────────────────────────────────────
export function TicketRow({ ticket, onClick }: { ticket: any; onClick?: () => void }) {
  return (
    <tr className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={onClick}>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-blue-600 font-semibold group-hover:text-blue-700">{ticket.id}</span>
          {ticket.isMajorIncident && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-md font-semibold">Major</span>}
          {ticket.isSecurityRestricted && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-md font-semibold">SEC</span>}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm text-gray-800 font-medium line-clamp-1 max-w-xs">{ticket.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{ticket.requester.name} · {ticket.requester.dept}</p>
      </td>
      <td className="px-4 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
      <td className="px-4 py-3.5"><StatusBadge status={ticket.status} /></td>
      <td className="px-4 py-3.5">
        {ticket.assigneeName
          ? <div className="flex items-center gap-1.5">
              <Avatar initials={ticket.assignee ? ticket.assignee.slice(1) : "?"} size="sm" />
              <span className="text-xs text-gray-600">{ticket.assigneeName}</span>
            </div>
          : <span className="text-xs text-gray-400 italic">Unassigned</span>}
      </td>
      <td className="px-4 py-3.5">
        <SLAChip remaining={ticket.slaResolve.remaining} breached={ticket.slaResolve.breached} paused={ticket.slapaused} />
      </td>
      <td className="px-4 py-3.5 text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
    </tr>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-5 flex gap-0.5 overflow-x-auto overflow-y-hidden border-b border-gray-200">
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            active === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", size = "md", onClick, disabled, className = "" }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg"; onClick?: () => void; disabled?: boolean; className?: string;
}) {
  const variants = {
    primary:   "bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm shadow-blue-500/20 border border-blue-600",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    danger:    "bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-red-600 shadow-sm",
    ghost:     "text-slate-600 hover:bg-slate-100",
    success:   "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border border-emerald-600 shadow-sm",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl text-center font-semibold transition-all duration-150 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed active:scale-100" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, placeholder, value, onChange, type = "text", error }: {
  label?: string; placeholder?: string; value?: string; onChange?: (v: string) => void;
  type?: string; error?: string;
}) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all bg-slate-50/70 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 ${
          error ? "border-red-400 bg-red-50" : "border-slate-200"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Risk Score Badge ──────────────────────────────────────────────────────────
export function RiskBadge({ score }: { score: number }) {
  const color = score >= 15
    ? "bg-red-50 text-red-700 border border-red-200"
    : score >= 9
    ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  const label = score >= 15 ? "Critical" : score >= 9 ? "High" : "Medium";
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${color}`}>
      {label} ({score})
    </span>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
          {item.onClick
            ? <button onClick={item.onClick} className="hover:text-blue-600 transition-colors font-medium">{item.label}</button>
            : <span className="text-gray-800 font-semibold">{item.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }: { message: string; type?: "success" | "error" | "info"; onClose: () => void }) {
  const styles = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };
  const icons  = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div className={`fixed bottom-3 left-3 right-3 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white">✕</button>
    </div>
  );
}

// ── Category Icon ─────────────────────────────────────────────────────────────
export function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    Hardware: "💻", Software: "⚙️", Network: "🌐",
    "Account/Access": "🔑", Printer: "🖨️", Security: "🔒",
  };
  return <span>{icons[category] || "📋"}</span>;
}
