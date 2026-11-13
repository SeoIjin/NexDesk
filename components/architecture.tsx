import { useState } from "react";
import { Card, Btn } from "./design-system";
import { exportData } from "../src/utils/export-data";

export function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState("System Architecture");
  const exportArchitecture = () => {
    exportData({
      filename: "nexdesk-system-architecture",
      title: "NexDesk System Architecture and Dev Workflow",
      format: "PDF",
      rows: [
        { section: "Client Layer", components: "React + Tailwind PWA; Responsive Mobile Web; Self-Service Chatbot", protocol: "HTTPS / WSS" },
        { section: "API Gateway", components: "JWT/SAML authentication; rate limiting; load balancing", protocol: "REST / WebSocket" },
        { section: "Backend", components: "Ticketing; Assignment; SLA; Notification; Knowledge Base; Assets; Analytics; Auth; Audit", runtime: "NestJS / Node.js" },
        { section: "Data", components: "MySQL primary and replica; Redis cache and queue", storage: "Relational + in-memory" },
        { section: "Git Workflow", components: "Feature branches; pull requests; protected main branch", delivery: "CI/CD pipeline" },
        { section: "CI/CD", components: "Build; test; security scan; deploy", environments: "Development; staging; production" },
      ],
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Architecture & Dev Workflow</h1>
          <p className="text-sm text-gray-500">NexDesk technical design, database schema, and Git branching strategy</p>
        </div>
        <Btn size="sm" variant="secondary" className="w-full sm:w-auto" onClick={exportArchitecture}>Export as PDF</Btn>
      </div>

      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["System Architecture", "Database Schema", "Git Workflow", "CI/CD Pipeline"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "System Architecture" && (
        <div className="space-y-5">
          {/* Architecture Diagram */}
          <Card title="Three-Tier Architecture Diagram">
            <div className="p-3 sm:p-6">
              {/* Clients Layer */}
              <div className="text-center mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Client Layer</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {["🌐 Web App\n(React + Tailwind\nPWA)", "📱 Mobile Web\n(Responsive PWA)", "🤖 Self-Service\nChatbot"].map((c, i) => (
                    <div key={i} className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-center min-w-28">
                      <p className="text-sm font-semibold text-blue-800 whitespace-pre-line">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center gap-8 my-3">
                <div className="flex-1 h-px bg-gray-300" />
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">HTTPS / WSS</p>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-gray-400" />
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-400" />
                  </div>
                </div>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* API Gateway */}
              <div className="flex justify-center mb-3">
                <div className="px-6 py-3 bg-purple-100 border-2 border-purple-300 rounded-xl text-center">
                  <p className="text-sm font-bold text-purple-800">🔀 API Gateway</p>
                  <p className="text-xs text-purple-600">Auth (JWT/SAML) · Rate Limiting · Load Balancing</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-3">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-gray-400" />
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-400" />
                </div>
              </div>

              {/* Backend Modules */}
              <div className="text-center mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Backend Layer (NestJS · Node.js)</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                  {[
                    { name: "Ticketing\nModule", icon: "🎫" },
                    { name: "Assignment\nEngine", icon: "🤖" },
                    { name: "SLA\nEngine", icon: "⏱" },
                    { name: "Notification\nService", icon: "🔔" },
                    { name: "Knowledge\nBase", icon: "📚" },
                    { name: "Asset/Inv.\nModule", icon: "💻" },
                    { name: "Analytics &\nReporting", icon: "📊" },
                    { name: "Auth &\nRBAC", icon: "🔑" },
                    { name: "Audit\nModule", icon: "📋" },
                    { name: "WebSocket\n(Real-time)", icon: "⚡" },
                  ].map(m => (
                    <div key={m.name} className="py-2 px-2 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                      <p className="text-lg">{m.icon}</p>
                      <p className="text-xs font-medium text-indigo-700 whitespace-pre-line">{m.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Layer */}
              <div className="flex justify-center my-3">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-gray-400" />
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-400" />
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Data Layer</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {[
                    { name: "MySQL 8\n(Primary)", icon: "🗄", color: "orange" },
                    { name: "MySQL\n(Read Replica)", icon: "📖", color: "amber" },
                    { name: "Redis\nCache + Queue", icon: "⚡", color: "red" },
                    { name: "S3 / Object\nStorage", icon: "📦", color: "blue" },
                    { name: "Meilisearch\n(Full-text)", icon: "🔍", color: "teal" },
                  ].map(d => (
                    <div key={d.name} className={`px-4 py-3 bg-${d.color}-50 border-2 border-${d.color}-200 rounded-xl text-center min-w-28`}
                      style={{ background: d.color === "orange" ? "#FFF7ED" : d.color === "red" ? "#FEF2F2" : d.color === "teal" ? "#F0FDFA" : d.color === "amber" ? "#FFFBEB" : "#EFF6FF", borderColor: d.color === "orange" ? "#FDBA74" : d.color === "red" ? "#FCA5A5" : d.color === "teal" ? "#5EEAD4" : d.color === "amber" ? "#FCD34D" : "#93C5FD" }}>
                      <p className="text-xl mb-1">{d.icon}</p>
                      <p className="text-xs font-semibold text-gray-700 whitespace-pre-line">{d.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* External */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 text-center mb-2">External Integrations</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {["💬 Slack/Teams", "📧 SMTP/IMAP", "🔐 Azure AD/SSO", "📱 Twilio SMS", "🛡 CrowdStrike", "📅 Calendar"].map(e => (
                    <span key={e} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Tech Stack */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { layer: "Frontend", items: ["React 18 + TypeScript", "Tailwind CSS", "Recharts (data viz)", "React Hook Form", "PWA (service worker)", "WCAG AA accessible"] },
              { layer: "Backend", items: ["Node.js + NestJS", "TypeORM / Prisma ORM", "REST API + WebSockets", "Redis (cache + BullMQ)", "JWT + SAML 2.0 Auth", "Async job workers"] },
              { layer: "Infrastructure", items: ["MySQL 8 (InnoDB)", "Read replica for analytics", "Meilisearch full-text", "S3 object storage", "Nightly backups + PITR", "Versioned migrations"] },
            ].map(s => (
              <Card key={s.layer} title={`${s.layer} Stack`}>
                <div className="p-3 space-y-1">
                  {s.items.map(item => (
                    <div key={item} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                      <span className="text-blue-500">•</span> {item}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Database Schema" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-800">MySQL 8 (InnoDB) · 18 core tables · Foreign key relationships · JSON columns for metadata</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { table: "tickets", cols: ["id (PK)", "title", "description", "category_id (FK)", "priority_id (FK)", "status", "requester_id (FK)", "assignee_id (FK)", "sla_policy_id (FK)", "metadata (JSON)", "created_at", "updated_at"], indexes: ["status, priority, assignee_id, sla_due_at"] },
              { table: "users", cols: ["id (PK)", "name", "email (UNIQUE)", "role_id (FK)", "dept", "location", "is_vip", "azure_ad_id", "created_at"], indexes: ["email, role_id"] },
              { table: "technicians", cols: ["id (PK)", "user_id (FK)", "tier", "shift_start", "shift_end", "on_call", "available", "open_tickets_count"], indexes: ["user_id, available"] },
              { table: "technician_skills", cols: ["id (PK)", "tech_id (FK)", "category", "proficiency (0–100)", "verified_at"], indexes: ["tech_id, category"] },
              { table: "sla_policies", cols: ["id (PK)", "priority", "response_min", "resolve_hours", "escalate_min", "active"], indexes: ["priority"] },
              { table: "assignments", cols: ["id (PK)", "ticket_id (FK)", "tech_id (FK)", "assigned_by", "assigned_at", "ai_score", "ai_reason"], indexes: ["ticket_id, tech_id"] },
              { table: "comments", cols: ["id (PK)", "ticket_id (FK)", "author_id (FK)", "body", "is_internal", "created_at"], indexes: ["ticket_id, is_internal"] },
              { table: "audit_logs", cols: ["id (PK)", "user_id (FK)", "action", "resource_type", "resource_id", "detail (JSON)", "ip_address", "created_at"], indexes: ["user_id, resource_type, created_at"] },
              { table: "risks", cols: ["id (PK)", "title", "category", "likelihood", "impact", "owner_id (FK)", "mitigation", "status", "created_at"], indexes: ["status, owner_id"] },
              { table: "assets", cols: ["id (PK)", "asset_tag (UNIQUE)", "type", "make", "model", "user_id (FK)", "location", "warranty_expires", "status"], indexes: ["asset_tag, status"] },
              { table: "qa_reviews", cols: ["id (PK)", "ticket_id (FK)", "reviewer_id (FK)", "tech_id (FK)", "score_json (JSON)", "total_score", "passed", "notes", "reviewed_at"], indexes: ["tech_id, passed"] },
              { table: "surveys", cols: ["id (PK)", "ticket_id (FK)", "requester_id (FK)", "csat (1–5)", "comment", "submitted_at"], indexes: ["ticket_id"] },
            ].map(t => (
              <div key={t.table} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                  <span className="text-orange-400 text-sm">🗄</span>
                  <span className="text-white font-mono text-sm font-bold">{t.table}</span>
                </div>
                <div className="p-3 space-y-0.5">
                  {t.cols.map(col => (
                    <div key={col} className="flex items-center gap-2">
                      <span className="text-blue-500 text-xs">▸</span>
                      <span className={`font-mono text-xs ${col.includes("PK") ? "text-amber-600 font-bold" : col.includes("FK") ? "text-purple-600" : col.includes("UNIQUE") ? "text-teal-600" : "text-gray-600"}`}>
                        {col}
                      </span>
                    </div>
                  ))}
                  {t.indexes && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">INDEX: {t.indexes[0]}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Git Workflow" && (
        <div className="space-y-5">
          <Card title="Monorepo Structure">
            <div className="p-4">
              <div className="font-mono text-sm bg-gray-900 text-green-400 rounded-xl p-4 space-y-1">
                <p className="text-gray-400">📁 nexdesk/ (monorepo)</p>
                {[
                  "├── apps/",
                  "│   ├── web/          ← React + TypeScript + Tailwind",
                  "│   └── api/          ← NestJS REST API + WebSockets",
                  "│       └── migrations/   ← Versioned DB migrations (Git-tracked)",
                  "├── packages/",
                  "│   └── ui/           ← Shared component library",
                  "└── docs/             ← Architecture, ADRs, runbooks",
                ].map((line, i) => (
                  <p key={i} className="text-green-300">{line}</p>
                ))}
              </div>
            </div>
          </Card>

          {/* Branch Flow Diagram */}
          <Card title="Trunk-Based Branching Model">
            <div className="p-6 overflow-x-auto">
              <div className="min-w-max space-y-6">
                {/* Main branch */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">main (always deployable · protected)</p>
                  <div className="flex items-center gap-0">
                    {["v1.0.0", "v1.1.0", "v1.2.0", "v1.2.1 (hotfix)", "v1.3.0", "HEAD"].map((tag, i) => (
                      <div key={i} className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-blue-200 flex items-center justify-center shadow-md">
                            <span className="text-white text-xs">●</span>
                          </div>
                          <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">{tag}</p>
                        </div>
                        {i < 5 && <div className="w-16 h-1 bg-blue-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {/* Feature branches */}
                  {[
                    { branch: "feature/TICKET-123-sla-timer", base: 1, merge: 2, color: "bg-green-500 border-green-200", lineColor: "bg-green-400" },
                    { branch: "feature/TICKET-145-ai-dispatch", base: 2, merge: 4, color: "bg-teal-500 border-teal-200", lineColor: "bg-teal-400" },
                    { branch: "fix/TICKET-189-sla-pause-bug", base: 3, merge: 4, color: "bg-amber-500 border-amber-200", lineColor: "bg-amber-400" },
                    { branch: "hotfix/TICKET-201-vpn-p1", base: 3, merge: 3, color: "bg-red-500 border-red-200", lineColor: "bg-red-400" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${b.color} border-2 flex-shrink-0`} />
                      <span className="font-mono text-xs text-gray-700 w-64">{b.branch}</span>
                      <div className={`h-0.5 flex-1 ${b.lineColor}`} />
                      <span className="text-xs text-gray-500">PR → code review → CI → merge</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-600 mb-2">Branch Naming Convention</p>
                  {[
                    { type: "feature/*", desc: "New features", example: "feature/TICKET-123-sla-timer" },
                    { type: "fix/*", desc: "Bug fixes", example: "fix/TICKET-189-sla-pause-bug" },
                    { type: "hotfix/*", desc: "Urgent production fixes", example: "hotfix/TICKET-201-vpn-p1" },
                    { type: "release/*", desc: "Release preparation", example: "release/v1.3.0" },
                    { type: "chore/*", desc: "Dependencies, config", example: "chore/update-node-18" },
                  ].map(n => (
                    <div key={n.type} className="flex gap-2 py-1 border-b border-gray-100 last:border-0">
                      <span className="font-mono text-xs text-blue-600 w-24 flex-shrink-0">{n.type}</span>
                      <span className="text-xs text-gray-500 flex-1">{n.example}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-600 mb-2">Conventional Commits</p>
                  {[
                    { prefix: "feat:", example: "feat: add predictive SLA breach alert" },
                    { prefix: "fix:", example: "fix: SLA timer not pausing on Pending" },
                    { prefix: "docs:", example: "docs: update architecture diagram" },
                    { prefix: "refactor:", example: "refactor: extract assignment engine" },
                    { prefix: "test:", example: "test: add SLA engine unit tests" },
                    { prefix: "chore:", example: "chore: upgrade recharts to 2.13" },
                  ].map(c => (
                    <div key={c.prefix} className="flex gap-2 py-1 border-b border-gray-100 last:border-0">
                      <span className="font-mono text-xs text-purple-600 w-20 flex-shrink-0">{c.prefix}</span>
                      <span className="text-xs text-gray-500">{c.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Pull Request Rules">
            <div className="p-4 space-y-2">
              {[
                "✅ At least 1 reviewer required before merge",
                "✅ All CI checks must pass (lint, tests, build, security scan)",
                "✅ Protected main — no direct pushes allowed",
                "✅ DB migrations must be included in the same PR as the code change",
                "✅ PR template with checklist: tests added, docs updated, migration reviewed",
                "✅ Semantic versioning tags on release: v1.0.0, v1.1.0, v1.1.1",
                "✅ Auto-generated changelog from Conventional Commits on release",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-green-50 rounded text-xs text-green-800">
                  <span className="mt-0.5">{rule}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "CI/CD Pipeline" && (
        <div className="space-y-5">
          <Card title="CI/CD Pipeline (GitHub Actions / GitLab CI)">
            <div className="p-6">
              <div className="flex items-start gap-0 overflow-x-auto pb-4">
                {[
                  { stage: "Lint", icon: "🔎", desc: "ESLint + Prettier", color: "blue", time: "~30s" },
                  { stage: "Unit Tests", icon: "🧪", desc: "Jest + Supertest", color: "teal", time: "~2min" },
                  { stage: "Build", icon: "🏗", desc: "TypeScript compile + Vite", color: "purple", time: "~1min" },
                  { stage: "Security Scan", icon: "🔒", desc: "Snyk + OWASP", color: "red", time: "~2min" },
                  { stage: "DB Migration", icon: "🗄", desc: "TypeORM run migrations", color: "orange", time: "~20s" },
                  { stage: "Deploy Staging", icon: "🚀", desc: "Auto-deploy to staging", color: "green", time: "~3min" },
                  { stage: "Manual Approval", icon: "👍", desc: "Team lead sign-off", color: "amber", time: "Manual" },
                  { stage: "Deploy Prod", icon: "✅", desc: "Blue-green deploy", color: "emerald", time: "~5min" },
                ].map((stage, i) => (
                  <div key={stage.stage} className="flex items-center min-w-max">
                    <div className="flex flex-col items-center">
                      <div className={`w-20 flex flex-col items-center p-3 rounded-xl border-2 ${
                        stage.color === "blue" ? "bg-blue-50 border-blue-200" :
                        stage.color === "teal" ? "bg-teal-50 border-teal-200" :
                        stage.color === "purple" ? "bg-purple-50 border-purple-200" :
                        stage.color === "red" ? "bg-red-50 border-red-200" :
                        stage.color === "orange" ? "bg-orange-50 border-orange-200" :
                        stage.color === "green" ? "bg-green-50 border-green-200" :
                        stage.color === "amber" ? "bg-amber-50 border-amber-200" :
                        "bg-emerald-50 border-emerald-200"
                      }`}>
                        <span className="text-2xl mb-1">{stage.icon}</span>
                        <p className="text-xs font-bold text-gray-800 text-center">{stage.stage}</p>
                        <p className="text-xs text-gray-400 text-center">{stage.desc}</p>
                        <p className="text-xs font-mono text-gray-500 mt-1">{stage.time}</p>
                      </div>
                    </div>
                    {i < 7 && (
                      <div className="flex items-center mx-1">
                        <div className="w-6 h-0.5 bg-gray-400" />
                        <div className="w-0 h-0 border-l-0 border-r-0 border-y-4 border-y-transparent border-l-4 border-l-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Database Migration Strategy">
              <div className="p-4 space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Migration Rules:</p>
                  <ul className="space-y-1 text-gray-600 text-xs">
                    <li>• Migrations committed to <span className="font-mono text-blue-600">apps/api/migrations/</span></li>
                    <li>• Run automatically in CI/CD pipeline (before deploy)</li>
                    <li>• Schema changes require PR review like any code</li>
                    <li>• Always write both up() and down() rollback</li>
                    <li>• Backward-compatible (never remove columns in same PR)</li>
                    <li>• Staging runs migration 24h before prod</li>
                  </ul>
                </div>
                <div className="font-mono text-xs bg-gray-900 text-green-400 rounded-lg p-3">
                  <p className="text-gray-400"># Migration file naming</p>
                  <p>1698921600000-AddSLADueAtIndex.ts</p>
                  <p>1699008000000-AddTicketMetadataJSON.ts</p>
                  <p>1699094400000-CreateRisksTable.ts</p>
                </div>
              </div>
            </Card>

            <Card title="Backup & Recovery">
              <div className="p-4 space-y-3 text-sm">
                {[
                  { item: "Nightly MySQL dump (01:00 UTC)", status: "✅ Active", detail: "Last: Nov 2, 01:00 AM · 2.3 GB" },
                  { item: "Binary log (PITR)", status: "✅ Active", detail: "Point-in-time recovery to any minute" },
                  { item: "Restore drill", status: "⚠ Overdue", detail: "Last tested: Aug 15 (90 days ago!)" },
                  { item: "Cross-region replica", status: "✅ Active", detail: "us-east-2 → us-west-2" },
                  { item: "S3 attachment backup", status: "✅ Active", detail: "Versioned · 30-day retention" },
                ].map(b => (
                  <div key={b.item} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{b.status.charAt(0)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.item}</p>
                      <p className="text-xs text-gray-500">{b.detail}</p>
                    </div>
                    <span className={`ml-auto text-xs font-medium flex-shrink-0 ${b.status.includes("⚠") ? "text-amber-600" : "text-green-600"}`}>
                      {b.status.includes("⚠") ? "At Risk" : "OK"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
