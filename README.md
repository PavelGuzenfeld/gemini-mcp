# gemini-mcp

MCP server that exposes Google Gemini as tools for Claude Code.

## Tools

- **gemini_ask** — Ask Gemini a question or give it a task
- **gemini_analyze** — Send code/text for analysis with a specific instruction
- **gemini_chat** — Multi-turn conversation with Gemini

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

2. Clone and install:
```bash
git clone https://github.com/PavelGuzenfeld/gemini-mcp.git ~/.claude/mcp-servers/gemini
cd ~/.claude/mcp-servers/gemini
npm install
```

3. Register in Claude Code (`~/.claude/settings.json`):
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

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | (required) | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-pro` | Default model |

## Models

- `gemini-2.5-pro` — best quality, large context
- `gemini-2.5-flash` — fast, good for simple tasks
- `gemini-2.0-flash` — fastest
