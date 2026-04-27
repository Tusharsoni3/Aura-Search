import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

const SUGGESTED_PROMPTS = [
  { icon: "🌐", text: "What's happening in tech today?" },
  { icon: "⚛️", text: "Explain quantum computing simply" },
  { icon: "🤖", text: "Latest AI developments in 2024" },
  { icon: "🔌", text: "How does the internet work?" },
];

/* ─── Welcome / empty state ──────────────────────────────────────────────── */
function WelcomeState({ onSuggestClick }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pb-16 select-none">
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        {/* Logo mark */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
            boxShadow: "0 0 40px rgba(129,140,248,0.18)",
          }}
        >
          <span
            className="font-black text-2xl tracking-tighter"
            style={{ color: "#0B0C11" }}
          >
            J
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight"
          style={{ color: "#F0F0FF" }}
        >
          How can I help you today?
        </h2>

        {/* Sub-text */}
        <p
          className="text-sm mb-10 max-w-sm leading-relaxed"
          style={{ color: "#64748B" }}
        >
          Ask me anything — I'll search the web and reason through it in real
          time.
        </p>

        {/* Suggestion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p.text}
              onClick={() => onSuggestClick && onSuggestClick(p.text)}
              className="group flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-150 active:scale-[0.98]"
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
              <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                {p.icon}
              </span>
              <span
                className="text-sm leading-snug transition-colors duration-150 group-hover:text-[#F0F0FF]"
                style={{ color: "#94A3B8" }}
              >
                {p.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ChatWindow
═══════════════════════════════════════════════════════════════════════════ */
export default function ChatWindow({ messages, onSuggestClick }) {
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

  /* ── Auto-scroll to bottom whenever messages change ── */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isEmpty = !messages || messages.length === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        {isEmpty ? (
          <WelcomeState onSuggestClick={onSuggestClick} />
        ) : (
          <div className="px-4 py-6 max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id ?? msg._id ?? `msg-${idx}`}
                  message={msg}
                />
              ))}
            </div>
            {/* Scroll anchor */}
            <div ref={bottomRef} className="h-4" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
