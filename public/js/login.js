// ============================================
// Login Page Script
// Handles the login form submission and authentication
// ============================================

const loginForm = document.getElementById('loginForm');
const messageBox = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    messageBox.textContent = 'Please enter both username and password.';
    messageBox.style.color = 'red';
    return;
  }

  try {
    let user;

    // The Vercel deployment is a browser-based university demo.
    // Local development still authenticates against MySQL through Node.js.
    if (location.hostname.endsWith('.vercel.app')) {
      if (username !== 'ridwan' || password !== '123') {
        messageBox.textContent = 'Invalid username or password.';
        messageBox.style.color = 'red';
        return;
      }
      user = { id: 1, username: 'ridwan' };
    } else {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        messageBox.textContent = data.message || 'Login failed.';
        messageBox.style.color = 'red';
        return;
      }
      user = data.user;
    }

    localStorage.setItem('adminUser', JSON.stringify(user));
    messageBox.textContent = 'Login successful. Redirecting...';
    messageBox.style.color = 'green';

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 300);
  } catch (error) {
    messageBox.textContent = 'Could not connect to the server.';
    messageBox.style.color = 'red';
  }
});
