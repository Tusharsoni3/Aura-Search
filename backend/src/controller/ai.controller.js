import { generateChatTitle, generateResponse } from "../services/ai.service.js";
import { chat as chatTable, messages as messagesTable } from "../db/schema.js"; 
import { db } from "../db/index.js";
import { and, eq, asc, desc } from 'drizzle-orm'; 

export async function sendMessage(req, res) {
    try {
        const { message, chats: chatId } = req.body;
        let title = null, chat = null;
        
        if (!chatId) {
            title = await generateChatTitle(message);
          
            const [result] = await db.insert(chatTable).values({ userId: req.user.id, title: title }).returning();
            chat = result;
        }

     
        const [userMessage] = await db.insert(messagesTable).values({ chatId: chatId || chat.id, content: message, role: "user" }).returning();
        
        const chatHistory = await db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId || chat.id)).orderBy(asc(messagesTable.createdAt));
        
        const aiResponse = await generateResponse(chatHistory);
        
        const [aiMessage] = await db.insert(messagesTable).values({ chatId: chatId || chat.id, content: aiResponse, role: "ai" }).returning();

        res.status(201).json({
            title,
            chat: chat || { id: chatId },
            aiMessage
        });
    } catch (error) {
        console.error("Chat Retrieval Error:", error); 
        res.status(400).json({
            message: "Something went wrong during chat retrieval",
        });
    }
}

export async function getChats(req, res) {
    try {
        const user = req.user;
      
        const userChats = await db.select().from(chatTable).where(eq(chatTable.userId, user.id)).orderBy(desc(chatTable.createdAt));
        res.status(201).json({
            message: "All user chats retrieved successfully ",
            userChats
        });
    } catch (error) {
        res.status(400).json({
            message: "something went wrong during chat retrieval"
        });
    }
}

export async function getMessages(req, res) {
    try {
        const {chatId} = req.params;
        const [foundChat] = await db.select().from(chatTable).where(eq(chatTable.id, chatId));
        
        if (!foundChat){
            return res.status(404).json({
                message : "Chat not found "
            });
        }
        const allMessages = await db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId));

        res.status(200).json({
            message: "Messages retrieved successfully",
            messages: allMessages
        });
    } catch (error) {
        res.status(400).json({ message: "Error retrieving messages" });
    }
}

export async function deleteChat(req, res) {
    try {
        const {chatId} = req.params;
        const userID = req.user.id; 
        
        const [deletedRow] = await db.delete(chatTable)
            .where(and(eq(chatTable.id, chatId), eq(chatTable.userId, userID)))
            .returning();

        if(!deletedRow) {
            return res.status(400).json({message : "Chat not found, chat delete failed"});
        }

        res.status(200).json({
            message : "Chat deleted successfully"
        });
    } catch (error) {
        res.status(400).json({ message: "Error deleting chat" });
    }
}