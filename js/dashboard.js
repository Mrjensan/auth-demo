// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const currentUser = authSystem.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }
  
  // Initialize dashboard
  initializeDashboard(currentUser);
  updateUserInfo(currentUser);
  setupNavigation();
  setupEventListeners();
  loadDashboardData();
  
  // Set role-based visibility
  document.body.classList.add(`user-${currentUser.role}`);
});

function initializeDashboard(user) {
  // Update user info in sidebar
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userRole').textContent = user.role;
  document.getElementById('userAvatar').textContent = user.avatar;
  
  // Update header user info
  document.getElementById('headerUserName').textContent = user.name;
  document.getElementById('headerUserAvatar').textContent = user.avatar;
  
  // Show welcome message
  const welcomeMessage = document.getElementById('welcomeMessage');
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bem-vindo de volta, ${user.name}!`;
  }
}

function updateUserInfo(user) {
  // Profile section
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileRole = document.getElementById('profileRole');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileStatus = document.getElementById('profileStatus');
  
  if (profileName) profileName.value = user.name;
  if (profileEmail) profileEmail.value = user.email;
  if (profileRole) profileRole.textContent = user.role.toUpperCase();
  if (profileAvatar) profileAvatar.textContent = user.avatar;
  if (profileStatus) {
    profileStatus.textContent = 'Online';
    profileStatus.className = 'profile-status online';
  }
  
  // Load user sessions
  loadUserSessions(user.id);
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetSection = item.dataset.section;
      if (!targetSection) return;
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show target section
      contentSections.forEach(section => section.classList.remove('active'));
      const targetElement = document.getElementById(targetSection);
      if (targetElement) {
        targetElement.classList.add('active');
      }
      
      // Load section-specific data
      loadSectionData(targetSection);
    });
  });
}

function setupEventListeners() {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja sair?')) {
        authSystem.logout();
        window.location.href = 'index.html';
      }
    });
  }
  
  // Profile form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  // Password form
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }
  
  // Notification bell
  const notificationBell = document.getElementById('notificationBell');
  if (notificationBell) {
    notificationBell.addEventListener('click', () => {
      Utils.showNotification('Nenhuma notificação nova', 'info');
    });
  }
}

function loadDashboardData() {
  // Load stats
  updateStats();
  
  // Load recent activity (simulated)
  loadRecentActivity();
  
  // Update notification count
  updateNotificationCount();
}

function updateStats() {
  const currentUser = authSystem.getCurrentUser();
  const allUsers = authSystem.getAllUsers();
  
  // Total users (visible for admin/moderator)
  const totalUsersElement = document.getElementById('totalUsers');
  if (totalUsersElement && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
    totalUsersElement.textContent = allUsers.length;
  }
  
  // Active sessions
  const activeSessionsElement = document.getElementById('activeSessions');
  if (activeSessionsElement) {
    const user = allUsers.find(u => u.id === currentUser.id);
    activeSessionsElement.textContent = user?.sessions?.length || 0;
  }
  
  // Login count (simulated)
  const loginCountElement = document.getElementById('loginCount');
  if (loginCountElement) {
    const loginCount = localStorage.getItem(`loginCount_${currentUser.id}`) || 0;
    loginCountElement.textContent = loginCount;
  }
  
  // Last login
  const lastLoginElement = document.getElementById('lastLogin');
  if (lastLoginElement && currentUser.lastLogin) {
    lastLoginElement.textContent = Utils.timeAgo(currentUser.lastLogin);
  }
}

function loadRecentActivity() {
  const activityList = document.getElementById('recentActivity');
  if (!activityList) return;
  
  const activities = [
    {
      icon: 'fa-sign-in-alt',
      text: 'Login realizado com sucesso',
      time: new Date().toISOString(),
      type: 'login'
    },
    {
      icon: 'fa-user-edit',
      text: 'Perfil atualizado',
      time: new Date(Date.now() - 60000).toISOString(),
      type: 'profile'
    }
  ];
  
  activityList.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">
        <i class="fas ${activity.icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-text">${activity.text}</div>
        <div class="activity-time">${Utils.timeAgo(activity.time)}</div>
      </div>
    </div>
  `).join('');
}

function updateNotificationCount() {
  const notificationCount = document.getElementById('notificationCount');
  if (notificationCount) {
    // Simulate random notification count
    const count = Math.floor(Math.random() * 5);
    notificationCount.textContent = count;
    notificationCount.style.display = count > 0 ? 'flex' : 'none';
  }
}

function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'users':
      loadUsersSection();
      break;
    case 'security':
      loadSecuritySection();
      break;
    case 'profile':
      loadProfileSection();
      break;
  }
}

function loadUsersSection() {
  const currentUser = authSystem.getCurrentUser();
  if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
    return;
  }
  
  const usersTable = document.getElementById('usersTable');
  if (!usersTable) return;
  
  const users = authSystem.getAllUsers();
  
  usersTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Último Login</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">
                  ${user.avatar}
                </div>
                ${user.name}
              </div>
            </td>
            <td>${user.email}</td>
            <td>
              <span class="role-badge role-${user.role}">${user.role}</span>
            </td>
            <td>
              <span class="status-badge status-${user.status}">${user.status}</span>
            </td>
            <td>${user.lastLogin ? Utils.timeAgo(user.lastLogin) : 'Nunca'}</td>
            <td>
              <div class="user-actions">
                ${currentUser.role === 'admin' ? `
                  <button class="btn-icon" onclick="toggleUserStatus(${user.id})" title="Alternar Status">
                    <i class="fas ${user.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                  </button>
                  <button class="btn-icon" onclick="deleteUser(${user.id})" title="Excluir Usuário">
                    <i class="fas fa-trash"></i>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function loadSecuritySection() {
  const currentUser = authSystem.getCurrentUser();
  loadUserSessions(currentUser.id);
}

function loadProfileSection() {
  // Already loaded in updateUserInfo
}

function loadUserSessions(userId) {
  const sessionsContainer = document.getElementById('userSessions');
  if (!sessionsContainer) return;
  
  const allUsers = authSystem.getAllUsers();
  const user = allUsers.find(u => u.id === userId);
  const sessions = user?.sessions || [];
  
  if (sessions.length === 0) {
    sessionsContainer.innerHTML = '<p class="text-muted">Nenhuma sessão ativa</p>';
    return;
  }
  
  const currentSessionId = localStorage.getItem('authSystem_sessionId');
  
  sessionsContainer.innerHTML = sessions.map(session => `
    <div class="session-item ${session.id == currentSessionId ? 'current' : ''}">
      <div class="session-info">
        <strong>${session.device.includes('Mobile') ? 'Mobile' : 'Desktop'}</strong>
        <span>IP: ${session.ip}</span>
        <span>Criada em: ${Utils.formatDate(session.createdAt)}</span>
      </div>
      <div class="session-actions">
        ${session.id == currentSessionId ? 
          '<span class="session-status current">Atual</span>' :
          `<button class="session-revoke" onclick="revokeSession(${session.id})">Revogar</button>`
        }
      </div>
    </div>
  `).join('');
}

// Event handlers
async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const currentUser = authSystem.getCurrentUser();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  const updates = {
    name: form.name.value.trim(),
    email: form.email.value.trim()
  };
  
  if (!updates.name || !updates.email) {
    Utils.showNotification('Preencha todos os campos', 'error');
    return;
  }
  
  if (!Utils.validateEmail(updates.email)) {
    Utils.showNotification('Email inválido', 'error');
    return;
  }
  
  Utils.showLoading(submitBtn);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    authSystem.updateProfile(currentUser.id, updates);
    Utils.showNotification('Perfil atualizado com sucesso!', 'success');
    
    // Update UI
    document.getElementById('userName').textContent = updates.name;
    document.getElementById('headerUserName').textContent = updates.name;
    
  } catch (error) {
    Utils.showNotification(error.message, 'error');
  } finally {
    Utils.hideLoading(submitBtn, originalText);
  }
}

async function handlePasswordChange(e) {
  e.preventDefault();
  
  const currentUser = authSystem.getCurrentUser();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  const oldPassword = form.currentPassword.value;
  const newPassword = form.newPassword.value;
  const confirmPassword = form.confirmPassword.value;
  
  if (!oldPassword || !newPassword || !confirmPassword) {
    Utils.showNotification('Preencha todos os campos', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    Utils.showNotification('Senhas não coincidem', 'error');
    return;
  }
  
  const validation = Utils.validatePassword(newPassword);
  if (validation.score < 3) {
    Utils.showNotification('Nova senha muito fraca', 'error');
    return;
  }
  
  Utils.showLoading(submitBtn);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    authSystem.changePassword(currentUser.id, oldPassword, newPassword);
    Utils.showNotification('Senha alterada com sucesso!', 'success');
    
    form.reset();
    
  } catch (error) {
    Utils.showNotification(error.message, 'error');
  } finally {
    Utils.hideLoading(submitBtn, originalText);
  }
}

// Global functions for onclick handlers
window.toggleUserStatus = async function(userId) {
  try {
    await authSystem.toggleUserStatus(userId);
    Utils.showNotification('Status do usuário alterado', 'success');
    loadUsersSection();
  } catch (error) {
    Utils.showNotification(error.message, 'error');
  }
};

window.deleteUser = async function(userId) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) {
    return;
  }
  
  try {
    await authSystem.deleteUser(userId);
    Utils.showNotification('Usuário excluído com sucesso', 'success');
    loadUsersSection();
  } catch (error) {
    Utils.showNotification(error.message, 'error');
  }
};

window.revokeSession = async function(sessionId) {
  if (!confirm('Tem certeza que deseja revogar esta sessão?')) {
    return;
  }
  
  const currentUser = authSystem.getCurrentUser();
  
  try {
    await authSystem.revokeSession(currentUser.id, sessionId);
    Utils.showNotification('Sessão revogada com sucesso', 'success');
    loadUserSessions(currentUser.id);
  } catch (error) {
    Utils.showNotification(error.message, 'error');
  }
};