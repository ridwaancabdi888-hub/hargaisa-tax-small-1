// This script loads simple dashboard-style report data for the reports page.
const reportTotal = document.getElementById('reportTotal');
const reportPaid = document.getElementById('reportPaid');
const reportUnpaid = document.getElementById('reportUnpaid');
const reportCollected = document.getElementById('reportCollected');
const reportTableBody = document.getElementById('reportTableBody');
const logoutBtn = document.getElementById('logoutBtn');
const { fetchJson } = window.HargeisaApi;
const { appendTextCell, appendStatusCell, appendEmptyRow } = window.HargeisaTable;

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function checkLogin() {
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  if (!user) window.location.href = 'index.html';
}

async function loadReports() {
  try {
    const data = window.HargeisaDemo?.enabled
      ? { stats: window.HargeisaDemo.getStats(), properties: window.HargeisaDemo.getProperties() }
      : await fetchJson('/api/reports');

    reportTotal.textContent = data.stats.totalProperties;
    reportPaid.textContent = data.stats.paidProperties;
    reportUnpaid.textContent = data.stats.unpaidProperties;
    reportCollected.textContent = formatCurrency(data.stats.totalTaxCollected);

    reportTableBody.replaceChildren();
    if (!data.properties.length) {
      appendEmptyRow(reportTableBody, 6, 'No property records available.');
      return;
    }

    data.properties.forEach((property) => {
      const row = document.createElement('tr');
      appendTextCell(row, property.property_code);
      appendTextCell(row, property.owner_name);
      appendTextCell(row, property.district);
      appendTextCell(row, property.property_type);
      appendTextCell(row, `$${Number(property.tax_amount).toFixed(2)}`);
      appendStatusCell(row, property.tax_status);
      reportTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Reports load error:', error);
  }
}

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
});

checkLogin();
loadReports();
