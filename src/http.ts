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

import './instrument.js';
import * as Sentry from '@sentry/node';
import express, { type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';
import { createOpsServer } from './ops-server.js';
import { isValidOpsBearer } from './ops-auth.js';

const app  = express();
const PORT = Number(process.env.PORT ?? 3000);

// BUG 4 FIX: Remove Express fingerprint and add security headers
app.disable('x-powered-by');
app.use((_req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(express.json({ limit: '1mb' }));

// BUG 5 FIX: Return clean JSON at root instead of bare Express 404
app.get('/', (_req: Request, res: Response) => {
    res.json({ name: 'HostLogic MCP Server', docs: 'https://hostlogic.io/enterprise/mcp' });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: '@hostlogic/mcp', version: '1.0.0' });
});

// Owner-only operations MCP. This is deliberately separate from /mcp:
// customer Enterprise API keys can never reach incident-management tools.
app.post('/ops/mcp', async (req: Request, res: Response) => {
    const endpointToken = process.env.HOSTLOGIC_OPS_MCP_TOKEN ?? '';
    if (!isValidOpsBearer(req.headers['authorization'], endpointToken)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const monitoringToken = process.env.MONITORING_MOBILE_API_TOKEN ?? '';
    const actingUserId = process.env.HOSTLOGIC_OPS_ACTING_USER_ID ?? '';
    if (!monitoringToken || !/^\d+$/.test(actingUserId)) {
        res.status(503).json({ error: 'Ops MCP is not configured' });
        return;
    }

    try {
        const server = createOpsServer(monitoringToken, actingUserId);
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        res.on('close', () => {
            transport.close().catch(() => {});
            server.close().catch(() => {});
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body as Record<string, unknown>);
    } catch (err) {
        Sentry.captureException(err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/ops/mcp', (_req: Request, res: Response) => {
    res.json({
        name: 'HostLogic Ops MCP',
        tools: ['list_open_incidents', 'get_incident', 'acknowledge_incident', 'resolve_incident'],
        auth: 'Authorization: Bearer <dedicated Ops MCP token>',
    });
});

// MCP endpoint — stateless, one server instance per request
app.post('/mcp', async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'] ?? '';
    const apiKey     = authHeader.replace(/^Bearer\s+/i, '').trim();

    // BUG 1 FIX: Validate key format KEY_ID.KEY_SECRET before creating any server instance
    const keyParts = apiKey.split('.');
    if (!apiKey || keyParts.length !== 2 || !keyParts[0] || !keyParts[1]) {
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

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
    process.stdout.write(`[hostlogic-mcp] HTTP server listening on :${PORT}\n`);
});
