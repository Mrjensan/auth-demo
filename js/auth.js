// Authentication and utility functions
class AuthSystem {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.getCurrentUser();
    this.initializeDefaultUsers();
  }

  // Load users from localStorage
  loadUsers() {
    const users = localStorage.getItem('authSystem_users');
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem('authSystem_users', JSON.stringify(this.users));
  }

  // Initialize default demo users
  initializeDefaultUsers() {
    if (this.users.length === 0) {
      const defaultUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@demo.com',
          password: 'admin123',
          role: 'admin',
          avatar: 'A',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: null,
          sessions: []
        },
        {
          id: 2,
          name: 'John Moderator',
          email: 'mod@demo.com',
          password: 'mod123',
          role: 'moderator',
          avatar: 'M',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: null,
          sessions: []
        },
        {
          id: 3,
          name: 'User Demo',
          email: 'user@demo.com',
          password: 'user123',
          role: 'user',
          avatar: 'U',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: null,
          sessions: []
        }
      ];
      
      this.users = defaultUsers;
      this.saveUsers();
    }
  }

  // Simple hash function (for demo purposes - use bcrypt in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Generate JWT-like token (simplified for demo)
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    return btoa(JSON.stringify(payload));
  }

  // Validate token
  validateToken(token) {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        return null; // Token expired
      }
      return payload;
    } catch (e) {
      return null;
    }
  }

  // Login function
  login(email, password) {
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    if (user.status !== 'active') {
      throw new Error('Conta desativada');
    }
    
    // For demo purposes, check plain password (use hashed in production)
    if (user.password !== password) {
      throw new Error('Senha incorreta');
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Create session
    const session = {
      id: Date.now(),
      device: navigator.userAgent,
      ip: '127.0.0.1', // Demo IP
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    user.sessions.push(session);
    this.saveUsers();
    
    // Generate token
    const token = this.generateToken(user);
    
    // Store session
    localStorage.setItem('authSystem_token', token);
    localStorage.setItem('authSystem_sessionId', session.id);
    
    return {
      user: this.sanitizeUser(user),
      token,
      sessionId: session.id
    };
  }

  // Register function
  register(userData) {
    // Check if user already exists
    if (this.users.find(u => u.email === userData.email)) {
      throw new Error('Email já cadastrado');
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // Should be hashed in production
      role: userData.role || 'user',
      avatar: userData.name.charAt(0).toUpperCase(),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      sessions: []
    };
    
    this.users.push(newUser);
    this.saveUsers();
    
    return this.sanitizeUser(newUser);
  }

  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('authSystem_token');
    if (!token) return null;
    
    const payload = this.validateToken(token);
    if (!payload) {
      this.logout();
      return null;
    }
    
    const user = this.users.find(u => u.id === payload.id);
    return user ? this.sanitizeUser(user) : null;
  }

  // Sanitize user data (remove password)
  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  // Logout function
  logout() {
    const sessionId = localStorage.getItem('authSystem_sessionId');
    const token = localStorage.getItem('authSystem_token');
    
    if (token && sessionId) {
      const payload = this.validateToken(token);
      if (payload) {
        const user = this.users.find(u => u.id === payload.id);
        if (user) {
          // Remove session
          user.sessions = user.sessions.filter(s => s.id != sessionId);
          this.saveUsers();
        }
      }
    }
    
    localStorage.removeItem('authSystem_token');
    localStorage.removeItem('authSystem_sessionId');
  }

  // Update user profile
  updateProfile(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    // Don't allow email changes if it would duplicate
    if (updates.email && updates.email !== this.users[userIndex].email) {
      if (this.users.find(u => u.email === updates.email)) {
        throw new Error('Email já em uso');
      }
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();
    
    return this.sanitizeUser(this.users[userIndex]);
  }

  // Change password
  changePassword(userId, oldPassword, newPassword) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    if (user.password !== oldPassword) {
      throw new Error('Senha atual incorreta');
    }
    
    user.password = newPassword; // Should be hashed in production
    this.saveUsers();
    
    return true;
  }

  // Revoke session
  revokeSession(userId, sessionId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    user.sessions = user.sessions.filter(s => s.id != sessionId);
    this.saveUsers();
    
    return true;
  }

  // Admin functions
  getAllUsers() {
    return this.users.map(user => this.sanitizeUser(user));
  }

  deleteUser(userId) {
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    this.users.splice(index, 1);
    this.saveUsers();
    
    return true;
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    user.status = user.status === 'active' ? 'inactive' : 'active';
    this.saveUsers();
    
    return this.sanitizeUser(user);
  }

  // Password reset functions
  requestPasswordReset(email) {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Email não encontrado');
    }
    
    // Generate reset code (6 digits)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset code (expires in 10 minutes)
    const resetData = {
      userId: user.id,
      code: code,
      expires: Date.now() + (10 * 60 * 1000)
    };
    
    localStorage.setItem('authSystem_resetCode', JSON.stringify(resetData));
    
    // In a real app, send email here
    console.log(`Reset code for ${email}: ${code}`);
    
    return { message: 'Código enviado para seu email', code }; // Remove code in production
  }

  verifyResetCode(code) {
    const resetData = JSON.parse(localStorage.getItem('authSystem_resetCode') || 'null');
    
    if (!resetData) {
      throw new Error('Nenhuma solicitação de reset ativa');
    }
    
    if (resetData.expires < Date.now()) {
      localStorage.removeItem('authSystem_resetCode');
      throw new Error('Código expirado');
    }
    
    if (resetData.code !== code) {
      throw new Error('Código incorreto');
    }
    
    return { valid: true, userId: resetData.userId };
  }

  resetPassword(newPassword) {
    const resetData = JSON.parse(localStorage.getItem('authSystem_resetCode') || 'null');
    
    if (!resetData) {
      throw new Error('Sessão de reset inválida');
    }
    
    const user = this.users.find(u => u.id === resetData.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    user.password = newPassword; // Should be hashed in production
    this.saveUsers();
    
    // Clear reset data
    localStorage.removeItem('authSystem_resetCode');
    
    return { message: 'Senha alterada com sucesso' };
  }
}

// Utility functions
class Utils {
  static showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
  
  static getNotificationIcon(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }
  
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  static validatePassword(password) {
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      score: [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
    };
  }
  
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  static timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    return 'Agora';
  }
  
  static showLoading(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
  }
  
  static hideLoading(element, originalText) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    element.disabled = false;
    element.innerHTML = originalText;
  }
}

// Theme management
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('authSystem_theme') || 'light';
    this.applyTheme();
  }
  
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    localStorage.setItem('authSystem_theme', this.currentTheme);
  }
  
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }
}

// Initialize global instances
const authSystem = new AuthSystem();
const themeManager = new ThemeManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthSystem, Utils, ThemeManager };
}