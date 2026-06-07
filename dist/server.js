/**
 * MCP server factory.
 * Defines and registers all four HostLogic tools (list_agents, create_session,
 * send_message, get_usage) on a new McpServer instance backed by HostLogicClient.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { HostLogicClient } from './client.js';
/**
 * Creates and registers all HostLogic MCP tools on a new McpServer instance.
 * Called once per request (HTTP) or once at startup (stdio).
 */
export function createServer(apiKey) {
    const client = new HostLogicClient(apiKey);
    const server = new McpServer({
        name: 'hostlogic',
        version: '1.0.0',
    });
    // ─────────────────────────────────────────────
    // Tool: list_agents
    // ─────────────────────────────────────────────
    server.tool('list_agents', 'List all available HostLogic AI agent types (Laura, Tamara, Tiffany, Pierre, etc.) with their domain and description.', {}, async () => {
        const data = await client.get('/api/v1/receptionist/agents');
        return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
    });
    // ─────────────────────────────────────────────
    // Tool: create_session
    // ─────────────────────────────────────────────
    server.tool('create_session', 'Create a new voice/text session for a property. Returns a signed real-time session URL and WebSocket endpoint for voice conversation. Pass the signed_url to any WebSocket-compatible voice client.', {
        property_id: z.number().int().positive().describe('The HostLogic property ID to create a session for. The API key must be scoped to this property or have no tenant restriction.'),
    }, async ({ property_id }) => {
        const data = await client.post('/api/v1/receptionist/sessions', { property_id });
        return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
    });
    // ─────────────────────────────────────────────
    // Tool: send_message
    // ─────────────────────────────────────────────
    server.tool('send_message', 'Send a text message to the AI receptionist within an existing session. For real-time bidirectional voice use the signed_url from create_session instead.', {
        session_id: z.string().describe('Session ID returned by create_session.'),
        message: z.string().max(2000).describe('The guest or user message to send.'),
    }, async ({ session_id, message }) => {
        const data = await client.post('/api/v1/receptionist/message', { session_id, message });
        return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
    });
    // ─────────────────────────────────────────────
    // Tool: get_usage
    // ─────────────────────────────────────────────
    server.tool('get_usage', 'Retrieve usage statistics for this API key over the last 30 days. Returns total calls, breakdown by endpoint, and daily call counts.', {}, async () => {
        const data = await client.get('/api/v1/receptionist/usage');
        return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
    });
    return server;
}
//# sourceMappingURL=server.js.map