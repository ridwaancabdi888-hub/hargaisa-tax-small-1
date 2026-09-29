const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.VERCEL = '1';
process.env.DEMO_MODE = 'true';

const app = require('../server');
const demoStore = require('../data/demoStore');

const initialProperties = structuredClone(demoStore.properties);
const initialPayments = structuredClone(demoStore.payments);

let server;
let baseUrl;

before(() => {
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  demoStore.properties.splice(0, demoStore.properties.length, ...structuredClone(initialProperties));
  demoStore.payments.splice(0, demoStore.payments.length, ...structuredClone(initialPayments));
});

after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
}));

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...options?.headers
    }
  });
  const body = await response.json();
  return { response, body };
}

test('dashboard reports the seeded demo totals', async () => {
  const { response, body } = await request('/api/dashboard');

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    totalProperties: 8,
    paidProperties: 4,
    unpaidProperties: 4,
    totalTaxCollected: 690
  });
});

test('property search is case-insensitive and checks supported fields', async () => {
  const { response, body } = await request('/api/properties?search=GACAN');

  assert.equal(response.status, 200);
  assert.equal(body.length, 2);
  assert.ok(body.every((property) => property.district === 'Gacan Libaax'));
});

test('property create, update, and delete flow keeps demo data consistent', async () => {
  const createResult = await request('/api/properties', {
    method: 'POST',
    body: JSON.stringify({
      property_code: 'HPT-TEST',
      owner_name: 'Test Owner',
      phone: '063999999',
      district: '26 June',
      property_type: 'House',
      tax_amount: 180,
      latitude: 9.56,
      longitude: 44.07
    })
  });

  assert.equal(createResult.response.status, 201);
  assert.equal(createResult.body.tax_status, 'Unpaid');

  const updateResult = await request(`/api/properties/${createResult.body.id}`, {
    method: 'PUT',
    body: JSON.stringify({ owner_name: 'Updated Owner', tax_amount: 200 })
  });
  assert.equal(updateResult.response.status, 200);
  assert.equal(updateResult.body.owner_name, 'Updated Owner');
  assert.equal(updateResult.body.tax_amount, 200);

  const deleteResult = await request(`/api/properties/${createResult.body.id}`, {
    method: 'DELETE'
  });
  assert.equal(deleteResult.response.status, 200);

  const getResult = await request(`/api/properties/${createResult.body.id}`);
  assert.equal(getResult.response.status, 404);
});

test('recording a demo payment updates both tax and dashboard responses', async () => {
  const paymentResult = await request('/api/taxes/pay', {
    method: 'POST',
    body: JSON.stringify({
      property_id: 2,
      amount: 150,
      payment_date: '2026-09-29'
    })
  });
  assert.equal(paymentResult.response.status, 200);

  const taxesResult = await request('/api/taxes');
  const paidProperty = taxesResult.body.find((property) => property.id === 2);
  assert.equal(paidProperty.tax_status, 'Paid');
  assert.equal(paidProperty.payment_amount, 150);
  assert.equal(paidProperty.payment_date, '2026-09-29');

  const dashboardResult = await request('/api/dashboard');
  assert.equal(dashboardResult.body.paidProperties, 5);
  assert.equal(dashboardResult.body.unpaidProperties, 3);
  assert.equal(dashboardResult.body.totalTaxCollected, 840);
});
