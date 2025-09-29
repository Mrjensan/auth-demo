// Registration page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const currentUser = authSystem.getCurrentUser();
  if (currentUser) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Form elements
  const registerForm = document.getElementById('registerForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const roleSelect = document.getElementById('role');
  const termsCheckbox = document.getElementById('terms');
  const registerBtn = document.getElementById('registerBtn');
  const themeToggle = document.getElementById('themeToggle');
  
  // Password strength elements
  const strengthMeter = document.querySelector('.strength-meter');
  const strengthBars = document.querySelectorAll('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  const strengthRequirements = document.querySelectorAll('.requirement');
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }
  
  // Password strength checker
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const validation = Utils.validatePassword(password);
    
    // Update strength meter
    strengthBars.forEach((bar, index) => {
      if (index < validation.score) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });
    
    // Update strength text
    let strengthLevel = '';
    let strengthClass = '';
    
    switch (validation.score) {
      case 0:
      case 1:
        strengthLevel = 'Muito fraca';
        strengthClass = 'very-weak';
        break;
      case 2:
        strengthLevel = 'Fraca';
        strengthClass = 'weak';
        break;
      case 3:
        strengthLevel = 'Média';
        strengthClass = 'medium';
        break;
      case 4:
        strengthLevel = 'Forte';
        strengthClass = 'strong';
        break;
      case 5:
        strengthLevel = 'Muito forte';
        strengthClass = 'very-strong';
        break;
    }
    
    strengthText.textContent = strengthLevel;
    strengthText.className = `strength-text ${strengthClass}`;
    
    // Update requirements
    strengthRequirements.forEach(req => {
      const requirement = req.dataset.requirement;
      const isValid = validation[requirement];
      
      req.classList.toggle('valid', isValid);
      const icon = req.querySelector('i');
      icon.className = isValid ? 'fas fa-check' : 'fas fa-times';
    });
    
    // Show/hide strength meter
    if (password.length > 0) {
      strengthMeter.style.display = 'block';
    } else {
      strengthMeter.style.display = 'none';
    }
  });
  
  // Confirm password validation
  confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length > 0) {
      if (password === confirmPassword) {
        confirmPasswordInput.classList.remove('error');
        confirmPasswordInput.classList.add('success');
      } else {
        confirmPasswordInput.classList.remove('success');
        confirmPasswordInput.classList.add('error');
      }
    } else {
      confirmPasswordInput.classList.remove('error', 'success');
    }
  });
  
  // Email validation
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !Utils.validateEmail(email)) {
      emailInput.classList.add('error');
    } else {
      emailInput.classList.remove('error');
    }
  });
  
  // Form submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
      role: roleSelect.value
    };
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Utils.showNotification('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    
    if (!Utils.validateEmail(formData.email)) {
      Utils.showNotification('Email inválido', 'error');
      return;
    }
    
    const passwordValidation = Utils.validatePassword(formData.password);
    if (passwordValidation.score < 3) {
      Utils.showNotification('Senha deve ser pelo menos "Média"', 'error');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Utils.showNotification('Senhas não coincidem', 'error');
      return;
    }
    
    if (!termsCheckbox.checked) {
      Utils.showNotification('Aceite os termos de uso', 'error');
      return;
    }
    
    // Show loading
    const originalText = registerBtn.innerHTML;
    Utils.showLoading(registerBtn);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Attempt registration
      const user = authSystem.register(formData);
      
      Utils.showNotification('Conta criada com sucesso!', 'success');
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } catch (error) {
      Utils.showNotification(error.message, 'error');
      Utils.hideLoading(registerBtn, originalText);
    }
  });
  
  // Show/hide password toggles
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      const icon = toggle.querySelector('i');
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  });
});