import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const server = new McpServer({
  name: "gemini",
  version: "1.0.0",
});

server.tool(
  "gemini_ask",
  "Ask Google Gemini a question or give it a task. Good for second opinions, large context analysis, or leveraging Gemini's strengths.",
  {
    prompt: z.string().describe("The prompt to send to Gemini"),
    model: z
      .string()
      .optional()
      .describe(
        "Model override (default: gemini-2.5-pro). Options: gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash"
      ),
  },
  async ({ prompt, model }) => {
    const useModel = model || MODEL;
    const response = await ai.models.generateContent({
      model: useModel,
      contents: prompt,
    });
    return {
      content: [
        {
          type: "text",
          text: response.text ?? "(empty response)",
        },
      ],
    };
  }
);

server.tool(
  "gemini_analyze",
  "Send code or text to Gemini for detailed analysis. Useful for code review, security audit, architecture analysis, or second opinions on complex code.",
  {
    instruction: z
      .string()
      .describe(
        "What to analyze (e.g. 'find security issues', 'review this code', 'explain the architecture')"
      ),
    content: z.string().describe("The code or text content to analyze"),
    model: z
      .string()
      .optional()
      .describe("Model override (default: gemini-2.5-pro)"),
  },
  async ({ instruction, content, model }) => {
    const useModel = model || MODEL;
    const prompt = `${instruction}\n\n---\n\n${content}`;
    const response = await ai.models.generateContent({
      model: useModel,
      contents: prompt,
    });
    return {
      content: [
        {
          type: "text",
          text: response.text ?? "(empty response)",
        },
      ],
    };
  }
);

server.tool(
  "gemini_chat",
  "Multi-turn conversation with Gemini. Send a conversation history for contextual responses.",
  {
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "model"]).describe("Role: 'user' or 'model'"),
          text: z.string().describe("Message content"),
        })
      )
      .describe("Conversation history as array of {role, text} objects"),
    model: z
      .string()
      .optional()
      .describe("Model override (default: gemini-2.5-pro)"),
  },
  async ({ messages, model }) => {
    const useModel = model || MODEL;
    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
    const response = await ai.models.generateContent({
      model: useModel,
      contents,
    });
    return {
      content: [
        {
          type: "text",
          text: response.text ?? "(empty response)",
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
