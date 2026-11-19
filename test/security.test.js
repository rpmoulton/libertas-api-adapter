import test from 'node:test';
import assert from 'node:assert/strict';
import http from '../src/http.js';
import Auth from '../src/auth.js';
import Deals from '../src/deals.js';
import Offers from '../src/offers.js';
import Stips from '../src/stipulations.js';
import StipTypes from '../src/stipulation_types.js';
import { pathSegment } from '../src/security.js';

const requests = [];
http.defaults.adapter = async config => {
    requests.push(config);
    return { data: { data: { token: 'session' } }, status: 200, headers: {}, config };
};
const options = { token: 'secret&injected=true', environment: 'production' };

test('credentials are encoded and redirects and timeouts are bounded', async () => {
    await new Auth(options).auth();
    const request = requests.at(-1);
    assert.equal(request.maxRedirects, 0);
    assert.equal(request.timeout, 30000);
    assert.equal(new URL(http.getUri(request)).searchParams.get('api_key'), options.token);
    assert.equal(new URL(http.getUri(request)).searchParams.has('injected'), false);
});

test('caller input cannot override HTTP configuration or authentication', async () => {
    const input = { deal_id: 'id/?admin=true', stipulation_id: 'stip', baseURL: 'https://attacker.invalid', headers: { Authorization: 'attacker' }, adapter: () => { throw Error('untrusted adapter'); } };
    for (const [Client, method] of [[Offers, 'getOffers'], [Stips, 'deleteStipulation'], [StipTypes, 'getStipulationTypes']]) {
        await new Client(options)[method](input);
        const request = requests.at(-1);
        assert.equal(request.headers.Authorization, 'Bearer session');
        assert.equal(request.baseURL, undefined);
        assert.ok(request.url.startsWith('https://api.libertasfms.com/'));
        assert.ok(!request.url.includes('?'));
    }
    await new StipTypes(options).getStipulationTypes();
});

test('pagination values cannot inject query parameters', async () => {
    await new Deals(options).listDeals({ page: '1&admin=true', per_page: 20 });
    const url = new URL(http.getUri(requests.at(-1)));
    assert.equal(url.searchParams.get('page'), '1&admin=true');
    assert.equal(url.searchParams.get('per_page'), '20');
    assert.equal(url.searchParams.has('admin'), false);
});

test('IDs cannot traverse paths or inject queries', () => {
    for (const id of ['', '.', '..', undefined, {}]) assert.throws(() => pathSegment(id), TypeError);
    assert.equal(pathSegment('../other?x=1#fragment'), '..%2Fother%3Fx%3D1%23fragment');
});

test('missing session tokens fail closed', async () => {
    const adapter = http.defaults.adapter;
    try {
        http.defaults.adapter = async () => ({ data: {}, status: 200, headers: {} });
        await assert.rejects(new Auth(options).auth(), /session token/);
    } finally {
        http.defaults.adapter = adapter;
    }
});
