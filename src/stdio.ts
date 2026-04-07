#!/usr/bin/env node
/**
 * Stdio transport entry point.
 * Used when running as a local npm package:
 *   npx @hostlogic/mcp
 *
 * Required env var:
 *   HOSTLOGIC_API_KEY=<key_id>.<key_secret>
 *
 * Optional:
 *   HOSTLOGIC_API_URL=https://custom-url (defaults to production)
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

const apiKey = process.env.HOSTLOGIC_API_KEY ?? '';

if (!apiKey) {
    process.stderr.write(
        '[hostlogic-mcp] Error: HOSTLOGIC_API_KEY environment variable is not set.\n' +
        'Set it to your HostLogic Enterprise API key (format: KEY_ID.KEY_SECRET).\n',
    );
    process.exit(1);
}

const server    = createServer(apiKey);
const transport = new StdioServerTransport();

await server.connect(transport);
process.stderr.write('[hostlogic-mcp] Running on stdio\n');
