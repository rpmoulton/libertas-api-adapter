import test from 'node:test';
import assert from 'node:assert/strict';
import LibertasClient from '../index.js';
import { productionUrl, sandboxUrl } from '../src/config.js';
import http from '../src/http.js';
import { pathSegment } from '../src/security.js';

const sandboxHost = new URL(sandboxUrl).origin;
const productionHost = new URL(productionUrl).origin;
const options = { token: 'test-key', host: sandboxHost };

function mockRequests(t, respond = () => ({})) {
    const original = http.defaults.adapter;
    const requests = [];
    t.after(() => { http.defaults.adapter = original; });
    http.defaults.adapter = async config => {
        requests.push(config);
        const data = config.url.endsWith('/auth')
            ? { success: true, data: { token: 'session' } }
            : respond(config);
        return { data, status: 200, headers: {}, config };
    };
    return requests;
}

test('explicit host, environment host and mode defaults follow precedence', t => {
    const saved = process.env.LIBERTAS_API_HOST;
    t.after(() => {
        if (saved === undefined) delete process.env.LIBERTAS_API_HOST;
        else process.env.LIBERTAS_API_HOST = saved;
    });
    for (const environment of [undefined, 'sandbox', 'production']) {
        for (const envHost of [undefined, 'https://env.example']) {
            if (envHost === undefined) delete process.env.LIBERTAS_API_HOST;
            else process.env.LIBERTAS_API_HOST = envHost;
            for (const host of [undefined, 'https://explicit.example/']) {
                const client = new LibertasClient({ host, environment });
                const expected = host?.slice(0, -1) ?? envHost ??
                    (environment === 'production' ? productionHost : sandboxHost);
                assert.equal(client.auth.baseUrl, expected + '/api/public/v2');
                assert.equal(client.environment, environment);
            }
        }
    }
    for (const host of [null, '', 'http://example.com', 'https://user:password@example.com',
        'https://@example.com', 'https://example.com/path', 'https://example.com?']) {
        assert.throws(() => new LibertasClient({ host }), /HTTPS origin/);
    }
});

test('numeric IDs serialize without losing precision or weakening path encoding', async t => {
    const requests = mockRequests(t);
    await new LibertasClient(options).getDealStatus({ deal_id: 123 });
    assert.equal(requests.at(-1).url, sandboxUrl + '/deals/123/status');
    for (const id of [-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, '  ', 'a\nb']) {
        assert.throws(() => pathSegment(id), TypeError);
    }
    assert.equal(pathSegment('12345678901234567890'), '12345678901234567890');
    assert.equal(pathSegment('id/?#'), 'id%2F%3F%23');
});

test('stipulation updates use multipart with and without an attachment', async t => {
    const requests = mockRequests(t);
    const client = new LibertasClient(options);
    const fields = { deal_id: 'deal', stipulation_id: 42, stipulation_type_id: 1 };
    for (const file of [undefined, Buffer.from('file bytes')]) {
        await client.updateStipulation({ ...fields, file, file_name: 'proof.pdf', file_type: 'application/pdf' });
        const request = requests.at(-1);
        assert.equal(request.method, 'put');
        assert.equal(request.url, sandboxUrl + '/deals/deal/stipulations/42');
        assert.equal(request.headers.Authorization, 'Bearer session');
        assert.match(request.headers.getContentType(), /^multipart\/form-data; boundary=/);
        const body = request.data.getBuffer().toString();
        assert.match(body, /name="stipulation_type_id"\r\n\r\n1\r\n/);
        assert.doesNotMatch(body, /name="(?:deal_id|stipulation_id)"/);
        assert.equal(body.includes('filename="proof.pdf"\r\nContent-Type: application/pdf\r\n\r\nfile bytes'), Boolean(file));
    }
    await assert.rejects(client.updateStipulation({ ...fields, stipulation_id: '..' }), TypeError);
    await assert.rejects(client.updateStipulation({ deal_id: 'deal', stipulation_id: 42 }), TypeError);
    await assert.rejects(client.updateStipulation({
        ...fields, file: Buffer.from('x'), file_type: 'application/pdf\r\nInjected: yes',
    }), TypeError);
    assert.equal(requests.length, 3);
});

test('presigned upload method sends only authenticated JSON metadata and preserves the response', async t => {
    const response = { id: 'stip', upload_url: 'https://storage.example/object', expires_at: 'expiry',
        upload_headers: { 'Content-Type': 'application/pdf', 'Content-Length': '10' } };
    const requests = mockRequests(t, () => response);
    const client = new LibertasClient(options);
    const metadata = { file_name: 'proof.pdf', file_type: 'application/pdf', file_size: 10, stipulation_type_id: '1' };
    for (const file_size of [0, 1.5, '10', Number.MAX_SAFE_INTEGER + 1]) {
        await assert.rejects(client.createStipulationUploadUrl({ ...metadata, deal_id: 'deal', file_size }), TypeError);
    }
    assert.equal(requests.length, 0);
    const result = await client.createStipulationUploadUrl({ ...metadata, deal_id: 'deal', file: Buffer.from('x'), stipulation_type_id: 1 });
    const request = requests.at(-1);
    assert.equal(request.method, 'post');
    assert.equal(request.url, sandboxUrl + '/deals/deal/stipulations/upload-url');
    assert.equal(request.headers.Authorization, 'Bearer session');
    assert.deepEqual(JSON.parse(request.data), metadata);
    assert.deepEqual(result.data, response);
    assert.equal(requests.length, 2);
});

test('funded deals and stipulations preserve pages, empty results and pagination parameters', async t => {
    const requests = mockRequests(t, ({ url, params }) => {
        const key = url.endsWith('/funded') ? 'funded_deals' : 'stipulations';
        const { page = 1, per_page = 50 } = params;
        return { [key]: page <= 2 ? [{ id: page }] : [], page, per_page, total_count: 2 };
    });
    const client = new LibertasClient(options);
    for (const [key, read] of [
        ['funded_deals', params => client.getFundedDeals(params)],
        ['stipulations', params => client.getAllStipulations({ deal_id: 'deal', ...params })],
    ]) {
        assert.equal((await read()).data.per_page, 50);
        assert.equal(new URL(http.getUri(requests.at(-1))).search, '');
        for (const page of [1, 2, 3]) {
            const { data } = await read({ page, per_page: 1 });
            assert.deepEqual(data, { [key]: page <= 2 ? [{ id: page }] : [], page, per_page: 1, total_count: 2 });
            assert.deepEqual(requests.at(-1).params, { page, per_page: 1 });
        }
        await read({ page: 1, per_page: 200 });
        assert.equal(new URL(http.getUri(requests.at(-1))).searchParams.get('per_page'), '200');
    }
});

test('simulation requires sandbox mode and the official sandbox origin before authentication', async t => {
    const requests = mockRequests(t);
    const payload = { deal_id: 123, type: 'status' };
    for (const clientOptions of [
        { host: productionHost, environment: 'production' },
        { host: sandboxHost, environment: 'production' },
        { host: productionHost, environment: 'sandbox' },
        { host: 'https://custom.example', environment: 'sandbox' },
    ]) {
        const client = new LibertasClient({ ...options, ...clientOptions });
        client.webhooks.environment = 'sandbox';
        await assert.rejects(client.simulateWebhook(payload), /only on the Libertas sandbox/);
    }
    const client = new LibertasClient(options);
    await assert.rejects(client.simulateWebhook({ type: 'status' }), TypeError);
    assert.equal(requests.length, 0);
    await client.simulateWebhook(payload);
    assert.equal(requests.at(-1).url, sandboxUrl + '/webhooks/simulate');
    assert.deepEqual(JSON.parse(requests.at(-1).data), { ...payload, deal_id: '123' });
});
