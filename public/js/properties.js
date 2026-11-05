// This script loads property records and allows adding, editing and deleting them.
const propertyForm = document.getElementById('propertyForm');
const tableBody = document.getElementById('propertyTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const resetBtn = document.getElementById('resetBtn');
const logoutBtn = document.getElementById('logoutBtn');
const propertyMessage = document.getElementById('propertyMessage');
const propertyIdInput = document.getElementById('propertyId');
const formCard = document.getElementById('propertyFormCard');
const formTitle = document.getElementById('propertyFormTitle');
const editNotice = document.getElementById('editNotice');
const saveBtn = document.getElementById('saveBtn');
const { fetchJson } = window.HargeisaApi;
const { appendTextCell, appendStatusCell, appendActionCell, appendEmptyRow } = window.HargeisaTable;

function showMessage(message, type = 'success') {
  propertyMessage.textContent = message;
  propertyMessage.className = `form-message ${type}`;
}

// Keep the form heading, buttons and highlight in sync with add vs. edit mode
// so users always know whether saving will create or overwrite a record.
function setEditMode(property) {
  const editing = Boolean(property);
  const label = editing ? property.property_code || `#${property.id}` : '';
  formCard.classList.toggle('is-editing', editing);
  formTitle.textContent = editing ? `Edit Property ${label}` : 'Add Property';
  editNotice.hidden = !editing;
  editNotice.textContent = editing
    ? `You are editing ${label} (${property.owner_name}). Saving will update this record.`
    : '';
  saveBtn.textContent = editing ? 'Update Property' : 'Save Property';
  resetBtn.textContent = editing ? 'Cancel Edit' : 'Reset';
}

function exitEditMode() {
  propertyForm.reset();
  propertyIdInput.value = '';
  setEditMode(null);
}

function validatePropertyForm(payload) {
  if (!payload.owner_name || !payload.owner_name.trim()) return 'Owner Name cannot be empty.';
  if (!payload.phone || !payload.phone.trim()) return 'Phone Number cannot be empty.';
  if (!payload.district || !payload.district.trim()) return 'District cannot be empty.';
  if (!payload.property_type) return 'Please select a property type.';
  if (!payload.tax_amount || Number(payload.tax_amount) <= 0 || Number.isNaN(Number(payload.tax_amount))) return 'Tax Amount must be a valid positive number.';
  if (!['Paid', 'Unpaid'].includes(payload.tax_status)) return 'Tax Status must be Paid or Unpaid.';
  if (Number.isNaN(Number(payload.latitude))) return 'Latitude must be a valid number.';
  if (Number.isNaN(Number(payload.longitude))) return 'Longitude must be a valid number.';
  return null;
}

function checkLogin() {
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  if (!user) window.location.href = 'index.html';
}

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
});

async function getPropertyRows(search = '') {
  if (window.HargeisaDemo?.enabled) return window.HargeisaDemo.getProperties(search);
  return fetchJson(`/api/properties?search=${encodeURIComponent(search)}`);
}

async function loadProperties(search = '', status = 'All') {
  try {
    const data = await getPropertyRows(search);
    tableBody.replaceChildren();

    const filteredData = data.filter((property) => status === 'All' || property.tax_status === status);
    if (!filteredData.length) {
      appendEmptyRow(tableBody, 11, 'No properties found.');
      return;
    }

    filteredData.forEach((property) => {
      const row = document.createElement('tr');
      appendTextCell(row, property.property_code);
      appendTextCell(row, property.owner_name);
      appendTextCell(row, property.phone);
      appendTextCell(row, property.district);
      appendTextCell(row, property.property_type);
      appendTextCell(row, `$${Number(property.tax_amount).toFixed(2)}`);
      appendStatusCell(row, property.tax_status);
      appendTextCell(row, property.latitude);
      appendTextCell(row, property.longitude);
      appendTextCell(row, new Date(property.created_at).toLocaleDateString());
      const rowLabel = `${property.property_code || `property ${property.id}`} (${property.owner_name})`;
      appendActionCell(row, property.id, [
        { action: 'edit', label: 'Edit', accessibleLabel: `Edit ${rowLabel}` },
        { action: 'delete', label: 'Delete', accessibleLabel: `Delete ${rowLabel}` }
      ]);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Load properties error:', error);
    showMessage('Unable to load properties.', 'error');
  }
}

propertyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const propertyId = propertyIdInput.value;
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
  if (validationError) return showMessage(validationError, 'error');

  try {
    if (window.HargeisaDemo?.enabled) {
      window.HargeisaDemo.saveProperty(payload, propertyId || null);
    } else {
      await fetchJson(propertyId ? `/api/properties/${propertyId}` : '/api/properties', {
        method: propertyId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    exitEditMode();
    showMessage(propertyId ? 'Property updated successfully.' : 'Property added successfully.', 'success');
    loadProperties(searchInput.value, statusFilter.value);
  } catch (error) {
    console.error('Save property error:', error);
    showMessage(error.message || 'Unable to save property.', 'error');
  }
});

searchInput.addEventListener('input', (event) => loadProperties(event.target.value, statusFilter.value));
statusFilter.addEventListener('change', (event) => loadProperties(searchInput.value, event.target.value));

tableBody.addEventListener('click', async (event) => {
  const target = event.target;
  if (!target.dataset.action) return;
  const propertyId = target.dataset.id;

  if (target.dataset.action === 'delete') {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      if (window.HargeisaDemo?.enabled) {
        window.HargeisaDemo.deleteProperty(propertyId);
      } else {
        await fetchJson(`/api/properties/${propertyId}`, { method: 'DELETE' });
      }
      // Deleting the record that is open in the form must not leave a stale
      // edit target behind, otherwise the next save would update a missing row.
      const deletedActiveRecord = propertyIdInput.value === String(propertyId);
      if (deletedActiveRecord) exitEditMode();
      showMessage(
        deletedActiveRecord ? 'Property deleted. The edit form has been cleared.' : 'Property deleted successfully.',
        'success'
      );
      loadProperties(searchInput.value, statusFilter.value);
    } catch (error) {
      console.error('Delete property error:', error);
      showMessage(error.message || 'Unable to delete property.', 'error');
    }
  }

  if (target.dataset.action === 'edit') {
    try {
      const property = window.HargeisaDemo?.enabled
        ? window.HargeisaDemo.getProperty(propertyId)
        : await fetchJson(`/api/properties/${propertyId}`);
      if (!property) throw new Error('Property not found.');

      propertyIdInput.value = property.id;
      document.getElementById('propertyCode').value = property.property_code;
      document.getElementById('ownerName').value = property.owner_name;
      document.getElementById('phone').value = property.phone;
      document.getElementById('district').value = property.district;
      document.getElementById('propertyType').value = property.property_type;
      document.getElementById('taxAmount').value = property.tax_amount;
      document.getElementById('taxStatus').value = property.tax_status;
      document.getElementById('latitude').value = property.latitude;
      document.getElementById('longitude').value = property.longitude;
      setEditMode(property);
      propertyMessage.className = 'form-message';
      propertyMessage.textContent = '';
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      formCard.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      document.getElementById('ownerName').focus({ preventScroll: true });
    } catch (error) {
      console.error('Edit property error:', error);
      showMessage(error.message || 'Unable to load property for editing.', 'error');
    }
  }
});

resetBtn.addEventListener('click', () => {
  const wasEditing = Boolean(propertyIdInput.value);
  exitEditMode();
  showMessage(wasEditing ? 'Edit cancelled. No changes were saved.' : 'Form reset.', 'success');
});

checkLogin();
loadProperties();
