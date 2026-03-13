# gemini-mcp

[![npm](https://img.shields.io/npm/v/claude-gemini-mcp)](https://www.npmjs.com/package/claude-gemini-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
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

## Usage Examples

### Ask a question
```
> Use gemini_ask to explain the difference between std::expected and std::optional

Gemini says: std::optional<T> represents a value that may or may not be present...
std::expected<T, E> additionally carries an error value when the expected value is absent...
```

### Analyze code
```
> Use gemini_analyze to review this function for performance issues:
  instruction: "Find performance bottlenecks"
  content: <your code here>

Gemini says: Line 12 allocates inside the loop — move the vector outside...
```

### Multi-turn conversation
```
> Use gemini_chat with messages:
  [{"role": "user", "content": "Design a REST API for a task manager"},
   {"role": "model", "content": "Here's a RESTful design..."},
   {"role": "user", "content": "Now add authentication"}]

Gemini says: Building on the previous design, add JWT-based auth...
```

### Override model per call
```
> Use gemini_ask with model: "gemini-2.5-flash" to quickly summarize this error log
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

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY is not set` | Add the key to your `env` block in `settings.json` |
| `429 Too Many Requests` | Built-in retry handles this — wait a few seconds |
| `Model not found` | Run `gemini_models` to list valid model names |
| Tools not appearing in Claude Code | Check `~/.claude/settings.json` syntax, restart Claude Code |
| `ECONNREFUSED` | Check network/firewall — the server calls `generativelanguage.googleapis.com` |

## Development

```bash
git clone https://github.com/PavelGuzenfeld/gemini-mcp.git
cd gemini-mcp
npm install
npm test          # Run smoke tests
node index.js     # Start the MCP server locally
```

## License

[MIT](LICENSE)
