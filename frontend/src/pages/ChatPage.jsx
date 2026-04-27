import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { chatAPI } from "../lib/api";

import Sidebar from "../components/chat/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import SearchInput from "../components/chat/SearchInput";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/** Normalise a message object so id is always present as `id` */
const normalizeMsg = (msg) => ({
  ...msg,
  id: msg.id ?? msg._id ?? `msg-${Date.now()}-${Math.random()}`,
});

/** Extract chats array from varied API response shapes */
const extractChats = (data) =>
  data?.userChats ?? data?.chats ?? (Array.isArray(data) ? data : []);

/** Extract messages array from varied API response shapes */
const extractMessages = (data) =>
  data?.messages ?? (Array.isArray(data) ? data : []);

/* ═══════════════════════════════════════════════════════════════════════════
   ChatPage
═══════════════════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const { chatId } = useParams(); // undefined on /chat (new chat)
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  /* ── core state ── */
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── refs ── */
  // When chat:start fires we navigate to the new chatId.
  // The resulting chatId param change would normally trigger fetchMessages,
  // but we're already building the conversation optimistically — skip it.
  const skipNextMsgFetchRef = useRef(false);

  const activeChatId = chatId ?? null;

  /* ────────────────────────────────────────────────────────────────────────
     Data fetching
  ─────────────────────────────────────────────────────────────────────── */
  const fetchChats = useCallback(async () => {
    try {
      const res = await chatAPI.getChats();
      setChats(extractChats(res.data));
    } catch (err) {
      console.error("[ChatPage] fetchChats error:", err);
    }
  }, []);

  const fetchMessages = useCallback(async (id) => {
    try {
      const res = await chatAPI.getMessages(id);
      const msgs = extractMessages(res.data).map(normalizeMsg);
      setMessages(
        msgs.map((m) => ({ ...m, isStreaming: false, isThinking: false })),
      );
    } catch (err) {
      console.error("[ChatPage] fetchMessages error:", err);
      toast.error("Could not load messages");
    }
  }, []);

  /* ── load chats on mount ── */
  useEffect(() => {
    fetchChats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchChats]);

  /* ── load messages when chatId changes ── */
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    if (skipNextMsgFetchRef.current) {
      skipNextMsgFetchRef.current = false;
      return;
    }
    fetchMessages(activeChatId);
  }, [activeChatId, fetchMessages]);

  /* ────────────────────────────────────────────────────────────────────────
     Socket event handlers
  ─────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!socket) return;

    /* chat:start — server created a new chat (streaming path, new conversation) */
    const handleChatStart = ({ chatId: newChatId }) => {
      skipNextMsgFetchRef.current = true;
      navigate(`/chat/${newChatId}`);
    };

    /* chat:token — append streamed token to the last streaming AI message */
    const handleChatToken = ({ token }) => {
      setMessages((prev) => {
        const updated = [...prev];
        // Find last streaming message (search from end)
        let idx = -1;
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].isStreaming) {
            idx = i;
            break;
          }
        }
        if (idx === -1) return prev;
        updated[idx] = {
          ...updated[idx],
          content: (updated[idx].content || "") + token,
          isThinking: false,
        };
        return updated;
      });
    };

    /* chat:done — finalise the AI message */
    const handleChatDone = ({ messageId, fullContent }) => {
      setMessages((prev) => {
        const updated = [...prev];
        let idx = -1;
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].isStreaming) {
            idx = i;
            break;
          }
        }
        if (idx === -1) return prev;
        updated[idx] = {
          ...updated[idx],
          id: messageId ?? updated[idx].id,
          content: fullContent ?? updated[idx].content,
          isStreaming: false,
          isThinking: false,
        };
        return updated;
      });
      setIsLoading(false);
      // Refresh chat list so the new title appears in the sidebar
      fetchChats();
    };

    /* chat:error — surface error, remove thinking placeholder */
    const handleChatError = ({ message: errMsg }) => {
      toast.error(errMsg || "Something went wrong");
      setMessages((prev) =>
        prev.filter((m) => !m.isThinking && !m.isStreaming),
      );
      setIsLoading(false);
    };

    socket.on("chat:start", handleChatStart);
    socket.on("chat:token", handleChatToken);
    socket.on("chat:done", handleChatDone);
    socket.on("chat:error", handleChatError);

    return () => {
      socket.off("chat:start", handleChatStart);
      socket.off("chat:token", handleChatToken);
      socket.off("chat:done", handleChatDone);
      socket.off("chat:error", handleChatError);
    };
  }, [socket, navigate, fetchChats]);

  /* ────────────────────────────────────────────────────────────────────────
     Send message
  ─────────────────────────────────────────────────────────────────────── */
  const handleSend = useCallback(
    async (message) => {
      const trimmed = message?.trim();
      if (!trimmed || isLoading) return;

      const tempUserId = `user-${Date.now()}`;
      const tempAiId = `ai-${Date.now()}`;

      /* Optimistic update */
      setMessages((prev) => [
        ...prev,
        {
          id: tempUserId,
          role: "user",
          content: trimmed,
          isStreaming: false,
          isThinking: false,
        },
        {
          id: tempAiId,
          role: "assistant",
          content: "",
          isStreaming: true,
          isThinking: true,
        },
      ]);
      setIsLoading(true);

      /* ── Socket path ── */
      if (socket && (isConnected || socket.connected)) {
        socket.emit("chat:send", { message: trimmed, chatId: activeChatId });
        // Socket handlers take over from here
        return;
      }

      /* ── REST fallback ── */
      try {
        const res = await chatAPI.sendMessage(trimmed, activeChatId);
        const { data } = res;

        // Support { aiMessage, chat } and legacy { message, chat }
        const aiMsg = data.aiMessage ?? data.message;
        const chat = data.chat;

        setMessages((prev) => {
          const without = prev.filter((m) => m.id !== tempAiId);
          return [
            ...without,
            normalizeMsg({
              ...(aiMsg ?? {}),
              id: aiMsg?.id ?? aiMsg?._id ?? `ai-final-${Date.now()}`,
              role: "assistant",
              content: aiMsg?.content ?? "",
              isStreaming: false,
              isThinking: false,
            }),
          ];
        });

        if (chat) {
          const newChatId = chat.id ?? chat._id;
          if (newChatId && newChatId !== activeChatId) {
            skipNextMsgFetchRef.current = true;
            navigate(`/chat/${newChatId}`);
          }
          fetchChats();
        }
      } catch (err) {
        console.error("[ChatPage] sendMessage REST error:", err);
        toast.error(err.response?.data?.message || "Failed to send message");
        setMessages((prev) =>
          prev.filter((m) => m.id !== tempUserId && m.id !== tempAiId),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeChatId, socket, isConnected, navigate, fetchChats],
  );

  /* ────────────────────────────────────────────────────────────────────────
     Sidebar actions
  ─────────────────────────────────────────────────────────────────────── */
  const handleNewChat = useCallback(() => {
    setMessages([]);
    navigate("/chat");
  }, [navigate]);

  const handleSelectChat = useCallback(
    (id) => {
      navigate(`/chat/${id}`);
    },
    [navigate],
  );

  const handleDeleteChat = useCallback(
    async (id) => {
      try {
        await chatAPI.deleteChat(id);
        setChats((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
        toast.success("Conversation deleted");
        if (id === activeChatId) {
          navigate("/chat");
          setMessages([]);
        }
      } catch {
        toast.error("Could not delete conversation");
      }
    },
    [activeChatId, navigate],
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      // swallow — navigate regardless
    }
    navigate("/");
  }, [logout, navigate]);

  /* ────────────────────────────────────────────────────────────────────────
     Render
  ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-[#0B0C11] overflow-hidden">
      {/* ── Left sidebar ── */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={handleSelectChat}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right: main chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Thin top bar — only shown when sidebar is hidden */}
        {!sidebarOpen && (
          <header
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              borderBottom: "1px solid rgba(35,37,58,0.4)",
              background: "rgba(6,15,32,0.85)",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
            >
              <Menu size={18} />
            </button>

            {/* Active chat title */}
            <span
              className="text-sm font-medium truncate"
              style={{ color: "#94A3B8" }}
            >
              {activeChatId
                ? chats.find((c) => (c.id ?? c._id) === activeChatId)?.title ||
                  "Conversation"
                : "New conversation"}
            </span>
          </header>
        )}

        {/* ── Scrollable message area ── */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          activeChatId={activeChatId}
          onSuggestClick={handleSend}
        />

        {/* ── Input bar ── */}
        <SearchInput
          onSend={handleSend}
          isLoading={isLoading}
          placeholder="Ask anything…"
        />
      </div>
    </div>
  );
}
