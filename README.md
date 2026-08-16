# Hargeisa Property Tax Management System

This is a simple beginner-friendly property tax system for Hargeisa, Somaliland. The project is designed to help a university student explain how a basic web app works using HTML, CSS, JavaScript, Node.js, Express.js, MySQL, and Leaflet.

## Project Purpose

The system allows an administrator to:
- log in
- view dashboard statistics
- add properties
- edit properties
- delete properties
- search properties
- record tax payments
- view a simple GIS map
- view simple reports

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Express.js
- MySQL from XAMPP
- Leaflet.js

## Requirements

Before running the project, make sure these are available:
- Node.js 18 or newer
- npm
- XAMPP with MySQL running
- A modern web browser

## Project Structure

- public/ - HTML pages and frontend JavaScript files
- routes/ - API routes for login, dashboard, properties, and taxes
- config/ - database connection file
- database/ - SQL file for creating tables and demo data
- server.js - main server file
- .env - local environment file
- .env.example - example environment file

## Start XAMPP

1. Open XAMPP Control Panel.
2. Start MySQL.
3. If needed, start Apache too.

## Start MySQL

MySQL is included with XAMPP. Use the MySQL server from XAMPP and keep the default root user with an empty password unless your local setup is different.

## Database Name

The project database is:

hargeisa_property_tax

## Import the Database

From the project folder, run:

```bash
Get-Content "database\database.sql" | "C:\xampp\mysql\bin\mysql.exe" -u root
```

This will create the database, tables, admin user, and demo data.

## Environment Variables

Copy `.env.example` to `.env` and update the values only if your local setup is different. The default MySQL port is `3306` and the app runs on port `3000`.

## Install Project Dependencies

```bash
npm install
```

## Run the Project

```bash
node server.js
```

Then open:

http://localhost:3000

## Default Admin Login

- Username: admin
- Password: admin123

## Main Project Pages

- Login page
- Dashboard
- Properties
- Tax Management
- GIS Map
- Reports

## How Leaflet GIS Works

The GIS map uses Leaflet.js and OpenStreetMap tiles. Property coordinates are pulled from MySQL through the Node.js API. Each marker is colored green for Paid and red for Unpaid.

## Main API Routes

- POST /api/login
- GET /api/dashboard
- GET /api/properties
- POST /api/properties
- PUT /api/properties/:id
- DELETE /api/properties/:id
- GET /api/taxes
- POST /api/taxes/pay
- GET /api/reports

## Simple Data Flow

User → HTML → JavaScript → Node.js/Express → MySQL → Node.js → JavaScript → User

## Notes

This project is intentionally simple and easy to explain during a university presentation. It focuses on property registration, tax status, MySQL storage, and GIS mapping.
