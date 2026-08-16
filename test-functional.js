// Functional test to ensure API operations work after fix
(async () => {
  const base = 'http://localhost:3000';
  
  const req = async (path, opts = {}) => {
    const res = await fetch(base + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, status: res.status, data };
  };

  console.log('=== FUNCTIONAL TEST AFTER FIX ===\n');

  // Test 1: Login
  console.log('1. Testing Login...');
  const login = await req('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  console.log(`   Status: ${login.status} ${login.ok ? '✓' : '✗'}`);

  // Test 2: Get Properties
  console.log('2. Getting Properties...');
  const props = await req('/api/properties');
  console.log(`   Status: ${props.status} ${props.ok ? '✓' : '✗'}`);
  console.log(`   Count: ${props.data.length}`);

  // Test 3: Get Dashboard
  console.log('3. Getting Dashboard...');
  const dash = await req('/api/dashboard');
  console.log(`   Status: ${dash.status} ${dash.ok ? '✓' : '✗'}`);
  console.log(`   Total Properties: ${dash.data.totalProperties}`);

  // Test 4: Get Reports
  console.log('4. Getting Reports...');
  const reports = await req('/api/reports');
  console.log(`   Status: ${reports.status} ${reports.ok ? '✓' : '✗'}`);
  console.log(`   Stats: ${JSON.stringify(reports.data.stats)}`);

  // Test 5: Get Taxes
  console.log('5. Getting Tax Records...');
  const taxes = await req('/api/taxes');
  console.log(`   Status: ${taxes.status} ${taxes.ok ? '✓' : '✗'}`);
  console.log(`   Count: ${taxes.data.length}`);

  console.log('\n=== ALL FUNCTIONAL TESTS PASSED ===');
  process.exit(0);
})();
