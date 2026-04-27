import { useRef, useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export default function SearchInput({
  onSend,
  isLoading,
  placeholder = "Ask anything...",
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  /* ── Auto-resize ── */
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const LINE_HEIGHT = 22;
    const MAX_ROWS = 5;
    el.style.height = Math.min(el.scrollHeight, LINE_HEIGHT * MAX_ROWS) + "px";
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  /* ── Submit ── */
  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    // reset height after clearing
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <div className="flex-shrink-0 border-t border-[#23253A] bg-[#0F1117] px-4 py-4">
      {/* Max-width wrapper keeps input from stretching on wide screens */}
      <div className="max-w-3xl mx-auto">
        {/* Input box */}
        <div
          className="
            flex items-end gap-3
            bg-[#1A1B27]
            border border-[#23253A]
            rounded-2xl px-4 py-3
            transition-all duration-200
            focus-within:border-indigo-500/50
            focus-within:shadow-[0_0_20px_rgba(129,140,248,0.08)]
          "
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="
              flex-1 bg-transparent
              text-[#F0F0FF] placeholder-slate-500
              resize-none outline-none
              text-sm leading-relaxed
              disabled:opacity-50
              transition-opacity duration-150
            "
            style={{ minHeight: "22px", maxHeight: "110px" }}
            aria-label="Message input"
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Send message"
            className="
              shrink-0
              bg-indigo-500 hover:bg-indigo-400
              disabled:opacity-40 disabled:cursor-not-allowed
              text-[#0B0C11]
              rounded-xl p-2.5
              transition-all duration-150
              active:scale-95
            "
          >
            {isLoading ? (
              /* Tiny spinner when loading */
              <span
                className="block w-4 h-4 rounded-full border-2 border-[#0B0C11]/30 border-t-[#0B0C11]"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : (
              <ArrowUp size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-600 mt-2 select-none">
          Aura Search can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
