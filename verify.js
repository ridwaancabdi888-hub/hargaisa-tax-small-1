async function api(base, path, options = {}) {
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    data = text;
  }

  return { ok: res.ok, status: res.status, data };
}

(async () => {
  const base = 'http://localhost:3000';

  const login = await api(base, '/api/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  console.log('LOGIN', JSON.stringify(login));

  const create = await api(base, '/api/properties', {
    method: 'POST',
    body: JSON.stringify({
      property_code: 'TMP-TEST',
      owner_name: 'Test User',
      phone: '252-61-999999',
      district: '26 June',
      property_type: 'House',
      tax_amount: 250,
      tax_status: 'Unpaid',
      latitude: 9.5612,
      longitude: 44.0567,
    }),
  });
  console.log('CREATE', JSON.stringify(create));

  const propertyId = create.data && create.data.id;
  const all = await api(base, '/api/properties');
  console.log('LIST_HAS_TEMP', JSON.stringify(all.data.some((p) => p.id === propertyId)));

  const edit = await api(base, `/api/properties/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify({
      property_code: 'TMP-TEST',
      owner_name: 'Updated User',
      phone: '252-61-888888',
      district: 'Ahmed Dhagah',
      property_type: 'Office',
      tax_amount: 300,
      tax_status: 'Unpaid',
      latitude: 9.5701,
      longitude: 44.0401,
    }),
  });
  console.log('EDIT', JSON.stringify(edit));

  const pay = await api(base, '/api/taxes/pay', {
    method: 'POST',
    body: JSON.stringify({
      property_id: propertyId,
      amount: 300,
      payment_date: '2026-08-16',
    }),
  });
  console.log('PAY', JSON.stringify(pay));

  const dash = await api(base, '/api/dashboard');
  console.log('DASH', JSON.stringify(dash));

  const reports = await api(base, '/api/reports');
  console.log('REPORTS', JSON.stringify(reports.data.stats));

  const del = await api(base, `/api/properties/${propertyId}`, { method: 'DELETE' });
  console.log('DELETE', JSON.stringify(del));
})();
