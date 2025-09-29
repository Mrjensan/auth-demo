// Forgot password page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const currentUser = authSystem.getCurrentUser();
  if (currentUser) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Initialize wizard
  let currentStep = 1;
  const totalSteps = 4;
  let resetData = {};
  
  // Elements
  const stepElements = document.querySelectorAll('.step');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const themeToggle = document.getElementById('themeToggle');
  
  // Forms
  const emailForm = document.getElementById('emailForm');
  const codeForm = document.getElementById('codeForm');
  const passwordForm = document.getElementById('passwordForm');
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }
  
  // Initialize wizard
  updateWizardUI();
  
  // Back button
  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardUI();
    }
  });
  
  // Email form submission
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
      Utils.showNotification('Digite seu email', 'error');
      return;
    }
    
    if (!Utils.validateEmail(email)) {
      Utils.showNotification('Email inválido', 'error');
      return;
    }
    
    const originalText = nextBtn.innerHTML;
    Utils.showLoading(nextBtn);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = authSystem.requestPasswordReset(email);
      
      resetData.email = email;
      resetData.code = result.code; // In production, this would be sent via email
      
      Utils.showNotification('Código enviado para seu email!', 'success');
      
      // Show code in console for demo purposes
      console.log(`Código de recuperação: ${result.code}`);
      
      currentStep++;
      updateWizardUI();
      
    } catch (error) {
      Utils.showNotification(error.message, 'error');
    } finally {
      Utils.hideLoading(nextBtn, originalText);
    }
  });
  
  // Code verification
  codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const codeInputs = document.querySelectorAll('.code-input');
    const code = Array.from(codeInputs).map(input => input.value).join('');
    
    if (code.length !== 6) {
      Utils.showNotification('Digite o código completo', 'error');
      return;
    }
    
    const originalText = nextBtn.innerHTML;
    Utils.showLoading(nextBtn);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = authSystem.verifyResetCode(code);
      
      if (result.valid) {
        Utils.showNotification('Código verificado!', 'success');
        currentStep++;
        updateWizardUI();
      }
      
    } catch (error) {
      Utils.showNotification(error.message, 'error');
      
      // Clear code inputs on error
      codeInputs.forEach(input => input.value = '');
      codeInputs[0].focus();
      
    } finally {
      Utils.hideLoading(nextBtn, originalText);
    }
  });
  
  // Password reset
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmPassword) {
      Utils.showNotification('Preencha todos os campos', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Utils.showNotification('Senhas não coincidem', 'error');
      return;
    }
    
    const validation = Utils.validatePassword(newPassword);
    if (validation.score < 3) {
      Utils.showNotification('Senha muito fraca', 'error');
      return;
    }
    
    const originalText = nextBtn.innerHTML;
    Utils.showLoading(nextBtn);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      authSystem.resetPassword(newPassword);
      
      Utils.showNotification('Senha alterada com sucesso!', 'success');
      
      currentStep++;
      updateWizardUI();
      
    } catch (error) {
      Utils.showNotification(error.message, 'error');
    } finally {
      Utils.hideLoading(nextBtn, originalText);
    }
  });
  
  // Code input functionality
  setupCodeInputs();
  
  // Password strength validation
  setupPasswordValidation();
  
  function updateWizardUI() {
    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      const stepNumber = index + 1;
      
      indicator.classList.remove('active', 'completed');
      
      if (stepNumber < currentStep) {
        indicator.classList.add('completed');
        indicator.innerHTML = '<i class="fas fa-check"></i>';
      } else if (stepNumber === currentStep) {
        indicator.classList.add('active');
        indicator.innerHTML = stepNumber;
      } else {
        indicator.innerHTML = stepNumber;
      }
    });
    
    // Show/hide steps
    stepElements.forEach((step, index) => {
      step.style.display = index + 1 === currentStep ? 'block' : 'none';
    });
    
    // Update navigation buttons
    backBtn.style.display = currentStep > 1 && currentStep < 4 ? 'block' : 'none';
    
    if (currentStep === 4) {
      nextBtn.style.display = 'none';
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 3000);
      
    } else {
      nextBtn.style.display = 'block';
      
      // Update button text
      switch (currentStep) {
        case 1:
          nextBtn.textContent = 'Enviar Código';
          nextBtn.type = 'submit';
          nextBtn.form = 'emailForm';
          break;
        case 2:
          nextBtn.textContent = 'Verificar Código';
          nextBtn.type = 'submit';
          nextBtn.form = 'codeForm';
          break;
        case 3:
          nextBtn.textContent = 'Alterar Senha';
          nextBtn.type = 'submit';
          nextBtn.form = 'passwordForm';
          break;
      }
    }
    
    // Focus on first input of current step
    setTimeout(() => {
      const firstInput = stepElements[currentStep - 1].querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }
  
  function setupCodeInputs() {
    const codeInputs = document.querySelectorAll('.code-input');
    
    codeInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d$/.test(value) && value !== '') {
          e.target.value = '';
          return;
        }
        
        // Move to next input
        if (value && index < codeInputs.length - 1) {
          codeInputs[index + 1].focus();
        }
      });
      
      input.addEventListener('keydown', (e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !input.value && index > 0) {
          codeInputs[index - 1].focus();
        }
        
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          
          navigator.clipboard.readText().then(text => {
            const digits = text.replace(/\D/g, '').slice(0, 6);
            
            digits.split('').forEach((digit, i) => {
              if (codeInputs[i]) {
                codeInputs[i].value = digit;
              }
            });
            
            // Focus on next empty input or last input
            const nextIndex = Math.min(digits.length, codeInputs.length - 1);
            codeInputs[nextIndex].focus();
          });
        }
      });
    });
  }
  
  function setupPasswordValidation() {
    const newPasswordInput = document.getElementById('newPassword');
    const strengthMeter = document.querySelector('#passwordStep .strength-meter');
    const strengthBars = strengthMeter.querySelectorAll('.strength-bar');
    const strengthText = strengthMeter.querySelector('.strength-text');
    
    newPasswordInput.addEventListener('input', () => {
      const password = newPasswordInput.value;
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
      
      // Show/hide strength meter
      strengthMeter.style.display = password.length > 0 ? 'block' : 'none';
    });
  }
});