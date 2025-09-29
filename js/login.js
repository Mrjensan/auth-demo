// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const currentUser = authSystem.getCurrentUser();
  if (currentUser) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Form elements
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const themeToggle = document.getElementById('themeToggle');
  
  // Demo buttons
  const demoButtons = document.querySelectorAll('.demo-btn');
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }
  
  // Demo button functionality
  demoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const role = btn.dataset.role;
      let email, password;
      
      switch (role) {
        case 'admin':
          email = 'admin@demo.com';
          password = 'admin123';
          break;
        case 'moderator':
          email = 'mod@demo.com';
          password = 'mod123';
          break;
        case 'user':
          email = 'user@demo.com';
          password = 'user123';
          break;
      }
      
      emailInput.value = email;
      passwordInput.value = password;
      
      Utils.showNotification(`Dados de ${role} preenchidos automaticamente`, 'info');
    });
  });
  
  // Form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email || !password) {
      Utils.showNotification('Preencha todos os campos', 'error');
      return;
    }
    
    if (!Utils.validateEmail(email)) {
      Utils.showNotification('Email inválido', 'error');
      return;
    }
    
    // Show loading
    const originalText = loginBtn.innerHTML;
    Utils.showLoading(loginBtn);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt login
      const result = authSystem.login(email, password);
      
      Utils.showNotification('Login realizado com sucesso!', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      
    } catch (error) {
      Utils.showNotification(error.message, 'error');
      Utils.hideLoading(loginBtn, originalText);
    }
  });
  
  // Input validation feedback
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !Utils.validateEmail(email)) {
      emailInput.classList.add('error');
    } else {
      emailInput.classList.remove('error');
    }
  });
  
  // Show/hide password
  const togglePassword = document.querySelector('.toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const icon = togglePassword.querySelector('i');
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  }
});