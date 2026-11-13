import { useState } from "react";
import { Shield, Clock, Zap, CheckCircle, X, Mail, KeyRound, ArrowLeft } from "lucide-react";

const LogoIcon = ({ size = 40 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28,
    background: "linear-gradient(135deg,#3b82f6,#22d3ee)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(59,130,246,0.45)", flexShrink: 0,
  }}>
    <svg viewBox="0 0 20 20" fill="none" width={size * 0.5} height={size * 0.5}>
      <path d="M3 10C3 6.13 6.13 3 10 3s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" stroke="white" strokeWidth="1.5"/>
      <path d="M7 10h6M10 7v6" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  </div>
);

export function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  const [email, setEmail]               = useState("ana.reyes@company.com");
  const [password, setPassword]         = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [selectedRole, setSelectedRole] = useState("technician");
  const [isLoading, setIsLoading]       = useState(false);
  const [remember, setRemember]         = useState(true);

  // Forgot-password flow states
  const [forgotOpen,   setForgotOpen]   = useState(false);
  const [forgotEmail,  setForgotEmail]  = useState("");
  const [forgotSent,   setForgotSent]   = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const roles = [
    { id: "employee",   label: "IT Service",    desc: "Report & track issues",  icon: "👤", grad: "linear-gradient(135deg,#10b981,#0d9488)" },
    { id: "technician", label: "Technician",    desc: "Work the queue",          icon: "🛠", grad: "linear-gradient(135deg,#3b82f6,#22d3ee)" },
    { id: "dispatcher", label: "IT Manager",    desc: "Assign & escalate",       icon: "📋", grad: "linear-gradient(135deg,#8b5cf6,#a855f7)" },
    { id: "manager",    label: "Administrator", desc: "Analytics & oversight",   icon: "📊", grad: "linear-gradient(135deg,#f59e0b,#f97316)" },
  ];

  const features = [
    { Icon: Zap,    label: "Smart Triage",        desc: "Auto-classify & prioritize" },
    { Icon: Clock,  label: "SLA Enforcement",     desc: "Real-time breach alerts"    },
    { Icon: Shield, label: "Enterprise Security", desc: "SAML 2.0 · AES-256"        },
  ];

  const stats = [
    { val: "99.7%", label: "Uptime SLA"       },
    { val: "40%",   label: "Faster resolution" },
    { val: "4.8★",  label: "Avg CSAT"         },
  ];

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); onLogin(selectedRole); }, 800);
  };

  const handleForgotSubmit = () => {
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setTimeout(() => { setForgotLoading(false); setForgotSent(true); }, 1000);
  };

  const closeForgot = () => { setForgotOpen(false); setForgotSent(false); setForgotLoading(false); setForgotEmail(""); };

  const selectedRoleLabel = roles.find(r => r.id === selectedRole)?.label ?? "Portal";

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#0F172A" }}>

      {/* ── Desktop left branding panel ──────────────────────────────── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "42%", flexShrink: 0, flexDirection: "column",
          justifyContent: "space-between", padding: "48px",
          position: "relative", overflow: "hidden",
          background: "#0F172A",
        }}
      >
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Glow blob */}
        <div style={{ position: "absolute", top: "25%", left: "35%", width: 360, height: 360, borderRadius: "50%", background: "#3b82f6", filter: "blur(130px)", opacity: 0.09, pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
            <LogoIcon size={44} />
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", margin: 0 }}>NexDesk</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>IT Help Desk Platform</p>
            </div>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 16 }}>
            Modern IT support,<br />
            <span style={{ background: "linear-gradient(to right,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              built for speed.
            </span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.65, maxWidth: 300, margin: 0 }}>
            AI-powered triage, real-time SLA monitoring, and intelligent dispatch — all in one platform.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {features.map(({ Icon, label, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color: "#60a5fa" }} />
              </div>
              <div>
                <p style={{ color: "white", fontWeight: 600, fontSize: 13, margin: 0 }}>{label}</p>
                <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "14px 8px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ color: "white", fontWeight: 800, fontSize: 22, margin: 0 }}>{s.val}</p>
              <p style={{ color: "#475569", fontSize: 11, marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right / full-width form area ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", overflowY: "auto", WebkitOverflowScrolling: "touch" as any, minHeight: 0 }}>

        {/* Mobile-only gradient hero ─── hidden on lg+ */}
        <div
          className="lg:hidden"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c75 100%)",
            padding: "28px 20px 32px",
            position: "relative", overflow: "hidden", flexShrink: 0,
          }}
        >
          {/* subtle grid overlay */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "32px 32px" }} />
          {/* glow */}
          <div style={{ position: "absolute", bottom: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "#22d3ee", filter: "blur(80px)", opacity: 0.12, pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <LogoIcon size={36} />
              <div>
                <p style={{ color: "white", fontWeight: 700, fontSize: 16, margin: 0 }}>NexDesk</p>
                <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>IT Help Desk Platform</p>
              </div>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", lineHeight: 1.25, marginBottom: 8 }}>
              Modern IT support,{" "}
              <span style={{ background: "linear-gradient(to right,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                built for speed.
              </span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
              Smart triage, real-time SLA monitoring &amp; intelligent dispatch.
            </p>

            {/* Mini stat pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {stats.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 12px" }}>
                  <CheckCircle style={{ width: 12, height: 12, color: "#34d399" }} />
                  <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{s.val}</span>
                  <span style={{ color: "#64748b", fontSize: 11 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form card ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "clamp(20px, 4vw, 48px) clamp(16px, 5vw, 32px)" }}>
          <div style={{ width: "100%", maxWidth: 440 }}>

            {/* Desktop logo row ─── hidden on mobile */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 10, marginBottom: 32 }}>
              <LogoIcon size={32} />
              <span style={{ fontWeight: 700, color: "#111827", fontSize: 16 }}>NexDesk</span>
            </div>

            <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "#111827", marginBottom: 4, marginTop: 0 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, marginTop: 0 }}>Sign in to access your workspace</p>

            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
                  padding: "12px 14px", fontSize: 15, color: "#111827",
                  outline: "none", background: "#f9fafb", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
                    padding: "12px 44px 12px 14px", fontSize: 15, color: "#111827",
                    outline: "none", background: "#f9fafb", boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, fontSize: 14 }}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, color: "#6b7280", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: "#2563eb", width: 15, height: 15 }}
                />
                Remember me
              </label>
              <button
                onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Forgot password?
              </button>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Sign in as</p>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                {roles.map(role => {
                  const active = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minHeight: 68,
                        padding: "11px 12px",
                        borderRadius: 12,
                        border: active ? "2px solid #3b82f6" : "1.5px solid #e5e7eb",
                        background: active ? "#eff6ff" : "linear-gradient(180deg,#ffffff,#f9fafb)",
                        cursor: "pointer",
                        textAlign: "left",
                        boxShadow: active ? "0 0 0 3px rgba(59,130,246,0.1),0 5px 16px rgba(37,99,235,0.1)" : "0 2px 7px rgba(15,23,42,0.04)",
                        transition: "border-color 150ms,background 150ms,box-shadow 150ms,transform 150ms",
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: role.grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 17, boxShadow: "0 4px 12px rgba(15,23,42,0.12)" }}>
                        {role.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{role.label}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{role.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sign in button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px 16px",
                background: isLoading ? "#93c5fd" : "linear-gradient(to right,#2563eb,#1d4ed8)",
                color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)", transition: "all 150ms",
                minHeight: 50,
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ width: 18, height: 18, animation: "loginSpin 1s linear infinite", flexShrink: 0 }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                `Sign in as ${selectedRoleLabel} →`
              )}
            </button>

            {/* Trust footer */}
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
              {["SAML 2.0", "AES-256", "WCAG AA"].map((t, i) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#9ca3af" }}>
                  {i > 0 && <span style={{ color: "#e5e7eb" }}>·</span>}
                  <Shield style={{ width: 10, height: 10 }} />
                  {t}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ─────────────────────────────────────────── */}
      {forgotOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)", padding: "0 16px" }}
          onClick={e => { if (e.target === e.currentTarget) closeForgot(); }}>
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,0.35)", width: "100%", maxWidth: 400, overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <KeyRound style={{ width: 15, height: 15, color: "white" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827" }}>Reset your password</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>We'll send you a secure reset link</p>
                </div>
              </div>
              <button onClick={closeForgot} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4, borderRadius: 6 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f3f4f6"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ padding: "22px 22px 24px" }}>
              {!forgotSent ? (
                <>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 18, marginTop: 0, lineHeight: 1.6 }}>
                    Enter your work email address and we'll send you a link to reset your password. The link expires in <strong>30 minutes</strong>.
                  </p>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Work email address
                  </label>
                  <div style={{ position: "relative", marginBottom: 20 }}>
                    <Mail style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#9ca3af" }} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleForgotSubmit(); }}
                      placeholder="you@company.com"
                      style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "11px 14px 11px 38px", fontSize: 14, color: "#111827", outline: "none", background: "#f9fafb", boxSizing: "border-box" }}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleForgotSubmit}
                    disabled={forgotLoading || !forgotEmail.trim()}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: forgotLoading || !forgotEmail.trim() ? "#93c5fd" : "linear-gradient(to right,#2563eb,#1d4ed8)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: forgotLoading || !forgotEmail.trim() ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.28)", transition: "all 150ms", marginBottom: 12 }}>
                    {forgotLoading ? (
                      <>
                        <svg style={{ width: 16, height: 16, animation: "loginSpin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </>
                    ) : "Send reset link"}
                  </button>
                  <button onClick={closeForgot} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                    <ArrowLeft style={{ width: 13, height: 13 }} /> Back to sign in
                  </button>
                </>
              ) : (
                /* ── Success state ── */
                <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 20px rgba(16,185,129,0.3)" }}>
                    <CheckCircle style={{ width: 26, height: 26, color: "white" }} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Check your inbox</p>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", lineHeight: 1.6 }}>
                    We've sent a password reset link to:
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", margin: "0 0 18px", wordBreak: "break-all" }}>{forgotEmail}</p>
                  <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", marginBottom: 20, fontSize: 12, color: "#166534", textAlign: "left" }}>
                    💡 The link expires in <strong>30 minutes</strong>. If you don't see the email, check your spam folder or contact your IT administrator.
                  </div>
                  <button
                    onClick={() => setForgotSent(false)}
                    style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginBottom: 10 }}>
                    Resend to a different address
                  </button>
                  <br />
                  <button onClick={closeForgot} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", fontWeight: 500, background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>
                    <ArrowLeft style={{ width: 13, height: 13 }} /> Back to sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
