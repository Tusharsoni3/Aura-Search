import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { db } from "../db/index.js";
import { chat as chatTable, messages as messagesTable } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";

let io;

/**
 * Parse the JWT token from the socket handshake cookies and return the user id.
 * Returns null if the token is missing or invalid.
 */
function getUserFromSocket(socket) {
  try {
    const rawCookie = socket.handshake.headers.cookie || "";
    const parsed = cookie.parse(rawCookie);
    const token = parsed.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { id, iat, exp }
  } catch {
    return null;
  }
}

/**
 * Stream a string word-by-word through a socket, emitting each chunk as a
 * `chat:token` event.  The delay between chunks is randomised slightly to
 * produce a more natural feel.
 */
async function streamResponse(socket, text) {
  // Split on spaces but keep the separator so we can re-join faithfully.
  // We also split on newlines so multi-line answers stream correctly.
  const tokens = text.split(/(?<=\s)|(?=\n)/);

  for (const token of tokens) {
    if (!token) continue;
    socket.emit("chat:token", { token });
    // 15–40 ms per token feels natural
    const delay = Math.floor(Math.random() * 25) + 15;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("[Socket.io] Server initialised");

  io.on("connection", (socket) => {
    // ── Authenticate on connect ─────────────────────────────────────────────
    const user = getUserFromSocket(socket);

    if (!user) {
      console.warn(
        `[Socket.io] Unauthenticated connection rejected — ${socket.id}`,
      );
      socket.emit("auth:error", { message: "Unauthorised. Please log in." });
      socket.disconnect(true);
      return;
    }

    console.log(
      `[Socket.io] Connected — socket: ${socket.id} | user: ${user.id}`,
    );

    // ── chat:send ───────────────────────────────────────────────────────────
    socket.on("chat:send", async ({ message, chatId }) => {
      // Basic validation
      if (!message || typeof message !== "string" || !message.trim()) {
        socket.emit("chat:error", { message: "Message cannot be empty." });
        return;
      }

      const trimmedMessage = message.trim();
      let currentChatId = chatId || null;
      let chatTitle = null;

      try {
        // ── 1. Create a new chat if no chatId provided ──────────────────────
        if (!currentChatId) {
          chatTitle = await generateChatTitle(trimmedMessage);

          const [newChat] = await db
            .insert(chatTable)
            .values({ userId: user.id, title: chatTitle })
            .returning();

          currentChatId = newChat.id;

          // Tell the client the new chatId so it can update the URL
          socket.emit("chat:start", {
            chatId: currentChatId,
            title: chatTitle,
          });
        }

        // ── 2. Persist user message ─────────────────────────────────────────
        await db.insert(messagesTable).values({
          chatId: currentChatId,
          content: trimmedMessage,
          role: "user",
        });

        // ── 3. Fetch full chat history to send as context ───────────────────
        const chatHistory = await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.chatId, currentChatId))
          .orderBy(asc(messagesTable.createdAt));

        // ── 4. Generate AI response (full, non-streaming call) ──────────────
        const fullResponse = await generateResponse(chatHistory);

        // ── 5. Stream the response token-by-token ───────────────────────────
        await streamResponse(socket, fullResponse);

        // ── 6. Persist the complete AI message ─────────────────────────────
        const [aiMessage] = await db
          .insert(messagesTable)
          .values({
            chatId: currentChatId,
            content: fullResponse,
            role: "ai",
          })
          .returning();

        // ── 7. Signal completion ────────────────────────────────────────────
        socket.emit("chat:done", {
          messageId: aiMessage.id,
          fullContent: fullResponse,
          chatId: currentChatId,
          title: chatTitle,
        });

        console.log(
          `[Socket.io] chat:done — chat: ${currentChatId} | user: ${user.id}`,
        );
      } catch (error) {
        console.error("[Socket.io] chat:send error:", error);
        socket.emit("chat:error", {
          message:
            error?.message ||
            "Something went wrong while generating a response.",
        });
      }
    });

    // ── disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket.io] Disconnected — socket: ${socket.id} | reason: ${reason}`,
      );
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("[Socket.io] Not initialised — call initSocket() first.");
  }
  return io;
}
