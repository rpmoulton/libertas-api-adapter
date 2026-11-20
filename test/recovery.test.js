import test from 'node:test';
import assert from 'node:assert/strict';
import { Console } from 'node:console';
import { Writable } from 'node:stream';
import { inspect } from 'node:util';
import LibertasClient, { LibertasApiError } from '../index.js';
import http from '../src/http.js';

const apiKey = 'synthetic-private-api-key';
const token = 'synthetic-private-token';
const clientOptions = { token: apiKey, host: 'https://test.example' };

function mockRequests(t, handler) {
    const original = http.defaults.adapter;
    const requests = [];
    t.after(() => { http.defaults.adapter = original; });
    http.defaults.adapter = async config => {
        requests.push(config);
        const data = await handler(config);
        return { data, status: 200, headers: {}, config };
    };
    return requests;
}

const isAuth = config => config.url.endsWith('/auth');

function fail(config, status, data) {
    throw Object.assign(new Error('Untrusted upstream message'), {
        config,
        response: { status, data },
    });
}

test('authentication is lazy and shared across concurrent services and explicit auth', async t => {
    const pending = Promise.withResolvers();
    const requests = mockRequests(t, config => isAuth(config) ? pending.promise : { ok: true });
    const client = new LibertasClient(clientOptions);
    assert.equal(requests.length, 0);

    const reads = Promise.all([client.auth.auth(), client.listDeals(), client.getIndustries()]);
    await Promise.resolve();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].params.api_key, apiKey);
    pending.resolve({ data: { token } });

    const [session, deals, industries] = await reads;
    assert.equal(session, token);
    assert.deepEqual(deals.data, { ok: true });
    assert.deepEqual(industries.data, { ok: true });
    await client.getFundedDeals();
    assert.equal(requests.filter(isAuth).length, 1);
    assert.ok(requests.slice(1).every(config => config.headers.Authorization === `Bearer ${token}`));
});

test('a late concurrent 401 reuses the refreshed session even when the token string is unchanged', async t => {
    const lateRequest = Promise.withResolvers();
    const lateStarted = Promise.withResolvers();
    let reads = 0;
    const requests = mockRequests(t, async config => {
        if (isAuth(config)) return { token };
        if (++reads === 1) {
            lateStarted.resolve();
            await lateRequest.promise;
            fail(config, 401);
        }
        if (reads === 2) fail(config, 401);
        return { result: 'ok' };
    });
    const client = new LibertasClient(clientOptions);
    const lateRead = client.getIndustries();
    await lateStarted.promise;

    const response = await client.listDeals({ page: 2, per_page: 3 });
    assert.deepEqual(response.data, { result: 'ok' });
    lateRequest.resolve();
    await lateRead;
    assert.equal(requests.filter(isAuth).length, 2);

    const dealRequests = requests.filter(config => config.url.endsWith('/deals'));
    assert.equal(dealRequests.length, 2);
    assert.deepEqual(dealRequests[0].params, { page: 2, per_page: 3 });
    assert.deepEqual(dealRequests[1], dealRequests[0]);
});

test('concurrent 401s share an in-flight refresh and replay with the new token', async t => {
    let logins = 0;
    const refresh = Promise.withResolvers();
    const staleRequests = Promise.withResolvers();
    let expired = 0;
    const requests = mockRequests(t, async config => {
        if (isAuth(config)) return ++logins === 1 ? { token } : refresh.promise;
        if (config.headers.Authorization === `Bearer ${token}`) {
            if (++expired === 2) staleRequests.resolve();
            await staleRequests.promise;
            fail(config, 401);
        }
        assert.equal(config.headers.Authorization, 'Bearer fresh-token');
        return {};
    });
    const client = new LibertasClient(clientOptions);
    const reads = Promise.all([client.getIndustries(), client.listDeals()]);
    await staleRequests.promise;
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(logins, 2);
    refresh.resolve({ token: 'fresh-token' });
    await reads;
    assert.equal(requests.filter(isAuth).length, 2);
    assert.equal(requests.length, 6);
});

test('a second endpoint 401 stops recovery and clears the rejected session', async t => {
    let logins = 0;
    const requests = mockRequests(t, config => {
        if (isAuth(config)) return { token: `session-${++logins}` };
        fail(config, 401);
    });
    const client = new LibertasClient(clientOptions);
    await assert.rejects(client.listDeals(), { name: 'LibertasApiError', kind: 'authentication', status: 401 });
    assert.deepEqual(requests.map(isAuth), [true, false, true, false]);
    assert.equal(await client.auth.auth(), 'session-3');
});

test('authentication 401s are never retried, including during endpoint recovery', async t => {
    for (const duringRefresh of [false, true]) {
        await t.test(`during ${duringRefresh ? 'refresh' : 'initial login'}`, async subtest => {
            let logins = 0;
            const requests = mockRequests(subtest, config => {
                if (isAuth(config) && ++logins === 1 && duringRefresh) return { token };
                fail(config, 401);
            });
            const client = new LibertasClient(clientOptions);
            await assert.rejects(client.listDeals(), { name: 'LibertasApiError', kind: 'authentication', status: 401 });
            assert.deepEqual(requests.map(isAuth), duringRefresh ? [true, false, true] : [true]);
        });
    }
});

test('writes refresh the session but are never replayed', async t => {
    for (const [method, write] of [
        ['post', client => client.createDeal({ business_name: 'Synthetic business' })],
        ['put', client => client.rejectDeal({ deal_id: 'deal' })],
        ['delete', client => client.deleteStipulation({ deal_id: 'deal', stipulation_id: 'stip' })],
    ]) {
        await t.test(method, async subtest => {
            let logins = 0;
            const requests = mockRequests(subtest, config => {
                if (isAuth(config)) return { token: `session-${++logins}` };
                if (config.method === method) fail(config, 401);
                assert.equal(config.headers.Authorization, 'Bearer session-2');
                return {};
            });
            const client = new LibertasClient(clientOptions);
            await assert.rejects(write(client), { name: 'LibertasApiError', status: 401 });
            await client.getIndustries();
            assert.deepEqual(requests.map(config => isAuth(config) ? 'auth' : config.method),
                ['auth', method, 'auth', 'get']);
        });
    }
});

test('non-401 HTTP errors, network failures and timeouts never cause a retry', async t => {
    for (const [kind, status, code] of [
        ['validation', 422], ['server', 503], ['authorization', 403],
        ['network', undefined, 'ECONNRESET'], ['timeout', undefined, 'ETIMEDOUT'],
    ]) {
        await t.test(kind, async subtest => {
            const requests = mockRequests(subtest, config => {
                if (isAuth(config)) return { token };
                if (status) fail(config, status);
                throw Object.assign(new Error('connection failed'), { code, config });
            });
            const client = new LibertasClient(clientOptions);
            await assert.rejects(client.listDeals(), error =>
                error instanceof LibertasApiError && error.kind === kind && error.status === status);
            assert.deepEqual(requests.map(isAuth), [true, false]);
        });
    }
});

test('auth and endpoint errors exclude credentials and financial data from all logging formats', async t => {
    const payload = {
        password: 'synthetic-private-password',
        ssn: '999-12-3456',
        fein: '00-1234567',
        financials: 'synthetic-private-financial-data',
    };
    const secrets = [apiKey, token, ...Object.values(payload), 'UNRECOGNIZED_VENDOR_CODE'];
    for (const duringAuth of [true, false]) {
        await t.test(duringAuth ? 'authentication' : 'endpoint', async subtest => {
            mockRequests(subtest, config => {
                if (isAuth(config) && !duringAuth) return { token };
                const data = { ...payload, apiKey, token, code: 'UNRECOGNIZED_VENDOR_CODE' };
                if (duringAuth) data.error = 'invalid_token';
                throw Object.assign(new Error(secrets.join(' ')), {
                    config, request: { ...payload }, cause: new Error(apiKey),
                    response: { status: duringAuth ? 401 : 422, data },
                });
            });
            const client = new LibertasClient(clientOptions);
            const call = duringAuth ? client.auth.auth() : client.acceptOffer({ deal_id: 'deal', ...payload });
            await assert.rejects(call, error => {
                assert.ok(error instanceof LibertasApiError);
                const status = duringAuth ? 401 : 422;
                assert.equal(error.status, status);
                assert.deepEqual(error.response, { status });
                assert.equal(error.vendorCode, duringAuth ? 'invalid_token' : undefined);
                for (const key of ['config', 'request', 'cause']) assert.ok(!(key in error));

                let logged = '';
                const output = new Writable({
                    write(chunk, encoding, done) {
                        logged += chunk;
                        done();
                    },
                });
                new Console(output).error(error);
                for (const value of [logged, inspect(error, { showHidden: true }), JSON.stringify(error)]) {
                    for (const secret of secrets) assert.ok(!value.includes(secret));
                }
                return true;
            });
        });
    }
});

test('multipart field preparation cannot expose invalid input through a local error', async () => {
    const client = new LibertasClient(clientOptions);
    const invalidName = { password: 'synthetic-private-filename-password' };
    await assert.rejects(client.createStipulation({
        deal_id: 'deal', file: Buffer.from('test'), file_name: invalidName,
    }), error => {
        assert.deepEqual(Object.getOwnPropertyNames(error).sort(), ['message', 'stack']);
        assert.ok(error instanceof TypeError);
        assert.equal(error.message, 'Invalid multipart form field');
        assert.ok(!inspect(error).includes(invalidName.password));
        return true;
    });
});
