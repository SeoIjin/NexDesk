import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Card, Btn, AIBadge, StatCard } from "./design-system";
import { KNOWLEDGE_ARTICLES } from "./mock-data";

type KnowledgeArticle = typeof KNOWLEDGE_ARTICLES[0] & {
  content?: string;
};

const EMPTY_ARTICLE_FORM = {
  title: "",
  category: "Hardware",
  author: "IT Admin",
  content: "",
};

export function KnowledgeBase({ initialSearch = "", onNewTicket, onShowToast }: {
  initialSearch?: string;
  onNewTicket?: () => void;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCat, setSelectedCat] = useState("All");
  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => [...KNOWLEDGE_ARTICLES]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [articleForm, setArticleForm] = useState(EMPTY_ARTICLE_FORM);

  const categories = ["All", "Hardware", "Software", "Network", "Account/Access", "Printer", "Security"];

  const filtered = articles.filter(a =>
    (selectedCat === "All" || a.category === selectedCat) &&
    (search === "" || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  const openArticle = (article: KnowledgeArticle) => {
    setFeedbackGiven(null);
    setSelectedArticle(article);
  };

  const publishArticle = () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) return;

    const nextNumber = articles.reduce((max, article) => {
      const numericId = Number(article.id.replace(/\D/g, ""));
      return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
    }, 0) + 1;

    const newArticle: KnowledgeArticle = {
      id: `KB-${String(nextNumber).padStart(3, "0")}`,
      title: articleForm.title.trim(),
      category: articleForm.category,
      author: articleForm.author.trim() || "IT Admin",
      updated: new Date().toISOString().slice(0, 10),
      views: 0,
      helpful: 0,
      content: articleForm.content.trim(),
    };

    setArticles(current => [newArticle, ...current]);
    setArticleForm(EMPTY_ARTICLE_FORM);
    setSelectedCat("All");
    setSearch("");
    setShowNewArticle(false);
    onShowToast?.(`${newArticle.id} published successfully`, "success");
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium">
          ← Back to Knowledge Base
        </button>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">{selectedArticle.category}</span>
            <span className="text-xs text-gray-400">{selectedArticle.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h1>
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-gray-100 pb-4 text-sm text-gray-500">
            <span>By {selectedArticle.author}</span>
            <span>Updated {selectedArticle.updated}</span>
            <span>{selectedArticle.views.toLocaleString()} views</span>
            <span className="text-green-600 font-medium">{selectedArticle.helpful}% helpful</span>
          </div>

          <div className="prose prose-sm max-w-none space-y-4">
            {selectedArticle.content ? (
              <p className="whitespace-pre-line text-gray-600 leading-7">{selectedArticle.content}</p>
            ) : (
              <p className="text-gray-600">This knowledge base article explains how to resolve the issue step by step. Follow the instructions carefully, and contact IT support if you're unsure about any step.</p>
            )}

            {!selectedArticle.content && <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-800">📋 Before You Start</p>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Save any open work before following these steps</li>
                <li>• You'll need administrator access for some steps</li>
                <li>• The process takes approximately 5–15 minutes</li>
              </ul>
            </div>}

            {!selectedArticle.content && <div className="space-y-3">
              {[
                "Open the Start menu and navigate to Settings → System",
                "Click on 'Troubleshoot' and then 'Additional troubleshooters'",
                "Run the relevant troubleshooter and apply any recommended fixes",
                "If the issue persists, restart your device and try again",
                "If still unresolved, submit a support ticket with the error message"
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                </div>
              ))}
            </div>}

            {!selectedArticle.content && <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-800">✅ Resolution Confirmed</p>
              <p className="text-sm text-green-700 mt-1">This solution resolved the issue for {selectedArticle.helpful}% of users who tried it.</p>
            </div>}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Was this article helpful?</p>

            {feedbackGiven === "yes" && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-green-800">Glad we could help!</p>
                  <p className="text-xs text-green-600 mt-0.5">Thanks for your feedback. This article has been marked as helpful.</p>
                </div>
              </div>
            )}

            {feedbackGiven === "no" && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-2xl">🛠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Still having a problem?</p>
                  <p className="text-xs text-amber-700 mt-0.5 mb-3">We're sorry the article didn't resolve your issue. Our IT team is ready to help.</p>
                  <button
                    onClick={onNewTicket}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    📋 Submit a ticket right now →
                  </button>
                </div>
              </div>
            )}

            {feedbackGiven === null && (
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Btn variant="success" size="sm" onClick={() => { setFeedbackGiven("yes"); onShowToast?.("Thanks for your feedback! 👍", "success"); }}>👍 Yes, resolved my issue</Btn>
                <Btn variant="secondary" size="sm" onClick={() => setFeedbackGiven("no")}>👎 No, I still need help</Btn>
                <Btn variant="ghost" size="sm" className="ml-auto" onClick={onNewTicket}>Submit a Ticket →</Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      {showNewArticle && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
          onClick={() => setShowNewArticle(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
              <div>
                <h2 className="font-bold text-gray-900">Create New Article</h2>
                <p className="mt-0.5 text-xs text-gray-500">Publish a new self-service guide to the Knowledge Base.</p>
              </div>
              <button
                aria-label="Close new article editor"
                onClick={() => setShowNewArticle(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Article title</label>
                <input
                  value={articleForm.title}
                  onChange={event => setArticleForm(current => ({ ...current, title: event.target.value }))}
                  placeholder="e.g. Configure VPN access on a new laptop"
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Category</label>
                  <div className="relative">
                    <select
                      value={articleForm.category}
                      onChange={event => setArticleForm(current => ({ ...current, category: event.target.value }))}
                      className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {categories.slice(1).map(category => <option key={category}>{category}</option>)}
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Author</label>
                  <input
                    value={articleForm.author}
                    onChange={event => setArticleForm(current => ({ ...current, author: event.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Article content</label>
                <textarea
                  value={articleForm.content}
                  onChange={event => setArticleForm(current => ({ ...current, content: event.target.value }))}
                  placeholder="Write clear troubleshooting steps, prerequisites, and expected results..."
                  className="min-h-56 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-gray-400">{articleForm.content.length} characters</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 px-4 py-4 sm:flex sm:justify-end sm:px-6">
              <Btn variant="ghost" onClick={() => setShowNewArticle(false)}>Cancel</Btn>
              <Btn
                variant="primary"
                disabled={!articleForm.title.trim() || !articleForm.content.trim()}
                onClick={publishArticle}
              >
                Publish Article
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-500">Self-service articles, guides, and FAQs</p>
        </div>
        <div className="flex gap-2">
          <Btn size="sm" variant="primary" className="w-full sm:w-auto" onClick={() => setShowNewArticle(true)}>+ New Article</Btn>
        </div>
      </div>

      {/* Search hero */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 p-5 sm:p-8">
        <h2 className="text-white text-xl font-bold text-center mb-2">How can we help you?</h2>
        <p className="text-blue-100 text-sm text-center mb-5">Search our knowledge base — 40% of issues can be resolved without submitting a ticket.</p>
        <div className="relative max-w-2xl mx-auto">
          <div className={`flex items-center gap-3 bg-white/15 backdrop-blur-sm border-2 rounded-2xl px-4 py-3 transition-all duration-200 ${search.length > 0 ? "border-white shadow-[0_0_0_4px_rgba(255,255,255,0.15)]" : "border-white/30 hover:border-white/60"}`}>
            <Search className="w-4 h-4 text-white/70 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, e.g. 'reset password', 'VPN setup', 'printer offline'..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-white/50 hover:text-white transition-colors text-lg leading-none flex-shrink-0"
              >×</button>
            )}
          </div>
        </div>
        {search && (
          <p className="text-blue-100 text-xs text-center mt-2">Showing results for: "{search}" — {filtered.length} articles found</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard label="Total Articles" value={47 + articles.length - KNOWLEDGE_ARTICLES.length} sub="8 categories" color="blue" />
        <StatCard label="Deflection Rate" value="40%" sub="Issues self-resolved" color="green" />
        <StatCard label="Most Viewed" value="3,201" sub="Password reset guide" color="teal" />
        <StatCard label="Avg Helpfulness" value="90%" sub="User ratings" color="amber" />
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card title="Categories">
            <div className="p-2 space-y-1">
              {categories.map(cat => {
                const icons: Record<string, string> = { All: "📚", Hardware: "💻", Software: "⚙️", Network: "🌐", "Account/Access": "🔑", Printer: "🖨️", Security: "🔒" };
                const count = cat === "All" ? articles.length : articles.filter(a => a.category === cat).length;
                return (
                  <button key={cat} onClick={() => { setSelectedCat(cat); setSearch(""); }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === cat ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}>
                    <span className="flex items-center gap-2">{icons[cat]} {cat}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{count}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Popular This Week">
            <div className="divide-y divide-gray-50">
              {[...articles].sort((a, b) => b.views - a.views).slice(0, 4).map(a => (
                <button key={a.id} onClick={() => openArticle(a)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.views.toLocaleString()} views</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Articles Grid */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-600 font-medium">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Try different keywords or browse by category</p>
              <Btn variant="primary" size="sm" className="mt-4" onClick={onNewTicket}>Submit a Support Ticket</Btn>
            </div>
          )}
          {filtered.map(a => (
            <div key={a.id} onClick={() => openArticle(a)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{a.category}</span>
                    <span className="text-xs text-gray-400">{a.id}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{a.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>By {a.author}</span>
                    <span>Updated {a.updated}</span>
                    <span>{a.views.toLocaleString()} views</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold ${a.helpful >= 90 ? "text-green-600" : a.helpful >= 80 ? "text-amber-600" : "text-red-500"}`}>
                    {a.helpful}%
                  </div>
                  <p className="text-xs text-gray-400">helpful</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-xs text-gray-400">👁 {a.views.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">👍 {a.helpful}%</span>
                </div>
                <span className="text-xs text-blue-600 font-medium">Read article →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
