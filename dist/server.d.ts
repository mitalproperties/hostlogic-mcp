/**
 * MCP server factory.
 * Defines and registers all four HostLogic tools (list_agents, create_session,
 * send_message, get_usage) on a new McpServer instance backed by HostLogicClient.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers all HostLogic MCP tools on a new McpServer instance.
 * Called once per request (HTTP) or once at startup (stdio).
 */
export declare function createServer(apiKey: string): McpServer;
//# sourceMappingURL=server.d.ts.map