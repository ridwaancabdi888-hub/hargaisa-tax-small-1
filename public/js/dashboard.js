// ============================================
// Dashboard Page Script
// Loads and displays dashboard statistics
// ============================================

// Get HTML elements where we will display the statistics
const totalPropertiesEl = document.getElementById('totalProperties');
const paidPropertiesEl = document.getElementById('paidProperties');
const unpaidPropertiesEl = document.getElementById('unpaidProperties');
const totalTaxCollectedEl = document.getElementById('totalTaxCollected');
const currentUserEl = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

// Format a number as US currency (e.g., 1000 becomes $1,000.00)
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

// Fetch dashboard statistics from the backend API
async function loadDashboard() {
  try {
    // Call /api/dashboard to get statistics from the database
    const response = await fetch('/api/dashboard');
    const data = await response.json();

    // Display the statistics on the page
    totalPropertiesEl.textContent = data.totalProperties || 0;
    paidPropertiesEl.textContent = data.paidProperties || 0;
    unpaidPropertiesEl.textContent = data.unpaidProperties || 0;
    totalTaxCollectedEl.textContent = formatCurrency(data.totalTaxCollected || 0);
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

// Check if the user is logged in
// If not, redirect them back to the login page
function checkLogin() {
  // Get the stored user information from localStorage
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  if (!user) {
    // User not logged in, redirect to login page
    window.location.href = 'index.html';
    return;
  }

  // Display the logged-in username
  currentUserEl.textContent = `Welcome, ${user.username}`;
}

// When the user clicks the Logout button
logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  // Remove the user from localStorage
  localStorage.removeItem('adminUser');
  // Redirect to login page
  window.location.href = 'index.html';
});

// Run these functions when the page loads
checkLogin();
loadDashboard();
