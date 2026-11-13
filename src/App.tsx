import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Wrench, Clipboard, BarChart3, ShieldAlert,
  CheckSquare, Calendar, Monitor, BookOpen, TrendingUp, Settings,
  GitBranch, ChevronLeft, ChevronRight, Menu, X,
  LogOut, Zap, Search, Bell, Star, FileText, AlertTriangle,
  Mail, Building2, Shield, Clock, ChevronDown
} from "lucide-react";
import { LoginScreen } from "../components/login";
import { EmployeePortal } from "../components/employee-portal";
import { NewTicketForm } from "../components/new-ticket";
import { TicketDetail } from "../components/ticket-detail";
import { TechnicianWorkspace } from "../components/technician-workspace";
import { DispatcherBoard } from "../components/dispatcher-board";
import { ManagerDashboard } from "../components/manager-dashboard";
import { RiskDashboard } from "../components/risk-dashboard";
import { QADashboard } from "../components/qa-dashboard";
import { SkillsAndShifts } from "../components/skills-shifts";
import { AssetInventory } from "../components/asset-inventory";
import { KnowledgeBase } from "../components/knowledge-base";
import { ReportsAnalytics } from "../components/reports";
import { AdminSettings } from "../components/admin-settings";
import { ArchitecturePage } from "../components/architecture";
import { FeedbackRating } from "../components/feedback-rating";
import { TICKETS } from "../components/mock-data";

type Screen =
  | "login" | "employee" | "new-ticket" | "ticket-detail"
  | "technician" | "dispatcher" | "manager" | "risk"
  | "qa" | "skills" | "assets" | "kb" | "reports" | "admin" | "architecture" | "feedback";

type Role = "employee" | "technician" | "dispatcher" | "manager";

const NAV_ITEMS: { id: Screen; label: string; Icon: any; roles: Role[]; group: string }[] = [
  { id: "employee",     label: "My Portal",         Icon: LayoutDashboard, roles: ["employee"],                                  group: "main" },
  { id: "new-ticket",   label: "Report Problem",    Icon: Zap,             roles: ["employee"],                                  group: "main" },
  { id: "technician",   label: "My Workspace",      Icon: Wrench,          roles: ["technician"],                                group: "main" },
  { id: "dispatcher",   label: "Dispatch Board",    Icon: Clipboard,       roles: ["dispatcher","manager"],                      group: "main" },
  { id: "manager",      label: "Dashboard",         Icon: BarChart3,       roles: ["manager"],                                   group: "main" },
  { id: "risk",         label: "Risk & Problems",   Icon: ShieldAlert,     roles: ["dispatcher","manager"],                      group: "ops"  },
  { id: "qa",           label: "QA Reviews",        Icon: CheckSquare,     roles: ["technician","dispatcher","manager"],         group: "ops"  },
  { id: "skills",       label: "Skills & Shifts",   Icon: Calendar,        roles: ["dispatcher","manager"],                      group: "ops"  },
  { id: "assets",       label: "Assets",            Icon: Monitor,         roles: ["technician","dispatcher","manager"],         group: "ops"  },
  { id: "kb",           label: "Knowledge Base",    Icon: BookOpen,        roles: ["employee","technician","dispatcher","manager"], group: "res" },
  { id: "feedback",     label: "Feedback & Rating", Icon: Star,            roles: ["employee"],                                  group: "res"  },
  { id: "reports",      label: "Reports",           Icon: TrendingUp,      roles: ["dispatcher","manager"],                      group: "res"  },
  { id: "admin",        label: "Admin Settings",    Icon: Settings,        roles: ["manager"],                                   group: "sys"  },
  { id: "architecture", label: "Architecture",      Icon: GitBranch,       roles: ["manager"],                                   group: "sys"  },
];

const NAV_GROUPS = [
  { key: "main", label: "Main"       },
  { key: "ops",  label: "Operations" },
  { key: "res",  label: "Resources"  },
  { key: "sys",  label: "System"     },
];

const ROLE_CONFIG: Record<Role, { label: string; badgeBg: string; badgeText: string; badgeBorder: string; dotColor: string }> = {
  employee:   { label: "IT Service Portal",   badgeBg: "rgba(16,185,129,0.15)", badgeText: "#6ee7b7", badgeBorder: "rgba(16,185,129,0.3)",  dotColor: "#34d399" },
  technician: { label: "Technician View",     badgeBg: "rgba(59,130,246,0.15)", badgeText: "#93c5fd", badgeBorder: "rgba(59,130,246,0.3)",  dotColor: "#60a5fa" },
  dispatcher: { label: "IT Manager View",     badgeBg: "rgba(139,92,246,0.15)", badgeText: "#c4b5fd", badgeBorder: "rgba(139,92,246,0.3)",  dotColor: "#a78bfa" },
  manager:    { label: "Administrator View",  badgeBg: "rgba(245,158,11,0.15)", badgeText: "#fcd34d", badgeBorder: "rgba(245,158,11,0.3)",  dotColor: "#fbbf24" },
};

// ── Per-role user profiles ─────────────────────────────────────────────────
const USER_PROFILES: Record<Role, { name: string; initials: string; email: string; dept: string; location: string; joined: string; gradient: string }> = {
  employee:   { name: "Ana Reyes",    initials: "AR", email: "ana.reyes@nexdesk.com",    dept: "Operations",    location: "Building A",  joined: "Mar 2023", gradient: "linear-gradient(135deg,#2dd4bf,#22d3ee)" },
  technician: { name: "Marcus Chen",  initials: "MC", email: "marcus.chen@nexdesk.com",  dept: "IT Support",    location: "Building B",  joined: "Jun 2022", gradient: "linear-gradient(135deg,#3b82f6,#6366f1)" },
  dispatcher: { name: "Lena Novak",   initials: "LN", email: "lena.novak@nexdesk.com",   dept: "IT Operations", location: "Building B",  joined: "Jan 2021", gradient: "linear-gradient(135deg,#f87171,#fb7185)" },
  manager:    { name: "Robin Walsh",  initials: "RW", email: "robin.walsh@nexdesk.com",  dept: "IT Management", location: "Building HQ", joined: "Aug 2020", gradient: "linear-gradient(135deg,#f59e0b,#f97316)" },
};

// ── Static notifications data ──────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  { id: "n1", type: "breach",     title: "SLA Breached",          body: "TKT-1010 is now overdue by 12h 0m",             time: "2m ago",  ticketId: "TKT-1010", read: false },
  { id: "n2", type: "breach",     title: "SLA Breached",          body: "TKT-1011 exceeded response SLA",                time: "8m ago",  ticketId: "TKT-1011", read: false },
  { id: "n3", type: "assigned",   title: "Ticket Assigned to You", body: "TKT-1032 – New laptop setup request",          time: "15m ago", ticketId: "TKT-1032", read: false },
  { id: "n4", type: "update",     title: "Ticket Updated",         body: "TKT-1001 – Comment added by Marcus Chen",      time: "34m ago", ticketId: "TKT-1001", read: true  },
  { id: "n5", type: "breach",     title: "SLA Breached",          body: "TKT-1012 is now overdue by 2h 15m",            time: "1h ago",  ticketId: "TKT-1012", read: false },
  { id: "n6", type: "assigned",   title: "Ticket Escalated",       body: "TKT-1024 escalated to Tier 2 – Lena Novak",   time: "2h ago",  ticketId: "TKT-1024", read: true  },
  { id: "n7", type: "update",     title: "Status Changed",         body: "TKT-1040 moved to In Progress by Sam Torres",  time: "3h ago",  ticketId: "TKT-1040", read: true  },
];

const HIDE_SCROLLBAR_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
  * { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  /* ── Recharts z-index & overflow fixes ───────────────────────────── */
  .recharts-surface { overflow: hidden; }
  .recharts-wrapper { position: relative; }
  .recharts-tooltip-wrapper { z-index: 200 !important; pointer-events: none; }
  .recharts-legend-wrapper { z-index: 1 !important; }

  /* ── Mobile chart label size fixes ───────────────────────────────── */
  @media (max-width: 767px) {
    .recharts-cartesian-axis-tick-value { font-size: 9px; }
    .recharts-polar-angle-axis .recharts-text tspan { font-size: 8px; }
    .recharts-legend-item-text { font-size: 10px !important; }
  }
`;

const LOGIN_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; }
  ::-webkit-scrollbar { display: none; }
  * { scrollbar-width: none; -ms-overflow-style: none; }
`;

export default function NexDesk() {
  const [screen, setScreen] = useState<Screen>(() => {
    try { return (localStorage.getItem("nexdesk_screen") as Screen) || "login"; }
    catch { return "login"; }
  });
  const [role, setRole] = useState<Role>(() => {
    try { return (localStorage.getItem("nexdesk_role") as Role) || "technician"; }
    catch { return "technician"; }
  });
  const [selectedTicketId, setSelectedTicketId] = useState<string>(() => {
    try { return localStorage.getItem("nexdesk_ticket") || "TKT-1001"; }
    catch { return "TKT-1001"; }
  });
  const [slaBreachBanner, setSlaBreachBanner]   = useState(true);
  const [toast, setToast]                       = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);
  const [kbSearch, setKBSearch]                 = useState("");

  // Search state
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const searchRef                       = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifOpen, setNotifOpen]         = useState(false);
  const notifRef                          = useRef<HTMLDivElement>(null);

  // Profile panel state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef                    = useRef<HTMLDivElement>(null);

  // Viewport / sidebar
  const [vpWidth, setVpWidth]       = useState(() => typeof window !== "undefined" ? window.innerWidth : 1280);
  const isMobile                    = vpWidth < 768;
  const isSmallMobile               = vpWidth < 480;
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setVpWidth(w);
      if (w < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogin = (r: string) => {
    setRole(r as Role);
    let dest: Screen;
    if      (r === "employee")   dest = "employee";
    else if (r === "technician") dest = "technician";
    else if (r === "dispatcher") dest = "dispatcher";
    else                         dest = "manager";
    setScreen(dest);
    setSidebarOpen(vpWidth >= 768);
    setSearchQuery("");
    setSearchOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
    setKBSearch("");
    setToast(null);
    try {
      localStorage.setItem("nexdesk_screen", dest);
      localStorage.setItem("nexdesk_role", r);
    } catch {}
  };

  const handleLogout = () => {
    setScreen("login");
    setRole("technician");
    setSelectedTicketId("TKT-1001");
    setSidebarOpen(vpWidth >= 768);
    setSlaBreachBanner(true);
    setToast(null);
    setKBSearch("");
    setSearchQuery("");
    setSearchOpen(false);
    setNotifications(INITIAL_NOTIFICATIONS);
    setNotifOpen(false);
    setProfileOpen(false);

    try {
      localStorage.removeItem("nexdesk_screen");
      localStorage.removeItem("nexdesk_role");
      localStorage.removeItem("nexdesk_ticket");
      localStorage.removeItem("nexdesk_ticket_draft");
    } catch {}
  };

  const showToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const navigateTo = (id: Screen) => {
    setScreen(id);
    try { localStorage.setItem("nexdesk_screen", id); } catch {}
    if (isMobile) setSidebarOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  // ── Search results ────────────────────────────────────────────────────────
  const visibleNav   = NAV_ITEMS.filter(n => n.roles.includes(role));
  const q            = searchQuery.trim().toLowerCase();
  const ticketResults = q.length >= 2
    ? TICKETS.filter(t =>
        t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];
  const navResults = q.length >= 1
    ? visibleNav.filter(n => n.label.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const hasResults = ticketResults.length > 0 || navResults.length > 0;

  if (screen === "login") {
    return (
      <>
        <style>{LOGIN_CSS}</style>
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", display: "flex" }}>
          <LoginScreen onLogin={handleLogin} />
        </div>
      </>
    );
  }

  const activeLabel = visibleNav.find(n => n.id === screen)?.label ?? "Ticket Detail";
  const cfg         = ROLE_CONFIG[role];

  const SIDEBAR_WIDE      = isMobile ? Math.min(vpWidth * 0.75, 240) : 232;
  const SIDEBAR_COLLAPSED = isMobile ? 0 : 64;
  const sidebarWidth      = sidebarOpen ? SIDEBAR_WIDE : SIDEBAR_COLLAPSED;

  // Notification type colors / icons
  const notifMeta = (type: string) => {
    if (type === "breach")   return { color: "#ef4444", bg: "#fef2f2", icon: "⚠" };
    if (type === "assigned") return { color: "#3b82f6", bg: "#eff6ff", icon: "📋" };
    return                          { color: "#8b5cf6", bg: "#f5f3ff", icon: "💬" };
  };

  return (
    <>
      <style>{HIDE_SCROLLBAR_CSS}</style>

      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "radial-gradient(circle at 85% 0%,rgba(219,234,254,0.55),transparent 28%),#f5f7fb", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>

        {/* ── SLA Banner ──────────────────────────────────────────────── */}
        {slaBreachBanner && (
          <div style={{ flexShrink: 0, position: "relative", background: "linear-gradient(90deg,#991b1b,#dc2626 55%,#e11d48)", color: "white", padding: isMobile ? "8px 12px" : "9px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 210, fontSize: isMobile ? 12 : 13, boxShadow: "0 4px 16px rgba(153,27,27,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "white", flexShrink: 0, animation: "nexPulse 2s infinite" }} />
              <strong>3 SLA Breaches Active</strong>
              {!isMobile && <span style={{ color: "rgba(255,255,255,0.8)" }}>— TKT-1010, TKT-1011, TKT-1012 overdue</span>}
              <button onClick={() => { setSelectedTicketId("TKT-1010"); setScreen("ticket-detail"); }} style={{ textDecoration: "underline", fontWeight: 600, background: "none", border: "none", color: "white", cursor: "pointer", padding: 0 }}>View →</button>
            </div>
            <button onClick={() => setSlaBreachBanner(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
          </div>
        )}

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", minHeight: 0 }}>

          {isMobile && sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 240 }} />
          )}

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside style={{
            width: sidebarWidth,
            height: isMobile ? "100dvh" : "auto",
            flexShrink: 0,
            background: "linear-gradient(180deg,#0b1220 0%,#0f1b30 58%,#0b1424 100%)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            transition: "width 220ms cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 0,
            boxShadow: isMobile && sidebarOpen ? "12px 0 36px rgba(2,6,23,0.28)" : "none",
            zIndex: isMobile ? 250 : 1,
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? 0 : undefined,
            left: 0,
            bottom: isMobile ? 0 : undefined,
            paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : 0,
          }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarOpen ? "17px 14px" : "17px 0", justifyContent: sidebarOpen ? "flex-start" : "center", borderBottom: "1px solid rgba(148,163,184,0.12)", flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 7px 20px rgba(37,99,235,0.32)", border: "1px solid rgba(255,255,255,0.18)" }}>
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <path d="M3 10C3 6.13 6.13 3 10 3s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" stroke="white" strokeWidth="1.5"/>
                  <path d="M7 10h6M10 7v6" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              </div>
              {sidebarOpen && (
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 750, color: "white", fontSize: 15, letterSpacing: "-0.35px", margin: 0 }}>NexDesk</p>
                  <p style={{ fontSize: 11, color: "#64748b", margin: 0, letterSpacing: "0.01em" }}>IT Help Desk</p>
                </div>
              )}
            </div>

            {/* Role badge */}
            {sidebarOpen && (
              <div style={{ margin: "11px 10px 1px", padding: "7px 10px", borderRadius: 10, border: `1px solid ${cfg.badgeBorder}`, background: cfg.badgeBg, display: "flex", alignItems: "center", gap: 8, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: cfg.dotColor }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: cfg.badgeText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cfg.label}</span>
              </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "10px 7px", minHeight: 0 }}>
              {NAV_GROUPS.map(group => {
                const items = visibleNav.filter(n => n.group === group.key);
                if (!items.length) return null;
                return (
                  <div key={group.key} style={{ marginBottom: 10 }}>
                    {sidebarOpen && <p style={{ fontSize: 9, fontWeight: 700, color: "#52627a", textTransform: "uppercase", letterSpacing: "0.14em", padding: "0 9px", marginBottom: 5 }}>{group.label}</p>}
                    {items.map(item => {
                      const isActive = screen === item.id || (screen === "ticket-detail" && item.id === "dispatcher");
                      return (
                        <button key={item.id} onClick={() => { if (item.id === "kb") setKBSearch(""); navigateTo(item.id); }} title={!sidebarOpen ? item.label : undefined}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "8px 10px" : "9px 0", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, border: isActive ? "1px solid rgba(147,197,253,0.22)" : "1px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 650 : 500, background: isActive ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "transparent", color: isActive ? "white" : "#94a3b8", boxShadow: isActive ? "0 6px 18px rgba(37,99,235,0.24),inset 0 1px 0 rgba(255,255,255,0.12)" : "none", marginBottom: 2, textAlign: "left", transition: "background 130ms,border-color 130ms,transform 130ms,box-shadow 130ms" }}
                          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <item.Icon style={{ width: sidebarOpen ? 15 : 17, height: sidebarOpen ? 15 : 17, flexShrink: 0, color: isActive ? "white" : "#64748b" }} />
                          {sidebarOpen && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            {/* Bottom — collapse toggle only */}
            {!isMobile && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 10px 12px", flexShrink: 0, display: "flex", justifyContent: sidebarOpen ? "flex-end" : "center" }}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}
                  title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.13)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"}
                >
                  {sidebarOpen ? <ChevronLeft style={{ width: 13, height: 13 }} /> : <ChevronRight style={{ width: 13, height: 13 }} />}
                </button>
              </div>
            )}
          </aside>

          {/* ── Main Content ────────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <header style={{ flexShrink: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(226,232,240,0.9)", padding: isMobile ? "0 10px" : "0 18px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 6 : 12, zIndex: 200, position: "relative", boxShadow: "0 1px 8px rgba(15,23,42,0.025)" }}>

              {/* Left: hamburger + breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {isMobile && (
                  <button onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", color: "#6b7280", flexShrink: 0, marginRight: 4 }}>
                    {sidebarOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
                  </button>
                )}
                {!isSmallMobile && <span style={{ color: "#9ca3af", fontWeight: 500, fontSize: 13, flexShrink: 0 }}>NexDesk</span>}
                {!isSmallMobile && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>}
                <span style={{ fontWeight: 600, color: "#111827", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: isSmallMobile ? 92 : isMobile ? 120 : 260 }}>{activeLabel}</span>
              </div>

              {/* Right: Search + Bell + Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: isSmallMobile ? 4 : 8, flexShrink: 0 }}>

                {/* ── Search ────────────────────────────────────────── */}
                <div ref={searchRef} style={{ position: "relative" }}>
                  <div onClick={() => { if (isSmallMobile && !searchOpen) setSearchOpen(true); }} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "white",
                    border: `1.5px solid ${searchOpen ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: 999,
                    padding: isSmallMobile && !searchOpen ? "0" : "0 12px 0 10px",
                    height: 38,
                    transition: "border-color 150ms, box-shadow 150ms",
                    boxShadow: searchOpen ? "0 0 0 3px rgba(59,130,246,0.15)" : "0 1px 3px rgba(0,0,0,0.07)",
                    width: isSmallMobile ? (searchOpen ? 150 : 36) : isMobile ? 140 : 240,
                    justifyContent: isSmallMobile && !searchOpen ? "center" : "flex-start",
                  }}>
                    <Search style={{ width: 14, height: 14, color: searchOpen ? "#3b82f6" : "#94a3b8", flexShrink: 0, transition: "color 150ms" }} />
                    {(!isSmallMobile || searchOpen) && <input
                      autoFocus={isSmallMobile && searchOpen}
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                      onFocus={() => setSearchOpen(true)}
                      placeholder={isMobile ? "Search…" : "Search tickets, pages…"}
                      style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1e293b", width: "100%", letterSpacing: "-0.01em" }}
                    />}
                    {searchQuery ? (
                      <button onClick={event => { event.stopPropagation(); setSearchQuery(""); setSearchOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", alignItems: "center" }}>
                        <X style={{ width: 13, height: 13 }} />
                      </button>
                    ) : null}
                  </div>

                  {/* Search dropdown */}
                  {searchOpen && q.length >= 1 && (
                    <div style={{ position: isMobile ? "fixed" : "absolute", top: isMobile ? 58 : "calc(100% + 8px)", right: isMobile ? 12 : 0, left: isMobile ? 12 : "auto", width: isMobile ? "auto" : 320, maxWidth: "calc(100vw - 24px)", background: "white", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 18px 48px rgba(15,23,42,0.14)", zIndex: 9999, overflow: "hidden" }}>
                      {!hasResults ? (
                        <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>No results for "<strong>{searchQuery}</strong>"</div>
                      ) : (
                        <>
                          {navResults.length > 0 && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", padding: "10px 14px 4px" }}>Pages</p>
                              {navResults.map(n => (
                                <button key={n.id} onClick={() => { navigateTo(n.id); setSearchQuery(""); setSearchOpen(false); }}
                                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                                >
                                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <n.Icon style={{ width: 13, height: 13, color: "#3b82f6" }} />
                                  </div>
                                  <span style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{n.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {ticketResults.length > 0 && (
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", padding: "10px 14px 4px", borderTop: navResults.length ? "1px solid #f3f4f6" : "none", margin: 0 }}>Tickets</p>
                              {ticketResults.map(t => (
                                <button key={t.id} onClick={() => { setSelectedTicketId(t.id); setScreen("ticket-detail"); setSearchQuery(""); setSearchOpen(false); }}
                                  style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                                >
                                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                    <FileText style={{ width: 13, height: 13, color: "#16a34a" }} />
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600, margin: 0 }}>{t.id}</p>
                                    <p style={{ fontSize: 12, color: "#374151", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{t.title}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          <div style={{ padding: "8px 14px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
                            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Press Enter to search all results</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Notifications ─────────────────────────────────── */}
                <div ref={notifRef} style={{ position: "relative" }}>
                  <button onClick={() => setNotifOpen(!notifOpen)}
                    style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: notifOpen ? "#eff6ff" : "#f9fafb", border: `1px solid ${notifOpen ? "#bfdbfe" : "#e5e7eb"}`, cursor: "pointer", color: "#6b7280", position: "relative", transition: "all 150ms" }}>
                    <Bell style={{ width: 15, height: 15 }} />
                    {unreadCount > 0 && (
                      <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, background: "#ef4444", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700, padding: "0 3px", border: "2px solid white" }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications panel */}
                  {notifOpen && (
                    <div style={{
                      position: isMobile ? "fixed" : "absolute",
                      top: isMobile ? 58 : "calc(100% + 6px)",
                      right: isMobile ? 12 : 0,
                      left: isMobile ? 12 : "auto",
                      width: isMobile ? "auto" : 340,
                      maxWidth: isMobile ? "none" : "calc(100vw - 24px)",
                      background: "white", borderRadius: 12, border: "1px solid #e5e7eb",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.14)", zIndex: 9999, overflow: "hidden"
                    }}>
                      {/* Header */}
                      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Notifications</p>
                          {unreadCount > 0 && <span style={{ background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{unreadCount} new</span>}
                        </div>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Mark all read</button>
                        )}
                      </div>

                      {/* List */}
                      <div style={{ maxHeight: 340, overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: 32, textAlign: "center" }}>
                            <Bell style={{ width: 28, height: 28, color: "#d1d5db", margin: "0 auto 8px" }} />
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>All caught up!</p>
                          </div>
                        ) : notifications.map(n => {
                          const meta = notifMeta(n.type);
                          return (
                            <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: n.read ? "white" : "#fefce8", borderBottom: "1px solid #f9fafb", cursor: "pointer", transition: "background 120ms" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? "white" : "#fefce8"}
                              onClick={() => { setSelectedTicketId(n.ticketId); setScreen("ticket-detail"); setNotifOpen(false); setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)); }}
                            >
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                                {meta.icon}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                                  <p style={{ fontSize: 12, fontWeight: n.read ? 500 : 700, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</p>
                                  <span style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>{n.time}</span>
                                </div>
                                <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.body}</p>
                              </div>
                              <button onClick={e => { e.stopPropagation(); dismissNotif(n.id); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 0, flexShrink: 0, display: "flex", alignItems: "center" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#9ca3af"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#d1d5db"}
                              >
                                <X style={{ width: 12, height: 12 }} />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
                        <button onClick={() => setNotifOpen(false)} style={{ width: "100%", padding: "6px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div ref={profileRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: USER_PROFILES[role].gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, border: profileOpen ? "2px solid #3b82f6" : "2px solid transparent", transition: "border-color 150ms", outline: "none" }}
                  >
                    {USER_PROFILES[role].initials}
                  </button>

                  {/* Profile dropdown */}
                  {profileOpen && (() => {
                    const u = USER_PROFILES[role];
                    const cfg2 = ROLE_CONFIG[role];
                    return (
                      <div style={{ position: isMobile ? "fixed" : "absolute", top: isMobile ? 58 : "calc(100% + 8px)", right: isMobile ? 12 : 0, left: isMobile ? 12 : "auto", width: isMobile ? "auto" : 280, background: "white", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 16px 48px rgba(0,0,0,0.14)", zIndex: 9999, overflow: "hidden" }}>

                        {/* Header gradient band */}
                        <div style={{ background: "linear-gradient(135deg,#1e3a5f,#1e40af)", padding: "20px 16px 16px", position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: u.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700, flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.2)" }}>
                              {u.initials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</p>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, padding: "2px 8px", borderRadius: 20, background: cfg2.badgeBg, border: `1px solid ${cfg2.badgeBorder}` }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg2.dotColor, flexShrink: 0 }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: cfg2.badgeText }}>{cfg2.label}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Info rows */}
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                          {[
                            { Icon: Mail,      label: "Email",      value: u.email    },
                            { Icon: Building2, label: "Department", value: u.dept     },
                            { Icon: Shield,    label: "Location",   value: u.location },
                            { Icon: Clock,     label: "Member since", value: u.joined },
                          ].map(row => (
                            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <row.Icon style={{ width: 13, height: 13, color: "#64748b" }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</p>
                                <p style={{ fontSize: 12, color: "#111827", margin: 0, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Log out */}
                        <div style={{ padding: "10px 16px 12px" }}>
                          <button
                            onClick={handleLogout}
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 130ms" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.13)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)"}
                          >
                            <LogOut style={{ width: 13, height: 13 }} />
                            Sign out
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </header>

            {/* ── Page content ──────────────────────────────────────── */}
            <main className="app-main" style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: isMobile ? 12 : 28, minWidth: 0 }}>
              {screen === "employee"     && <EmployeePortal onNewTicket={() => setScreen("new-ticket")} onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} onShowToast={showToast} onViewKB={(term) => { setKBSearch(term || ""); setScreen("kb"); }} />}
              {screen === "new-ticket"   && <NewTicketForm onSubmit={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); showToast("Ticket submitted successfully!", "success"); }} onCancel={() => setScreen(role === "employee" ? "employee" : "dispatcher")} onShowToast={showToast} />}
              {screen === "ticket-detail" && <TicketDetail key={selectedTicketId} ticketId={selectedTicketId} role={role} onBack={() => setScreen(role === "employee" ? "employee" : "dispatcher")} onShowToast={showToast} onNewTicket={() => setScreen("new-ticket")} onViewTicket={setSelectedTicketId} />}
              {screen === "technician"   && <TechnicianWorkspace onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} />}
              {screen === "dispatcher"   && <DispatcherBoard onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} onNewTicket={() => setScreen("new-ticket")} onShowToast={showToast} />}
              {screen === "manager"      && <ManagerDashboard onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} />}
              {screen === "risk"         && <RiskDashboard onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} />}
              {screen === "qa"           && <QADashboard onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} onNewTicket={() => setScreen("new-ticket")} onShowToast={showToast} />}
              {screen === "skills"       && <SkillsAndShifts />}
              {screen === "assets"       && <AssetInventory onViewTicket={(id) => { setSelectedTicketId(id); setScreen("ticket-detail"); }} onShowToast={showToast} />}
              {screen === "kb"           && <KnowledgeBase initialSearch={kbSearch} onNewTicket={() => setScreen("new-ticket")} onShowToast={showToast} />}
              {screen === "feedback"     && <FeedbackRating />}
              {screen === "reports"      && <ReportsAnalytics />}
              {screen === "admin"        && <AdminSettings />}
              {screen === "architecture" && <ArchitecturePage />}
            </main>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: isMobile ? 12 : 20, right: isMobile ? 12 : 20, left: isMobile ? 12 : "auto", zIndex: 9999, display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 10, color: "white", background: toast.type === "success" ? "#059669" : toast.type === "error" ? "#dc2626" : "#1e40af", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", maxWidth: isMobile ? "none" : 340, fontSize: 13, lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "✦"}</span>
          <p style={{ margin: 0 }}>{toast.msg}</p>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, marginLeft: 6, flexShrink: 0, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      )}

      <style>{`
        @keyframes nexPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </>
  );
}
