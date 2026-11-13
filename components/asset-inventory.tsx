import { useState } from "react";
import { Card, Btn, StatCard } from "./design-system";
import { ASSETS, PARTS_INVENTORY } from "./mock-data";
import { X, Monitor, Laptop, Printer, Wifi, Server, Package, Plus, Minus, ChevronDown } from "lucide-react";

const ASSET_HISTORY: Record<string, { date: string; action: string; by: string; note: string }[]> = {
  "WIN-PC-0033": [
    { date: "2026-10-28", action: "Sent to Repair", by: "Marcus Chen", note: "Hard drive showing SMART errors — replaced with new SSD" },
    { date: "2026-09-15", action: "RAM Upgrade", by: "Devon Mills", note: "Upgraded from 8 GB to 16 GB DDR4" },
    { date: "2026-06-01", action: "OS Reinstall", by: "Sam Torres", note: "Windows 11 clean install after malware detection" },
    { date: "2025-10-10", action: "Asset Registered", by: "IT Admin", note: "New device assigned to Linda Chang, Finance" },
  ],
  "MBP-2024-0088": [
    { date: "2026-10-30", action: "Sent to Repair", by: "Jordan Kim", note: "Keyboard unresponsive — top case replacement ordered" },
    { date: "2026-01-15", action: "Asset Registered", by: "IT Admin", note: "New device assigned to Clara Park, Marketing" },
  ],
  "NET-SWI-042": [
    { date: "2026-11-01", action: "Critical Alert", by: "System", note: "Port 24 showing continuous CRC errors — degraded uplink" },
    { date: "2026-09-20", action: "Firmware Update", by: "Lena Novak", note: "Updated to IOS XE 17.9.4a" },
    { date: "2026-07-05", action: "Config Backup", by: "Marcus Chen", note: "Running config backed up to TFTP server" },
    { date: "2023-08-12", action: "Asset Registered", by: "IT Admin", note: "Installed in Server Room B rack 3U" },
  ],
  "PRN-HP-0021": [
    { date: "2026-10-25", action: "Offline", by: "System", note: "No response on network — power cycle did not restore" },
    { date: "2026-08-10", action: "Toner Replaced", by: "Devon Mills", note: "HP 26A toner replaced, yield ~3100 pages" },
    { date: "2026-03-02", action: "Paper Jam Repair", by: "Devon Mills", note: "Pickup roller replaced, tested OK" },
    { date: "2022-09-01", action: "Asset Registered", by: "IT Admin", note: "Shared printer, Building A Floor 2" },
  ],
  "AP-CONFB-001": [
    { date: "2026-11-01", action: "Warning", by: "System", note: "Client association drops spiking — possible interference on Ch 6" },
    { date: "2026-07-18", action: "Config Update", by: "Lena Novak", note: "Band steering enabled, 5GHz preference set" },
    { date: "2025-05-14", action: "Asset Registered", by: "IT Admin", note: "Installed in Conference Room B ceiling mount" },
  ],
  "WIN-PC-0056": [
    { date: "2026-11-01", action: "Quarantined", by: "Lena Novak", note: "Machine isolated — suspected malware, pending forensic scan" },
    { date: "2026-10-30", action: "Security Scan", by: "System", note: "Defender flagged suspicious process nexspy.exe" },
    { date: "2025-09-03", action: "Asset Registered", by: "IT Admin", note: "New device assigned to Robert Lee, HR" },
  ],
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  "Desktop": <Monitor className="w-4 h-4" />,
  "Laptop": <Laptop className="w-4 h-4" />,
  "Printer": <Printer className="w-4 h-4" />,
  "Access Point": <Wifi className="w-4 h-4" />,
  "Network Switch": <Server className="w-4 h-4" />,
};

const statusColor: Record<string, string> = {
  "In Repair": "bg-amber-100 text-amber-700",
  "Critical": "bg-red-100 text-red-700",
  "Offline": "bg-gray-100 text-gray-600",
  "Warning": "bg-yellow-100 text-yellow-700",
  "Quarantined": "bg-red-200 text-red-800",
  "Active": "bg-green-100 text-green-700",
};

type Asset = typeof ASSETS[0];
type Part = typeof PARTS_INVENTORY[0];

function FilterSelect({ value, onChange, options, label }: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10 min-w-[140px] appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}

// ── Overlay Modal wrapper ──────────────────────────────────────────────────
function Modal({ title, onClose, children, width = "max-w-lg" }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

export function AssetInventory({ onViewTicket, onShowToast }: {
  onViewTicket?: (id: string) => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
}) {
  const [activeTab, setActiveTab] = useState("Assets");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Modal states
  const [viewAsset, setViewAsset] = useState<Asset | null>(null);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [reorderPart, setReorderPart] = useState<Part | null>(null);
  const [adjustPart, setAdjustPart] = useState<Part | null>(null);
  const [replacementAsset, setReplacementAsset] = useState<{ id: string; name: string; warranty: string; age: number; dept: string } | null>(null);

  // Add asset form state
  const [addForm, setAddForm] = useState({ id: "", type: "Desktop", make: "", model: "", user: "", dept: "", location: "" });

  // Reorder form state
  const [reorderQty, setReorderQty] = useState(10);

  // Adjust form state
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Consumed in repair");

  // Filtered assets
  const filteredAssets = ASSETS.filter(a => {
    const matchSearch =
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.make.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || a.type === typeFilter || (typeFilter === "Network" && (a.type === "Network Switch" || a.type === "Access Point"));
    const matchStatus = statusFilter === "All Statuses" || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const uniqueTypes = ["All Types", ...Array.from(new Set(ASSETS.map(a => a.type)))];
  const uniqueStatuses = ["All Statuses", ...Array.from(new Set(ASSETS.map(a => a.status)))];

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset & Inventory Management</h1>
          <p className="text-sm text-gray-500">Track devices, parts, and their relationship to open tickets</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
          <Btn size="sm" variant="secondary" className="w-full" onClick={() => onShowToast?.("QR scanner opened — point camera at asset tag", "info")}>QR Scan</Btn>
          <Btn size="sm" variant="secondary" className="w-full" onClick={() => onShowToast?.("CSV import template downloaded", "info")}>Import</Btn>
          <Btn size="sm" variant="primary" className="w-full" onClick={() => setShowAddAsset(true)}>+ Asset</Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard label="Total Assets" value={342} sub="6 flagged" color="blue" />
        <StatCard label="In Repair" value={4} sub="2 awaiting parts" color="amber" />
        <StatCard label="Quarantined" value={1} sub="Security incident" color="red" />
        <StatCard label="Parts Low Stock" value={2} sub="Reorder needed" color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {["Assets", "Parts & Inventory", "Lifecycle"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Assets Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "Assets" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-full flex-1 sm:min-w-[200px] sm:max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by asset ID, user, or make..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <FilterSelect label="Filter by asset type" value={typeFilter} onChange={setTypeFilter} options={uniqueTypes} />
            <FilterSelect label="Filter by asset status" value={statusFilter} onChange={setStatusFilter} options={uniqueStatuses} />
            {(typeFilter !== "All Types" || statusFilter !== "All Statuses" || search) && (
              <button onClick={() => { setSearch(""); setTypeFilter("All Types"); setStatusFilter("All Statuses"); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                Clear filters
              </button>
            )}
            <span className="ml-auto text-xs text-gray-400">{filteredAssets.length} of {ASSETS.length} assets</span>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Asset ID", "Type", "Make / Model", "User", "Location", "Warranty", "Status", "Tickets"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                    <th className="pl-4 pr-8 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[160px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                        No assets match your filters.
                        <button onClick={() => { setSearch(""); setTypeFilter("All Types"); setStatusFilter("All Statuses"); }}
                          className="ml-2 text-blue-600 hover:underline">Clear filters</button>
                      </td>
                    </tr>
                  ) : filteredAssets.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono text-sm font-bold text-blue-600">{a.id}</p>
                          <button className="text-xs text-gray-400 hover:text-gray-600 mt-0.5"
                            onClick={() => onShowToast?.(`QR code for ${a.id} opened`, "info")}>📱 QR</button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <span className="text-gray-400">{TYPE_ICON[a.type] ?? <Package className="w-4 h-4" />}</span>
                          {a.type}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{a.make}</p>
                        <p className="text-xs text-gray-400">{a.model}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{a.user}</p>
                        <p className="text-xs text-gray-400">{a.dept}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{a.location}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${a.warranty === "Expired" ? "text-red-600" : "text-gray-600"}`}>
                          {a.warranty}
                        </span>
                        <p className="text-xs text-gray-400">{a.age}y old</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor[a.status] || "bg-green-100 text-green-700"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${a.tickets >= 5 ? "bg-red-100 text-red-700" : a.tickets >= 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {a.tickets}
                        </span>
                      </td>
                      <td className="pl-4 pr-8 py-3">
                        <div className="flex gap-2 whitespace-nowrap">
                          <Btn size="sm" variant="secondary" onClick={() => setViewAsset(a)}>View</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => setHistoryAsset(a)}>History</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quarantine alert */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 flex-wrap">
            <span className="text-3xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-red-800">WIN-PC-0056 — QUARANTINED (Security Incident)</p>
              <p className="text-sm text-red-600">Robert Lee's machine isolated due to TKT-1004 (suspected malware). Do not reconnect until cleared by Lena Novak.</p>
            </div>
            <Btn size="sm" variant="danger" className="flex-shrink-0"
              onClick={() => { onViewTicket?.("TKT-1004"); }}>
              View Incident
            </Btn>
          </div>
        </div>
      )}

      {/* ── Parts & Inventory Tab ───────────────────────────────────────────── */}
      {activeTab === "Parts & Inventory" && (
        <div className="space-y-4">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-xs text-red-600 font-semibold">Critical Stock</p>
              <p className="text-3xl font-bold text-red-700">2</p>
              <p className="text-xs text-red-500">items need reorder</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-xs text-amber-600 font-semibold">Low Stock</p>
              <p className="text-3xl font-bold text-amber-700">1</p>
              <p className="text-xs text-amber-500">below minimum</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-xs text-green-600 font-semibold">OK</p>
              <p className="text-3xl font-bold text-green-700">3</p>
              <p className="text-xs text-green-500">well stocked</p>
            </div>
          </div>

          <Card title="Parts Inventory">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Part ID", "Name", "Category", "Stock", "Min Stock", "Status", "Unit Cost", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PARTS_INVENTORY.map(p => (
                    <tr key={p.id} className={`hover:bg-gray-50 ${p.status === "Critical" ? "bg-red-50" : p.status === "Low Stock" ? "bg-amber-50" : ""}`}>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-bold">{p.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{p.category}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${p.stock <= p.minStock ? "text-red-600" : "text-gray-800"}`}>{p.stock}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${p.stock <= p.minStock / 2 ? "bg-red-500" : p.stock <= p.minStock ? "bg-amber-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min(100, (p.stock / (p.minStock * 2)) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.minStock}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          p.status === "Critical" ? "bg-red-100 text-red-700" :
                          p.status === "Low Stock" ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">${p.cost}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.status !== "OK" ? (
                            <Btn size="sm" variant="danger" onClick={() => { setReorderQty(p.minStock * 2); setReorderPart(p); }}>Reorder</Btn>
                          ) : (
                            <Btn size="sm" variant="secondary" onClick={() => { setAdjustDelta(0); setAdjustReason("Consumed in repair"); setAdjustPart(p); }}>Adjust</Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Lifecycle Tab ───────────────────────────────────────────────────── */}
      {activeTab === "Lifecycle" && (
        <div className="grid md:grid-cols-2 gap-5">
          <Card title="Assets Approaching End of Life">
            <div className="p-4 space-y-3">
              {[
                { id: "PRN-HP-0021", name: "HP LaserJet Pro M404n", age: 4.1, warranty: "Expired", dept: "Operations" },
                { id: "WIN-PC-0033", name: "Dell OptiPlex 7090", age: 2.5, warranty: "Mar 2027", dept: "Finance" },
                { id: "NET-SWI-042", name: "Cisco Catalyst 9200", age: 3.2, warranty: "Dec 2026", dept: "IT" },
              ].map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${a.warranty === "Expired" ? "bg-red-100" : "bg-amber-100"}`}>
                    {a.warranty === "Expired" ? "⚠️" : "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-bold text-gray-800">{a.id}</p>
                    <p className="text-xs text-gray-500">{a.name} · {a.dept}</p>
                    <p className={`text-xs font-medium ${a.warranty === "Expired" ? "text-red-600" : "text-amber-600"}`}>
                      Warranty: {a.warranty} · {a.age}y old
                    </p>
                  </div>
                  <Btn size="sm" variant={a.warranty === "Expired" ? "danger" : "secondary"}
                    onClick={() => setReplacementAsset(a)}>
                    Plan Replacement
                  </Btn>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Refresh Budget Tracker">
            <div className="p-4 space-y-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">FY2026 IT Hardware Budget</span>
                <span className="font-bold text-gray-800">$48,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: "67%" }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>Spent: $32,150</span>
                <span>Remaining: $15,850</span>
              </div>
              {[
                { item: "15× Dell OptiPlex refresh", cost: 18000, status: "Approved" },
                { item: "5× MacBook Pro M3", cost: 12500, status: "Pending" },
                { item: "Network switch replacement", cost: 8500, status: "In Review" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="flex-1">
                    <p className="text-gray-800">{b.item}</p>
                    <p className="text-xs text-gray-400">${b.cost.toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.status === "Approved" ? "bg-green-100 text-green-700" : b.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════ MODALS ══════════════════════════════════════════ */}

      {/* View Asset Detail */}
      {viewAsset && (
        <Modal title={`Asset Details — ${viewAsset.id}`} onClose={() => setViewAsset(null)} width="max-w-xl">
          <div className="space-y-5">
            {/* Header badge */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                {TYPE_ICON[viewAsset.type] ?? <Package className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold text-gray-900">{viewAsset.make} {viewAsset.model}</p>
                <p className="text-sm text-gray-500">{viewAsset.type} · {viewAsset.id}</p>
              </div>
              <span className={`ml-auto px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${statusColor[viewAsset.status] || "bg-green-100 text-green-700"}`}>
                {viewAsset.status}
              </span>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Assigned To", value: viewAsset.user },
                { label: "Department", value: viewAsset.dept },
                { label: "Location", value: viewAsset.location },
                { label: "Asset Age", value: `${viewAsset.age} years` },
                { label: "Warranty", value: viewAsset.warranty, highlight: viewAsset.warranty === "Expired" },
                { label: "Open Tickets", value: `${viewAsset.tickets} ticket${viewAsset.tickets !== 1 ? "s" : ""}` },
              ].map(f => (
                <div key={f.label} className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5">{f.label}</p>
                  <p className={`text-sm font-semibold ${(f as any).highlight ? "text-red-600" : "text-gray-800"}`}>{f.value}</p>
                </div>
              ))}
            </div>

            {/* Ticket status bar */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold mb-1">Ticket History</p>
              <p className="text-sm text-blue-800">{viewAsset.tickets} total tickets logged against this asset.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="secondary" size="sm" onClick={() => { setViewAsset(null); setHistoryAsset(viewAsset); }}>View History</Btn>
              <Btn variant="ghost" size="sm" onClick={() => setViewAsset(null)}>Close</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Asset History */}
      {historyAsset && (
        <Modal title={`Maintenance History — ${historyAsset.id}`} onClose={() => setHistoryAsset(null)} width="max-w-xl">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{historyAsset.make} {historyAsset.model} · {historyAsset.user}</p>
            {(ASSET_HISTORY[historyAsset.id] || []).map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  {i < (ASSET_HISTORY[historyAsset.id] || []).length - 1 && (
                    <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-800">{h.action}</span>
                    <span className="text-xs text-gray-400">· {h.date}</span>
                  </div>
                  <p className="text-xs text-blue-600 mb-0.5">by {h.by}</p>
                  <p className="text-sm text-gray-600">{h.note}</p>
                </div>
              </div>
            ))}
            {!(ASSET_HISTORY[historyAsset.id]?.length) && (
              <p className="text-sm text-gray-400 text-center py-6">No history records found for this asset.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Add Asset */}
      {showAddAsset && (
        <Modal title="Add New Asset" onClose={() => setShowAddAsset(false)} width="max-w-lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Asset ID *</label>
                <input value={addForm.id} onChange={e => setAddForm(f => ({ ...f, id: e.target.value }))}
                  placeholder="e.g. WIN-PC-0099"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  {["Desktop", "Laptop", "Network Switch", "Access Point", "Printer", "Server", "Other"].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Make *</label>
                <input value={addForm.make} onChange={e => setAddForm(f => ({ ...f, make: e.target.value }))}
                  placeholder="e.g. Dell, Apple, Cisco"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Model *</label>
                <input value={addForm.model} onChange={e => setAddForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="e.g. OptiPlex 7090"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned User</label>
                <input value={addForm.user} onChange={e => setAddForm(f => ({ ...f, user: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                <input value={addForm.dept} onChange={e => setAddForm(f => ({ ...f, dept: e.target.value }))}
                  placeholder="e.g. Finance"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                <input value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Building A, Floor 2"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Btn variant="primary" onClick={() => {
                if (!addForm.id || !addForm.make || !addForm.model) {
                  onShowToast?.("Please fill in Asset ID, Make, and Model", "error");
                  return;
                }
                onShowToast?.(`Asset ${addForm.id} registered successfully`, "success");
                setAddForm({ id: "", type: "Desktop", make: "", model: "", user: "", dept: "", location: "" });
                setShowAddAsset(false);
              }}>Register Asset</Btn>
              <Btn variant="ghost" onClick={() => setShowAddAsset(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Reorder Part */}
      {reorderPart && (
        <Modal title={`Reorder — ${reorderPart.name}`} onClose={() => setReorderPart(null)} width="max-w-md">
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${reorderPart.status === "Critical" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className={`text-sm font-semibold ${reorderPart.status === "Critical" ? "text-red-700" : "text-amber-700"}`}>
                {reorderPart.status === "Critical" ? "🚨 Critical stock level" : "⚠️ Low stock level"}
              </p>
              <p className="text-xs text-gray-600 mt-1">Current: {reorderPart.stock} units · Minimum: {reorderPart.minStock} units</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Part ID</label>
                <p className="text-sm font-mono text-blue-600 font-bold">{reorderPart.id}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Cost</label>
                <p className="text-sm font-semibold text-gray-800">${reorderPart.cost}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Order Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setReorderQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-lg font-bold text-gray-800 w-8 text-center">{reorderQty}</span>
                <button onClick={() => setReorderQty(q => q + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <Plus className="w-3 h-3" />
                </button>
                <span className="text-sm text-gray-500 ml-2">= <span className="font-semibold text-gray-800">${(reorderQty * reorderPart.cost).toLocaleString()}</span> total</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
              <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option>CDW — Preferred Vendor</option>
                <option>Amazon Business</option>
                <option>Insight Direct</option>
                <option>Zones LLC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Urgency</label>
              <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Standard (5–7 days)</option>
                <option>Expedited (2–3 days)</option>
                <option>Overnight</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="primary" onClick={() => {
                onShowToast?.(`Reorder placed for ${reorderQty}× ${reorderPart.name} — PO submitted for approval`, "success");
                setReorderPart(null);
              }}>Submit Reorder</Btn>
              <Btn variant="ghost" onClick={() => setReorderPart(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Adjust Stock */}
      {adjustPart && (
        <Modal title={`Adjust Stock — ${adjustPart.name}`} onClose={() => setAdjustPart(null)} width="max-w-md">
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Current Stock</p>
                <p className="text-2xl font-bold text-gray-800">{adjustPart.stock}</p>
              </div>
              <div className="text-2xl text-gray-300">→</div>
              <div>
                <p className="text-xs text-gray-500">New Stock</p>
                <p className={`text-2xl font-bold ${adjustPart.stock + adjustDelta < adjustPart.minStock ? "text-red-600" : "text-green-600"}`}>
                  {Math.max(0, adjustPart.stock + adjustDelta)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Adjustment (+ add / − remove)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setAdjustDelta(d => d - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <Minus className="w-3 h-3" />
                </button>
                <span className={`text-lg font-bold w-12 text-center ${adjustDelta > 0 ? "text-green-600" : adjustDelta < 0 ? "text-red-600" : "text-gray-600"}`}>
                  {adjustDelta > 0 ? `+${adjustDelta}` : adjustDelta}
                </span>
                <button onClick={() => setAdjustDelta(d => d + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
              <select value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Consumed in repair</option>
                <option>Received new stock</option>
                <option>Lost / damaged</option>
                <option>Returned to supplier</option>
                <option>Inventory count correction</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="primary" onClick={() => {
                if (adjustDelta === 0) { onShowToast?.("No adjustment made — delta is zero", "error"); return; }
                onShowToast?.(`Stock for ${adjustPart.name} ${adjustDelta > 0 ? "increased" : "decreased"} by ${Math.abs(adjustDelta)} units`, "success");
                setAdjustPart(null);
              }}>Save Adjustment</Btn>
              <Btn variant="ghost" onClick={() => setAdjustPart(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Plan Replacement */}
      {replacementAsset && (
        <Modal title={`Plan Replacement — ${replacementAsset.id}`} onClose={() => setReplacementAsset(null)} width="max-w-md">
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${replacementAsset.warranty === "Expired" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className="text-sm font-semibold text-gray-800">{replacementAsset.name}</p>
              <p className={`text-xs mt-1 ${replacementAsset.warranty === "Expired" ? "text-red-600" : "text-amber-600"}`}>
                Warranty: {replacementAsset.warranty} · Age: {replacementAsset.age} years · Dept: {replacementAsset.dept}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Replacement Reason</label>
              <select className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Warranty Expired</option>
                <option>End of Life (Age)</option>
                <option>Performance Degradation</option>
                <option>Frequent Failures</option>
                <option>Security Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Replacement Date</label>
              <input type="date" defaultValue="2027-01-15"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Estimated Budget ($)</label>
              <input type="number" defaultValue={1200} placeholder="e.g. 1200"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <textarea rows={2} placeholder="Any special requirements or notes..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="primary" onClick={() => {
                onShowToast?.(`Replacement plan for ${replacementAsset.id} submitted for budget approval`, "success");
                setReplacementAsset(null);
              }}>Submit Plan</Btn>
              <Btn variant="ghost" onClick={() => setReplacementAsset(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
