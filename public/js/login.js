// ============================================
// Login Page Script
// Handles the login form submission and authentication
// ============================================

// Get the login form and message area from the HTML page
const loginForm = document.getElementById('loginForm');
const messageBox = document.getElementById('loginMessage');

// Listen for when the user clicks the Login button
loginForm.addEventListener('submit', async (event) => {
  // Prevent the form from submitting the default way
  event.preventDefault();

  // Get the username and password the user entered
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Check that both username and password were entered
  if (!username || !password) {
    messageBox.textContent = 'Please enter both username and password.';
    messageBox.style.color = 'red';
    return;
  }

  try {
    // Send the username and password to the backend /api/login endpoint
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    // Get the response from the server
    const data = await response.json();

    // If login failed, show error message
    if (!response.ok) {
      messageBox.textContent = data.message || 'Login failed.';
      messageBox.style.color = 'red';
      return;
    }

    // Login successful: save the user information in browser storage (localStorage)
    // This lets other pages know the user is logged in
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    messageBox.textContent = 'Login successful. Redirecting...';
    messageBox.style.color = 'green';

    // After 500 milliseconds, redirect the user to the dashboard page
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } catch (error) {
    // If the server is not responding, show an error
    messageBox.textContent = 'Could not connect to the server.';
    messageBox.style.color = 'red';
  }
});

// NOTE: The login page itself does NOT have a checkLogin() function.
// The login page should be accessible to all users (logged in or not).
// Login protection is enforced on protected pages like dashboard.html, properties.html, etc.
// Those pages check localStorage for the adminUser before allowing access.
