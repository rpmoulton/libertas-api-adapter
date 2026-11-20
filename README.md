
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
request. All endpoint services on a client share one cached session and one
in-flight authentication request. The SDK sends the session token in the
`Authorization: Bearer ...` header.

An endpoint HTTP 401 triggers one shared session refresh. The SDK retries only
read-only GET requests, at most once. POST, PUT, and DELETE operations return
the original sanitized 401 after the refresh attempt. Check the operation's
outcome before deciding whether to submit a write again. A 401 on the retried
GET clears that session and ends the request. Authentication requests, network
failures, timeouts, and other HTTP failures are never retried automatically.

The sandbox returned a successful response with the session token at `data.token`.
The SDK also accepts the top-level `token` shown in the vendor reference.
Responses with `success: false` are treated as authentication failures.

## Environment and host

Set `environment: 'production'` for production mode. Omitted or unrecognized
values select sandbox mode. An explicit `host` takes precedence over
`LIBERTAS_API_HOST`, followed by the default origin for the selected mode:

| Mode | Default origin |
| --- | --- |
| Sandbox | `https://sandbox.uat.libertasfms.com` |
| Production | `https://api.libertasfms.com` |

The production origin serves the [Libertas public API reference](https://api.libertasfms.com/api/public/v2/docs/index.html).
The SDK appends `/api/public/v2` to origin overrides. Supply only the origin,
for example `host: 'https://libertas-proxy.example'`. Overrides leave the mode
unchanged. Only send credentials to origins you trust. Origins require HTTPS,
with HTTP allowed for loopback development. Embedded credentials are rejected.

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
      "success": true,
      "data": {
        "deal_id": "56ba721d-a343-4282-9ea8-9b7fc8d6cef6",
        "name_dba": "Fluffy Inc",
        "name_legal": "SomeName",
        "status": "processing",
        "last_state_ts": null,
        "create_ts": "2017-08-15T14:36:56.000Z"
      }
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
const { data: funded } = await libertasClient.getFundedDeals({
  page: 1,
  per_page: 20,
});
console.log(funded.funded_deals, funded.total_count, funded.page, funded.per_page);
```

Funded deals and stipulations each return one page per call. The sandbox returned
`total_count`, `page`, and `per_page` alongside `funded_deals` or `stipulations`.
A page beyond the available results returned an empty array and the same total.
Funded deals defaulted to 50 per page and accepted up to 200. Stipulations
accepted 201 in the sandbox. Use the returned page metadata when reading further
pages.

The sandbox returned individual deals in `listDeals().data.deals` wrapped in a
`data` object. In a read check, that endpoint returned `per_page: 50` when asked
for 2. The SDK forwards query parameters and preserves the server response.

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

const stipulationPage = await libertasClient.getAllStipulations({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  page: 2,
  per_page: 20,
});

const updated = await libertasClient.updateStipulation({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  stipulation_id: '18f1db1e-585f-46fd-8891-d54221209db0',
  file: createReadStream('./bank_statement_1.pdf'),
  file_name: 'bank_statement_1.pdf',
  file_type: 'application/pdf',
  stipulation_type_id: '1',
});
```

---

Create and update send multipart form data. For attachments, pass a readable
stream or Buffer. When supplying a string it becomes a literal form field.
Create a fresh stream for each upload. The vendor documents updates with a
replacement file. Sandbox support for metadata-only updates remains unverified.

#### Presigned uploads

The [sandbox reference](https://sandbox.uat.libertasfms.com/api/public/v2/docs/index.html#api-Stipulations-CreateUploadUrl)
documents a bearer-authenticated JSON POST to
`/deals/:deal_id/stipulations/upload-url`. It creates a stipulation and returns
`id`, `upload_url`, `expires_at`, and `upload_headers`. The documented URL lasts
15 minutes. Send the exact bytes as a raw PUT using the returned signed headers.
Keep the URL private and use only the signed headers for that PUT. The following
example buffers a file for clarity. For large files, measure and stream the same
unchanged file. Sandbox verification covered read operations only, so URL
issuance and the S3 PUT were not exercised.

```javascript
import { readFile } from 'node:fs/promises';

const bytes = await readFile('./bank_statement_1.pdf');
const { data: upload } = await libertasClient.createStipulationUploadUrl({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  stipulation_type_id: '1',
  file_name: 'bank_statement_1.pdf',
  file_type: 'application/pdf',
  file_size: bytes.length,
});
const destination = new URL(upload.upload_url);
if (destination.protocol !== 'https:') throw new Error('Expected an HTTPS upload URL');

const result = await fetch(destination, {
  method: 'PUT',
  headers: upload.upload_headers,
  body: bytes,
  redirect: 'error',
});
if (!result.ok) throw new Error(`Presigned upload failed (HTTP ${result.status})`);
```

### Identifiers

Path identifiers accept strings and non-negative safe integers in the SDK.
Pass IDs exactly as returned by Libertas. Use strings for numeric identifiers
that exceed JavaScript's safe integer range. The current sandbox requires GUID
deal IDs on the stipulation listing and deal status routes. Vendor examples
include numeric IDs for older stipulation routes. Numeric acceptance on write
routes remains unverified.

### Webhooks

```javascript
await libertasClient.registerWebhook({
  url: 'YOUR_URL',
  type: 'WEBHOOK_TYPE_BEING_REGISTERED',
});

await libertasClient.simulateWebhook({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  type: 'status',
});
```

Simulation requires sandbox mode and the official sandbox origin. Supply
`deal_id` and a webhook `type` such as `status`, `stipulations`, or `offers`.
The vendor reference disagrees on the singular and plural route spellings.
The SDK retains `/webhooks/simulate`, which the vendor uses in its example.
The simulation POST was not exercised during read-only sandbox verification.

---

## Error handling

Failed API requests reject with a `LibertasApiError`, available as a named
export. Its `message` is generated by the SDK, and its `kind` distinguishes
`authentication`, `authorization`, `validation`, `network`, `timeout`, `server`,
and other `http` failures. HTTP failures provide `status` and a compatibility
alias at `error.response.status`. A `vendorCode` is available when the response
body contains a recognized bearer error code for that status.

Logging or serializing the error exposes only safe diagnostics. Migrate any
code that reads raw Axios fields such as `error.response.data` or `error.config`
to the diagnostic fields above. Local argument checks can still throw
`TypeError`.

```javascript
try {
  const response = await libertasClient.listDeals();
  console.log(response.data);
} catch (error) {
  console.error(error);
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

Pass `--page=2 --per_page=20` to request a specific page from a listing.
For methods that require identifiers, pass arguments such as `--deal_id=...`,
`--stipulation_id=...`, or `--offer_id=...`. CLI calls can create or modify sandbox
records. Review `scripts/index.js` and the sample payloads in `scripts/test-data.js`
before using write operations.

## Contributing

Issues and pull requests are welcome. Include a description of the change and
run `npm test` before submitting a pull request. Unit tests use mocked HTTP
requests. To opt into the read-only integration test, set
`LIBERTAS_SANDBOX_API_KEY` and run `node --test test/sandbox.test.js`. It always
targets the official sandbox origin.

## Reference

See the [Libertas API documentation](https://api.libertasfms.com/api/public/v2/docs/index.html)
for request fields and response schemas. The examples above show usage; API
response bodies are returned unchanged.

## License

ISC (as declared in `package.json`).

## Security

Keep API keys in environment variables and avoid logging successful Axios responses because they can contain credentials and financial data. If a key is exposed, revoke or rotate it; removing it from a file does not revoke copies in Git history. Authentication uses the API-required query parameter over HTTPS. Requests reject redirects to keep credentials and uploads on the configured API host.
