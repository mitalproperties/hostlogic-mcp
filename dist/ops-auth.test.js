import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidOpsBearer } from './ops-auth.js';
test('accepts only the exact configured Ops bearer token', () => {
    assert.equal(isValidOpsBearer('Bearer owner-secret', 'owner-secret'), true);
    assert.equal(isValidOpsBearer('Bearer wrong-secret', 'owner-secret'), false);
    assert.equal(isValidOpsBearer(undefined, 'owner-secret'), false);
    assert.equal(isValidOpsBearer('Bearer owner-secret', ''), false);
});
//# sourceMappingURL=ops-auth.test.js.map