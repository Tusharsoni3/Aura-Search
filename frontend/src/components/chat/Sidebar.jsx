import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* Strip any markdown symbols the AI might have put in a chat title */
function cleanTitle(raw) {
  if (!raw) return "Untitled Chat";
  return (
    raw
      .replace(/\*{1,3}/g, "")
      .replace(/_{1,3}/g, "")
      .replace(/`{1,3}/g, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/[[\]()]/g, "")
      .replace(/^["']|["']$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim() || "Untitled Chat"
  );
}
import {
  Plus,
  Trash2,
  LogOut,
  Settings,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getInitials(user) {
  if (!user) return "U";
  const name = user.name || user.username || user.email || "";
  return (
    name
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function relativeDateLabel(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();

  // Strip time from both for day-level comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffMs = todayStart - dateStart;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Show time for today
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupChatsByDate(chats) {
  const groups = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const chat of chats) {
    const date = new Date(chat.createdAt);
    const dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const diffDays = Math.round(
      (todayStart - dateStart) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) groups.Today.push(chat);
    else if (diffDays === 1) groups.Yesterday.push(chat);
    else if (diffDays <= 7) groups["Previous 7 Days"].push(chat);
    else groups.Older.push(chat);
  }

  return groups;
}

const GROUP_ORDER = ["Today", "Yesterday", "Previous 7 Days", "Older"];

/* ─── Single chat row ────────────────────────────────────────────────────── */

function ChatItem({ chat, isActive, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);

  const chatId = chat.id || chat._id;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chatId)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(chatId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative flex items-center gap-2 rounded-lg px-3 py-2.5
        cursor-pointer select-none transition-all duration-150 outline-none
        focus-visible:ring-1 focus-visible:ring-indigo-500/50
        ${
          isActive
            ? "bg-[#1E1B4B] border-l-2 border-indigo-400"
            : "border-l-2 border-transparent hover:bg-[#15161F]"
        }
      `}
    >
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate leading-snug ${
            isActive ? "text-[#F0F0FF] font-medium" : "text-[#94A3B8]"
          }`}
        >
          {cleanTitle(chat.title)}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
          {relativeDateLabel(chat.createdAt)}
        </p>
      </div>

      {/* Delete button — visible on hover or when active */}
      {(hovered || isActive) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chatId);
          }}
          aria-label="Delete chat"
          className="shrink-0 p-1 rounded-md transition-all duration-150 text-[#475569] hover:text-red-400 hover:bg-red-400/10"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

/* ─── Group section ──────────────────────────────────────────────────────── */

function ChatGroup({ label, chats, activeChatId, onSelect, onDelete }) {
  if (!chats || chats.length === 0) return null;

  return (
    <div className="mb-4">
      <p
        className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "#475569" }}
      >
        {label}
      </p>
      <div className="flex flex-col gap-0.5">
        {chats.map((chat) => {
          const id = chat.id || chat._id;
          return (
            <ChatItem
              key={id}
              chat={chat}
              isActive={id === activeChatId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar
═══════════════════════════════════════════════════════════════════════════ */

export default function Sidebar({
  chats = [],
  activeChatId,
  onNewChat,
  onDeleteChat,
  onSelectChat,
  user,
  onLogout,
  isOpen,
  onClose,
}) {
  const grouped = groupChatsByDate(chats);
  const hasChats = chats.length > 0;
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          flex flex-col h-full flex-shrink-0
          bg-[#0F1117] border-r border-[#23253A]
          transition-all duration-200 ease-in-out z-30
          ${isOpen ? "w-72" : "w-0 overflow-hidden border-r-0"}
        `}
      >
        {/* Inner wrapper keeps content at 288 px even during collapse animation */}
        <div
          className="flex flex-col h-full w-72 overflow-hidden"
          style={{ flexShrink: 0 }}
        >
          {/* ── Logo / header ── */}
          <div
            className="flex items-center justify-between px-4 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(35,37,58,0.5)" }}
          >
            <div className="flex items-center gap-2.5">
              {/* Gradient icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #818CF8 0%, #34D399 100%)",
                }}
              >
                <Sparkles size={14} style={{ color: "#0B0C11" }} />
              </div>
              <span
                className="font-bold text-sm tracking-tight"
                style={{ color: "#F0F0FF" }}
              >
                Aura Search
              </span>
            </div>

            {/* Close button (visible on mobile) */}
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="p-1.5 rounded-lg transition-colors md:hidden"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── New Chat button ── */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <button
              onClick={onNewChat}
              className="
                w-full flex items-center gap-2
                bg-[#15161F] hover:bg-[#1A1C2E]
                border border-[#23253A] hover:border-indigo-500/30
                text-[#F0F0FF]
                rounded-xl px-4 py-2.5
                transition-all duration-150
                text-sm font-medium
              "
            >
              <Plus size={15} style={{ color: "#818CF8" }} />
              New Chat
            </button>
          </div>

          {/* ── Chat list ── */}
          <div className="flex-1 overflow-y-auto px-3 pb-2">
            {!hasChats ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <MessageSquare size={28} style={{ color: "#23253A" }} />
                <p className="text-xs" style={{ color: "#475569" }}>
                  No conversations yet
                </p>
              </div>
            ) : (
              <div className="py-2">
                {GROUP_ORDER.map((label) => (
                  <ChatGroup
                    key={label}
                    label={label}
                    chats={grouped[label]}
                    activeChatId={activeChatId}
                    onSelect={onSelectChat}
                    onDelete={onDeleteChat}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── User footer ── */}
          <div
            className="flex-shrink-0 px-3 py-3"
            style={{ borderTop: "1px solid rgba(35,37,58,0.5)" }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/profile")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate("/profile");
                }
              }}
              className="group flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-150 hover:bg-[#15161F] focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
                  color: "#0B0C11",
                }}
              >
                {getInitials(user)}
              </div>

              {/* Name + email (prominent name shown) */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#F0F0FF" }}
                >
                  {/* Prefer display name; fallback to email local part or 'User' */}
                  {user?.name
                    ? user.name
                    : user?.email
                      ? user.email.split("@")[0]
                      : "User"}
                </p>
                {user?.email && (
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: "#64748B" }}
                  >
                    {user.email}
                  </p>
                )}
              </div>

              {/* Icon actions — revealed on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                <button
                  aria-label="Settings"
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: "#64748B" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#F0F0FF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#64748B")
                  }
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  aria-label="Log out"
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: "#64748B" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#f87171")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#64748B")
                  }
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
