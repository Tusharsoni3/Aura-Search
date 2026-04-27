import "dotenv/config";
import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { tool } from "@langchain/core/tools";
import { ChatMistralAI } from "@langchain/mistralai";
import * as z from "zod";
import { searchInternet } from "./internetSearch.service.js";
import { createAgent } from "langchain";

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_AI_KEY,
});

const searchInternetTool = tool(searchInternet, {
  name: "searchInternet",
  description: "Use this tool to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

const agent = createAgent({
  model: mistralModel,
  tools: [searchInternetTool],
});

export async function generateResponse(messages) {
  console.log(messages);

  const response = await agent.invoke({
    messages: [
      new SystemMessage(`
                You are a helpful and precise assistant for answering questions.
                If you don't know the answer, say you don't know.
                If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
            `),
      ...messages.map((msg) => {
        if (msg.role == "user") {
          return new HumanMessage(msg.content);
        } else if (msg.role == "ai") {
          return new AIMessage(msg.content);
        }
      }),
    ],
  });

  return response.messages[response.messages.length - 1].text;
}

// Strip every markdown symbol the model might sneak into a title:
// bold (**), italic (* or _), code (backtick), headings (#), brackets, etc.
// Then collapse extra whitespace and trim.
function cleanTitle(raw) {
  return raw
    .replace(/\*{1,3}/g, "") // *** ** *
    .replace(/_{1,3}/g, "") // ___ __ _
    .replace(/`{1,3}/g, "") // ``` `` `
    .replace(/#{1,6}\s*/g, "") // ## headings
    .replace(/[[\]()]/g, "") // [text](url) brackets
    .replace(/^["']|["']$/g, "") // leading / trailing quotes
    .replace(/\s{2,}/g, " ") // collapse multiple spaces
    .trim();
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
            You are an assistant that generates concise, plain-text titles for chat conversations.
            Rules you MUST follow:
            - Return ONLY the title. No explanation, no punctuation at the end, no extra text.
            - 2 to 5 words maximum.
            - Plain text ONLY — absolutely no markdown, no asterisks, no underscores, no backticks, no quotes, no bold, no italic.
            - Use Title Case (capitalise each major word).
        `),
    new HumanMessage(`
            Generate a plain-text title for this first message:
            "${message}"
        `),
  ]);

  return cleanTitle(response.text);
}
