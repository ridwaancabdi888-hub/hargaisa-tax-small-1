const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const { fetchJson } = require('../public/js/api-client');

function response({ ok = true, status = 200, body, jsonError } = {}) {
  return {
    ok,
    status,
    async json() {
      if (jsonError) throw jsonError;
      return body;
    }
  };
}

test('returns parsed JSON for successful responses', async () => {
  const payload = { totalProperties: 8 };
  const result = await fetchJson('/api/dashboard', undefined, async () => response({ body: payload }));
  assert.equal(result, payload);
});

test('throws the API message and preserves status for failed responses', async () => {
  await assert.rejects(
    fetchJson('/api/properties', undefined, async () => response({
      ok: false,
      status: 422,
      body: { message: 'Tax Amount must be positive.' }
    })),
    error => error.message === 'Tax Amount must be positive.' && error.status === 422
  );
});

test('provides a status-based error when a failed response is not JSON', async () => {
  await assert.rejects(
    fetchJson('/api/properties', undefined, async () => response({
      ok: false,
      status: 503,
      jsonError: new SyntaxError('Invalid JSON')
    })),
    /Request failed with status 503/
  );
});

test('distinguishes connection and invalid-success-response failures', async () => {
  await assert.rejects(
    fetchJson('/api/dashboard', undefined, async () => { throw new Error('offline'); }),
    /Unable to connect to the server/
  );
  await assert.rejects(
    fetchJson('/api/dashboard', undefined, async () => response({ jsonError: new SyntaxError('Invalid JSON') })),
    /server returned an invalid response/
  );
});

test('protected pages load the API client before their page scripts', async () => {
  for (const page of ['dashboard', 'map', 'properties', 'reports', 'tax']) {
    const html = await readFile(resolve(__dirname, `../public/${page}.html`), 'utf8');
    assert.ok(html.indexOf('js/api-client.js') > -1, `${page}.html must load the API client`);
    assert.ok(
      html.indexOf('js/api-client.js') < html.indexOf(`js/${page}.js`),
      `${page}.html must load the API client before its page script`
    );
  }
});
