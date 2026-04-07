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
export {};
//# sourceMappingURL=http.d.ts.map