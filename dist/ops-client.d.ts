/**
 * Narrow client for HostLogic's incident-management API.
 *
 * The monitoring token never crosses the MCP boundary: it is held by the
 * hosted server and sent only to the configured HostLogic API origin.
 */
export declare class HostLogicOpsClient {
    private readonly baseUrl;
    private readonly monitoringToken;
    private readonly actingUserId;
    constructor(monitoringToken: string, actingUserId: string, baseUrl?: string);
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    private request;
}
//# sourceMappingURL=ops-client.d.ts.map