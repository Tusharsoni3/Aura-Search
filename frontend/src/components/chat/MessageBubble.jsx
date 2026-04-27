import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

/* ─── Code block with header + copy ─────────────────────────────────────── */
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className="my-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(35,37,58,0.8)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "#111220",
          borderBottom: "1px solid rgba(35,37,58,0.6)",
        }}
      >
        <span
          className="text-xs font-mono font-medium"
          style={{ color: "rgba(129,140,248,0.6)" }}
        >
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs rounded-md px-2 py-1 transition-all"
          style={{ color: "#64748B", background: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F0F0FF";
            e.currentTarget.style.background = "rgba(35,37,58,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#64748B";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {copied ? (
            <>
              <Check size={11} style={{ color: "#818CF8" }} /> Copied!
            </>
          ) : (
            <>
              <Copy size={11} /> Copy
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre
        className="overflow-x-auto text-sm"
        style={{ background: "#0D0E18", margin: 0, padding: "1rem" }}
      >
        <code
          className="font-mono leading-relaxed"
          style={{ color: "#A5B4FC" }}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}

/* ─── Inline code ────────────────────────────────────────────────────────── */
function InlineCode({ children }) {
  return (
    <code
      className="font-mono text-[0.82em] px-1.5 py-0.5 rounded-md"
      style={{
        background: "rgba(6,14,28,0.9)",
        border: "1px solid rgba(35,37,58,0.7)",
        color: "#A5B4FC",
      }}
    >
      {children}
    </code>
  );
}

/* ─── Markdown component overrides ──────────────────────────────────────── */
const mdComponents = {
  /* Neutralise the outer <pre> so our CodeBlock is the only wrapper */
  pre({ children }) {
    return <>{children}</>;
  },

  code({ className, children }) {
    const language = /language-(\w+)/.exec(className || "")?.[1];
    const raw = String(children).replace(/\n$/, "");
    const isBlock = Boolean(language) || raw.includes("\n");

    if (isBlock) {
      return <CodeBlock language={language} code={raw} />;
    }
    return <InlineCode>{children}</InlineCode>;
  },

  p({ children }) {
    return (
      <p
        className="mb-3 last:mb-0 leading-relaxed"
        style={{ color: "#C7D2FE" }}
      >
        {children}
      </p>
    );
  },

  ul({ children }) {
    return (
      <ul
        className="mb-3 space-y-1 pl-5"
        style={{ color: "#C7D2FE", listStyleType: "disc" }}
      >
        {children}
      </ul>
    );
  },

  ol({ children }) {
    return (
      <ol
        className="mb-3 space-y-1 pl-5"
        style={{ color: "#C7D2FE", listStyleType: "decimal" }}
      >
        {children}
      </ol>
    );
  },

  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },

  h1({ children }) {
    return (
      <h1 className="text-xl font-bold mt-5 mb-3" style={{ color: "#F0F0FF" }}>
        {children}
      </h1>
    );
  },

  h2({ children }) {
    return (
      <h2
        className="text-lg font-semibold mt-4 mb-2"
        style={{ color: "#F0F0FF" }}
      >
        {children}
      </h2>
    );
  },

  h3({ children }) {
    return (
      <h3
        className="text-base font-semibold mt-3 mb-2"
        style={{ color: "#F0F0FF" }}
      >
        {children}
      </h3>
    );
  },

  blockquote({ children }) {
    return (
      <blockquote
        className="pl-4 my-3 italic"
        style={{
          borderLeft: "2px solid rgba(129,140,248,0.35)",
          color: "#94A3B8",
        }}
      >
        {children}
      </blockquote>
    );
  },

  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition-colors"
        style={{ color: "#818CF8" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#A5B4FC")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#818CF8")}
      >
        {children}
      </a>
    );
  },

  strong({ children }) {
    return (
      <strong className="font-semibold" style={{ color: "#F0F0FF" }}>
        {children}
      </strong>
    );
  },

  em({ children }) {
    return (
      <em className="italic" style={{ color: "#34D399" }}>
        {children}
      </em>
    );
  },

  hr() {
    return (
      <hr className="my-4" style={{ borderColor: "rgba(35,37,58,0.6)" }} />
    );
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table
          className="w-full text-sm border-collapse"
          style={{ color: "#C7D2FE" }}
        >
          {children}
        </table>
      </div>
    );
  },

  thead({ children }) {
    return (
      <thead style={{ background: "rgba(21,22,31,0.8)" }}>{children}</thead>
    );
  },

  th({ children }) {
    return (
      <th
        className="px-3 py-2 text-left font-semibold text-sm"
        style={{
          border: "1px solid rgba(35,37,58,0.6)",
          color: "#F0F0FF",
        }}
      >
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td
        className="px-3 py-2 text-sm"
        style={{ border: "1px solid rgba(35,37,58,0.5)" }}
      >
        {children}
      </td>
    );
  },
};

/* ─── Thinking animation ─────────────────────────────────────────────────── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* ─── Streaming cursor ───────────────────────────────────────────────────── */
function StreamingCursor() {
  return (
    <span
      className="inline-block ml-0.5 rounded-sm animate-pulse"
      style={{
        width: "2px",
        height: "1em",
        background: "#818CF8",
        verticalAlign: "text-bottom",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MessageBubble
═══════════════════════════════════════════════════════════════════════════ */
export default function MessageBubble({ message }) {
  const { role, content, isStreaming, isThinking } = message;

  /* ── User bubble ── */
  if (role === "user") {
    return (
      <div className="flex justify-end message-enter">
        <div
          className="max-w-[70%] rounded-2xl rounded-tr-sm px-5 py-3 text-sm leading-relaxed"
          style={{
            background: "#1E1B4B",
            border: "1px solid #3730A3",
            color: "#F0F0FF",
          }}
        >
          <p className="whitespace-pre-wrap wrap-break-word">{content}</p>
        </div>
      </div>
    );
  }

  /* ── AI bubble ── */
  return (
    <div className="flex flex-col message-enter">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
          }}
        >
          <Sparkles size={10} style={{ color: "#0B0C11" }} />
        </div>
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: "#64748B" }}
        >
          Aura Search
        </span>
      </div>

      {/* Content area with left accent border */}
      <div
        className="pl-4 text-sm leading-relaxed"
        style={{ borderLeft: "2px solid rgba(129,140,248,0.35)" }}
      >
        {isThinking && !content ? (
          <ThinkingDots />
        ) : (
          <div style={{ color: "#C7D2FE" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents}
            >
              {content || ""}
            </ReactMarkdown>
            {isStreaming && <StreamingCursor />}
          </div>
        )}
      </div>
    </div>
  );
}
