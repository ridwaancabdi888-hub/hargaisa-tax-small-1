// This script loads property records and allows adding, editing and deleting them.
const propertyForm = document.getElementById('propertyForm');
const tableBody = document.getElementById('propertyTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const resetBtn = document.getElementById('resetBtn');
const logoutBtn = document.getElementById('logoutBtn');
const propertyMessage = document.getElementById('propertyMessage');

function showMessage(message, type = 'success') {
  propertyMessage.textContent = message;
  propertyMessage.className = `form-message ${type}`;
}

function validatePropertyForm(payload) {
  if (!payload.owner_name || !payload.owner_name.trim()) {
    return 'Owner Name cannot be empty.';
  }

  if (!payload.phone || !payload.phone.trim()) {
    return 'Phone Number cannot be empty.';
  }

  if (!payload.district || !payload.district.trim()) {
    return 'District cannot be empty.';
  }

  if (!payload.property_type) {
    return 'Please select a property type.';
  }

  if (!payload.tax_amount || Number(payload.tax_amount) <= 0 || Number.isNaN(Number(payload.tax_amount))) {
    return 'Tax Amount must be a valid positive number.';
  }

  if (!['Paid', 'Unpaid'].includes(payload.tax_status)) {
    return 'Tax Status must be Paid or Unpaid.';
  }

  if (!payload.latitude || Number.isNaN(Number(payload.latitude))) {
    return 'Latitude must be a valid number.';
  }

  if (!payload.longitude || Number.isNaN(Number(payload.longitude))) {
    return 'Longitude must be a valid number.';
  }

  return null;
}

function getStatusBadge(status) {
  const safeStatus = status || 'Unpaid';
  const isPaid = safeStatus === 'Paid';
  return `<span class="status-badge ${isPaid ? 'paid' : 'unpaid'}">${safeStatus}</span>`;
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

async function loadProperties(search = '', status = 'All') {
  try {
    const response = await fetch(`/api/properties?search=${encodeURIComponent(search)}`);
    const data = await response.json();

    tableBody.innerHTML = '';

    const filteredData = data.filter((property) => {
      if (status === 'All') return true;
      return property.tax_status === status;
    });

    if (!filteredData.length) {
      tableBody.innerHTML = '<tr><td colspan="11">No properties found.</td></tr>';
      return;
    }

    filteredData.forEach((property) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${property.property_code}</td>
        <td>${property.owner_name}</td>
        <td>${property.phone}</td>
        <td>${property.district}</td>
        <td>${property.property_type}</td>
        <td>$${Number(property.tax_amount).toFixed(2)}</td>
        <td>${getStatusBadge(property.tax_status)}</td>
        <td>${property.latitude}</td>
        <td>${property.longitude}</td>
        <td>${new Date(property.created_at).toLocaleDateString()}</td>
        <td>
          <button class="action-btn" data-action="edit" data-id="${property.id}">Edit</button>
          <button class="action-btn" data-action="delete" data-id="${property.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Load properties error:', error);
    showMessage('Unable to load properties.', 'error');
  }
}

propertyForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const propertyId = document.getElementById('propertyId').value;
  const payload = {
    property_code: document.getElementById('propertyCode').value.trim(),
    owner_name: document.getElementById('ownerName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    district: document.getElementById('district').value.trim(),
    property_type: document.getElementById('propertyType').value,
    tax_amount: Number(document.getElementById('taxAmount').value),
    tax_status: document.getElementById('taxStatus').value,
    latitude: Number(document.getElementById('latitude').value),
    longitude: Number(document.getElementById('longitude').value)
  };

  const validationError = validatePropertyForm(payload);
  if (validationError) {
    showMessage(validationError, 'error');
    return;
  }

  try {
    const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
    const method = propertyId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Could not save property.', 'error');
      return;
    }

    const successMessage = propertyId ? 'Property updated successfully.' : 'Property added successfully.';
    propertyForm.reset();
    document.getElementById('propertyId').value = '';
    showMessage(successMessage, 'success');
    loadProperties(searchInput.value, statusFilter.value);
  } catch (error) {
    console.error('Save property error:', error);
    showMessage('Unable to save property.', 'error');
  }
});

searchInput.addEventListener('input', (event) => {
  loadProperties(event.target.value, statusFilter.value);
});

statusFilter.addEventListener('change', (event) => {
  loadProperties(searchInput.value, event.target.value);
});

tableBody.addEventListener('click', async (event) => {
  const target = event.target;
  if (!target.dataset.action) return;

  const propertyId = target.dataset.id;

  if (target.dataset.action === 'delete') {
    // Ask the user before deleting a property.
    const confirmed = window.confirm('Are you sure you want to delete this property?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        showMessage(data.message || 'Property could not be deleted.', 'error');
        return;
      }
      showMessage('Property deleted successfully.', 'success');
      loadProperties(searchInput.value, statusFilter.value);
    } catch (error) {
      console.error('Delete property error:', error);
      showMessage('Unable to delete property.', 'error');
    }
  }

  if (target.dataset.action === 'edit') {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const property = await response.json();

      document.getElementById('propertyId').value = property.id;
      document.getElementById('propertyCode').value = property.property_code;
      document.getElementById('ownerName').value = property.owner_name;
      document.getElementById('phone').value = property.phone;
      document.getElementById('district').value = property.district;
      document.getElementById('propertyType').value = property.property_type;
      document.getElementById('taxAmount').value = property.tax_amount;
      document.getElementById('taxStatus').value = property.tax_status;
      document.getElementById('latitude').value = property.latitude;
      document.getElementById('longitude').value = property.longitude;
      showMessage('Edit the property details and save.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Edit property error:', error);
      showMessage('Unable to load property for editing.', 'error');
    }
  }
});

resetBtn.addEventListener('click', () => {
  propertyForm.reset();
  document.getElementById('propertyId').value = '';
  showMessage('Form reset.', 'success');
});

checkLogin();
loadProperties();
