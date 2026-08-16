-- Create the main database for the Hargeisa Property Tax project.
CREATE DATABASE IF NOT EXISTS hargeisa_property_tax;
USE hargeisa_property_tax;

-- Create the users table for admin login.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the properties table for all property records.
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_code VARCHAR(50) NOT NULL UNIQUE,
  owner_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  district VARCHAR(100) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  tax_status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the tax_payments table for payment history.
CREATE TABLE IF NOT EXISTS tax_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Add a default admin user.
INSERT INTO users (username, password) VALUES ('admin', '$2b$10$YCz2U0fbtZ4G9dutPS4HKOpfI1uGgTepd8K684/fKz5wEeIrMIfmO');
-- Password is: admin123

-- Demo property data for Hargeisa.
-- These are sample records for testing the dashboard, reports, and map.
INSERT INTO properties (property_code, owner_name, phone, district, property_type, tax_amount, tax_status, latitude, longitude)
VALUES
('HPT-001', 'Ahmed Ali', '252-61-111111', '26 June', 'House', 100.00, 'Paid', 9.5600, 44.0400),
('HPT-002', 'Nimco Yusuf', '252-61-222222', 'Ahmed Dhagah', 'Shop', 150.00, 'Unpaid', 9.5650, 44.0520),
('HPT-003', 'Mohamed Mooge', '252-61-333333', 'Gacan Libaax', 'Office', 200.00, 'Paid', 9.5700, 44.0600),
('HPT-004', 'Abdi Hassan', '252-61-444444', 'Ibrahim Koodbuur', 'Land', 120.00, 'Unpaid', 9.5500, 44.0470),
('HPT-005', 'Maryam Farah', '252-61-555555', 'Wadajir', 'House', 170.00, 'Paid', 9.5300, 44.0750),
('HPT-006', 'Ali Ismail', '252-61-666666', 'Mohamed Mooge', 'Shop', 140.00, 'Unpaid', 9.5400, 44.0850),
('HPT-007', 'Muna Abdi', '252-61-777777', 'Hargeisa', 'Office', 220.00, 'Paid', 9.5780, 44.0330),
('HPT-008', 'Khadija Mohamud', '252-61-888888', 'Ibrahim Koodbuur', 'House', 130.00, 'Unpaid', 9.5405, 44.0565);

-- Add a few sample payment records.
INSERT INTO tax_payments (property_id, amount, payment_date, status)
VALUES
(1, 100.00, '2026-08-01', 'Paid'),
(3, 200.00, '2026-08-03', 'Paid'),
(5, 170.00, '2026-08-05', 'Paid'),
(7, 220.00, '2026-08-07', 'Paid');

-- Display a simple confirmation message after import.
SELECT 'Hargeisa property tax database created successfully.' AS message;
