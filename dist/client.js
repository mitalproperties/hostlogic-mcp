/**
 * HostLogic Enterprise API client.
 * Wraps /api/v1/receptionist/* REST endpoints.
 */
const DEFAULT_API_URL = 'https://hostlogic.io';
export class HostLogicClient {
    baseUrl;
    apiKey;
    constructor(apiKey, baseUrl) {
        if (!apiKey)
            throw new Error('HOSTLOGIC_API_KEY is required');
        this.apiKey = apiKey;
        this.baseUrl = (baseUrl ?? process.env.HOSTLOGIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
    }
    /**
     * Perform a GET request against the HostLogic API.
     * @param path API path starting with `/`, e.g. `/api/v1/receptionist/agents`
     * @returns Parsed JSON response body
     */
    async get(path) {
        return this.request('GET', path);
    }
    /**
     * Perform a POST request against the HostLogic API.
     * @param path API path starting with `/`
     * @param body Request payload (will be JSON-serialised)
     * @returns Parsed JSON response body
     */
    async post(path, body) {
        return this.request('POST', path, body);
    }
    /**
     * Core HTTP request helper shared by `get` and `post`.
     * Throws an Error with a sanitised message on non-2xx responses —
     * internal SQL/infra details are stripped to prevent information leakage.
     */
    async request(method, path, body) {
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
                const json = JSON.parse(text);
                message = json.message ?? json.error ?? message;
            }
            catch {
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
        return JSON.parse(text);
    }
}
//# sourceMappingURL=client.js.map