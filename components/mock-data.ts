// NexDesk - Complete Mock Data

export const TECHNICIANS = [
  {
    id: "T001", name: "Ana Reyes", avatar: "AR", role: "Senior Technician", tier: 2,
    email: "ana.reyes@company.com", phone: "+1 555-0101", location: "Building A",
    shift: "08:00–17:00", onCall: true, available: true,
    skills: { Hardware: 95, Software: 85, Network: 70, "Account/Access": 60, Printer: 80, Security: 65 },
    openTickets: 3, estimatedHours: 4.5, csat: 4.8, qaScore: 92, slaCompliance: 97,
    reopenRate: 1.2, streak: 14, badges: ["Speed Demon", "Quality Champion", "Zero Breach"],
    totalResolved: 312, thisMonth: 28
  },
  {
    id: "T002", name: "Marcus Chen", avatar: "MC", role: "Network Specialist", tier: 2,
    email: "marcus.chen@company.com", phone: "+1 555-0102", location: "Building B",
    shift: "09:00–18:00", onCall: false, available: true,
    skills: { Hardware: 60, Software: 70, Network: 98, "Account/Access": 75, Printer: 40, Security: 85 },
    openTickets: 7, estimatedHours: 9.0, csat: 4.5, qaScore: 88, slaCompliance: 91,
    reopenRate: 2.1, streak: 7, badges: ["Network Ninja", "Security Guard"],
    totalResolved: 245, thisMonth: 19
  },
  {
    id: "T003", name: "Priya Sharma", avatar: "PS", role: "Tier 1 Support", tier: 1,
    email: "priya.sharma@company.com", phone: "+1 555-0103", location: "Building A",
    shift: "07:00–16:00", onCall: false, available: true,
    skills: { Hardware: 65, Software: 90, Network: 50, "Account/Access": 95, Printer: 70, Security: 55 },
    openTickets: 5, estimatedHours: 6.0, csat: 4.6, qaScore: 85, slaCompliance: 89,
    reopenRate: 3.0, streak: 5, badges: ["First Responder", "Password Wizard"],
    totalResolved: 198, thisMonth: 22
  },
  {
    id: "T004", name: "Jordan Kim", avatar: "JK", role: "Hardware Engineer", tier: 2,
    email: "jordan.kim@company.com", phone: "+1 555-0104", location: "Building C",
    shift: "08:00–17:00", onCall: false, available: false,
    skills: { Hardware: 98, Software: 55, Network: 45, "Account/Access": 40, Printer: 90, Security: 50 },
    openTickets: 4, estimatedHours: 5.5, csat: 4.7, qaScore: 90, slaCompliance: 93,
    reopenRate: 1.8, streak: 21, badges: ["Hardware Hero", "Streak Master"],
    totalResolved: 278, thisMonth: 17
  },
  {
    id: "T005", name: "Lena Novak", avatar: "LN", role: "Security Analyst", tier: 3,
    email: "lena.novak@company.com", phone: "+1 555-0105", location: "Building B",
    shift: "09:00–18:00", onCall: true, available: true,
    skills: { Hardware: 50, Software: 75, Network: 80, "Account/Access": 70, Printer: 35, Security: 99 },
    openTickets: 2, estimatedHours: 3.0, csat: 4.9, qaScore: 96, slaCompliance: 99,
    reopenRate: 0.5, streak: 42, badges: ["Security Ace", "Perfect Streak", "MVP"],
    totalResolved: 156, thisMonth: 12
  },
  {
    id: "T006", name: "Devon Mills", avatar: "DM", role: "Tier 1 Support", tier: 1,
    email: "devon.mills@company.com", phone: "+1 555-0106", location: "Building A",
    shift: "10:00–19:00", onCall: false, available: true,
    skills: { Hardware: 70, Software: 75, Network: 55, "Account/Access": 80, Printer: 85, Security: 45 },
    openTickets: 8, estimatedHours: 10.5, csat: 4.2, qaScore: 78, slaCompliance: 82,
    reopenRate: 4.5, streak: 2, badges: ["Printer Pro"],
    totalResolved: 134, thisMonth: 15
  },
  {
    id: "T007", name: "Sam Torres", avatar: "ST", role: "Software Specialist", tier: 2,
    email: "sam.torres@company.com", phone: "+1 555-0107", location: "Building C",
    shift: "08:00–17:00", onCall: false, available: true,
    skills: { Hardware: 55, Software: 96, Network: 65, "Account/Access": 75, Printer: 50, Security: 70 },
    openTickets: 6, estimatedHours: 7.5, csat: 4.4, qaScore: 86, slaCompliance: 88,
    reopenRate: 2.8, streak: 9, badges: ["Bug Squasher", "Software Guru"],
    totalResolved: 221, thisMonth: 24
  },
  {
    id: "T008", name: "Robin Walsh", avatar: "RW", role: "Tier 3 / Escalation", tier: 3,
    email: "robin.walsh@company.com", phone: "+1 555-0108", location: "Building B",
    shift: "08:00–17:00", onCall: true, available: true,
    skills: { Hardware: 85, Software: 88, Network: 90, "Account/Access": 85, Printer: 75, Security: 92 },
    openTickets: 2, estimatedHours: 3.5, csat: 4.9, qaScore: 97, slaCompliance: 99,
    reopenRate: 0.8, streak: 33, badges: ["Jack of All Trades", "Escalation King", "Zero Breach"],
    totalResolved: 189, thisMonth: 10
  }
];

export const TICKETS = [
  {
    id: "TKT-1001", title: "VPN outage affecting entire sales floor",
    description: "All 120 users in the Sales department cannot connect to VPN. This is blocking all remote work and CRM access. Started at 08:15 AM today.",
    category: "Network", priority: "P1", status: "In Progress",
    requester: { name: "James Burton", dept: "Sales", email: "j.burton@company.com", vip: true },
    assignee: "T002", assigneeName: "Marcus Chen",
    createdAt: "2026-11-02T08:15:00Z", updatedAt: "2026-11-02T09:45:00Z",
    slaResponse: { target: 15, met: true, responseTime: 8 },
    slaResolve: { target: 240, remaining: 45, status: "red", breached: false },
    affectedUsers: 120, assetTag: "NET-SWI-042",
    location: "Building B, Floor 3", tags: ["major-incident", "vpn", "outage"],
    isMajorIncident: true, linkedTickets: ["TKT-1008", "TKT-1015", "TKT-1023"],
    comments: 14, attachments: 3, timeLogged: 1.5,
    breachLikelihood: 78
  },
  {
    id: "TKT-1002", title: "MacBook Pro won't boot after macOS update",
    description: "Laptop shows Apple logo then restarts in a loop after applying the latest macOS Sonoma update.",
    category: "Hardware", priority: "P2", status: "Assigned",
    requester: { name: "Clara Park", dept: "Marketing", email: "c.park@company.com", vip: false },
    assignee: "T004", assigneeName: "Jordan Kim",
    createdAt: "2026-11-02T07:30:00Z", updatedAt: "2026-11-02T09:00:00Z",
    slaResponse: { target: 60, met: true, responseTime: 22 },
    slaResolve: { target: 480, remaining: 210, status: "amber", breached: false },
    affectedUsers: 1, assetTag: "MBP-2024-0088",
    location: "Building A, Floor 2", tags: ["macOS", "boot-loop"],
    isMajorIncident: false, linkedTickets: [],
    comments: 3, attachments: 1, timeLogged: 0.5,
    breachLikelihood: 32
  },
  {
    id: "TKT-1003", title: "Outlook not syncing emails — 2-day backlog",
    description: "Email client stopped syncing on Friday. Inbox shows 2 days of missing emails. Issue affects 3 users in Finance.",
    category: "Software", priority: "P2", status: "In Progress",
    requester: { name: "Diane Howell", dept: "Finance", email: "d.howell@company.com", vip: false },
    assignee: "T007", assigneeName: "Sam Torres",
    createdAt: "2026-11-01T14:00:00Z", updatedAt: "2026-11-02T08:30:00Z",
    slaResponse: { target: 60, met: true, responseTime: 15 },
    slaResolve: { target: 480, remaining: 30, status: "red", breached: false },
    affectedUsers: 3, assetTag: "WIN-PC-0124",
    location: "Building C, Floor 1", tags: ["outlook", "email", "sync"],
    isMajorIncident: false, linkedTickets: [],
    comments: 7, attachments: 2, timeLogged: 2.0,
    breachLikelihood: 65
  },
  {
    id: "TKT-1004", title: "Suspected phishing email with malicious attachment",
    description: "User received email claiming to be IT asking for credentials. Attachment was downloaded before user realized. Possible malware.",
    category: "Security", priority: "P1", status: "In Progress",
    requester: { name: "Robert Lee", dept: "HR", email: "r.lee@company.com", vip: false },
    assignee: "T005", assigneeName: "Lena Novak",
    createdAt: "2026-11-02T09:00:00Z", updatedAt: "2026-11-02T09:50:00Z",
    slaResponse: { target: 15, met: true, responseTime: 5 },
    slaResolve: { target: 240, remaining: 170, status: "green", breached: false },
    affectedUsers: 1, assetTag: "WIN-PC-0056",
    location: "Building A, Floor 1", tags: ["phishing", "malware", "security"],
    isMajorIncident: false, linkedTickets: [],
    isSecurityRestricted: true,
    comments: 5, attachments: 2, timeLogged: 1.0,
    breachLikelihood: 15
  },
  {
    id: "TKT-1005", title: "HP LaserJet printer offline on Floor 2",
    description: "Shared printer shows offline status. Last print job was Friday. Paper tray is full, no error lights showing.",
    category: "Printer", priority: "P3", status: "Triaged",
    requester: { name: "Amy Chen", dept: "Operations", email: "a.chen@company.com", vip: false },
    assignee: "T006", assigneeName: "Devon Mills",
    createdAt: "2026-11-02T08:00:00Z", updatedAt: "2026-11-02T08:30:00Z",
    slaResponse: { target: 240, met: true, responseTime: 30 },
    slaResolve: { target: 4320, remaining: 3800, status: "green", breached: false },
    affectedUsers: 12, assetTag: "PRN-HP-0021",
    location: "Building A, Floor 2", tags: ["printer", "offline"],
    isMajorIncident: false, linkedTickets: [],
    comments: 2, attachments: 0, timeLogged: 0.0,
    breachLikelihood: 8
  },
  {
    id: "TKT-1006", title: "New employee account not provisioned",
    description: "Starting employee Sarah Mitchell cannot log into any systems on her first day. AD account exists but no M365 license assigned.",
    category: "Account/Access", priority: "P2", status: "Resolved",
    requester: { name: "Tom Richards", dept: "IT", email: "t.richards@company.com", vip: false },
    assignee: "T003", assigneeName: "Priya Sharma",
    createdAt: "2026-11-01T08:00:00Z", updatedAt: "2026-11-01T10:30:00Z",
    slaResponse: { target: 60, met: true, responseTime: 12 },
    slaResolve: { target: 480, remaining: 0, status: "green", breached: false, resolvedIn: 150 },
    affectedUsers: 1, assetTag: null,
    location: "Building C", tags: ["onboarding", "access", "M365"],
    isMajorIncident: false, linkedTickets: [],
    comments: 5, attachments: 0, timeLogged: 0.5,
    csat: 5, csatComment: "Priya was amazing! Fixed within 2.5 hours.",
    breachLikelihood: 0
  },
  {
    id: "TKT-1007", title: "Monitor flickering on Dell workstation",
    description: "External 4K monitor flickers randomly every few minutes. Issue started after a recent driver update. Tried different cable.",
    category: "Hardware", priority: "P3", status: "Pending",
    requester: { name: "Kevin Walsh", dept: "Engineering", email: "k.walsh@company.com", vip: false },
    assignee: "T004", assigneeName: "Jordan Kim",
    slapaused: true,
    createdAt: "2026-10-31T15:00:00Z", updatedAt: "2026-11-02T08:00:00Z",
    slaResponse: { target: 240, met: true, responseTime: 45 },
    slaResolve: { target: 4320, remaining: 2100, status: "amber", breached: false },
    affectedUsers: 1, assetTag: "DL-WS-0099",
    location: "Building C, Floor 2", tags: ["monitor", "driver", "display"],
    isMajorIncident: false, linkedTickets: [],
    comments: 4, attachments: 1, timeLogged: 1.0,
    aiSuggestion: "Waiting on replacement DisplayPort cable from vendor (ETA: Nov 4). SLA paused.",
    breachLikelihood: 22
  },
  {
    id: "TKT-1008", title: "Cannot access internal CRM — connection timeout",
    description: "Getting 'Connection timed out' when loading Salesforce. Browser shows ERR_CONNECTION_TIMED_OUT. Started same time as VPN issue.",
    category: "Network", priority: "P1", status: "In Progress",
    requester: { name: "Maria Gonzalez", dept: "Sales", email: "m.gonzalez@company.com", vip: false },
    assignee: "T002", assigneeName: "Marcus Chen",
    createdAt: "2026-11-02T08:20:00Z", updatedAt: "2026-11-02T09:30:00Z",
    slaResponse: { target: 15, met: true, responseTime: 10 },
    slaResolve: { target: 240, remaining: 25, status: "red", breached: false },
    affectedUsers: 120, assetTag: null,
    location: "Building B", tags: ["crm", "network", "vpn"],
    isMajorIncident: true, linkedTickets: ["TKT-1001"],
    comments: 6, attachments: 1, timeLogged: 0.5,
    breachLikelihood: 85
  },
  {
    id: "TKT-1009", title: "Zoom crashes during screen share on Windows 11",
    description: "Zoom application crashes consistently when sharing a specific PowerPoint file. Only happens on this machine. Others in same meeting are fine.",
    category: "Software", priority: "P3", status: "New",
    requester: { name: "Patrick Moore", dept: "Marketing", email: "p.moore@company.com", vip: false },
    assignee: null, assigneeName: null,
    createdAt: "2026-11-02T09:45:00Z", updatedAt: "2026-11-02T09:45:00Z",
    slaResponse: { target: 240, met: false, responseTime: null },
    slaResolve: { target: 4320, remaining: 4320, status: "green", breached: false },
    affectedUsers: 1, assetTag: "WIN-PC-0201",
    location: "Building A, Floor 3", tags: ["zoom", "crash", "windows11"],
    isMajorIncident: false, linkedTickets: [],
    comments: 0, attachments: 1, timeLogged: 0.0,
    breachLikelihood: 5
  },
  {
    id: "TKT-1010", title: "SLA BREACHED: Password reset not working for contractor",
    description: "External contractor cannot reset password via self-service portal. Tried 4 times. Gets error: 'Account not found in directory'.",
    category: "Account/Access", priority: "P2", status: "Escalated",
    requester: { name: "Brett Adams (Contractor)", dept: "External", email: "b.adams@contractor.com", vip: false },
    assignee: "T003", assigneeName: "Priya Sharma",
    createdAt: "2026-10-31T10:00:00Z", updatedAt: "2026-11-02T08:00:00Z",
    slaResponse: { target: 60, met: true, responseTime: 25 },
    slaResolve: { target: 480, remaining: -1200, status: "red", breached: true },
    affectedUsers: 1, assetTag: null,
    location: "Remote", tags: ["password", "contractor", "SSO"],
    isMajorIncident: false, linkedTickets: [],
    escalatedTier: 2,
    comments: 9, attachments: 0, timeLogged: 2.0,
    breachLikelihood: 100
  },
  {
    id: "TKT-1011", title: "SLA BREACHED: Office PC won't wake from sleep",
    description: "Desktop PC goes into sleep mode and cannot be woken. Keyboard/mouse don't respond. Requires hard reboot every morning.",
    category: "Hardware", priority: "P3", status: "In Progress",
    requester: { name: "Linda Chang", dept: "Finance", email: "l.chang@company.com", vip: false },
    assignee: "T001", assigneeName: "Ana Reyes",
    createdAt: "2026-10-30T09:00:00Z", updatedAt: "2026-11-01T14:00:00Z",
    slaResponse: { target: 240, met: true, responseTime: 60 },
    slaResolve: { target: 4320, remaining: -720, status: "red", breached: true },
    affectedUsers: 1, assetTag: "WIN-PC-0033",
    location: "Building C, Floor 1", tags: ["sleep", "power", "windows"],
    isMajorIncident: false, linkedTickets: [],
    comments: 6, attachments: 0, timeLogged: 3.5,
    breachLikelihood: 100
  },
  {
    id: "TKT-1012", title: "SLA BREACHED: No audio after Windows update",
    description: "Sound stopped working completely after a Windows cumulative update. Device Manager shows no audio devices.",
    category: "Software", priority: "P3", status: "Pending",
    requester: { name: "Steve Nguyen", dept: "Sales", email: "s.nguyen@company.com", vip: false },
    assignee: "T007", assigneeName: "Sam Torres",
    slapaused: true,
    createdAt: "2026-10-29T11:00:00Z", updatedAt: "2026-11-01T09:00:00Z",
    slaResponse: { target: 240, met: true, responseTime: 120 },
    slaResolve: { target: 4320, remaining: -2880, status: "red", breached: true },
    affectedUsers: 1, assetTag: "WIN-PC-0078",
    location: "Building B, Floor 2", tags: ["audio", "windows-update", "driver"],
    isMajorIncident: false, linkedTickets: [],
    comments: 8, attachments: 0, timeLogged: 1.5,
    breachLikelihood: 100
  },
  {
    id: "TKT-1013", title: "Request: Dual monitor setup for new desk",
    description: "Employee moved to a new workstation and needs a second monitor mounted and configured.",
    category: "Hardware", priority: "P4", status: "New",
    requester: { name: "Grace Liu", dept: "Design", email: "g.liu@company.com", vip: false },
    assignee: null, assigneeName: null,
    createdAt: "2026-11-02T07:00:00Z", updatedAt: "2026-11-02T07:00:00Z",
    slaResponse: { target: 1440, met: true, responseTime: null },
    slaResolve: { target: 7200, remaining: 7200, status: "green", breached: false },
    affectedUsers: 1, assetTag: "WIN-PC-0211",
    location: "Building A, Floor 3", tags: ["monitor", "hardware", "setup"],
    isMajorIncident: false, linkedTickets: [],
    comments: 0, attachments: 0, timeLogged: 0.0,
    breachLikelihood: 2
  },
  {
    id: "TKT-1014", title: "Wi-Fi drops every 30 minutes in Conference Room B",
    description: "Wireless connection in Conf Room B drops exactly every 30 min and reconnects after ~60 seconds. Multiple users affected.",
    category: "Network", priority: "P2", status: "Triaged",
    requester: { name: "Nathan Fox", dept: "Operations", email: "n.fox@company.com", vip: false },
    assignee: "T002", assigneeName: "Marcus Chen",
    createdAt: "2026-11-01T13:00:00Z", updatedAt: "2026-11-02T09:00:00Z",
    slaResponse: { target: 60, met: true, responseTime: 30 },
    slaResolve: { target: 480, remaining: 150, status: "amber", breached: false },
    affectedUsers: 8, assetTag: "AP-CONFB-001",
    location: "Building A, Conference Room B", tags: ["wifi", "drops", "conference"],
    isMajorIncident: false, linkedTickets: [],
    comments: 5, attachments: 0, timeLogged: 0.5,
    breachLikelihood: 45
  },
  {
    id: "TKT-1015", title: "Salesforce mobile app authentication error",
    description: "Mobile app returns 'OAuth token expired' every time the user tries to log in. Desktop version works fine.",
    category: "Software", priority: "P2", status: "Assigned",
    requester: { name: "Rachel Kim", dept: "Sales", email: "r.kim@company.com", vip: false },
    assignee: "T007", assigneeName: "Sam Torres",
    createdAt: "2026-11-02T08:45:00Z", updatedAt: "2026-11-02T09:15:00Z",
    slaResponse: { target: 60, met: true, responseTime: 18 },
    slaResolve: { target: 480, remaining: 390, status: "green", breached: false },
    affectedUsers: 5, assetTag: null,
    location: "Remote/Mobile", tags: ["salesforce", "oauth", "mobile"],
    isMajorIncident: false, linkedTickets: ["TKT-1001"],
    comments: 2, attachments: 1, timeLogged: 0.0,
    breachLikelihood: 12
  },
  // Additional tickets to reach 40+
  ...Array.from({ length: 28 }, (_, i) => {
    const statuses = ["New", "Triaged", "Assigned", "In Progress", "Pending", "Resolved", "Verified/Closed"];
    const priorities = ["P1", "P2", "P3", "P4"];
    const categories = ["Hardware", "Software", "Network", "Account/Access", "Printer", "Security"];
    const requesters = [
      { name: "Alice Turner", dept: "Legal", email: "a.turner@company.com", vip: false },
      { name: "Brian Scott", dept: "HR", email: "b.scott@company.com", vip: false },
      { name: "Carol White", dept: "Engineering", email: "c.white@company.com", vip: true },
      { name: "David Jones", dept: "Finance", email: "d.jones@company.com", vip: false },
      { name: "Emma Davis", dept: "Marketing", email: "e.davis@company.com", vip: false },
    ];
    const titles = [
      "Adobe Creative Cloud license expired",
      "Shared drive permissions issue",
      "Keyboard not detected on startup",
      "MFA app not generating codes",
      "Teams calling not working",
      "Blue screen of death on login",
      "Mouse scroll stops working intermittently",
      "VPN client won't install on new Mac",
      "Access request: SharePoint site",
      "Printer driver missing after reimaging",
      "Excel crashing on large files",
      "Network share mapped drive disconnects",
      "Screen brightness control not working",
      "Unable to join Teams meetings",
      "Disk nearly full on laptop",
      "USB ports not recognized",
      "New laptop setup request",
      "Antivirus out of date",
      "Webcam not detected in Zoom",
      "Email signature not showing",
      "OneDrive sync errors",
      "Software installation request",
      "Remote desktop access issues",
      "BitLocker recovery key needed",
      "Taskbar icons missing",
      "Internet Explorer compatibility issue",
      "Video playback choppy on all apps",
      "Network printer added but jobs stuck"
    ];
    const idx = i;
    const pri = priorities[idx % 4];
    const sta = statuses[idx % 7];
    const techIds = ["T001","T002","T003","T004","T005","T006","T007","T008"];
    const techNames = ["Ana Reyes","Marcus Chen","Priya Sharma","Jordan Kim","Lena Novak","Devon Mills","Sam Torres","Robin Walsh"];
    const tIdx = idx % 8;
    return {
      id: `TKT-${1016 + idx}`,
      title: titles[idx],
      description: `Detailed description for ticket ${1016 + idx}.`,
      category: categories[idx % 6],
      priority: pri,
      status: sta,
      requester: requesters[idx % 5],
      assignee: sta === "New" ? null : techIds[tIdx],
      assigneeName: sta === "New" ? null : techNames[tIdx],
      createdAt: `2026-10-${String(Math.max(1, 30 - Math.floor(idx / 2))).padStart(2, "0")}T${String(8 + (idx % 8)).padStart(2, "0")}:00:00Z`,
      updatedAt: `2026-11-01T${String(8 + (idx % 8)).padStart(2, "0")}:30:00Z`,
      slaResponse: { target: 60, met: idx % 5 !== 0, responseTime: 20 + idx },
      slaResolve: { target: 480, remaining: sta === "Resolved" || sta === "Verified/Closed" ? 0 : 100 + idx * 10, status: idx % 7 === 0 ? "red" : idx % 3 === 0 ? "amber" : "green", breached: sta === "Resolved" && idx % 4 === 0 },
      affectedUsers: 1 + (idx % 5),
      assetTag: idx % 3 === 0 ? `WIN-PC-0${300 + idx}` : null,
      location: `Building ${["A","B","C"][idx % 3]}, Floor ${1 + (idx % 3)}`,
      tags: [],
      isMajorIncident: false,
      linkedTickets: [],
      comments: idx % 6,
      attachments: idx % 3,
      timeLogged: (idx % 5) * 0.5,
      csat: sta === "Resolved" || sta === "Verified/Closed" ? 3 + (idx % 3) : null,
      breachLikelihood: sta === "New" ? 5 : 10 + idx * 2
    };
  })
];

export const SLA_POLICIES = [
  { priority: "P1", label: "Critical", color: "red", responseMin: 15, resolveHours: 4, escalateMin: 30 },
  { priority: "P2", label: "High", color: "orange", responseMin: 60, resolveHours: 8, escalateMin: 120 },
  { priority: "P3", label: "Medium", color: "yellow", responseMin: 240, resolveHours: 72, escalateMin: 480 },
  { priority: "P4", label: "Low", color: "blue", responseMin: 1440, resolveHours: 120, escalateMin: 2880 },
];

export const MONTHLY_TRENDS = [
  { month: "May", created: 182, resolved: 175, slaBreached: 8, csat: 4.3, mttr: 5.2 },
  { month: "Jun", created: 196, resolved: 188, slaBreached: 11, csat: 4.2, mttr: 5.8 },
  { month: "Jul", created: 210, resolved: 205, slaBreached: 6, csat: 4.5, mttr: 4.9 },
  { month: "Aug", created: 224, resolved: 219, slaBreached: 9, csat: 4.4, mttr: 5.1 },
  { month: "Sep", created: 198, resolved: 192, slaBreached: 7, csat: 4.6, mttr: 4.7 },
  { month: "Oct", created: 241, resolved: 228, slaBreached: 14, csat: 4.3, mttr: 5.5 },
  { month: "Nov", created: 43, resolved: 31, slaBreached: 3, csat: 4.5, mttr: 3.2 },
];

export const CATEGORY_BREAKDOWN = [
  { name: "Hardware", count: 68, color: "#3B82F6" },
  { name: "Software", count: 89, color: "#8B5CF6" },
  { name: "Network", count: 42, color: "#06B6D4" },
  { name: "Account/Access", count: 55, color: "#10B981" },
  { name: "Printer", count: 28, color: "#F59E0B" },
  { name: "Security", count: 15, color: "#EF4444" },
];

export const RISK_ITEMS = [
  {
    id: "RSK-001", title: "VPN infrastructure single point of failure",
    likelihood: 4, impact: 5, score: 20, level: "Critical",
    owner: "Marcus Chen", category: "Infrastructure",
    mitigation: "Deploy redundant VPN concentrators — In Progress",
    linkedTickets: ["TKT-1001", "TKT-1008"], status: "Open"
  },
  {
    id: "RSK-002", title: "Only one Security Analyst (Lena) — single point of failure",
    likelihood: 3, impact: 5, score: 15, level: "High",
    owner: "Robin Walsh", category: "Resource",
    mitigation: "Cross-train T002, T008 on security response procedures",
    linkedTickets: ["TKT-1004"], status: "Mitigating"
  },
  {
    id: "RSK-003", title: "Devon Mills at 125% capacity — burnout risk",
    likelihood: 4, impact: 3, score: 12, level: "High",
    owner: "Team Lead", category: "Workload",
    mitigation: "Redistribute 3 tickets to Ana Reyes",
    linkedTickets: [], status: "Open"
  },
  {
    id: "RSK-004", title: "MySQL backup not tested in 90 days",
    likelihood: 2, impact: 5, score: 10, level: "Medium",
    owner: "IT Admin", category: "Data",
    mitigation: "Schedule restore drill for Nov 15",
    linkedTickets: [], status: "Open"
  },
  {
    id: "RSK-005", title: "Conference room APs showing DHCP exhaustion",
    likelihood: 3, impact: 3, score: 9, level: "Medium",
    owner: "Marcus Chen", category: "Network",
    mitigation: "Expand DHCP pool scope on VLAN 30",
    linkedTickets: ["TKT-1014"], status: "Mitigating"
  },
];

export const KNOWLEDGE_ARTICLES = [
  { id: "KB-001", title: "How to connect to VPN from home", category: "Network", views: 1842, helpful: 94, updated: "2026-10-15", author: "Marcus Chen" },
  { id: "KB-002", title: "Reset your Windows password via self-service portal", category: "Account/Access", views: 3201, helpful: 97, updated: "2026-09-30", author: "Priya Sharma" },
  { id: "KB-003", title: "Fix Outlook sync issues and OST file rebuild", category: "Software", views: 892, helpful: 88, updated: "2026-10-20", author: "Sam Torres" },
  { id: "KB-004", title: "Setting up MFA with Microsoft Authenticator", category: "Security", views: 2145, helpful: 96, updated: "2026-10-01", author: "Lena Novak" },
  { id: "KB-005", title: "How to request new software installation", category: "Software", views: 567, helpful: 91, updated: "2026-08-14", author: "IT Admin" },
  { id: "KB-006", title: "Clearing a printer paper jam (HP LaserJet series)", category: "Printer", views: 1023, helpful: 90, updated: "2026-10-22", author: "Devon Mills" },
  { id: "KB-007", title: "macOS boot loop recovery guide", category: "Hardware", views: 312, helpful: 85, updated: "2026-10-18", author: "Jordan Kim" },
  { id: "KB-008", title: "Zoom screen share crash troubleshooting", category: "Software", views: 445, helpful: 83, updated: "2026-11-01", author: "Sam Torres" },
];

export const ASSETS = [
  { id: "WIN-PC-0033", type: "Desktop", make: "Dell", model: "OptiPlex 7090", user: "Linda Chang", dept: "Finance", location: "Building C", status: "In Repair", age: 2.5, warranty: "2027-03-15", tickets: 4 },
  { id: "MBP-2024-0088", type: "Laptop", make: "Apple", model: "MacBook Pro 14\" M3", user: "Clara Park", dept: "Marketing", location: "Building A", status: "In Repair", age: 0.8, warranty: "2027-01-10", tickets: 2 },
  { id: "NET-SWI-042", type: "Network Switch", make: "Cisco", model: "Catalyst 9200", user: "Network Team", dept: "IT", location: "Server Room B", status: "Critical", age: 3.2, warranty: "2026-12-01", tickets: 8 },
  { id: "PRN-HP-0021", type: "Printer", make: "HP", model: "LaserJet Pro M404n", user: "Shared", dept: "Operations", location: "Building A, Floor 2", status: "Offline", age: 4.1, warranty: "Expired", tickets: 5 },
  { id: "AP-CONFB-001", type: "Access Point", make: "Cisco", model: "Catalyst 9115", user: "IT Infrastructure", dept: "IT", location: "Conference Room B", status: "Warning", age: 1.5, warranty: "2028-06-30", tickets: 3 },
  { id: "WIN-PC-0056", type: "Desktop", make: "HP", model: "EliteDesk 800 G9", user: "Robert Lee", dept: "HR", location: "Building A", status: "Quarantined", age: 1.2, warranty: "2028-03-20", tickets: 1 },
];

export const PARTS_INVENTORY = [
  { id: "PRT-001", name: "DisplayPort Cable 2m", category: "Cable", stock: 3, minStock: 5, status: "Low Stock", cost: 18 },
  { id: "PRT-002", name: "DDR4 16GB RAM Module", category: "Memory", stock: 8, minStock: 4, status: "OK", cost: 65 },
  { id: "PRT-003", name: "2.5\" SSD 512GB", category: "Storage", stock: 2, minStock: 5, status: "Critical", cost: 89 },
  { id: "PRT-004", name: "USB-C Hub 7-in-1", category: "Peripheral", stock: 12, minStock: 6, status: "OK", cost: 42 },
  { id: "PRT-005", name: "Wireless Keyboard (Logitech MK270)", category: "Peripheral", stock: 7, minStock: 5, status: "OK", cost: 30 },
  { id: "PRT-006", name: "HP 26A Toner Cartridge", category: "Print Supply", stock: 1, minStock: 3, status: "Critical", cost: 112 },
];

export const QA_REVIEWS = [
  { id: "QA-001", ticket: "TKT-0945", tech: "Devon Mills", reviewer: "Robin Walsh", date: "2026-11-01", scores: { communication: 3, accuracy: 4, documentation: 2, timeliness: 3 }, total: 60, pass: false, notes: "Documentation incomplete. Root cause not clearly stated." },
  { id: "QA-002", ticket: "TKT-0931", tech: "Ana Reyes", reviewer: "Robin Walsh", date: "2026-11-01", scores: { communication: 5, accuracy: 5, documentation: 5, timeliness: 5 }, total: 100, pass: true, notes: "Excellent ticket. Clear resolution notes, customer followed up positively." },
  { id: "QA-003", ticket: "TKT-0918", tech: "Sam Torres", reviewer: "Robin Walsh", date: "2026-10-31", scores: { communication: 4, accuracy: 3, documentation: 4, timeliness: 3 }, total: 70, pass: true, notes: "Good resolution but root cause analysis could be deeper." },
  { id: "QA-004", ticket: "TKT-0899", tech: "Marcus Chen", reviewer: "Robin Walsh", date: "2026-10-30", scores: { communication: 5, accuracy: 4, documentation: 4, timeliness: 4 }, total: 85, pass: true, notes: "Well documented. Network diagram attached was very helpful." },
];

export const AUDIT_LOG = [
  { id: "AUD-001", timestamp: "2026-11-02T09:50:22Z", user: "Marcus Chen", action: "Updated ticket status", resource: "TKT-1001", detail: "Status changed: In Progress → In Progress (escalated)", ip: "10.0.1.45" },
  { id: "AUD-002", timestamp: "2026-11-02T09:35:10Z", user: "Lena Novak", action: "Added internal note", resource: "TKT-1004", detail: "Added security-restricted note", ip: "10.0.1.88" },
  { id: "AUD-003", timestamp: "2026-11-02T09:20:05Z", user: "System", action: "Auto-escalated ticket", resource: "TKT-1010", detail: "SLA breached → escalated to Tier 2", ip: "system" },
  { id: "AUD-004", timestamp: "2026-11-02T09:00:44Z", user: "Admin", action: "SLA policy updated", resource: "SLA-P1", detail: "Response time changed: 15min → 15min (no change logged by error)", ip: "10.0.0.1" },
  { id: "AUD-005", timestamp: "2026-11-02T08:30:15Z", user: "Priya Sharma", action: "Resolved ticket", resource: "TKT-1006", detail: "Status changed: In Progress → Resolved", ip: "10.0.1.22" },
];

export const SHIFTS = [
  { tech: "T001", name: "Ana Reyes", mon: "08-17", tue: "08-17", wed: "08-17", thu: "08-17", fri: "08-17", sat: "OFF", sun: "OFF", onCall: "Thu" },
  { tech: "T002", name: "Marcus Chen", mon: "09-18", tue: "09-18", wed: "09-18", thu: "09-18", fri: "09-18", sat: "OFF", sun: "OFF", onCall: "" },
  { tech: "T003", name: "Priya Sharma", mon: "07-16", tue: "07-16", wed: "07-16", thu: "OFF", fri: "07-16", sat: "07-12", sun: "OFF", onCall: "" },
  { tech: "T004", name: "Jordan Kim", mon: "08-17", tue: "08-17", wed: "08-17", thu: "08-17", fri: "08-17", sat: "OFF", sun: "OFF", onCall: "" },
  { tech: "T005", name: "Lena Novak", mon: "09-18", tue: "09-18", wed: "09-18", thu: "09-18", fri: "09-18", sat: "OFF", sun: "ON-CALL", onCall: "Sat-Sun" },
  { tech: "T006", name: "Devon Mills", mon: "10-19", tue: "10-19", wed: "10-19", thu: "10-19", fri: "10-19", sat: "OFF", sun: "OFF", onCall: "" },
  { tech: "T007", name: "Sam Torres", mon: "08-17", tue: "08-17", wed: "OFF", thu: "08-17", fri: "08-17", sat: "OFF", sun: "OFF", onCall: "" },
  { tech: "T008", name: "Robin Walsh", mon: "08-17", tue: "08-17", wed: "08-17", thu: "08-17", fri: "08-17", sat: "ON-CALL", sun: "OFF", onCall: "Fri-Sat" },
];