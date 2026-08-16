// ============================================
// Dashboard Page Script
// Loads and displays dashboard statistics
// ============================================

const totalPropertiesEl = document.getElementById('totalProperties');
const paidPropertiesEl = document.getElementById('paidProperties');
const unpaidPropertiesEl = document.getElementById('unpaidProperties');
const totalTaxCollectedEl = document.getElementById('totalTaxCollected');
const currentUserEl = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

async function loadDashboard() {
  try {
    const data = window.HargeisaDemo?.enabled
      ? window.HargeisaDemo.getStats()
      : await (await fetch('/api/dashboard')).json();

    totalPropertiesEl.textContent = data.totalProperties || 0;
    paidPropertiesEl.textContent = data.paidProperties || 0;
    unpaidPropertiesEl.textContent = data.unpaidProperties || 0;
    totalTaxCollectedEl.textContent = formatCurrency(data.totalTaxCollected || 0);
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

function checkLogin() {
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUserEl.textContent = `Welcome, ${user.username}`;
}

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
});

checkLogin();
loadDashboard();
