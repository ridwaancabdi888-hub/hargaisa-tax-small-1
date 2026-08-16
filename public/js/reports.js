// This script loads simple dashboard-style report data for the reports page.
const reportTotal = document.getElementById('reportTotal');
const reportPaid = document.getElementById('reportPaid');
const reportUnpaid = document.getElementById('reportUnpaid');
const reportCollected = document.getElementById('reportCollected');
const reportTableBody = document.getElementById('reportTableBody');
const logoutBtn = document.getElementById('logoutBtn');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function getStatusBadge(status) {
  const safeStatus = status || 'Unpaid';
  const paid = safeStatus === 'Paid';
  return `<span class="status-badge ${paid ? 'paid' : 'unpaid'}">${safeStatus}</span>`;
}

function checkLogin() {
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  if (!user) {
    window.location.href = 'index.html';
  }
}

async function loadReports() {
  try {
    const response = await fetch('/api/reports');
    const data = await response.json();

    reportTotal.textContent = data.stats.totalProperties;
    reportPaid.textContent = data.stats.paidProperties;
    reportUnpaid.textContent = data.stats.unpaidProperties;
    reportCollected.textContent = formatCurrency(data.stats.totalTaxCollected);

    reportTableBody.innerHTML = '';

    if (!data.properties.length) {
      reportTableBody.innerHTML = '<tr><td colspan="6">No property records available.</td></tr>';
      return;
    }

    data.properties.forEach((property) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${property.property_code}</td>
        <td>${property.owner_name}</td>
        <td>${property.district}</td>
        <td>${property.property_type}</td>
        <td>$${Number(property.tax_amount).toFixed(2)}</td>
        <td>${getStatusBadge(property.tax_status)}</td>
      `;
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
