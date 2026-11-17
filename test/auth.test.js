import test from 'node:test';
import assert from 'node:assert/strict';
import http from '../src/http.js';
import Auth from '../src/auth.js';

const options = { token: 'test-key', environment: 'sandbox' };

test('concurrent authentication shares a request and caches the session', async () => {
    const original = http.defaults.adapter;
    let calls = 0;
    try {
        http.defaults.adapter = async config => {
            calls++;
            return { data: { data: { token: 'session' } }, status: 200, headers: {}, config };
        };
        const auth = new Auth(options);
        assert.deepEqual(await Promise.all([auth.auth(), auth.auth(), auth.auth()]),
            ['session', 'session', 'session']);
        assert.equal(await auth.auth(), 'session');
        assert.equal(calls, 1);
    } finally {
        http.defaults.adapter = original;
    }
});

test('failed authentication can be retried', async () => {
    const original = http.defaults.adapter;
    let calls = 0;
    try {
        http.defaults.adapter = async config => {
            calls++;
            if (calls === 1) throw new Error('temporary failure');
            return { data: { data: { token: 'session' } }, status: 200, headers: {}, config };
        };
        const auth = new Auth(options);
        const results = await Promise.allSettled([auth.auth(), auth.auth()]);
        assert.ok(results.every(result => result.status === 'rejected'));
        assert.equal(calls, 1);
        assert.equal(await auth.auth(), 'session');
        assert.equal(calls, 2);
    } finally {
        http.defaults.adapter = original;
    }
});
