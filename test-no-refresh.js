// Test script to verify pages don't auto-refresh
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, hasRefresh: data.includes('meta http-equiv="refresh"'), hasReload: data.includes('location.reload()'), length: data.length });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testPages() {
  console.log('=== TESTING ALL PAGES FOR AUTO-REFRESH ===\n');

  const pages = [
    { path: '/', name: 'Login Page' },
    { path: '/dashboard.html', name: 'Dashboard' },
    { path: '/properties.html', name: 'Properties' },
    { path: '/tax.html', name: 'Tax Management' },
    { path: '/map.html', name: 'GIS Map' },
    { path: '/reports.html', name: 'Reports' }
  ];

  let allGood = true;

  for (const page of pages) {
    try {
      const result = await makeRequest(page.path);
      console.log(`✓ ${page.name} (${page.path})`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Size: ${result.length} bytes`);
      
      if (result.hasRefresh) {
        console.log(`  ⚠ Found: <meta http-equiv="refresh">`);
        allGood = false;
      }
      if (result.hasReload) {
        console.log(`  ⚠ Found: location.reload()`);
        allGood = false;
      }
      
      if (!result.hasRefresh && !result.hasReload) {
        console.log(`  ✓ No auto-refresh detected`);
      }
      console.log('');
    } catch (error) {
      console.log(`✗ ${page.name}: ${error.message}\n`);
      allGood = false;
    }
  }

  console.log('=== TEST COMPLETE ===');
  if (allGood) {
    console.log('✓ All pages are clean - NO continuous refresh detected!');
  } else {
    console.log('✗ Some issues found - see above');
  }
  
  process.exit(allGood ? 0 : 1);
}

testPages();
