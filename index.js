#!/usr/bin/env node

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
const MAX_RETRIES = 3;
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generate(model, contents) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return response.text ?? "(empty response)";
    } catch (err) {
      lastError = err;
      const status = err.status ?? err.httpStatusCode;
      if (status === 429 || status >= 500) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function toolResult(text) {
  return { content: [{ type: "text", text }] };
}

function errorResult(err) {
  const msg = err.message ?? String(err);
  return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
}

const server = new McpServer({
  name: "gemini-mcp",
  version: "0.1.0",
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
    try {
      const text = await generate(model || MODEL, prompt);
      return toolResult(text);
    } catch (err) {
      return errorResult(err);
    }
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
    try {
      const prompt = `${instruction}\n\n---\n\n${content}`;
      const text = await generate(model || MODEL, prompt);
      return toolResult(text);
    } catch (err) {
      return errorResult(err);
    }
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
    try {
      const contents = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      const text = await generate(model || MODEL, contents);
      return toolResult(text);
    } catch (err) {
      return errorResult(err);
    }
  }
);

server.tool(
  "gemini_models",
  "List available Gemini models.",
  {},
  async () => {
    try {
      const pager = await ai.models.list();
      const models = [];
      for await (const m of pager) {
        models.push({
          name: m.name,
          displayName: m.displayName,
          inputTokenLimit: m.inputTokenLimit,
          outputTokenLimit: m.outputTokenLimit,
        });
      }
      return toolResult(JSON.stringify(models, null, 2));
    } catch (err) {
      return errorResult(err);
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
