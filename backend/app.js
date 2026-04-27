import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import "./src/db/index.js";
import authRoute from "./src/routes/auth.routes.js";
import chatRouter from "./src/routes/chat.routes.js";
import { initSocket } from "./src/sockets/server.socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocket(httpServer);

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Aura Search Server Running"));
app.use("/api/auth", authRoute);
app.use("/api/chats", chatRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[Server] Active on http://localhost:${PORT}`);
});
