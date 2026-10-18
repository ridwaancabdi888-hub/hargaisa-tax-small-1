(function initializeApiClient(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.HargeisaApi = api;
})(typeof window !== 'undefined' ? window : null, function createApiClient() {
  async function fetchJson(url, options, fetchImplementation = globalThis.fetch) {
    let response;
    try {
      response = await fetchImplementation(url, options);
    } catch {
      throw new Error('Unable to connect to the server.');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      if (response.ok) throw new Error('The server returned an invalid response.');
      data = null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}.`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  return Object.freeze({ fetchJson });
});
