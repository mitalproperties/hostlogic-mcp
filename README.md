# @hostlogic/mcp

MCP server for the [HostLogic](https://hostlogic.io) AI Receptionist Enterprise API.

Connect Claude, Cursor, or any [Model Context Protocol](https://modelcontextprotocol.io) compatible client to HostLogic in minutes — no SDK, no boilerplate.

## Tools

| Tool | Description |
|------|-------------|
| `list_agents` | List available AI agent types (Laura, Tamara, Tiffany, Pierre) |
| `create_session` | Create a ConvAI session → returns signed WebSocket URL for real-time voice |
| `send_message` | Send a text message to the AI receptionist |
| `get_usage` | Usage statistics for your API key (last 30 days) |

---

## Option 1 — Hosted endpoint (zero install)

Add to your Claude Desktop / Cursor / Claude Code config:

```json
{
  "mcpServers": {
    "hostlogic": {
      "url": "https://mcp.hostlogic.io/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY_ID.YOUR_KEY_SECRET"
      }
    }
  }
}
```

That's it. No `npm install`, no local process.

---

## Option 2 — npm package (local / self-hosted)

### Claude Desktop

```json
{
  "mcpServers": {
    "hostlogic": {
      "command": "npx",
      "args": ["-y", "@hostlogic/mcp"],
      "env": {
        "HOSTLOGIC_API_KEY": "YOUR_KEY_ID.YOUR_KEY_SECRET"
      }
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add hostlogic -e HOSTLOGIC_API_KEY=YOUR_KEY_ID.YOUR_KEY_SECRET -- npx -y @hostlogic/mcp
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "hostlogic": {
      "command": "npx",
      "args": ["-y", "@hostlogic/mcp"],
      "env": {
        "HOSTLOGIC_API_KEY": "YOUR_KEY_ID.YOUR_KEY_SECRET"
      }
    }
  }
}
```

---

## Getting an API key

Enterprise API keys are available on the [HostLogic Enterprise plan](https://hostlogic.io/enterprise/apply).

After approval your key arrives by email in the format `KEY_ID.KEY_SECRET`. Store it securely — the secret is shown only once.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HOSTLOGIC_API_KEY` | Yes | — | Your Enterprise API key (`KEY_ID.KEY_SECRET`) |
| `HOSTLOGIC_API_URL` | No | Production URL | Override for staging/custom deployments |

---

## Self-hosting the HTTP server

```bash
git clone https://github.com/mitalproperties/hostlogic-mcp
cd hostlogic-mcp
npm install
npm run build
PORT=3000 node dist/http.js
```

The server exposes `POST /mcp` (Streamable HTTP transport) and `GET /health`.

---

## License

MIT © HOST LOGIC LIMITED
