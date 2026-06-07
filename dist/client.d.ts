/**
 * HostLogic Enterprise API client.
 * Wraps /api/v1/receptionist/* REST endpoints.
 */
export declare class HostLogicClient {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(apiKey: string, baseUrl?: string);
    /**
     * Perform a GET request against the HostLogic API.
     * @param path API path starting with `/`, e.g. `/api/v1/receptionist/agents`
     * @returns Parsed JSON response body
     */
    get<T>(path: string): Promise<T>;
    /**
     * Perform a POST request against the HostLogic API.
     * @param path API path starting with `/`
     * @param body Request payload (will be JSON-serialised)
     * @returns Parsed JSON response body
     */
    post<T>(path: string, body: unknown): Promise<T>;
    /**
     * Core HTTP request helper shared by `get` and `post`.
     * Throws an Error with a sanitised message on non-2xx responses —
     * internal SQL/infra details are stripped to prevent information leakage.
     */
    private request;
}
//# sourceMappingURL=client.d.ts.map