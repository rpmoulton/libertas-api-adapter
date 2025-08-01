
# Libertas API SDK

A Node.js SDK for the [Libertas Funding Public API](https://api.libertasfms.com/api/public/v2/docs/index.html).

## Requirements

- Node.js v12.0.0 or higher

## Installation

*When this is completely finished I'll publish it to npm.*

```sh
npm install libertas-api-sdk
```

## Example usage

I made a CLI script for testing in the `scripts` folder. This can be run using:

```sh
node ./scripts/index.js --endpoint=listDeals
```

It also shows sample usage of the connector.

## Authentication

All requests require a session token. To obtain a session token, use your master API key:

```javascript
import libertasSDK from 'libertas-api-sdk';

const libertasClient = new libertasSDK({
    token: "YOUR_MASTER_TOKEN",
    environment: "production", // or "sandbox"
});
```

*Note: initializing the client will automatically pull the session token and use it as a Bearer token in the `Authorization` header for all requests.*

---

## API Endpoints

### Deals

#### Create a Deal

```javascript
const result = await libertasClient.createDeal({
  name_legal: 'Music Stores In Space',
  business_street_1: '72 N 12 W',
  business_street_2: '',
  business_city: 'New York',
  business_state: 'NY',
  business_zip_code: '10023',
  business_phone: '888-777-666',
  business_industry_type: 22112, // five code
  business_start_date: '2005-12-25',
  business_date_aquired: '2005-08-15',
  entity_type: 'Corporation',
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
  file_1: '@test/data/bank_statement_1.pdf',
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
const funded = await libertasClient.getFundedDeals({
  page: 1,
  per_page: 200,
});
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
const fileStream = fs.getReadStream('some_file_to_upload.txt');

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

const updated = await libertasClient.updateStipulation({
  deal_id: '56ba721d-a343-4282-9ea8-9b7fc8d6cef6',
  stipulation_id: '18f1db1e-585f-46fd-8891-d54221209db0',
  file: fileStream,
  file_name: 'bank_statement_1.pdf',
  file_type: 'application/pdf',
  stipulation_type_id: '1',
});
```

---

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

## Error Handling

```json
// 401 Unauthorized
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Missing authentication"
}

// 400 Bad Request
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request params input"
}
```

---

## Contributing

Pull requests and issues are welcome!

---

## Reference

See [API Docs](https://api.libertasfms.com/api/public/v2/docs/index.html)
