import assert from 'node:assert/strict';
import test from 'node:test';
import { HostLogicOpsClient } from './ops-client.js';

test('sends the bounded monitoring credentials only to an allow-listed path', async () => {
    const originalFetch = globalThis.fetch;
    let captured: { url?: string; init?: RequestInit } = {};
    globalThis.fetch = async (input, init) => {
        captured = { url: String(input), init };
        return new Response(JSON.stringify({ id: 146 }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    };

    try {
        const client = new HostLogicOpsClient('monitoring-secret', '7', 'https://dev.example.test');
        const data = await client.get<{ id: number }>('/api/automation/monitoring/incidents/146');
        assert.equal(data.id, 146);
        assert.equal(captured.url, 'https://dev.example.test/api/automation/monitoring/incidents/146');
        const headers = captured.init?.headers as Record<string, string>;
        assert.equal(headers['X-Monitoring-Mobile-Token'], 'monitoring-secret');
        assert.equal(headers['X-Acting-User-Id'], '7');
        await assert.rejects(() => client.get('/api/v1/receptionist/agents'), /allow-list/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('does not leak infrastructure details from monitoring API errors', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(
        JSON.stringify({ error: 'SQLSTATE connection failed Host: forge.internal Database: secret' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
    );

    try {
        const client = new HostLogicOpsClient('monitoring-secret', '7', 'https://dev.example.test');
        await assert.rejects(
            () => client.get('/api/automation/monitoring/incidents/146'),
            (error: Error) => error.message === 'HostLogic monitoring API error 500',
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});
