/**
 * Narrow client for HostLogic's incident-management API.
 *
 * The monitoring token never crosses the MCP boundary: it is held by the
 * hosted server and sent only to the configured HostLogic API origin.
 */
const DEFAULT_OPS_API_URL = 'https://dev.hostlogic.io';
export class HostLogicOpsClient {
    baseUrl;
    monitoringToken;
    actingUserId;
    constructor(monitoringToken, actingUserId, baseUrl) {
        if (!monitoringToken)
            throw new Error('MONITORING_MOBILE_API_TOKEN is required');
        if (!/^\d+$/.test(actingUserId))
            throw new Error('HOSTLOGIC_OPS_ACTING_USER_ID must be a positive integer');
        this.monitoringToken = monitoringToken;
        this.actingUserId = actingUserId;
        this.baseUrl = (baseUrl ?? process.env.HOSTLOGIC_OPS_API_URL ?? DEFAULT_OPS_API_URL).replace(/\/$/, '');
    }
    get(path) {
        return this.request('GET', path);
    }
    post(path, body = {}) {
        return this.request('POST', path, body);
    }
    async request(method, path, body) {
        if (!path.startsWith('/api/automation/monitoring/')) {
            throw new Error('Ops client path is outside the monitoring API allow-list');
        }
        const res = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers: {
                'X-Monitoring-Mobile-Token': this.monitoringToken,
                'X-Acting-User-Id': this.actingUserId,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        const text = await res.text();
        if (!res.ok) {
            let message = `HostLogic monitoring API error ${res.status}`;
            try {
                const json = JSON.parse(text);
                message = json.message ?? json.error ?? message;
            }
            catch {
                // Keep the generic status-only message for non-JSON responses.
            }
            const sensitivePatterns = ['SQLSTATE', 'Connection:', 'Host:', 'Port:', 'Database:', 'forge.'];
            if (sensitivePatterns.some(pattern => message.includes(pattern))) {
                message = `HostLogic monitoring API error ${res.status}`;
            }
            throw new Error(message);
        }
        return JSON.parse(text);
    }
}
//# sourceMappingURL=ops-client.js.map