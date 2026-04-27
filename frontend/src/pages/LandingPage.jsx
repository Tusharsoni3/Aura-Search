import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles, ArrowRight } from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const SUGGESTED_CHIPS = [
  "What's happening in tech today?",
  "Explain quantum computing",
  "Latest AI developments",
  "How does the internet work?",
];

const FEATURE_CARDS = [
  {
    emoji: "🔍",
    title: "Web Search",
    description:
      "Real-time answers sourced directly from the web — not stale training data.",
  },
  {
    emoji: "🤖",
    title: "AI Analysis",
    description:
      "Deep reasoning and synthesis powered by state-of-the-art language models.",
  },
  {
    emoji: "💬",
    title: "Chat History",
    description:
      "Every conversation saved and organised so you can pick up right where you left off.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LandingPage
═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const goToLogin = () => navigate("/login");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goToLogin();
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#0B0C11", color: "#F0F0FF" }}
    >
      {/* ── Animated gradient orbs ───────────────────────────────────────── */}
      <style>{`
        @keyframes orb-drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(40px, -50px) scale(1.12); }
        }
        @keyframes orb-drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-50px, 30px) scale(1.08); }
        }
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.04; }
          50%       { opacity: 0.09; }
        }
      `}</style>

      {/* Cyan orb — top-left */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-160px",
          left: "-120px",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(129,140,248,0.18) 0%, transparent 70%)",
          animation: "orb-drift-a 11s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Violet orb — bottom-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-140px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.16) 0%, transparent 70%)",
          animation: "orb-drift-b 13s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Centre glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "350px",
          background:
            "radial-gradient(ellipse, rgba(129,140,248,0.06) 0%, rgba(52,211,153,0.04) 50%, transparent 70%)",
          animation: "orb-pulse 7s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 py-5"
        style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}
      >
        {/* Logo */}
        <button
          onClick={goToLogin}
          className="flex items-center gap-2.5 focus-visible:outline-none"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
            }}
          >
            <Sparkles size={15} style={{ color: "#0B0C11" }} />
          </div>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: "#F0F0FF" }}
          >
            Aura Search
          </span>
        </button>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToLogin}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150"
            style={{ color: "#94A3B8" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0FF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
          >
            Sign in
          </button>
          <button
            onClick={goToLogin}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
              color: "#0B0C11",
              boxShadow: "0 0 20px rgba(129,140,248,0.2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 30px rgba(129,140,248,0.35)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 20px rgba(129,140,248,0.2)")
            }
          >
            Get started
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-10">
        <div
          className="w-full flex flex-col items-center text-center"
          style={{ maxWidth: "768px", margin: "0 auto" }}
        >
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(129,140,248,0.07)",
              border: "1px solid rgba(129,140,248,0.2)",
              color: "#818CF8",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#818CF8",
                animation: "orb-pulse 2s ease-in-out infinite",
              }}
            />
            AI-powered answers with real-time web search
          </div>

          {/* Heading */}
          <h1
            className="font-black leading-[1.08] tracking-tight mb-5"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "block",
              }}
            >
              Search smarter.
            </span>
            <span
              style={{
                background: "linear-gradient(135deg, #34D399 0%, #818CF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "block",
              }}
            >
              Think deeper.
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="text-lg leading-relaxed mb-10 max-w-lg"
            style={{ color: "#64748B" }}
          >
            AI-powered answers with real-time web search. Ask anything and get
            responses that actually make sense.
          </p>

          {/* ── Search bar ── */}
          <form onSubmit={handleSearchSubmit} className="w-full mb-5">
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-200"
              style={{
                background: "#1A1B27",
                border: "1px solid rgba(129,140,248,0.25)",
                boxShadow: "0 0 0 0 rgba(129,140,248,0)",
              }}
              onFocus={() => {}}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(129,140,248,0.45)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(129,140,248,0.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(129,140,248,0.25)";
                e.currentTarget.style.boxShadow = "0 0 0 0 rgba(129,140,248,0)";
              }}
            >
              {/* Input (read-only — click goes to /login) */}
              <input
                type="text"
                value={query}
                readOnly
                onClick={goToLogin}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent outline-none text-base leading-relaxed cursor-pointer"
                style={{ color: "#F0F0FF" }}
              />

              {/* Send button */}
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all duration-150 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
                  color: "#0B0C11",
                }}
              >
                <Send size={14} strokeWidth={2.5} />
                Ask
              </button>
            </div>
          </form>

          {/* ── Suggestion chips ── */}
          <div className="flex flex-wrap gap-2 justify-center mb-16">
            {SUGGESTED_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={goToLogin}
                className="px-4 py-2 rounded-full text-sm transition-all duration-150 active:scale-95"
                style={{
                  background: "#15161F",
                  border: "1px solid rgba(35,37,58,0.8)",
                  color: "#94A3B8",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1E1B4B";
                  e.currentTarget.style.borderColor = "rgba(129,140,248,0.3)";
                  e.currentTarget.style.color = "#F0F0FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#15161F";
                  e.currentTarget.style.borderColor = "rgba(35,37,58,0.8)";
                  e.currentTarget.style.color = "#94A3B8";
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* ── Feature cards ── */}
          <div
            className="grid gap-4 w-full"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            {FEATURE_CARDS.map((card) => (
              <button
                key={card.title}
                onClick={goToLogin}
                className="group flex flex-col items-start p-5 rounded-2xl text-left transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "#15161F",
                  border: "1px solid rgba(35,37,58,0.7)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1E1B4B";
                  e.currentTarget.style.borderColor = "rgba(129,140,248,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#15161F";
                  e.currentTarget.style.borderColor = "rgba(35,37,58,0.7)";
                }}
              >
                <span className="text-3xl mb-3" aria-hidden="true">
                  {card.emoji}
                </span>
                <h3
                  className="font-semibold text-base mb-1.5 transition-colors duration-150 group-hover:text-indigo-300"
                  style={{ color: "#F0F0FF" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#64748B" }}
                >
                  {card.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 flex flex-wrap items-center justify-center gap-3 px-6 py-5 text-xs"
        style={{
          borderTop: "1px solid rgba(35,37,58,0.4)",
          color: "#475569",
        }}
      >
        <span>
          © {new Date().getFullYear()} Aura Search. All rights reserved.
        </span>
        <span aria-hidden="true" style={{ color: "#23253A" }}>
          ·
        </span>
        <button
          onClick={goToLogin}
          className="transition-colors duration-150 hover:text-[#94A3B8]"
        >
          Privacy
        </button>
        <span aria-hidden="true" style={{ color: "#23253A" }}>
          ·
        </span>
        <button
          onClick={goToLogin}
          className="transition-colors duration-150 hover:text-[#94A3B8]"
        >
          Terms
        </button>
        <span aria-hidden="true" style={{ color: "#23253A" }}>
          ·
        </span>
        <button
          onClick={goToLogin}
          className="transition-colors duration-150 hover:text-[#94A3B8]"
        >
          Contact
        </button>
      </footer>
    </div>
  );
}
