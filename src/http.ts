/**
 * HTTP (Streamable HTTP) transport entry point.
 * Used for the hosted MCP endpoint at mcp.hostlogic.io.
 *
 * Each POST /mcp request is stateless:
 *   - API key extracted from Authorization: Bearer header
 *   - Fresh McpServer instance per request (no shared state)
 *
 * Deploy on Railway: set PORT env var (default 3000).
 */

import express, { type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

const app  = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: '@hostlogic/mcp', version: '1.0.0' });
});

// MCP endpoint — stateless, one server instance per request
app.post('/mcp', async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'] ?? '';
    const apiKey     = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!apiKey) {
        res.status(401).json({
            error:   'Unauthorized',
            message: 'Provide your HostLogic API key as: Authorization: Bearer KEY_ID.KEY_SECRET',
        });
        return;
    }

    try {
        const server    = createServer(apiKey);
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // stateless mode
        });

        // Clean up after request completes
        res.on('close', () => {
            transport.close().catch(() => {});
            server.close().catch(() => {});
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body as Record<string, unknown>);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        if (!res.headersSent) {
            res.status(500).json({ error: message });
        }
    }
});

// GET /mcp — returns server info (useful for clients that probe the endpoint)
app.get('/mcp', (_req: Request, res: Response) => {
    res.json({
        name:        'HostLogic MCP Server',
        version:     '1.0.0',
        description: 'Connect Claude, Cursor or any MCP client to the HostLogic AI Receptionist Enterprise API.',
        docs:        'https://hostlogic.io/enterprise/mcp',
        tools:       ['list_agents', 'create_session', 'send_message', 'get_usage'],
        auth:        'Authorization: Bearer KEY_ID.KEY_SECRET',
    });
});

app.listen(PORT, () => {
    process.stdout.write(`[hostlogic-mcp] HTTP server listening on :${PORT}\n`);
});
