// This script loads tax records and records new payments.
const propertySelect = document.getElementById('propertySelect');
const paymentForm = document.getElementById('paymentForm');
const taxTableBody = document.getElementById('taxTableBody');
const logoutBtn = document.getElementById('logoutBtn');
const paymentMessage = document.getElementById('paymentMessage');

function showMessage(message, type = 'success') {
  paymentMessage.textContent = message;
  paymentMessage.className = `form-message ${type}`;
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

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
});

async function loadPropertiesForPayment() {
  try {
    const response = await fetch('/api/properties');
    const data = await response.json();

    propertySelect.innerHTML = '<option value="">Select property</option>';

    data.forEach((property) => {
      const option = document.createElement('option');
      option.value = property.id;
      option.textContent = `${property.property_code} - ${property.owner_name}`;
      propertySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Property select load error:', error);
    showMessage('Unable to load properties.', 'error');
  }
}

async function loadTaxRecords() {
  try {
    const response = await fetch('/api/taxes');
    const data = await response.json();

    taxTableBody.innerHTML = '';

    if (!data.length) {
      taxTableBody.innerHTML = '<tr><td colspan="5">No tax records yet.</td></tr>';
      return;
    }

    data.forEach((row) => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
        <td>${row.property_code}</td>
        <td>${row.owner_name}</td>
        <td>$${Number(row.tax_amount).toFixed(2)}</td>
        <td>${getStatusBadge(row.tax_status || 'Unpaid')}</td>
        <td>${row.payment_date ? new Date(row.payment_date).toLocaleDateString() : 'Not paid'}</td>
      `;
      taxTableBody.appendChild(tableRow);
    });
  } catch (error) {
    console.error('Tax record load error:', error);
    showMessage('Unable to load tax records.', 'error');
  }
}

paymentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const propertyId = propertySelect.value;
  const amount = document.getElementById('paymentAmount').value;
  const paymentDate = document.getElementById('paymentDate').value;

  if (!propertyId || !amount || !paymentDate) {
    showMessage('Please select property, amount and payment date.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/taxes/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, amount, payment_date: paymentDate })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Unable to record payment.', 'error');
      return;
    }

    showMessage('Payment recorded successfully.', 'success');
    paymentForm.reset();
    loadTaxRecords();
    loadPropertiesForPayment();
  } catch (error) {
    console.error('Payment submit error:', error);
    showMessage('Unable to record payment.', 'error');
  }
});

checkLogin();
loadPropertiesForPayment();
loadTaxRecords();
