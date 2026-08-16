// This script loads property coordinates from the backend and places markers on the map.
const map = L.map('map').setView([9.5600, 44.0520], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function createPopupText(property) {
  return `
    <b>Property ID:</b> ${property.property_code}<br>
    <b>Owner:</b> ${property.owner_name}<br>
    <b>District:</b> ${property.district}<br>
    <b>Type:</b> ${property.property_type}<br>
    <b>Tax Amount:</b> $${Number(property.tax_amount).toFixed(2)}<br>
    <b>Status:</b> ${property.tax_status}<br>
  `;
}

async function loadMapProperties() {
  try {
    const response = await fetch('/api/properties');
    const properties = await response.json();

    properties.forEach((property) => {
      const color = property.tax_status === 'Paid' ? 'green' : 'red';
      const marker = L.marker([property.latitude, property.longitude]).addTo(map);
      marker.bindPopup(createPopupText(property));

      const circle = L.circleMarker([property.latitude, property.longitude], {
        radius: 10,
        color: color,
        fillColor: color,
        fillOpacity: 0.9
      }).addTo(map);

      circle.bindPopup(createPopupText(property));
    });
  } catch (error) {
    console.error('Map data error:', error);
  }
}

function checkLogin() {
  const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
  if (!user) {
    window.location.href = 'index.html';
  }
}

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
});

checkLogin();
loadMapProperties();
