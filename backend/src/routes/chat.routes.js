import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { deleteChat, getChats, getMessages, sendMessage } from "../controller/ai.controller.js";

const chatRouter = Router();

chatRouter.post("/message",authMiddleware,sendMessage);
chatRouter.get("/",authMiddleware,getChats);
chatRouter.get("/:chatId/messages",authMiddleware,getMessages);
chatRouter.delete("/delete/:chatId",authMiddleware,deleteChat);

export default chatRouter;