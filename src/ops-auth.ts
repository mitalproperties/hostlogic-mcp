import { timingSafeEqual } from 'node:crypto';

/** Constant-time bearer-token comparison for the isolated Ops MCP endpoint. */
export function isValidOpsBearer(authorization: string | undefined, expectedToken: string): boolean {
    const supplied = (authorization ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!supplied || !expectedToken) return false;

    const suppliedBuffer = Buffer.from(supplied);
    const expectedBuffer = Buffer.from(expectedToken);
    return suppliedBuffer.length === expectedBuffer.length
        && timingSafeEqual(suppliedBuffer, expectedBuffer);
}
