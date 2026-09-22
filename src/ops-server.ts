/** Separate, owner-only MCP surface for HostLogic incident management. */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { HostLogicOpsClient } from './ops-client.js';

export function createOpsServer(monitoringToken: string, actingUserId: string): McpServer {
    const client = new HostLogicOpsClient(monitoringToken, actingUserId);
    const server = new McpServer({ name: 'hostlogic-ops', version: '1.0.0' });

    server.tool(
        'list_open_incidents',
        'List open HostLogic monitoring incidents. Read-only.',
        {},
        async () => result(await client.get('/api/automation/monitoring/incidents')),
    );

    server.tool(
        'get_incident',
        'Read one HostLogic monitoring incident, including recent runs, timeline and diagnostic prompt. Read-only.',
        { incident_id: z.number().int().positive() },
        async ({ incident_id }) => result(await client.get(`/api/automation/monitoring/incidents/${incident_id}`)),
    );

    server.tool(
        'acknowledge_incident',
        'Acknowledge one HostLogic monitoring incident as the configured admin actor. This changes incident state and must only be called with explicit user approval.',
        { incident_id: z.number().int().positive() },
        async ({ incident_id }) => result(await client.post(`/api/automation/monitoring/incidents/${incident_id}/acknowledge`)),
    );

    server.tool(
        'resolve_incident',
        'Resolve one HostLogic monitoring incident as the configured admin actor. Use only after the fix is deployed and healthy monitoring runs verify recovery; requires explicit user approval.',
        { incident_id: z.number().int().positive() },
        async ({ incident_id }) => result(await client.post(`/api/automation/monitoring/incidents/${incident_id}/resolve`)),
    );

    return server;
}

function result(data: unknown) {
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
