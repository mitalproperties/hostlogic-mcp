/**
 * HostLogic Enterprise API client.
 * Wraps /api/v1/receptionist/* REST endpoints.
 */
export declare class HostLogicClient {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(apiKey: string, baseUrl?: string);
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
    private request;
}
//# sourceMappingURL=client.d.ts.map