# gemini-mcp

[![npm](https://img.shields.io/npm/v/claude-gemini-mcp)](https://www.npmjs.com/package/claude-gemini-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Lightweight [MCP](https://modelcontextprotocol.io) server that exposes Google Gemini as tools for Claude Code (or any MCP client).

Use Gemini for second opinions, large-context analysis, code review, or anything where a different model perspective helps.

## Tools

| Tool | Description |
|------|-------------|
| `gemini_ask` | Ask Gemini a question or give it a task |
| `gemini_analyze` | Send code/text for analysis with a specific instruction |
| `gemini_chat` | Multi-turn conversation with full history |
| `gemini_models` | List available Gemini models |

## Quick Start

### 1. Get an API key

Go to [Google AI Studio](https://aistudio.google.com/apikey) and create a free API key.

### 2. Install

**Option A — Clone (recommended for Claude Code)**

```bash
git clone https://github.com/PavelGuzenfeld/gemini-mcp.git ~/.claude/mcp-servers/gemini
cd ~/.claude/mcp-servers/gemini
npm install
```

**Option B — npx (no install)**

```bash
npx claude-gemini-mcp
```

### 3. Register with Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/home/you/.claude/mcp-servers/gemini/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-key-here"
      }
    }
  }
}
```

Or with npx:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["-y", "claude-gemini-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-pro` | Default model for all tools |

## Models

| Model | Best for |
|-------|----------|
| `gemini-2.5-pro` | Best quality, large context (1M tokens) |
| `gemini-2.5-flash` | Fast, good for most tasks |
| `gemini-2.0-flash` | Fastest, simple tasks |

Every tool accepts an optional `model` parameter to override the default per-call.

## Features

- Retry with exponential backoff on rate limits (429) and server errors (5xx)
- Graceful error reporting back to the MCP client (no crashes)
- Per-call model override
- Zero configuration beyond the API key

## License

[MIT](LICENSE)
