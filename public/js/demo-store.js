// Hosted demo data store.
// Vercel serverless functions do not provide a persistent in-memory database,
// so the live demo stores editable demo data in this browser's localStorage.
(function () {
  const STORAGE_KEY = 'hargeisaTaxDemoStateV1';

  const seedState = {
    properties: [
      { id: 1, property_code: 'HPT-001', owner_name: 'Ahmed Ali', phone: '063000001', district: '26 June', property_type: 'House', tax_amount: 100, tax_status: 'Paid', latitude: 9.5624, longitude: 44.0770, created_at: '2026-08-01' },
      { id: 2, property_code: 'HPT-002', owner_name: 'Nimco Yusuf', phone: '063000002', district: 'Ahmed Dhagah', property_type: 'Shop', tax_amount: 150, tax_status: 'Unpaid', latitude: 9.5578, longitude: 44.0647, created_at: '2026-08-02' },
      { id: 3, property_code: 'HPT-003', owner_name: 'Mohamed Mooge', phone: '063000003', district: 'Gacan Libaax', property_type: 'Office', tax_amount: 200, tax_status: 'Paid', latitude: 9.5681, longitude: 44.0833, created_at: '2026-08-03' },
      { id: 4, property_code: 'HPT-004', owner_name: 'Abdi Hassan', phone: '063000004', district: 'Ibrahim Koodbuur', property_type: 'Land', tax_amount: 120, tax_status: 'Unpaid', latitude: 9.5750, longitude: 44.0538, created_at: '2026-08-04' },
      { id: 5, property_code: 'HPT-005', owner_name: 'Maryam Farah', phone: '063000005', district: 'Mohamed Mooge', property_type: 'House', tax_amount: 170, tax_status: 'Paid', latitude: 9.5489, longitude: 44.0739, created_at: '2026-08-05' },
      { id: 6, property_code: 'HPT-006', owner_name: 'Hodan Jama', phone: '063000006', district: '26 June', property_type: 'Shop', tax_amount: 140, tax_status: 'Unpaid', latitude: 9.5647, longitude: 44.0910, created_at: '2026-08-06' },
      { id: 7, property_code: 'HPT-007', owner_name: 'Yasin Omar', phone: '063000007', district: 'Gacan Libaax', property_type: 'Office', tax_amount: 220, tax_status: 'Paid', latitude: 9.5527, longitude: 44.0865, created_at: '2026-08-07' },
      { id: 8, property_code: 'HPT-008', owner_name: 'Asha Ibrahim', phone: '063000008', district: 'Ahmed Dhagah', property_type: 'Land', tax_amount: 130, tax_status: 'Unpaid', latitude: 9.5707, longitude: 44.0701, created_at: '2026-08-08' }
    ],
    payments: [
      { id: 1, property_id: 1, amount: 100, payment_date: '2026-08-01', status: 'Paid' },
      { id: 2, property_id: 3, amount: 200, payment_date: '2026-08-03', status: 'Paid' },
      { id: 3, property_id: 5, amount: 170, payment_date: '2026-08-05', status: 'Paid' },
      { id: 4, property_id: 7, amount: 220, payment_date: '2026-08-07', status: 'Paid' }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.warn('Could not read demo data:', error);
    }
    const state = clone(seedState);
    save(state);
    return state;
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getStats() {
    const state = load();
    const paid = state.properties.filter((item) => item.tax_status === 'Paid');
    return {
      totalProperties: state.properties.length,
      paidProperties: paid.length,
      unpaidProperties: state.properties.filter((item) => item.tax_status === 'Unpaid').length,
      totalTaxCollected: paid.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0)
    };
  }

  function getProperties(search = '') {
    const text = search.trim().toLowerCase();
    const rows = load().properties;
    if (!text) return clone(rows);
    return clone(rows.filter((item) =>
      [item.property_code, item.owner_name, item.district, item.property_type]
        .some((value) => String(value).toLowerCase().includes(text))
    ));
  }

  function getProperty(id) {
    return clone(load().properties.find((item) => item.id === Number(id)) || null);
  }

  function saveProperty(payload, id) {
    const state = load();
    if (id) {
      const index = state.properties.findIndex((item) => item.id === Number(id));
      if (index === -1) throw new Error('Property not found.');
      state.properties[index] = { ...state.properties[index], ...payload, id: Number(id) };
      save(state);
      return clone(state.properties[index]);
    }

    const nextId = state.properties.length ? Math.max(...state.properties.map((item) => item.id)) + 1 : 1;
    const item = {
      ...payload,
      id: nextId,
      property_code: payload.property_code || `HPT-${String(nextId).padStart(3, '0')}`,
      tax_amount: Number(payload.tax_amount),
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      created_at: new Date().toISOString()
    };
    state.properties.unshift(item);
    save(state);
    return clone(item);
  }

  function deleteProperty(id) {
    const state = load();
    const numberId = Number(id);
    const index = state.properties.findIndex((item) => item.id === numberId);
    if (index === -1) throw new Error('Property not found.');
    state.properties.splice(index, 1);
    state.payments = state.payments.filter((item) => item.property_id !== numberId);
    save(state);
  }

  function getTaxes() {
    const state = load();
    return state.properties.map((property) => {
      const payment = [...state.payments].reverse().find((item) => item.property_id === property.id);
      return {
        ...property,
        payment_amount: payment ? payment.amount : null,
        payment_date: payment ? payment.payment_date : null
      };
    });
  }

  function recordPayment(propertyId, amount, paymentDate) {
    const state = load();
    const id = Number(propertyId);
    const property = state.properties.find((item) => item.id === id);
    if (!property) throw new Error('Property not found.');
    property.tax_status = 'Paid';
    const nextId = state.payments.length ? Math.max(...state.payments.map((item) => item.id)) + 1 : 1;
    state.payments.push({ id: nextId, property_id: id, amount: Number(amount), payment_date: paymentDate, status: 'Paid' });
    save(state);
  }

  window.HargeisaDemo = {
    enabled: location.hostname.endsWith('.vercel.app'),
    getStats,
    getProperties,
    getProperty,
    saveProperty,
    deleteProperty,
    getTaxes,
    recordPayment
  };
})();
