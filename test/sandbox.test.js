import test from 'node:test';
import assert from 'node:assert/strict';
import LibertasClient from '../index.js';
import { sandboxUrl } from '../src/config.js';

const token = process.env.LIBERTAS_SANDBOX_API_KEY;

async function request(read) {
    try {
        return await read();
    } catch (error) {
        throw new Error(`Sandbox read failed (HTTP ${error.response?.status ?? 'unavailable'})`);
    }
}

function assertPage(body, collection, page, perPage) {
    assert.ok(Array.isArray(body?.[collection]));
    assert.ok(body[collection].length <= perPage);
    assert.ok(Number.isSafeInteger(body.total_count) && body.total_count >= 0);
    assert.equal(body.page, page);
    assert.equal(body.per_page, perPage);
}

test('official sandbox authenticates and serves funded and stipulation pages', {
    skip: !token && 'Set LIBERTAS_SANDBOX_API_KEY to opt in',
}, async t => {
    const client = new LibertasClient({ token, environment: 'sandbox', host: new URL(sandboxUrl).origin });
    assert.ok(typeof await request(() => client.auth.auth()) === 'string');
    for (const page of [1, 2]) {
        const { data } = await request(() => client.getFundedDeals({ page, per_page: 1 }));
        assertPage(data, 'funded_deals', page, 1);
    }

    const { data } = await request(() => client.listDeals({ page: 1 }));
    const dealId = data.deals?.map(deal => deal.data?.deal_id ?? deal.deal_id).find(Boolean);
    if (!dealId) {
        t.diagnostic('No sandbox deal was available for stipulation reads');
        return;
    }
    for (const page of [1, 2]) {
        const { data } = await request(() => client.getAllStipulations({ deal_id: dealId, page, per_page: 1 }));
        assertPage(data, 'stipulations', page, 1);
    }
});
