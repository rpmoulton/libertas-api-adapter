
# Libertas API SDK

An ECMAScript module (ESM) SDK for the [Libertas Funding Public API](https://api.libertasfms.com/api/public/v2/docs/index.html).

## Requirements

- Node.js `^22.12.0` or `>=24.0.0`

## Installation

https://www.npmjs.com/package/libertas-api-sdk

```sh
npm install libertas-api-sdk
```

## Quick start

Set `LIBERTAS_API_KEY` in your environment, then create a client:

```javascript
import LibertasClient from 'libertas-api-sdk';

const libertasClient = new LibertasClient({
  token: process.env.LIBERTAS_API_KEY,
  environment: 'sandbox', // Use 'production' for live requests.
});

const response = await libertasClient.listDeals({ page: 1, per_page: 20 });
console.log(response.data);
```

## Authentication and responses

Supply your master API key as `token`. Authentication happens lazily on the first
request, and each endpoint service caches its session token. The SDK sends that
token in the `Authorization: Bearer ...` header. It does not automatically refresh
expired sessions; create a new client if a session expires.

Set `environment` explicitly to `'sandbox'` or `'production'`. An omitted or
unrecognized value currently selects the sandbox.

All endpoint methods return an Axios response. Read `response.data` for the API
response body and `response.status` for the HTTP status. Requests time out after
30 seconds, reject redirects, and are not automatically retried.

---

## API Endpoints

### Deals

#### Create a Deal

```javascript
import { createReadStream } from 'node:fs';

const result = await libertasClient.createDeal({
  name_legal: 'Music Stores In Space',
  business_street_1: '72 N 12 W',
  business_street_2: '',
  business_city: 'New York',
  business_state: 'NY',
  business_zip_code: '10023',
  business_phone: '888-777-666',
  business_industry_type: 22112, // Industry code
  business_start_date: '2005-12-25',
  business_date_aquired: '2005-08-15',
  entity_type: 'CORPORATION',
  fein: '12-1231234',
  notes: 'Needs a decision within three days',
  first_name: 'Fred',
  last_name: 'Flintstone',
  owner_1_street_1: '123 Kitty cat trail',
  owner_1_street_2: '',
  owner_1_city: 'Centennial',
  owner_1_state: 'CO',
  owner_1_zip_code: '80016',
  owner_1_ssn: '123-12-1234',
  owner_1_dob: '2000-12-13',
  owner_1_percent_ownership: '33',
  owner_1_phone: '123-321-1234',
  owner_1_email: 'fred@test.com',
  owner_2_first_name: 'George',
  owner_2_last_name: 'Stevenson',
  owner_2_street_1: '777 S Main St',
  owner_2_street_2: '',
  owner_2_city: 'Halfmoon',
  owner_2_state: 'NY',
  owner_2_zip_code: '12065',
  owner_2_ssn: '999-99-9999',
  owner_2_dob: '1955-11-17',
  owner_2_percent_ownership: '33',
  owner_2_phone: '555-555-5555',
  owner_2_email: 'george@test.com',
  owner_3_first_name: 'Kelsey',
  owner_3_last_name: 'MacKenzie',
  owner_3_street_1: '1243 E Graham Ave',
  owner_3_street_2: '',
  owner_3_city: 'Greenwich',
  owner_3_state: 'CT',
  owner_3_zip_code: '06807',
  owner_3_ssn: '444-44-3333',
  owner_3_dob: '1985-02-22',
  owner_3_percent_ownership: '33',
  owner_3_phone: '909-888-1234',
  owner_3_email: 'kelsey@test.com',
  amount_requested: 100000,
  use_of_funds: 'Buying more banjos',
  file_1: createReadStream('./bank_statement_1.pdf'),
  file_1_name: 'bank_statement_1.pdf',
  file_1_type: 'application/pdf',
  file_1_stipulation_type_id: '1',
  state_of_organization: 'CA',
  product_type: 'rbf',
});
```

**Parameters:**  
See [API Docs](https://api.libertasfms.com/api/public/v2/docs/index.html#/Deals/post_api_public_v2_deals) for full list.

**Response:**

```json
{
  "deal_id": "56ba721d-a343-4282-9ea8-9b7fc8d6cef6"
}
```

#### List All Deals

```javascript
const currentDeals = await libertasClient.listDeals({
  page: 1,
  per_page: 200,
});
```

**Response:**

```json
{
  "deals": [
    {
      "deal_id": "56ba721d-a343-4282-9ea8-9b7fc8d6cef6",
      "name_dba": "Fluffy Inc",
      "name_legal": "SomeName",
      "status": "processing",
      "last_state_ts": null,
      "create_ts": "2017-08-15T14:36:56.000Z"
    }
  ],
  "total_count": 1,
  "page": 1,
  "per_page": 3
}
```

#### Get a Deal

```javascript
const deal = await libertasClient.getDeal({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
});
```

#### Reject a Deal

```javascript
const rejectResult = await libertasClient.rejectDeal({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
});
```

#### Get Deal Status

```javascript
const status = await libertasClient.getDealStatus({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
});
```

---

### Funded Deals

```javascript
const funded = await libertasClient.getFundedDeals();
```

---

### Industries

```javascript
const industries = await libertasClient.getIndustries();
```

---

### Offers

```javascript
const offers = await libertasClient.getOffers({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
});

const accept = await libertasClient.acceptOffer({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  offer_id: '02ee8fce-6df1-41ba-9634-e6faae6c45b4',
});
```

---

### Stipulation Types

```javascript
const stipulationTypes = await libertasClient.getStipulationTypes();
```

---

### Stipulations

```javascript
import { createReadStream } from 'node:fs';

const fileStream = createReadStream('./bank_statement_1.pdf');

const result = await libertasClient.createStipulation({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  file: fileStream,
  file_name: 'bank_statement_1.pdf',
  file_type: 'application/pdf',
  stipulation_type_id: '1',
});

await libertasClient.deleteStipulation({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  stipulation_id: '18f1db1e-585f-46fd-8891-d54221209db0',
});

const allStips = await libertasClient.getAllStipulations({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
});

// updateStipulation sends a JSON body; consult the API reference for update fields.
const updated = await libertasClient.updateStipulation({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  stipulation_id: '18f1db1e-585f-46fd-8891-d54221209db0',
  stipulation_type_id: '1',
});
```

---

For `createDeal` and `createStipulation`, pass a readable stream or Buffer for
file fields. Strings are sent as literal form values, not opened as files. Create
a fresh stream for each upload; consumed streams cannot be reused.

### Webhooks

```javascript
await libertasClient.registerWebhook({
  url: 'YOUR_URL',
  type: 'WEBHOOK_TYPE_BEING_REGISTERED',
});

await libertasClient.simulateWebhook({
  type: 'status',
});
```

---

## Error handling

Failed requests reject with an error. HTTP errors expose the status through
`error.response?.status`; network failures and timeouts may have no response.

```javascript
try {
  const response = await libertasClient.listDeals();
  console.log(response.data);
} catch (error) {
  console.error('Libertas request failed:', error.response?.status ?? 'no response');
  // Handle or propagate the failure as appropriate for your application.
}
```

## Development

```sh
npm ci
npm test
```

The CLI runs against the sandbox and requires an API key. Run it from the
repository root after installing development dependencies:

```sh
LIBERTAS_API_KEY=your_key node ./scripts/index.js --endpoint=listDeals
```

For methods that require identifiers, pass arguments such as `--deal_id=...`,
`--stipulation_id=...`, or `--offer_id=...`. CLI calls can create or modify sandbox
records. Review `scripts/index.js` and the sample payloads in `scripts/test-data.js`
before using write operations.

## Contributing

Issues and pull requests are welcome. Include a description of the change and
run `npm test` before submitting a pull request. Tests use mocked HTTP requests
and do not require API credentials.

## Reference

See the [Libertas API documentation](https://api.libertasfms.com/api/public/v2/docs/index.html)
for request fields and response schemas. The examples above show usage; API
response bodies are returned unchanged.

## License

ISC (as declared in `package.json`).

## Security

Keep API keys in environment variables and avoid logging raw Axios errors or responses: they can contain credentials and financial data. If a key is exposed, revoke or rotate it; removing it from a file does not revoke copies in Git history. Authentication uses the API-required query parameter over HTTPS. Requests reject redirects to keep credentials and uploads on the configured API host.
