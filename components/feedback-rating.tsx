import { useState } from "react";
import { Star, ThumbsUp, MessageSquare, Award, TrendingUp, Filter, ChevronDown, X, CheckCircle } from "lucide-react";
import { TECHNICIANS } from "./mock-data";

// ── Mock review data ───────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: "r1",  techId: "T001", techName: "Ana Reyes",    reviewer: "James B.",   avatar: "JB", rating: 5, comment: "Ana fixed my laptop screen issue in under an hour. Extremely professional and friendly. Best IT experience I've had!", date: "Nov 1, 2026",  category: "Hardware",       verified: true  },
  { id: "r2",  techId: "T005", techName: "Lena Novak",   reviewer: "Sarah M.",   avatar: "SM", rating: 5, comment: "Lena resolved the phishing alert immediately and explained exactly what happened. Very thorough and reassuring.", date: "Nov 1, 2026",  category: "Security",       verified: true  },
  { id: "r3",  techId: "T002", techName: "Marcus Chen",  reviewer: "Clara P.",   avatar: "CP", rating: 4, comment: "VPN was back online quickly. Good communication throughout the whole process. Kept me updated every step.", date: "Oct 31, 2026", category: "Network",        verified: true  },
  { id: "r4",  techId: "T004", techName: "Jordan Kim",   reviewer: "Robert L.",  avatar: "RL", rating: 5, comment: "Jordan replaced my keyboard same day — didn't even need to send the laptop away. Incredibly fast!", date: "Oct 31, 2026", category: "Hardware",       verified: true  },
  { id: "r5",  techId: "T007", techName: "Sam Torres",   reviewer: "Diane H.",   avatar: "DH", rating: 4, comment: "Sam sorted out our Outlook sync issue. Took a couple of tries but he stayed on it until it was fully resolved.", date: "Oct 30, 2026", category: "Software",       verified: true  },
  { id: "r6",  techId: "T003", techName: "Priya Sharma", reviewer: "Linda C.",   avatar: "LC", rating: 5, comment: "Password reset done in 2 minutes, no fuss. Priya is always cheerful and super efficient!", date: "Oct 30, 2026", category: "Account/Access", verified: true  },
  { id: "r7",  techId: "T008", techName: "Robin Walsh",  reviewer: "Tom S.",     avatar: "TS", rating: 5, comment: "Escalated my complex server issue and Robin had a root cause in 30 minutes. Phenomenal technical depth.", date: "Oct 29, 2026", category: "Network",        verified: true  },
  { id: "r8",  techId: "T006", techName: "Devon Mills",  reviewer: "Megan F.",   avatar: "MF", rating: 3, comment: "Printer issue was eventually fixed but it took a few visits. Was polite but could be a bit faster.", date: "Oct 29, 2026", category: "Printer",        verified: true  },
  { id: "r9",  techId: "T001", techName: "Ana Reyes",    reviewer: "Kevin W.",   avatar: "KW", rating: 5, comment: "Set up my new MacBook in record time with all software pre-configured. Ana is outstanding.", date: "Oct 28, 2026", category: "Hardware",       verified: true  },
  { id: "r10", techId: "T002", techName: "Marcus Chen",  reviewer: "Nina P.",    avatar: "NP", rating: 4, comment: "WiFi issue resolved after two troubleshooting sessions. Could have been faster but friendly throughout.", date: "Oct 28, 2026", category: "Network",        verified: false },
];

const CATEGORIES = ["All", "Hardware", "Software", "Network", "Account/Access", "Security", "Printer"] as const;

function StarRow({ rating, size = 14, interactive = false, onRate }: { rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  const effective = hover || rating;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{ width: size, height: size, cursor: interactive ? "pointer" : "default" }}
          className={effective >= i ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(i)}
        />
      ))}
    </div>
  );
}

function TechAvatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const colors: Record<string, string> = {
    AR: "from-teal-400 to-cyan-500", MC: "from-blue-500 to-indigo-500",
    PS: "from-purple-400 to-violet-500", JK: "from-orange-400 to-amber-500",
    LN: "from-red-400 to-rose-500", DM: "from-emerald-400 to-green-500",
    ST: "from-sky-400 to-blue-400", RW: "from-pink-400 to-fuchsia-500",
  };
  const grad = colors[initials] || "from-gray-400 to-gray-500";
  return (
    <div
      className={`bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials}
    </div>
  );
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8">{label}★</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{value}%</span>
    </div>
  );
}

export function FeedbackRating() {
  const [filterCat, setFilterCat] = useState<string>("All");
  const [sortBy, setSortBy]       = useState<"rating" | "reviews" | "resolved">("rating");
  const [sortOpen, setSortOpen]   = useState(false);
  const [ratingTech, setRatingTech] = useState<string | null>(null);   // tech id being rated
  const [submitted, setSubmitted]   = useState<string[]>([]);           // tech ids already rated
  const [reviews, setReviews]       = useState(MOCK_REVIEWS);
  const [showAll, setShowAll]       = useState(false);

  // Form state
  const [formRating, setFormRating]   = useState(0);
  const [formComment, setFormComment] = useState("");
  const [formCat, setFormCat]         = useState("General");
  const [showSuccess, setShowSuccess] = useState(false);

  const techReviewMap = reviews.reduce<Record<string, typeof reviews>>((acc, r) => {
    acc[r.techId] = acc[r.techId] || [];
    acc[r.techId].push(r);
    return acc;
  }, {});

  const avgRating = (techId: string) => {
    const rs = techReviewMap[techId];
    if (!rs || !rs.length) return 0;
    return parseFloat((rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1));
  };

  const filteredReviews = filterCat === "All"
    ? reviews
    : reviews.filter(review => review.category === filterCat);

  const sortedTechs = [...TECHNICIANS]
    .filter(t => filterCat === "All" || (t.skills as Record<string, number>)[filterCat] >= 75)
    .sort((a, b) => {
      if (sortBy === "rating")   return b.csat - a.csat;
      if (sortBy === "reviews")  return (techReviewMap[b.id]?.length || 0) - (techReviewMap[a.id]?.length || 0);
      return b.totalResolved - a.totalResolved;
    });

  const overallAvg = (TECHNICIANS.reduce((s, t) => s + t.csat, 0) / TECHNICIANS.length).toFixed(1);
  const totalReviews = reviews.length;

  const handleSubmit = () => {
    if (!ratingTech || !formRating) return;
    const tech = TECHNICIANS.find(t => t.id === ratingTech)!;
    const newReview = {
      id: `r${Date.now()}`,
      techId: ratingTech,
      techName: tech.name,
      reviewer: "You",
      avatar: "YO",
      rating: formRating,
      comment: formComment || "No comment provided.",
      date: "Nov 2, 2026",
      category: formCat,
      verified: true,
    };
    setReviews(prev => [newReview, ...prev]);
    setSubmitted(prev => [...prev, ratingTech]);
    setRatingTech(null);
    setFormRating(0);
    setFormComment("");
    setFormCat("General");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 4);

  const sortLabel = sortBy === "rating" ? "Highest Rated" : sortBy === "reviews" ? "Most Reviewed" : "Most Resolved";

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-8 sm:space-y-6">

      {/* ── Success toast ─────────────────────────────────────────── */}
      {showSuccess && (
        <div style={{ position: "fixed", bottom: 12, right: 12, left: 12, maxWidth: 420, marginLeft: "auto", zIndex: 9999, display: "flex", alignItems: "center", gap: 12, background: "#059669", color: "white", padding: "12px 18px", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">Thanks! Your feedback has been submitted.</span>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 p-4 text-white sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Feedback & Ratings</h1>
            <p className="text-blue-100 text-sm mt-1">Rate the IT technicians who helped you and read what other employees say.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-4">
            <div className="min-w-0 rounded-xl bg-white/15 px-2 py-3 text-center sm:min-w-[80px] sm:px-4">
              <p className="text-2xl font-bold">{overallAvg}</p>
              <p className="text-xs text-blue-100">Avg. Rating</p>
            </div>
            <div className="min-w-0 rounded-xl bg-white/15 px-2 py-3 text-center sm:min-w-[80px] sm:px-4">
              <p className="text-2xl font-bold">{totalReviews}</p>
              <p className="text-xs text-blue-100">Total Reviews</p>
            </div>
            <div className="min-w-0 rounded-xl bg-white/15 px-2 py-3 text-center sm:min-w-[80px] sm:px-4">
              <p className="text-2xl font-bold">{TECHNICIANS.length}</p>
              <p className="text-xs text-blue-100">Technicians</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Sort ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setFilterCat(c); setShowAll(false); }}
              aria-pressed={filterCat === c}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterCat === c ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"}`}>
              {c}
            </button>
          ))}
        </div>
        {/* Sort dropdown */}
        <div className="w-full sm:w-auto" style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setSortOpen(!sortOpen)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 sm:w-auto">
            <TrendingUp className="w-3.5 h-3.5" />
            {sortLabel}
            <ChevronDown className="w-3 h-3" />
          </button>
          {sortOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 9999, width: 160, background: "white", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", overflow: "hidden" }}>
              {(["rating", "reviews", "resolved"] as const).map(s => (
                <button key={s} onClick={() => { setSortBy(s); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${sortBy === s ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                  {s === "rating" ? "Highest Rated" : s === "reviews" ? "Most Reviewed" : "Most Resolved"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Technician Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTechs.map(tech => {
          const techReviews = techReviewMap[tech.id] || [];
          const displayRating = avgRating(tech.id) || tech.csat;
          const alreadyRated = submitted.includes(tech.id);
          const isExpanded   = ratingTech === tech.id;
          const ratingCounts = [5, 4, 3, 2, 1].map(s => ({
            star: s,
            pct: techReviews.length ? Math.round((techReviews.filter(r => r.rating === s).length / techReviews.length) * 100) : 0,
          }));

          return (
            <div key={tech.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {/* Card top */}
              <div className="p-4">
                {/* Avatar + name row */}
                <div className="flex items-start gap-3 mb-3">
                  <TechAvatar initials={tech.avatar} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{tech.name}</p>
                    <p className="text-xs text-gray-500 truncate">{tech.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${tech.available ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <span className="text-xs text-gray-400">{tech.available ? "Available" : "Offline"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <StarRow rating={Math.round(displayRating)} size={12} />
                      <span className="font-bold text-amber-500 text-sm leading-none">{displayRating}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{techReviews.length} review{techReviews.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Rating breakdown bars */}
                <div className="space-y-1 mb-3">
                  {ratingCounts.map(({ star, pct }) => (
                    <RatingBar key={star} label={String(star)} value={pct} max={100} />
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2 mb-3">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{tech.totalResolved} resolved</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{tech.slaCompliance}% SLA</span>
                </div>

                {/* Badges */}
                {tech.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tech.badges.slice(0, 2).map(badge => (
                      <span key={badge} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        <Award className="w-2.5 h-2.5" />{badge}
                      </span>
                    ))}
                    {tech.badges.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{tech.badges.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Rate button */}
                {alreadyRated ? (
                  <div className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 rounded-xl text-emerald-700 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Feedback Submitted
                  </div>
                ) : !isExpanded ? (
                  <button onClick={() => setRatingTech(tech.id)}
                    className="w-full py-2 rounded-xl text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <span className="flex items-center justify-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Rate this Technician
                    </span>
                  </button>
                ) : null}
              </div>

              {/* ── Inline Rating Form ─────────────────────────── */}
              {isExpanded && (
                <div className="border-t border-blue-100 bg-blue-50 p-4 space-y-3">
                  {/* Form header with cancel */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-blue-800">Rate your experience with {tech.name.split(" ")[0]}</p>
                    <button onClick={() => { setRatingTech(null); setFormRating(0); setFormComment(""); setFormCat("General"); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-300 text-blue-700 transition-colors flex-shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Star picker */}
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    <StarRow rating={formRating} size={28} interactive onRate={setFormRating} />
                    <p className="text-xs text-gray-500">
                      {formRating === 0 ? "Tap a star to rate" : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][formRating]}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Issue type</label>
                    <div className="relative">
                      <select value={formCat} onChange={e => setFormCat(e.target.value)}
                        className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30">
                        {["General", "Hardware", "Software", "Network", "Account/Access", "Security", "Printer"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Comment <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea value={formComment} onChange={e => setFormComment(e.target.value)}
                      placeholder="Tell others about your experience…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 resize-none h-20 bg-white" />
                  </div>

                  <button onClick={handleSubmit} disabled={!formRating}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${formRating ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedTechs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
          <p className="text-sm font-semibold text-gray-700">No technicians match this category.</p>
          <button onClick={() => setFilterCat("All")} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
            Clear category filter
          </button>
        </div>
      )}

      {/* ── Recent Reviews ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Recent Reviews
          </h2>
          <button onClick={() => setShowAll(!showAll)} className="text-xs text-blue-600 font-medium hover:underline">
            {showAll ? "Show less" : `View all ${filteredReviews.length}`}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleReviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                {/* Reviewer avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-xs font-semibold text-gray-800">{review.reviewer}</span>
                      <span className="text-xs text-gray-400 ml-1">→</span>
                      <span className="text-xs font-semibold text-blue-600 ml-1">{review.techName}</span>
                      {review.verified && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-600 text-xs">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{review.date}</span>
                  </div>
                  <StarRow rating={review.rating} size={12} />
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{review.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works callout ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-5">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          How ratings work
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "✅", title: "Verified Only", desc: "Ratings are only accepted from employees who had a ticket resolved by that technician." },
            { icon: "🔒", title: "Anonymous Option", desc: "Your name is shown as initials only. Your manager cannot see your individual ratings." },
            { icon: "📊", title: "Used for QA", desc: "CSAT scores feed directly into our Quality Assurance dashboard for service improvement." },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-blue-900">{item.title}</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
