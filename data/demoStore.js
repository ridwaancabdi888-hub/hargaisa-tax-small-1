// ============================================
// Demo Data Store for Vercel
// Keeps the deployed demo usable without local XAMPP/MySQL.
// Local development still uses the real MySQL database.
// ============================================

const properties = [
  { id: 1, property_code: 'HPT-001', owner_name: 'Ahmed Ali', phone: '063000001', district: '26 June', property_type: 'House', tax_amount: 100, tax_status: 'Paid', latitude: 9.5624, longitude: 44.0770, created_at: '2026-08-01' },
  { id: 2, property_code: 'HPT-002', owner_name: 'Nimco Yusuf', phone: '063000002', district: 'Ahmed Dhagah', property_type: 'Shop', tax_amount: 150, tax_status: 'Unpaid', latitude: 9.5578, longitude: 44.0647, created_at: '2026-08-02' },
  { id: 3, property_code: 'HPT-003', owner_name: 'Mohamed Mooge', phone: '063000003', district: 'Gacan Libaax', property_type: 'Office', tax_amount: 200, tax_status: 'Paid', latitude: 9.5681, longitude: 44.0833, created_at: '2026-08-03' },
  { id: 4, property_code: 'HPT-004', owner_name: 'Abdi Hassan', phone: '063000004', district: 'Ibrahim Koodbuur', property_type: 'Land', tax_amount: 120, tax_status: 'Unpaid', latitude: 9.5750, longitude: 44.0538, created_at: '2026-08-04' },
  { id: 5, property_code: 'HPT-005', owner_name: 'Maryam Farah', phone: '063000005', district: 'Mohamed Mooge', property_type: 'House', tax_amount: 170, tax_status: 'Paid', latitude: 9.5489, longitude: 44.0739, created_at: '2026-08-05' },
  { id: 6, property_code: 'HPT-006', owner_name: 'Hodan Jama', phone: '063000006', district: '26 June', property_type: 'Shop', tax_amount: 140, tax_status: 'Unpaid', latitude: 9.5647, longitude: 44.0910, created_at: '2026-08-06' },
  { id: 7, property_code: 'HPT-007', owner_name: 'Yasin Omar', phone: '063000007', district: 'Gacan Libaax', property_type: 'Office', tax_amount: 220, tax_status: 'Paid', latitude: 9.5527, longitude: 44.0865, created_at: '2026-08-07' },
  { id: 8, property_code: 'HPT-008', owner_name: 'Asha Ibrahim', phone: '063000008', district: 'Ahmed Dhagah', property_type: 'Land', tax_amount: 130, tax_status: 'Unpaid', latitude: 9.5707, longitude: 44.0701, created_at: '2026-08-08' }
];

const payments = [
  { id: 1, property_id: 1, amount: 100, payment_date: '2026-08-01', status: 'Paid' },
  { id: 2, property_id: 3, amount: 200, payment_date: '2026-08-03', status: 'Paid' },
  { id: 3, property_id: 5, amount: 170, payment_date: '2026-08-05', status: 'Paid' },
  { id: 4, property_id: 7, amount: 220, payment_date: '2026-08-07', status: 'Paid' }
];

function getStats() {
  const paid = properties.filter((property) => property.tax_status === 'Paid');
  return {
    totalProperties: properties.length,
    paidProperties: paid.length,
    unpaidProperties: properties.filter((property) => property.tax_status === 'Unpaid').length,
    totalTaxCollected: paid.reduce((total, property) => total + Number(property.tax_amount || 0), 0)
  };
}

module.exports = { properties, payments, getStats };
