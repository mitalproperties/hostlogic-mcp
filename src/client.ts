/**
 * HostLogic Enterprise API client.
 * Wraps /api/v1/receptionist/* REST endpoints.
 */

const DEFAULT_API_URL = 'https://shimmering-playfulness-production-2588.up.railway.app';

export class HostLogicClient {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(apiKey: string, baseUrl?: string) {
        if (!apiKey) throw new Error('HOSTLOGIC_API_KEY is required');
        this.apiKey  = apiKey;
        this.baseUrl = (baseUrl ?? process.env.HOSTLOGIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
    }

    /**
     * Perform a GET request against the HostLogic API.
     * @param path API path starting with `/`, e.g. `/api/v1/receptionist/agents`
     * @returns Parsed JSON response body
     */
    async get<T>(path: string): Promise<T> {
        return this.request<T>('GET', path);
    }

    /**
     * Perform a POST request against the HostLogic API.
     * @param path API path starting with `/`
     * @param body Request payload (will be JSON-serialised)
     * @returns Parsed JSON response body
     */
    async post<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>('POST', path, body);
    }

    /**
     * Core HTTP request helper shared by `get` and `post`.
     * Throws an Error with a sanitised message on non-2xx responses —
     * internal SQL/infra details are stripped to prevent information leakage.
     */
    private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });

        const text = await res.text();

        if (!res.ok) {
            let message = `HostLogic API error ${res.status}`;
            try {
                const json = JSON.parse(text) as { message?: string; error?: string };
                message = json.message ?? json.error ?? message;
            } catch {
                // non-JSON error body
            }
            // BUG 2 FIX: Sanitize SQL/infra details to prevent internal info leakage
            const sqlLeakPatterns = ['SQLSTATE', 'Connection:', 'Host:', 'Port:', 'Database:', 'forge.'];
            const hasSqlLeak = sqlLeakPatterns.some(pattern => message.includes(pattern));
            if (hasSqlLeak) {
                message = 'Invalid API key or unauthorized.';
            }
            throw new Error(message);
        }

        return JSON.parse(text) as T;
    }
}
