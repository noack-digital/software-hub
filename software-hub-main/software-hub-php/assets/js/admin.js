/**
 * Admin Panel JavaScript
 * Software Hub - PHP Version
 */

// ==========================================
// ADMIN STATE MANAGEMENT
// ==========================================

const AdminState = {
    currentUser: null,
    csrfToken: null,
    software: [],
    categories: [],
    targetGroups: [],
    users: [],
    settings: {},
    stats: null
};

// ==========================================
// API MODULE
// ==========================================

const AdminAPI = {
    baseUrl: '/api',

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            credentials: 'same-origin'
        };
        const finalOptions = { ...defaultOptions, ...options };
        if (AdminState.csrfToken) {
            finalOptions.headers = { ...finalOptions.headers, 'X-CSRF-Token': AdminState.csrfToken };
        }

        try {
            const response = await fetch(url, finalOptions);

            if (!response.ok) {
                // Try to parse error message from JSON, fallback to status text
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Response is not JSON, use status text
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // Auth
    async login(email, password) {
        return this.request('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async logout() {
        return this.request('auth.php?action=logout', {
            method: 'POST'
        });
    },

    async checkSession() {
        return this.request('auth.php?action=session');
    },

    // Stats
    async getStats() {
        return this.request('stats.php');
    },

    // Software
    async getSoftware(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`software.php${params}`);
    },

    async getSoftwareById(id) {
        return this.request(`software.php?id=${id}`);
    },

    async createSoftware(data) {
        return this.request('software.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateSoftware(id, data) {
        return this.request('software.php', {
            method: 'PATCH',
            body: JSON.stringify({ ...data, id })
        });
    },

    async deleteSoftware(id) {
        return this.request(`software.php?id=${id}`, {
            method: 'DELETE'
        });
    },

    async batchDeleteSoftware(ids) {
        return this.request('software.php', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    },

    // Categories
    async getCategories() {
        return this.request('categories.php');
    },

    async createCategory(data) {
        return this.request('categories.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateCategory(id, data) {
        return this.request('categories.php', {
            method: 'PATCH',
            body: JSON.stringify({ ...data, id })
        });
    },

    async deleteCategory(id) {
        return this.request(`categories.php?id=${id}`, {
            method: 'DELETE'
        });
    },

    // Target Groups
    async getTargetGroups() {
        return this.request('target-groups.php');
    },

    async createTargetGroup(data) {
        return this.request('target-groups.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateTargetGroup(id, data) {
        return this.request('target-groups.php', {
            method: 'PATCH',
            body: JSON.stringify({ ...data, id })
        });
    },

    async deleteTargetGroup(id) {
        return this.request(`target-groups.php?id=${id}`, {
            method: 'DELETE'
        });
    },

    // Departments
    async getDepartments() {
        return this.request('departments.php');
    },

    async createDepartment(data) {
        return this.request('departments.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateDepartment(id, data) {
        return this.request('departments.php', {
            method: 'PATCH',
            body: JSON.stringify({ ...data, id })
        });
    },

    async deleteDepartment(id) {
        return this.request(`departments.php?id=${id}`, {
            method: 'DELETE'
        });
    },

    // Users
    async getUsers(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`users.php${params}`);
    },

    async createUser(data) {
        return this.request('users.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateUser(id, data) {
        return this.request('users.php', {
            method: 'PATCH',
            body: JSON.stringify({ ...data, id })
        });
    },

    async deleteUser(id) {
        return this.request(`users.php?id=${id}`, {
            method: 'DELETE'
        });
    },

    async resetUserPassword(id, password) {
        return this.request(`users.php?id=${id}&action=reset-password`, {
            method: 'PATCH',
            body: JSON.stringify({ password })
        });
    },

    // Settings
    async getSettings() {
        return this.request('settings.php');
    },

    async updateSettings(settings) {
        return this.request('settings.php', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    },

    // Upload
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;

        const response = await fetch(`${this.baseUrl}/upload.php`, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        return data;
    },

    // AI
    async generateWithAI(softwareName, language = 'de', options = {}) {
        const payload = {
            softwareName,
            language,
            includeClassification: options.includeClassification || false,
            categories: options.categories || [],
            targetGroups: options.targetGroups || []
        };
        return this.request('ai/generate-all.php', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async testApiKey(apiKey, provider = 'gemini') {
        return this.request('ai/test-key.php', {
            method: 'POST',
            body: JSON.stringify({ apiKey, provider })
        });
    }
};

// ==========================================
// UI COMPONENTS MODULE
// ==========================================

const AdminUI = {
    confirmCallback: null,

    // Confirm Dialog
    showConfirmDialog(title, message, onConfirm) {
        const dialog = document.getElementById('confirmDialog');
        const titleEl = document.getElementById('confirmDialogTitle');
        const messageEl = document.getElementById('confirmDialogMessage');
        const confirmBtn = document.getElementById('confirmDialogConfirmBtn');

        titleEl.textContent = title;
        messageEl.textContent = message;
        this.confirmCallback = onConfirm;

        confirmBtn.onclick = () => {
            const callback = this.confirmCallback;
            this.hideConfirmDialog();
            if (callback) {
                callback();
            }
        };

        dialog.classList.add('active');
    },

    hideConfirmDialog() {
        const dialog = document.getElementById('confirmDialog');
        dialog.classList.remove('active');
        this.confirmCallback = null;
    },

    // Multi-Select Component
    createMultiSelect(container, options, selected = [], onChange) {
        const wrapper = document.createElement('div');
        wrapper.className = 'multi-select';

        const trigger = document.createElement('div');
        trigger.className = 'multi-select-trigger';
        trigger.tabIndex = 0;

        const dropdown = document.createElement('div');
        dropdown.className = 'multi-select-dropdown';

        let selectedValues = [...selected];

        const render = () => {
            // Render trigger
            if (selectedValues.length === 0) {
                trigger.innerHTML = '<span class="multi-select-placeholder">' + t('common.select') + '...</span>';
            } else {
                trigger.innerHTML = selectedValues.map(val => {
                    const opt = options.find(o => o.id === val);
                    const label = opt ? (currentLanguage === 'en' && opt.name_en ? opt.name_en : opt.name) : val;
                    return `<span class="multi-select-tag">
                        ${escapeHtml(label)}
                        <span class="multi-select-tag-remove" data-value="${val}">&times;</span>
                    </span>`;
                }).join('');
            }

            // Render dropdown
            dropdown.innerHTML = options.map(opt => {
                const label = currentLanguage === 'en' && opt.name_en ? opt.name_en : opt.name;
                const isSelected = selectedValues.includes(opt.id);
                return `<div class="multi-select-option ${isSelected ? 'selected' : ''}" data-value="${opt.id}">
                    <input type="checkbox" ${isSelected ? 'checked' : ''}>
                    <span>${escapeHtml(label)}</span>
                </div>`;
            }).join('');
        };

        // Event handlers
        trigger.addEventListener('click', (e) => {
            if (e.target.classList.contains('multi-select-tag-remove')) {
                const val = e.target.dataset.value;
                selectedValues = selectedValues.filter(v => v !== val);
                render();
                if (onChange) onChange(selectedValues);
            } else {
                dropdown.classList.toggle('open');
            }
        });

        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.multi-select-option');
            if (option) {
                const val = option.dataset.value;
                if (selectedValues.includes(val)) {
                    selectedValues = selectedValues.filter(v => v !== val);
                } else {
                    selectedValues.push(val);
                }
                render();
                if (onChange) onChange(selectedValues);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(dropdown);
        container.innerHTML = '';
        container.appendChild(wrapper);

        render();

        return {
            getValue: () => selectedValues,
            setValue: (vals) => {
                selectedValues = [...vals];
                render();
            }
        };
    },

    // Toggle Switch
    createToggle(checked, onChange) {
        const label = document.createElement('label');
        label.className = 'toggle-switch';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'toggle-switch-input';
        input.checked = checked;

        const slider = document.createElement('span');
        slider.className = 'toggle-switch-slider';

        input.addEventListener('change', () => {
            if (onChange) onChange(input.checked);
        });

        label.appendChild(input);
        label.appendChild(slider);

        return {
            element: label,
            getValue: () => input.checked,
            setValue: (val) => { input.checked = val; }
        };
    },

    // Data Table
    renderDataTable(container, columns, data, options = {}) {
        const { onEdit, onDelete, emptyMessage } = options;

        if (data.length === 0) {
            container.innerHTML = `<div class="data-table-empty">${emptyMessage || t('common.noData')}</div>`;
            return;
        }

        let html = '<table class="data-table"><thead><tr>';

        // Headers
        columns.forEach(col => {
            html += `<th>${col.label}</th>`;
        });
        if (onEdit || onDelete) {
            html += `<th class="text-right">${t('common.actions')}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Rows
        data.forEach(item => {
            html += '<tr>';
            columns.forEach(col => {
                const value = col.render ? col.render(item) : escapeHtml(item[col.key] || '');
                html += `<td>${value}</td>`;
            });

            if (onEdit || onDelete) {
                html += '<td class="data-table-cell-actions">';
                if (onEdit) {
                    html += `<button class="btn btn-ghost btn-icon btn-sm edit-btn" data-id="${item.id}" title="${t('common.edit')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>`;
                }
                if (onDelete) {
                    html += `<button class="btn btn-ghost btn-icon btn-sm delete-btn" data-id="${item.id}" title="${t('common.delete')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>`;
                }
                html += '</td>';
            }
            html += '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;

        // Add event listeners
        if (onEdit) {
            container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => onEdit(btn.dataset.id));
            });
        }
        if (onDelete) {
            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => onDelete(btn.dataset.id));
            });
        }
    }
};

// ==========================================
// LOGIN PAGE MODULE
// ==========================================

async function initLoginPage() {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    const spinner = loginBtn.querySelector('.btn-spinner');

    // CSRF-Token für Login holen (Session-Response enthält Token auch wenn nicht eingeloggt)
    try {
        const session = await AdminAPI.checkSession();
        if (session.csrfToken) AdminState.csrfToken = session.csrfToken;
    } catch (e) {
        console.warn('Session/CSRF check failed:', e);
    }

    // Initialize language
    loadTranslations().then(() => {
        updateLanguageUI();
    });

    // Setup language switcher
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.addEventListener('click', () => {
            changeLanguage(btn.dataset.lang);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');
        loginBtn.disabled = true;
        spinner.classList.remove('hidden');

        const email = form.email.value;
        const password = form.password.value;

        try {
            const result = await AdminAPI.login(email, password);
            if (result.success) {
                window.location.href = 'dashboard.php';
            }
        } catch (error) {
            errorDiv.textContent = error.message || t('auth.invalidCredentials');
            errorDiv.classList.remove('hidden');
        } finally {
            loginBtn.disabled = false;
            spinner.classList.add('hidden');
        }
    });
}

// ==========================================
// ADMIN PAGE INITIALIZATION
// ==========================================

async function initAdminPage() {
    // Session prüfen und CSRF-Token für schreibende Requests speichern
    try {
        const session = await AdminAPI.checkSession();
        if (session.csrfToken) AdminState.csrfToken = session.csrfToken;
        if (session.user) AdminState.currentUser = session.user;
    } catch (e) {
        console.warn('Session check failed:', e);
    }

    // Load translations
    await loadTranslations();
    updateLanguageUI();

    // Setup language switcher
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.addEventListener('click', () => {
            changeLanguage(btn.dataset.lang);
            // Re-render page content after language change
            const page = document.body.dataset.adminPage;
            if (page && window[`init${capitalize(page)}Page`]) {
                window[`init${capitalize(page)}Page`]();
            }
        });
    });

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await AdminAPI.logout();
                window.location.href = 'index.php';
            } catch (error) {
                showToast(t('errors.logoutFailed'), 'error');
            }
        });
    }

    // Setup mobile menu
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (mobileToggle && sidebar && overlay) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    // Sidebar collapse toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && sidebar) {
        // Restore saved state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // Initialize page-specific content
    const page = document.body.dataset.adminPage;
    switch (page) {
        case 'dashboard':
            await initDashboardPage();
            break;
        case 'software':
            await initSoftwarePage();
            break;
        case 'categories':
            await initCategoriesPage();
            break;
        case 'target-groups':
            await initTargetGroupsPage();
            break;
        case 'departments':
            await initDepartmentsPage();
            break;
        case 'users':
            await initUsersPage();
            break;
        case 'settings':
            await initSettingsPage();
            break;
    }
}

// ==========================================
// DASHBOARD PAGE
// ==========================================

async function initDashboardPage() {
    showLoading();
    try {
        const stats = await AdminAPI.getStats();
        AdminState.stats = stats;
        renderDashboard(stats);
    } catch (error) {
        showToast(t('errors.loadFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function renderDashboard(stats) {
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    const html = `
        <div class="stats-grid">
            <div class="stat-card" style="cursor: pointer;" onclick="window.location.href='software.php'">
                <div class="stat-card-header">
                    <span class="stat-label" data-t="stats.totalSoftware">${t('stats.totalSoftware')}</span>
                    <div class="stat-card-icon blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.software?.total || 0}</div>
            </div>
            <div class="stat-card" style="cursor: pointer;" onclick="window.location.href='categories.php'">
                <div class="stat-card-header">
                    <span class="stat-label" data-t="stats.categories">${t('stats.categories')}</span>
                    <div class="stat-card-icon green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                            <path d="M7 7h.01"></path>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.categories?.total || 0}</div>
            </div>
            <div class="stat-card" style="cursor: pointer;" onclick="window.location.href='target-groups.php'">
                <div class="stat-card-header">
                    <span class="stat-label" data-t="stats.targetGroups">${t('stats.targetGroups')}</span>
                    <div class="stat-card-icon purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.targetGroups?.total || 0}</div>
            </div>
            <div class="stat-card" style="cursor: pointer;" onclick="window.location.href='users.php'">
                <div class="stat-card-header">
                    <span class="stat-label" data-t="stats.users">${t('stats.users')}</span>
                    <div class="stat-card-icon orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" y1="8" x2="19" y2="14"></line>
                            <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                    </div>
                </div>
                <div class="stat-value">${stats.users?.total || 0}</div>
            </div>
        </div>

        <div class="grid grid-cols-2" style="gap: 1.5rem; margin-bottom: 1.5rem;">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title" data-t="stats.softwareByCategory">Software nach Kategorien</h3>
                </div>
                <div class="card-body">
                    ${renderCategoryChart(stats.topCategories || [])}
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title" data-t="stats.softwareByTargetGroup">Software nach Zielgruppen</h3>
                </div>
                <div class="card-body">
                    ${renderTargetGroupChart(stats.topTargetGroups || [])}
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title" data-t="stats.recentActivity">${t('stats.recentActivity')}</h3>
            </div>
            <div class="card-body" id="recentActivity">
                ${renderRecentActivity(stats.recentActivities || [])}
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Trigger chart animations after render
    setTimeout(() => {
        const bars = container.querySelectorAll('.chart-bar-fill');
        bars.forEach(bar => {
            const width = bar.style.getPropertyValue('--bar-width');
            bar.style.width = width;
        });
    }, 100);
}

function renderCategoryChart(categories) {
    if (!categories || categories.length === 0) {
        return `<div class="chart-no-data">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <p>${t('common.noData')}</p>
        </div>`;
    }

    const maxCount = Math.max(...categories.map(c => parseInt(c.count) || 0));

    return `<div class="chart-container">
        ${categories.map((cat, index) => {
            const name = currentLanguage === 'en' && cat.name_en ? cat.name_en : cat.name;
            const count = parseInt(cat.count) || 0;
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;

            return `<div class="chart-bar-item">
                <div class="chart-bar-label">
                    <span class="chart-bar-name">${escapeHtml(name)}</span>
                    <span class="chart-bar-value">${count}</span>
                </div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="--bar-width: ${percentage}%"></div>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

function renderTargetGroupChart(targetGroups) {
    if (!targetGroups || targetGroups.length === 0) {
        return `<div class="chart-no-data">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>${t('common.noData')}</p>
        </div>`;
    }

    const maxCount = Math.max(...targetGroups.map(tg => parseInt(tg.count) || 0));

    return `<div class="chart-container">
        ${targetGroups.map((tg, index) => {
            const name = currentLanguage === 'en' && tg.name_en ? tg.name_en : tg.name;
            const count = parseInt(tg.count) || 0;
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;

            return `<div class="chart-bar-item">
                <div class="chart-bar-label">
                    <span class="chart-bar-name">${escapeHtml(name)}</span>
                    <span class="chart-bar-value">${count}</span>
                </div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill target-group" style="--bar-width: ${percentage}%"></div>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

function renderRecentActivity(activities) {
    if (!activities || activities.length === 0) {
        return `<p class="text-gray-500">${t('stats.noRecentActivity')}</p>`;
    }

    return `<div class="activity-list">
        ${activities.map(activity => {
            const iconClass = activity.action === 'created' ? 'created' :
                              activity.action === 'updated' ? 'updated' : 'deleted';
            const icon = activity.action === 'created' ?
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>' :
                activity.action === 'updated' ?
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' :
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

            return `<div class="activity-item">
                <div class="activity-icon ${iconClass}">${icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${escapeHtml(activity.description)}</div>
                    <div class="activity-meta">${formatDate(activity.created_at)}</div>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

// ==========================================
// SOFTWARE PAGE
// ==========================================

async function initSoftwarePage() {
    showLoading();
    try {
        const [softwareRes, categoriesRes, targetGroupsRes, departmentsRes, settingsRes] = await Promise.all([
            AdminAPI.getSoftware(),
            AdminAPI.getCategories(),
            AdminAPI.getTargetGroups(),
            AdminAPI.getDepartments(),
            AdminAPI.getSettings()
        ]);

        AdminState.software = softwareRes.data || [];
        AdminState.categories = categoriesRes.data || [];
        AdminState.targetGroups = targetGroupsRes.data || [];
        AdminState.departments = departmentsRes.data || [];
        // Settings API returns object directly, not wrapped in .data
        AdminState.settings = settingsRes.data || settingsRes;

        // Debug logging for settings
        console.log('Software Page - Settings loaded:', {
            settingsResponse: settingsRes,
            adminStateSettings: AdminState.settings,
            geminiKey: AdminState.settings.GOOGLE_GEMINI_API_KEY,
            mistralKey: AdminState.settings.MISTRAL_API_KEY,
            aiProvider: AdminState.settings.AI_PROVIDER
        });

        renderSoftwareList();
        setupSoftwareEventListeners();
        initQuillEditors();
    } catch (error) {
        showToast(t('errors.loadFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function renderSoftwareList() {
    const container = document.getElementById('softwareTableBody');
    if (!container) return;

    const searchInput = document.getElementById('softwareSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const categoryFilter = document.getElementById('filterCategory');
    const privacyFilter = document.getElementById('filterPrivacy');
    const translationFilter = document.getElementById('filterTranslation');

    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const selectedPrivacy = privacyFilter ? privacyFilter.value : '';
    const selectedTranslation = translationFilter ? translationFilter.value : '';

    const filtered = AdminState.software.filter(item => {
        // Search filter
        if (searchTerm) {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                   (item.description && item.description.toLowerCase().includes(searchTerm));
            if (!matchesSearch) return false;
        }

        // Category filter
        if (selectedCategory) {
            const hasCategory = item.categories && item.categories.some(cat => cat.id === selectedCategory);
            if (!hasCategory) return false;
        }

        // Privacy filter
        if (selectedPrivacy) {
            const itemPrivacy = item.data_privacy_status || item.privacy_status;
            if (itemPrivacy !== selectedPrivacy) return false;
        }

        // Translation filter
        if (selectedTranslation) {
            const hasTranslation = item.name_en && item.description_en;
            if (selectedTranslation === 'complete' && !hasTranslation) return false;
            if (selectedTranslation === 'missing' && hasTranslation) return false;
        }

        return true;
    });

    const columns = [
        {
            key: 'select',
            label: '<input type="checkbox" id="selectAllSoftware" title="Alle auswählen">',
            render: (item) => `<input type="checkbox" class="software-select" data-id="${item.id}">`
        },
        {
            key: 'logo',
            label: 'ICONS',
            render: (item) => {
                const logo = item.logo ?
                    `<img src="${escapeHtml(item.logo)}" class="software-logo" style="width:32px;height:32px;" alt="">` :
                    `<div style="width:32px;height:32px;background:var(--color-gray-200);border-radius:var(--border-radius);"></div>`;
                const reloadBtn = `<button class="btn-icon-sm" onclick="reloadFavicon('${item.id}')" title="Favicon neu laden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                </button>`;
                return `<div style="display:flex;align-items:center;gap:0.5rem;">${logo}${reloadBtn}</div>`;
            }
        },
        {
            key: 'name',
            label: t('software.name'),
            render: (item) => `<strong>${escapeHtml(item.name)}</strong>`
        },
        {
            key: 'categories',
            label: t('software.categories'),
            render: (item) => {
                if (!item.categories || item.categories.length === 0) return '-';
                return item.categories.map(cat => {
                    const name = currentLanguage === 'en' && cat.name_en ? cat.name_en : cat.name;
                    return `<span class="badge badge-primary" style="margin-right:0.25rem;">${escapeHtml(name)}</span>`;
                }).join('');
            }
        },
        {
            key: 'privacy_status',
            label: t('software.privacyStatus'),
            render: (item) => {
                const status = item.data_privacy_status || item.privacy_status || 'UNKNOWN';
                const colors = {
                    'COMPLIANT': '#22c55e', 'DSGVO_COMPLIANT': '#22c55e',
                    'PARTIAL': '#eab308',
                    'IN_PROGRESS': '#f97316',
                    'NON_COMPLIANT': '#ef4444'
                };
                const color = colors[status] || '#9ca3af';
                const statusText = t(`software.privacy.${status}`) || status;
                return `<span style="display:inline-flex;align-items:center;gap:0.35rem;"><span class="privacy-dot" style="background:${color};"></span> ${statusText}</span>`;
            }
        },
        {
            key: 'translation',
            label: t('common.translation'),
            render: (item) => {
                const hasTranslation = item.name_en && item.description_en;
                const statusIcon = hasTranslation ?
                    '<span class="translation-status complete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' :
                    '<span class="translation-status missing"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>';
                const translateBtn = !hasTranslation ?
                    `<button class="btn-icon-sm" onclick="translateSoftware('${item.id}')" title="Automatisch übersetzen">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
                        </svg>
                    </button>` : '';
                return `<div style="display:flex;align-items:center;gap:0.5rem;">${statusIcon}${translateBtn}</div>`;
            }
        },
        {
            key: 'optimize',
            label: 'Optimierung',
            render: (item) => {
                const hasApiKey = AdminState.settings &&
                    (AdminState.settings.GOOGLE_GEMINI_API_KEY || AdminState.settings.MISTRAL_API_KEY);
                if (!hasApiKey) return '';

                const isOptimized = item.optimized == 1;
                const statusIcon = isOptimized ?
                    '<span class="translation-status complete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' :
                    '<span class="translation-status missing"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>';
                const optimizeBtn = `<button class="btn-icon-sm" onclick="optimizeSoftware('${item.id}')" title="Beschreibung optimieren">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                </button>`;
                return `<div style="display:flex;align-items:center;gap:0.5rem;">${statusIcon}${optimizeBtn}</div>`;
            }
        }
    ];

    AdminUI.renderDataTable(container, columns, filtered, {
        onEdit: (id) => openSoftwareModal(id),
        onDelete: (id) => confirmDeleteSoftware(id),
        emptyMessage: t('software.noSoftware')
    });

    // Nach dem Rendern den Status des Batch-Delete-Buttons aktualisieren
    updateBatchDeleteButton();
}

// ---- Quill Rich-Text Editors ----
const quillToolbar = [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
];

const quillEditors = {};

function initQuillEditors() {
    const editorIds = [
        'editorDescription', 'editorDescriptionEn',
        'editorFeatures', 'editorFeaturesEn',
        'editorReasonHnee', 'editorReasonHneeEn',
        'editorPrivacyNote'
    ];
    editorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && !quillEditors[id]) {
            quillEditors[id] = new Quill('#' + id, {
                theme: 'snow',
                modules: { toolbar: quillToolbar },
                placeholder: ''
            });
            // Fix: Quill sets height:100% on .ql-container which breaks layout
            const container = el.querySelector('.ql-container');
            if (container) container.style.height = 'auto';
        }
    });
}

function setQuillContent(editorId, html) {
    const editor = quillEditors[editorId];
    if (!editor) return;
    if (html && html.trim()) {
        editor.root.innerHTML = html;
    } else {
        editor.setText('');
    }
}

function getQuillContent(editorId) {
    const editor = quillEditors[editorId];
    if (!editor) return '';
    const html = editor.root.innerHTML;
    // Return empty string if editor is empty (only contains <p><br></p>)
    if (html === '<p><br></p>' || html === '<p></p>') return '';
    return html;
}

// Map: quill editor ID → hidden textarea ID
const quillTextareaMap = {
    'editorDescription': 'softwareDescription',
    'editorDescriptionEn': 'softwareDescriptionEn',
    'editorFeatures': 'softwareFeatures',
    'editorFeaturesEn': 'softwareFeaturesEn',
    'editorReasonHnee': 'softwareReasonHnee',
    'editorReasonHneeEn': 'softwareReasonHneeEn',
    'editorPrivacyNote': 'privacyNote'
};

function syncQuillToTextareas() {
    for (const [editorId, textareaId] of Object.entries(quillTextareaMap)) {
        const ta = document.getElementById(textareaId);
        if (ta) ta.value = getQuillContent(editorId);
    }
}

function loadTextareasToQuill() {
    for (const [editorId, textareaId] of Object.entries(quillTextareaMap)) {
        const ta = document.getElementById(textareaId);
        if (ta) setQuillContent(editorId, ta.value);
    }
}

function setupSoftwareEventListeners() {
    // Search
    const searchInput = document.getElementById('softwareSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderSoftwareList, 300);
        });
    }

    // Filter listeners
    const categoryFilter = document.getElementById('filterCategory');
    const privacyFilter = document.getElementById('filterPrivacy');
    const translationFilter = document.getElementById('filterTranslation');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', renderSoftwareList);
    }
    if (privacyFilter) {
        privacyFilter.addEventListener('change', renderSoftwareList);
    }
    if (translationFilter) {
        translationFilter.addEventListener('change', renderSoftwareList);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (categoryFilter) categoryFilter.value = '';
            if (privacyFilter) privacyFilter.value = '';
            if (translationFilter) translationFilter.value = '';
            if (searchInput) searchInput.value = '';
            renderSoftwareList();
        });
    }

    // Populate category filter
    populateCategoryFilter();

    // Select all checkbox
    document.addEventListener('change', (e) => {
        if (e.target.id === 'selectAllSoftware') {
            document.querySelectorAll('.software-select').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBatchDeleteButton();
        } else if (e.target.classList.contains('software-select')) {
            updateBatchDeleteButton();
        }
    });

    // Batch delete button
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', confirmBatchDelete);
    }

    // Batch translate button
    const batchTranslateBtn = document.getElementById('batchTranslateBtn');
    if (batchTranslateBtn && !batchTranslateBtn._listenerAdded) {
        batchTranslateBtn.addEventListener('click', batchTranslateSoftware);
        batchTranslateBtn._listenerAdded = true;
    }

    // Batch optimize button
    const batchOptimizeBtn = document.getElementById('batchOptimizeBtn');
    if (batchOptimizeBtn && !batchOptimizeBtn._listenerAdded) {
        batchOptimizeBtn.addEventListener('click', batchOptimizeSoftware);
        batchOptimizeBtn._listenerAdded = true;
    }

    // New button
    const newBtn = document.getElementById('newSoftwareBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => openSoftwareModal());
    }
    // Ansprechperson hinzufügen
    document.getElementById('addContactBtn')?.addEventListener('click', addContactRow);
}

function updateBatchDeleteButton() {
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    const countSpan = document.getElementById('batchDeleteCount');
    const batchTranslateBtn = document.getElementById('batchTranslateBtn');
    const translateCountSpan = document.getElementById('batchTranslateCount');

    const selectedCount = document.querySelectorAll('.software-select:checked').length;

    if (batchDeleteBtn && countSpan) {
        if (selectedCount > 0) {
            batchDeleteBtn.style.display = 'inline-flex';
            batchDeleteBtn.disabled = false;
            countSpan.textContent = `Löschen (${selectedCount})`;
        } else {
            batchDeleteBtn.disabled = true;
            batchDeleteBtn.style.display = 'none';
            countSpan.textContent = 'Löschen (0)';
        }
    }

    if (batchTranslateBtn && translateCountSpan) {
        if (selectedCount > 0) {
            batchTranslateBtn.style.display = 'inline-flex';
            batchTranslateBtn.disabled = false;
            translateCountSpan.textContent = `Übersetzen (${selectedCount})`;
        } else {
            batchTranslateBtn.disabled = true;
            batchTranslateBtn.style.display = 'none';
            translateCountSpan.textContent = 'Übersetzen (0)';
        }
    }

    const batchOptimizeBtn = document.getElementById('batchOptimizeBtn');
    const optimizeCountSpan = document.getElementById('batchOptimizeCount');
    const hasApiKey = AdminState.settings &&
        (AdminState.settings.GOOGLE_GEMINI_API_KEY || AdminState.settings.MISTRAL_API_KEY);

    if (batchOptimizeBtn && optimizeCountSpan) {
        if (selectedCount > 0 && hasApiKey) {
            batchOptimizeBtn.style.display = 'inline-flex';
            batchOptimizeBtn.disabled = false;
            optimizeCountSpan.textContent = `Optimieren (${selectedCount})`;
        } else {
            batchOptimizeBtn.disabled = true;
            batchOptimizeBtn.style.display = 'none';
            optimizeCountSpan.textContent = 'Optimieren (0)';
        }
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('filterCategory');
    if (!categoryFilter || !AdminState.categories) return;

    // Keep existing "Alle" option
    const allOption = categoryFilter.querySelector('option[value=""]');
    categoryFilter.innerHTML = '';
    if (allOption) categoryFilter.appendChild(allOption);

    AdminState.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        const name = currentLanguage === 'en' && cat.name_en ? cat.name_en : cat.name;
        option.textContent = name;
        categoryFilter.appendChild(option);
    });
}

function closeSoftwareEditPage() {
    document.getElementById('softwareEditPage').classList.add('hidden');
    document.getElementById('softwareListView').style.display = '';
    window.scrollTo(0, 0);
}

async function openSoftwareModal(id = null) {
    const form = document.getElementById('softwareForm');
    const title = document.getElementById('softwareEditTitle');

    // Reset form
    form.reset();
    document.getElementById('softwareId').value = '';
    document.getElementById('logoPreview').innerHTML = '';
    renderContactsList([]);
    // Clear AI-generated logo data
    if (document.getElementById('softwareName').dataset.aiLogo) {
        delete document.getElementById('softwareName').dataset.aiLogo;
    }

    if (id) {
        // Edit mode: fetch full item (incl. contacts)
        title.textContent = t('software.edit');
        let item = null;
        try {
            item = await AdminAPI.getSoftwareById(id);
        } catch (e) {
            item = AdminState.software.find(s => s.id === id) || null;
        }
        if (item) {
            document.getElementById('softwareId').value = item.id;
            document.getElementById('softwareName').value = item.name || '';
            document.getElementById('softwareNameEn').value = item.name_en || '';
            document.getElementById('softwareUrl').value = item.url || '';
            document.getElementById('softwareDescription').value = item.description || '';
            document.getElementById('softwareDescriptionEn').value = item.description_en || '';
            document.getElementById('softwareShortDescription').value = item.short_description || '';
            document.getElementById('softwareShortDescriptionEn').value = item.short_description_en || '';
            document.getElementById('softwareFeatures').value = item.features || '';
            document.getElementById('softwareFeaturesEn').value = item.features_en || '';
            document.getElementById('softwareReasonHnee').value = item.reason_hnee || '';
            document.getElementById('softwareReasonHneeEn').value = item.reason_hnee_en || '';

            // Costs & license fields
            document.getElementById('softwareCosts').value = item.costs || 'kostenlos';
            document.getElementById('softwareCostModel').value = item.cost_model || '';
            document.getElementById('softwareCostPrice').value = item.cost_price || '';
            document.getElementById('softwareAlternatives').value = item.alternatives || '';
            document.getElementById('softwareAlternativesEn').value = item.alternatives_en || '';
            document.getElementById('softwareTutorials').value = item.tutorials || '';
            document.getElementById('softwareAccessInfo').value = item.access_info || '';
            document.getElementById('softwareNotes').value = item.notes || '';
            document.getElementById('softwareNotesEn').value = item.notes_en || '';

            // Steckbrief preview
            const steckbriefPreview = document.getElementById('steckbriefPreview');
            const steckbriefPathInput = document.getElementById('softwareSteckbriefPath');
            const steckbriefFileInput = document.getElementById('softwareSteckbrief');
            if (steckbriefFileInput) steckbriefFileInput.value = '';
            if (item.steckbrief_path) {
                steckbriefPathInput.value = item.steckbrief_path;
                document.getElementById('steckbriefLink').href = item.steckbrief_path;
                document.getElementById('steckbriefFilename').textContent = item.steckbrief_path.split('/').pop();
                steckbriefPreview.style.display = 'flex';
            } else {
                steckbriefPathInput.value = '';
                steckbriefPreview.style.display = 'none';
            }

            // Privacy status radio buttons
            const privacyStatus = item.data_privacy_status || item.privacy_status || 'UNKNOWN';
            const privacyMap = {
                'COMPLIANT': 'privacyCompliant',
                'DSGVO_COMPLIANT': 'privacyCompliant',
                'PARTIAL': 'privacyPartial',
                'IN_PROGRESS': 'privacyInProgress',
                'NON_COMPLIANT': 'privacyNonCompliant',
                'NON_EU': 'privacyNonCompliant',
                'UNKNOWN': 'privacyUnknown',
                'EU_HOSTED': 'privacyUnknown'
            };
            const privacyRadio = document.getElementById(privacyMap[privacyStatus] || 'privacyUnknown');
            if (privacyRadio) privacyRadio.checked = true;

            // Hosting location radio buttons
            const hostingLoc = item.hosting_location || 'UNKNOWN';
            const hostingMap = { 'HNEE': 'hostingHNEE', 'DE': 'hostingDE', 'EU': 'hostingEU', 'NON_EU': 'hostingNonEU' };
            const hostingRadio = document.getElementById(hostingMap[hostingLoc]);
            if (hostingRadio) hostingRadio.checked = true;
            // Fallback: inhouse_hosted legacy
            if (!hostingRadio && (item.inhouse_hosted || item.is_inhouse)) {
                const hneeRadio = document.getElementById('hostingHNEE');
                if (hneeRadio) hneeRadio.checked = true;
            }

            // Privacy note
            document.getElementById('privacyNote').value = item.privacy_note || '';

            // Show account request toggle
            const showAccReq = document.getElementById('showAccountRequest');
            if (showAccReq) showAccReq.checked = item.show_account_request != 0;

            // Logo preview
            if (item.logo) {
                document.getElementById('logoPreview').innerHTML =
                    `<div class="file-preview"><img src="${escapeHtml(item.logo)}" class="file-preview-image" alt=""></div>`;
            }

            // Categories checkboxes
            initCategoryCheckboxes(item.categories ? item.categories.map(c => c.id) : []);

            // Target groups checkboxes
            initTargetGroupCheckboxes(item.target_groups ? item.target_groups.map(t => t.id) : []);

            // Departments checkboxes
            initDepartmentCheckboxes(item.departments ? item.departments.map(d => d.id) : []);

            // Types checkboxes
            const types = item.types || [];
            document.getElementById('typeWeb').checked = types.includes('WEB');
            document.getElementById('typeDesktop').checked = types.includes('DESKTOP');
            document.getElementById('typeMobile').checked = types.includes('MOBILE');

            // Ansprechpersonen
            renderContactsList(item.contacts || []);
        }
    } else {
        // Create mode
        title.textContent = t('software.new');
        initCategoryCheckboxes([]);
        initTargetGroupCheckboxes([]);
        initDepartmentCheckboxes([]);
        // Set default privacy status to UNKNOWN
        document.getElementById('privacyUnknown').checked = true;
    }

    // Show/hide AI buttons based on API key availability
    const hasApiKey = AdminState.settings &&
                     (AdminState.settings.GOOGLE_GEMINI_API_KEY ||
                      AdminState.settings.MISTRAL_API_KEY);

    const aiBtn = document.getElementById('aiGenerateBtn');
    if (aiBtn) {
        aiBtn.style.display = hasApiKey ? 'inline-flex' : 'none';
    }

    const optimizeBtn = document.getElementById('optimizeDescBtn');
    if (optimizeBtn) {
        optimizeBtn.style.display = (hasApiKey && id) ? 'inline-flex' : 'none';
    }

    const aiDescBtn = document.getElementById('aiDescBtn');
    if (aiDescBtn) {
        aiDescBtn.style.display = hasApiKey ? 'inline-flex' : 'none';
    }

    // Show/hide field translate buttons
    document.querySelectorAll('.btn-translate-field').forEach(btn => {
        btn.classList.toggle('visible', !!hasApiKey);
    });

    // Show edit page, hide list
    document.getElementById('softwareListView').style.display = 'none';
    document.getElementById('softwareEditPage').classList.remove('hidden');
    window.scrollTo(0, 0);

    // Init Quill editors (if not yet) and load content
    initQuillEditors();
    loadTextareasToQuill();
}

function renderContactsList(contacts) {
    const container = document.getElementById('softwareContactsList');
    if (!container) return;
    const salutationOptions = ['', 'Herr', 'Frau', 'Dr.', 'Prof.'];
    const parseRoles = (r) => { if (!r) return []; return String(r).split(',').map(s => s.trim()).filter(Boolean); };
    container.innerHTML = (contacts.length ? contacts : [{ salutation: '', first_name: '', last_name: '', profile_url: '', email: '', contact_roles: '', is_account_recipient: 0 }]).map((c, i) => {
        const roles = parseRoles(c.contact_roles || c.contactRoles);
        const adminChecked = roles.includes('administration');
        const trainingChecked = roles.includes('training');
        const recipientChecked = c.is_account_recipient == 1;
        return `
        <div class="software-contact-row grid gap-2" style="grid-template-columns: auto 1fr 1fr 1fr 1fr auto auto; align-items: center;">
            <select class="form-input contact-salutation" style="min-width: 5rem;">
                ${salutationOptions.map(s => `<option value="${s}" ${(c.salutation || '') === s ? 'selected' : ''}>${s || '–'}</option>`).join('')}
            </select>
            <input type="text" class="form-input contact-first-name" placeholder="Vorname" value="${escapeHtml(c.first_name || '')}">
            <input type="text" class="form-input contact-last-name" placeholder="Nachname" value="${escapeHtml(c.last_name || '')}">
            <input type="url" class="form-input contact-profile-url" placeholder="Link zum Profil" value="${escapeHtml(c.profile_url || '')}">
            <input type="email" class="form-input contact-email" placeholder="E-Mail" value="${escapeHtml(c.email || '')}">
            <div class="flex flex-wrap gap-2">
                <label class="form-checkbox text-xs"><input type="checkbox" class="contact-role-admin" ${adminChecked ? 'checked' : ''}> Admin</label>
                <label class="form-checkbox text-xs"><input type="checkbox" class="contact-role-training" ${trainingChecked ? 'checked' : ''}> Fragen/Schulung</label>
                <label class="form-checkbox text-xs" title="Empfänger für Nutzerkonto-Anfragen"><input type="checkbox" class="contact-account-recipient" ${recipientChecked ? 'checked' : ''}> Konto-Empf.</label>
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-contact" title="Entfernen">×</button>
        </div>`;
    }).join('');
    container.querySelectorAll('.remove-contact').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.software-contact-row').remove();
            if (!container.querySelectorAll('.software-contact-row').length) addContactRow();
        });
    });
}

function addContactRow() {
    const container = document.getElementById('softwareContactsList');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'software-contact-row grid gap-2';
    row.style.cssText = 'grid-template-columns: auto 1fr 1fr 1fr 1fr auto auto; align-items: center;';
    row.innerHTML = `
        <select class="form-input contact-salutation" style="min-width: 5rem;">
            <option value="">–</option><option value="Herr">Herr</option><option value="Frau">Frau</option><option value="Dr.">Dr.</option><option value="Prof.">Prof.</option>
        </select>
        <input type="text" class="form-input contact-first-name" placeholder="Vorname">
        <input type="text" class="form-input contact-last-name" placeholder="Nachname">
        <input type="url" class="form-input contact-profile-url" placeholder="Link zum Profil">
        <input type="email" class="form-input contact-email" placeholder="E-Mail">
        <div class="flex flex-wrap gap-2">
            <label class="form-checkbox text-xs"><input type="checkbox" class="contact-role-admin"> Admin</label>
            <label class="form-checkbox text-xs"><input type="checkbox" class="contact-role-training"> Fragen/Schulung</label>
            <label class="form-checkbox text-xs" title="Empfänger für Nutzerkonto-Anfragen"><input type="checkbox" class="contact-account-recipient"> Konto-Empf.</label>
        </div>
        <button type="button" class="btn btn-danger btn-sm remove-contact" title="Entfernen">×</button>
    `;
    row.querySelector('.remove-contact').addEventListener('click', () => {
        row.remove();
    });
    container.appendChild(row);
}

function getContactsFromForm() {
    const rows = document.querySelectorAll('#softwareContactsList .software-contact-row');
    const contacts = [];
    rows.forEach((row, i) => {
        const first = row.querySelector('.contact-first-name')?.value?.trim() ?? '';
        const last = row.querySelector('.contact-last-name')?.value?.trim() ?? '';
        if (!first && !last) return;
        const roles = [];
        if (row.querySelector('.contact-role-admin')?.checked) roles.push('administration');
        if (row.querySelector('.contact-role-training')?.checked) roles.push('training');
        contacts.push({
            salutation: row.querySelector('.contact-salutation')?.value || null,
            first_name: first,
            last_name: last,
            profile_url: row.querySelector('.contact-profile-url')?.value?.trim() || null,
            email: row.querySelector('.contact-email')?.value?.trim() || null,
            contact_roles: roles.length ? roles.join(',') : null,
            is_account_recipient: row.querySelector('.contact-account-recipient')?.checked ? 1 : 0,
            sort_order: i
        });
    });
    return contacts;
}

function initCategoryCheckboxes(selected = []) {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return;

    container.innerHTML = '';
    AdminState.categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'form-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category.id;
        checkbox.checked = selected.includes(category.id);
        checkbox.dataset.categoryId = category.id;

        const span = document.createElement('span');
        span.textContent = category.name;

        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

function initTargetGroupCheckboxes(selected = []) {
    const container = document.getElementById('targetGroupCheckboxes');
    if (!container) return;

    container.innerHTML = '';
    AdminState.targetGroups.forEach(group => {
        const label = document.createElement('label');
        label.className = 'form-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = group.id;
        checkbox.checked = selected.includes(group.id);
        checkbox.dataset.targetGroupId = group.id;

        const span = document.createElement('span');
        span.textContent = group.name;

        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

function initDepartmentCheckboxes(selected = []) {
    const container = document.getElementById('departmentCheckboxes');
    if (!container) return;

    container.innerHTML = '';
    (AdminState.departments || []).forEach(dept => {
        const label = document.createElement('label');
        label.className = 'form-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = dept.id;
        checkbox.checked = selected.includes(dept.id);
        checkbox.dataset.departmentId = dept.id;

        const span = document.createElement('span');
        span.textContent = dept.name;

        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedTargetGroups() {
    const checkboxes = document.querySelectorAll('#targetGroupCheckboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedDepartments() {
    const checkboxes = document.querySelectorAll('#departmentCheckboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

async function saveSoftware(e) {
    e.preventDefault();
    showLoading();

    // Sync Quill editors to hidden textareas before reading values
    syncQuillToTextareas();

    const id = document.getElementById('softwareId').value;
    const types = [];
    if (document.getElementById('typeWeb').checked) types.push('WEB');
    if (document.getElementById('typeDesktop').checked) types.push('DESKTOP');
    if (document.getElementById('typeMobile').checked) types.push('MOBILE');

    // Get selected privacy status from radio buttons
    let privacyStatus = 'UNKNOWN';
    const privacyRadios = document.querySelectorAll('input[name="privacyStatus"]:checked');
    if (privacyRadios.length > 0) privacyStatus = privacyRadios[0].value;

    // Get selected hosting location from radio buttons
    let hostingLocation = null;
    const hostingRadios = document.querySelectorAll('input[name="hostingLocation"]:checked');
    if (hostingRadios.length > 0) hostingLocation = hostingRadios[0].value;

    const data = {
        name: document.getElementById('softwareName').value,
        name_en: document.getElementById('softwareNameEn').value,
        url: document.getElementById('softwareUrl').value,
        description: document.getElementById('softwareDescription').value,
        description_en: document.getElementById('softwareDescriptionEn').value,
        short_description: document.getElementById('softwareShortDescription').value,
        short_description_en: document.getElementById('softwareShortDescriptionEn').value,
        features: document.getElementById('softwareFeatures').value,
        features_en: document.getElementById('softwareFeaturesEn').value,
        reason_hnee: document.getElementById('softwareReasonHnee').value,
        reason_hnee_en: document.getElementById('softwareReasonHneeEn').value,
        costs: document.getElementById('softwareCosts').value,
        cost_model: document.getElementById('softwareCostModel').value,
        cost_price: document.getElementById('softwareCostPrice').value,
        alternatives: document.getElementById('softwareAlternatives').value,
        alternatives_en: document.getElementById('softwareAlternativesEn').value,
        tutorials: document.getElementById('softwareTutorials').value,
        access_info: document.getElementById('softwareAccessInfo').value,
        notes: document.getElementById('softwareNotes').value,
        notes_en: document.getElementById('softwareNotesEn').value,
        privacy_status: privacyStatus,
        privacy_note: document.getElementById('privacyNote').value,
        hosting_location: hostingLocation,
        is_inhouse: hostingLocation === 'HNEE',
        types: types,
        show_account_request: document.getElementById('showAccountRequest')?.checked ? 1 : 0,
        categories: getSelectedCategories(),
        target_groups: getSelectedTargetGroups(),
        departments: getSelectedDepartments(),
        contacts: getContactsFromForm()
    };

    try {
        // Handle logo upload, fetched favicon, or AI-generated logo
        const logoFile = document.getElementById('softwareLogo')?.files[0];
        if (logoFile) {
            // Manual upload takes precedence
            console.log('Manual logo file selected, uploading:', logoFile.name);
            const uploadResult = await AdminAPI.uploadFile(logoFile);
            data.logo = uploadResult.path;
            console.log('Logo uploaded successfully:', uploadResult.path);
        } else {
            // Check for manually fetched favicon
            const fetchedLogo = document.getElementById('softwareName').dataset.fetchedLogo;
            if (fetchedLogo) {
                data.logo = fetchedLogo;
                console.log('Using manually fetched favicon:', fetchedLogo);
            } else {
                // Check for AI-generated logo
                const aiLogo = document.getElementById('softwareName').dataset.aiLogo;
                console.log('Checking for AI-generated logo:', {
                    hasDataset: !!document.getElementById('softwareName').dataset,
                    aiLogo: aiLogo,
                    willInclude: !!aiLogo
                });
                if (aiLogo) {
                    data.logo = aiLogo;
                    console.log('Using AI-generated logo:', aiLogo);
                } else {
                    console.log('No logo to include in save request');
                }
            }
        }

        // Handle Steckbrief PDF upload
        const steckbriefFile = document.getElementById('softwareSteckbrief')?.files[0];
        if (steckbriefFile) {
            const formData = new FormData();
            formData.append('file', steckbriefFile);
            const headers = {};
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const steckRes = await fetch('/api/upload.php?action=steckbrief', {
                method: 'POST', credentials: 'same-origin', headers, body: formData
            });
            const steckResult = await steckRes.json();
            if (steckResult.path) {
                data.steckbrief_path = steckResult.path;
                data.steckbrief_original_name = steckResult.original_name || steckbriefFile.name;
            }
        } else {
            const existingPath = document.getElementById('softwareSteckbriefPath')?.value;
            data.steckbrief_path = existingPath || '';
            if (!existingPath) {
                data.steckbrief_original_name = '';
            }
        }

        console.log('Final data being sent to API:', data);

        if (id) {
            await AdminAPI.updateSoftware(id, data);
            showToast(t('software.updated'), 'success');
        } else {
            await AdminAPI.createSoftware(data);
            showToast(t('software.created'), 'success');
        }

        // Reload data
        const result = await AdminAPI.getSoftware();
        AdminState.software = result.data || [];
        renderSoftwareList();

        // If called from "Speichern & Schließen" (form submit), close
        if (e && e.type === 'submit') {
            closeSoftwareEditPage();
        } else {
            // Stay on page: update the ID for newly created entries
            const savedId = data._savedId;
            if (!id && AdminState.software.length > 0) {
                // Reload the item to get the new ID
                const newest = AdminState.software.find(s => s.name === data.name);
                if (newest) document.getElementById('softwareId').value = newest.id;
            }
        }
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

async function saveSoftwareStay(e) {
    // Create a fake event to prevent form submission
    const fakeEvent = { preventDefault: () => {}, type: 'click' };
    await saveSoftware(fakeEvent);
}

function previewSoftware() {
    const id = document.getElementById('softwareId')?.value;
    if (!id) {
        showToast('Bitte zuerst speichern', 'info');
        return;
    }

    // Create or reuse preview overlay with iframe
    let overlay = document.getElementById('previewOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'previewOverlay';
        overlay.className = 'preview-overlay';
        overlay.innerHTML = `
            <div class="preview-toolbar">
                <span>Vorschau</span>
                <button class="btn btn-ghost" onclick="closePreview()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Schließen
                </button>
            </div>
            <iframe id="previewIframe" class="preview-iframe"></iframe>
        `;
        document.body.appendChild(overlay);
    }

    document.getElementById('previewIframe').src = '/?software=' + id + '&hideHeader=true&hideFooter=true';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePreview() {
    const overlay = document.getElementById('previewOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.getElementById('previewIframe').src = '';
        document.body.style.overflow = '';
    }
}

function confirmDeleteSoftware(id) {
    const item = AdminState.software.find(s => s.id === id);
    if (!item) return;

    AdminUI.showConfirmDialog(
        t('common.confirmDelete'),
        t('software.deleteConfirm', { name: item.name }),
        async () => {
            showLoading();
            try {
                await AdminAPI.deleteSoftware(id);
                showToast(t('software.deleted'), 'success');

                // Reload data
                const result = await AdminAPI.getSoftware();
                AdminState.software = result.data || [];
                renderSoftwareList();
            } catch (error) {
                showToast(error.message || t('errors.deleteFailed'), 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// Batch delete functionality
function confirmBatchDelete() {
    const selectedIds = Array.from(document.querySelectorAll('.software-select:checked'))
        .map(cb => cb.dataset.id);

    if (selectedIds.length === 0) return;

    const message = selectedIds.length === 1 ?
        'Möchten Sie wirklich 1 Software löschen?' :
        `Möchten Sie wirklich ${selectedIds.length} Software-Einträge löschen?`;

    AdminUI.showConfirmDialog(
        'Ausgewählte löschen',
        message,
        async () => {
            showLoading();
            try {
                const batchResult = await AdminAPI.batchDeleteSoftware(selectedIds);
                const deleted = typeof batchResult?.deleted === 'number' ? batchResult.deleted : selectedIds.length;
                const total = typeof batchResult?.total === 'number' ? batchResult.total : selectedIds.length;
                const errors = Array.isArray(batchResult?.errors) ? batchResult.errors : [];

                if (errors.length === 0) {
                    showToast(`${deleted} Einträge erfolgreich gelöscht`, 'success');
                } else {
                    showToast(`${deleted} Einträge gelöscht, ${errors.length} Fehler`, 'warning');
                    console.error('Batch delete errors:', errors);
                }

                // Reload data
                const reloadResult = await AdminAPI.getSoftware();
                AdminState.software = reloadResult.data || [];
                renderSoftwareList();

                // Uncheck select all
                const selectAll = document.getElementById('selectAllSoftware');
                if (selectAll) selectAll.checked = false;
                updateBatchDeleteButton();
            } catch (error) {
                showToast('Fehler beim Löschen', 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// Reload favicon for a software entry
async function reloadFavicon(id) {
    const item = AdminState.software.find(s => s.id === id);
    if (!item || !item.url) {
        showToast('Keine URL vorhanden', 'error');
        return;
    }

    showLoading();
    try {
        const response = await fetch('/api/favicon.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                software_id: id,
                url: item.url
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Favicon erfolgreich aktualisiert', 'success');
            // Reload data to show new favicon
            const softwareResult = await AdminAPI.getSoftware();
            AdminState.software = softwareResult.data || [];
            renderSoftwareList();
        } else {
            showToast(result.error || 'Fehler beim Laden des Favicons', 'error');
        }
    } catch (error) {
        console.error('Error reloading favicon:', error);
        showToast('Fehler beim Laden des Favicons', 'error');
    } finally {
        hideLoading();
    }
}

// Translate a software entry
async function translateSoftware(id) {
    const item = AdminState.software.find(s => s.id === id);
    if (!item) return;

    showLoading();
    try {
        const response = await fetch('/api/translate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ software_id: id })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Übersetzung erfolgreich erstellt', 'success');
            const softwareResult = await AdminAPI.getSoftware();
            AdminState.software = softwareResult.data || [];
            renderSoftwareList();
        } else {
            showToast(result.error || 'Fehler bei der Übersetzung', 'error');
        }
    } catch (error) {
        console.error('Error translating software:', error);
        showToast('Fehler bei der Übersetzung', 'error');
    } finally {
        hideLoading();
    }
}

// Batch translate selected software entries (one by one with progress)
async function batchTranslateSoftware() {
    const selectedIds = Array.from(document.querySelectorAll('.software-select:checked'))
        .map(cb => cb.dataset.id);

    if (selectedIds.length === 0) {
        showToast('Keine Software ausgewählt', 'info');
        return;
    }

    if (!confirm(`${selectedIds.length} Einträge übersetzen? Dies kann einige Zeit dauern.`)) {
        return;
    }

    const btn = document.getElementById('batchTranslateBtn');
    const countSpan = document.getElementById('batchTranslateCount');
    if (btn) btn.disabled = true;

    let success = 0;
    let failed = 0;

    for (let i = 0; i < selectedIds.length; i++) {
        if (countSpan) countSpan.textContent = `Übersetze ${i + 1}/${selectedIds.length}...`;

        try {
            const response = await fetch('/api/translate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ software_id: selectedIds[i] })
            });

            const result = await response.json();
            if (result.success) {
                success++;
            } else {
                failed++;
                console.warn(`Translation failed for ${selectedIds[i]}:`, result.error);
            }
        } catch (error) {
            failed++;
            console.error(`Error translating ${selectedIds[i]}:`, error);
        }
    }

    // Reload and show result
    const softwareResult = await AdminAPI.getSoftware();
    AdminState.software = softwareResult.data || [];
    renderSoftwareList();

    if (failed === 0) {
        showToast(`${success} von ${selectedIds.length} Einträgen erfolgreich übersetzt`, 'success');
    } else {
        showToast(`${success} übersetzt, ${failed} fehlgeschlagen`, failed === selectedIds.length ? 'error' : 'warning');
    }

    if (btn) btn.disabled = false;
}

// Optimize a single software entry
async function optimizeSoftware(id) {
    showLoading();
    try {
        const response = await fetch('/api/optimize.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ software_id: id })
        });

        const result = await response.json();
        if (result.success) {
            showToast('Beschreibung optimiert', 'success');
            const softwareResult = await AdminAPI.getSoftware();
            AdminState.software = softwareResult.data || [];
            renderSoftwareList();
        } else {
            showToast(result.error || 'Fehler bei der Optimierung', 'error');
        }
    } catch (error) {
        console.error('Error optimizing software:', error);
        showToast('Fehler bei der Optimierung', 'error');
    } finally {
        hideLoading();
    }
}

// Optimize software descriptions directly in the edit modal
async function optimizeSoftwareInModal() {
    const id = document.getElementById('softwareId')?.value;
    if (!id) {
        showToast('Keine Software-ID gefunden', 'error');
        return;
    }

    const btn = document.getElementById('optimizeDescBtn');
    if (btn) btn.disabled = true;

    showLoading();
    try {
        const response = await fetch('/api/optimize.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ software_id: id })
        });

        const result = await response.json();
        if (result.success && result.optimized) {
            const shortDesc = document.getElementById('softwareShortDescription');
            const desc = document.getElementById('softwareDescription');
            const features = document.getElementById('softwareFeatures');

            if (shortDesc) shortDesc.value = result.optimized.short_description || '';
            if (desc) desc.value = result.optimized.description || '';
            if (features) features.value = result.optimized.features || '';

            // Update English fields if optimized
            if (result.optimized.short_description_en) {
                const shortDescEn = document.getElementById('softwareShortDescriptionEn');
                if (shortDescEn) shortDescEn.value = result.optimized.short_description_en;
            }
            if (result.optimized.description_en) {
                const descEn = document.getElementById('softwareDescriptionEn');
                if (descEn) descEn.value = result.optimized.description_en;
            }
            if (result.optimized.features_en) {
                const featuresEn = document.getElementById('softwareFeaturesEn');
                if (featuresEn) featuresEn.value = result.optimized.features_en;
            }

            // Sync updated textareas into Quill editors
            loadTextareasToQuill();

            showToast(result.message || 'Beschreibungen optimiert', 'success');

            // Also refresh the list in background
            const softwareResult = await AdminAPI.getSoftware();
            AdminState.software = softwareResult.data || [];
            renderSoftwareList();
        } else {
            showToast(result.error || 'Fehler bei der Optimierung', 'error');
        }
    } catch (error) {
        console.error('Error optimizing software in modal:', error);
        showToast('Fehler bei der Optimierung', 'error');
    } finally {
        hideLoading();
        if (btn) btn.disabled = false;
    }
}

// Batch optimize selected software entries
async function batchOptimizeSoftware() {
    const selectedIds = Array.from(document.querySelectorAll('.software-select:checked'))
        .map(cb => cb.dataset.id);

    if (selectedIds.length === 0) {
        showToast('Keine Software ausgewählt', 'info');
        return;
    }

    if (!confirm(`Beschreibungen von ${selectedIds.length} Einträgen optimieren?`)) {
        return;
    }

    const btn = document.getElementById('batchOptimizeBtn');
    const countSpan = document.getElementById('batchOptimizeCount');
    if (btn) btn.disabled = true;

    let success = 0;
    let failed = 0;

    for (let i = 0; i < selectedIds.length; i++) {
        if (countSpan) countSpan.textContent = `Optimiere ${i + 1}/${selectedIds.length}...`;

        try {
            const response = await fetch('/api/optimize.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ software_id: selectedIds[i] })
            });

            const result = await response.json();
            if (result.success) {
                success++;
            } else {
                failed++;
                console.warn(`Optimization failed for ${selectedIds[i]}:`, result.error);
            }
        } catch (error) {
            failed++;
            console.error(`Error optimizing ${selectedIds[i]}:`, error);
        }
    }

    const softwareResult = await AdminAPI.getSoftware();
    AdminState.software = softwareResult.data || [];
    renderSoftwareList();

    if (failed === 0) {
        showToast(`${success} von ${selectedIds.length} Beschreibungen optimiert`, 'success');
    } else {
        showToast(`${success} optimiert, ${failed} fehlgeschlagen`, failed === selectedIds.length ? 'error' : 'warning');
    }

    if (btn) btn.disabled = false;
}

// ==========================================
// CATEGORIES PAGE
// ==========================================

async function initCategoriesPage() {
    showLoading();
    try {
        const result = await AdminAPI.getCategories();
        AdminState.categories = result.data || [];
        renderCategoriesList();
        setupCategoriesEventListeners();
    } catch (error) {
        showToast(t('errors.loadFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function renderCategoriesList() {
    const container = document.getElementById('categoriesTableBody');
    if (!container) return;

    const searchInput = document.getElementById('categorySearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const translationFilter = document.getElementById('filterCategoryTranslation');
    const softwareFilter = document.getElementById('filterCategorySoftware');

    const selectedTranslation = translationFilter ? translationFilter.value : '';
    const selectedSoftware = softwareFilter ? softwareFilter.value : '';

    const filtered = AdminState.categories.filter(item => {
        // Search filter
        if (searchTerm) {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                   (item.description && item.description.toLowerCase().includes(searchTerm));
            if (!matchesSearch) return false;
        }

        // Translation filter
        if (selectedTranslation) {
            const hasTranslation = item.name_en && item.description_en;
            if (selectedTranslation === 'complete' && !hasTranslation) return false;
            if (selectedTranslation === 'missing' && hasTranslation) return false;
        }

        // Software filter
        if (selectedSoftware) {
            const softwareCount = item.software_count || 0;
            if (selectedSoftware === 'with' && softwareCount === 0) return false;
            if (selectedSoftware === 'without' && softwareCount > 0) return false;
        }

        return true;
    });

    const columns = [
        {
            key: 'select',
            label: '<input type="checkbox" id="selectAllCategories" title="Alle auswählen">',
            render: (item) => `<input type="checkbox" class="category-select" data-id="${item.id}">`
        },
        {
            key: 'name',
            label: t('common.name'),
            render: (item) => `<strong>${escapeHtml(item.name)}</strong>`
        },
        {
            key: 'description',
            label: t('common.description'),
            render: (item) => escapeHtml(item.description || '-')
        },
        {
            key: 'translation',
            label: t('common.translation'),
            render: (item) => {
                const hasTranslation = item.name_en;
                const statusIcon = hasTranslation ?
                    '<span class="translation-status complete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' :
                    '<span class="translation-status missing"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>';
                const translateBtn = `<button class="btn-icon-sm" onclick="translateCategory('${item.id}')" title="Mit KI übersetzen" style="margin-left:0.25rem;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg></button>`;
                return `<div style="display:flex;align-items:center;">${statusIcon}${translateBtn}</div>`;
            }
        },
        {
            key: 'software_count',
            label: t('stats.softwareCount'),
            render: (item) => `<span class="badge badge-gray">${item.software_count || 0}</span>`
        }
    ];

    AdminUI.renderDataTable(container, columns, filtered, {
        onEdit: (id) => openCategoryModal(id),
        onDelete: (id) => confirmDeleteCategory(id),
        emptyMessage: t('categories.noCategories')
    });

    updateBatchDeleteCategoriesButton();
}

function setupCategoriesEventListeners() {
    // Search
    const searchInput = document.getElementById('categorySearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderCategoriesList, 300);
        });
    }

    // Filter listeners
    const translationFilter = document.getElementById('filterCategoryTranslation');
    const softwareFilter = document.getElementById('filterCategorySoftware');
    const clearFiltersBtn = document.getElementById('clearCategoryFiltersBtn');

    if (translationFilter) {
        translationFilter.addEventListener('change', renderCategoriesList);
    }
    if (softwareFilter) {
        softwareFilter.addEventListener('change', renderCategoriesList);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (translationFilter) translationFilter.value = '';
            if (softwareFilter) softwareFilter.value = '';
            if (searchInput) searchInput.value = '';
            renderCategoriesList();
        });
    }

    // Select all / Einzel-Checkboxen
    document.addEventListener('change', (e) => {
        if (e.target.id === 'selectAllCategories') {
            document.querySelectorAll('.category-select').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBatchDeleteCategoriesButton();
        } else if (e.target.classList?.contains('category-select')) {
            updateBatchDeleteCategoriesButton();
        }
    });

    // New button
    const newBtn = document.getElementById('newCategoryBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => openCategoryModal());
    }
}

function updateBatchDeleteCategoriesButton() {
    const batchBtn = document.getElementById('batchDeleteCategoriesBtn');
    const countSpan = document.getElementById('batchDeleteCategoriesCount');
    const batchTransBtn = document.getElementById('batchTranslateCategoriesBtn');
    const transCountSpan = document.getElementById('batchTranslateCategoriesCount');

    const selectedCount = document.querySelectorAll('.category-select:checked').length;

    if (batchBtn && countSpan) {
        if (selectedCount > 0) {
            batchBtn.style.display = 'inline-flex';
            batchBtn.disabled = false;
            countSpan.textContent = `Löschen (${selectedCount})`;
        } else {
            batchBtn.disabled = true;
            batchBtn.style.display = 'none';
            countSpan.textContent = 'Löschen (0)';
        }
    }

    if (batchTransBtn && transCountSpan) {
        if (selectedCount > 0) {
            batchTransBtn.style.display = 'inline-flex';
            batchTransBtn.disabled = false;
            transCountSpan.textContent = `Übersetzen (${selectedCount})`;
        } else {
            batchTransBtn.disabled = true;
            batchTransBtn.style.display = 'none';
            transCountSpan.textContent = 'Übersetzen (0)';
        }
    }
}

function openCategoryModal(id = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryModalTitle');

    form.reset();
    document.getElementById('categoryId').value = '';

    if (id) {
        title.textContent = t('categories.edit');
        const item = AdminState.categories.find(c => c.id === id);
        if (item) {
            document.getElementById('categoryId').value = item.id;
            document.getElementById('categoryName').value = item.name || '';
            document.getElementById('categoryNameEn').value = item.name_en || '';
            document.getElementById('categoryDescription').value = item.description || '';
            document.getElementById('categoryDescriptionEn').value = item.description_en || '';
        }
    } else {
        title.textContent = t('categories.new');
    }

    openModal('categoryModal');
}

async function saveCategory(e) {
    e.preventDefault();
    showLoading();

    const id = document.getElementById('categoryId').value;
    const data = {
        name: document.getElementById('categoryName').value,
        name_en: document.getElementById('categoryNameEn').value,
        description: document.getElementById('categoryDescription').value,
        description_en: document.getElementById('categoryDescriptionEn').value
    };

    try {
        if (id) {
            await AdminAPI.updateCategory(id, data);
            showToast(t('categories.updated'), 'success');
        } else {
            await AdminAPI.createCategory(data);
            showToast(t('categories.created'), 'success');
        }

        closeModal('categoryModal');

        const result = await AdminAPI.getCategories();
        AdminState.categories = result.data || [];
        renderCategoriesList();
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function confirmDeleteCategory(id) {
    const item = AdminState.categories.find(c => c.id === id);
    if (!item) return;

    AdminUI.showConfirmDialog(
        t('common.confirmDelete'),
        t('categories.deleteConfirm', { name: item.name }),
        async () => {
            showLoading();
            try {
                await AdminAPI.deleteCategory(id);
                showToast(t('categories.deleted'), 'success');

                const result = await AdminAPI.getCategories();
                AdminState.categories = result.data || [];
                renderCategoriesList();
            } catch (error) {
                showToast(error.message || t('errors.deleteFailed'), 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// Batch delete categories
function confirmBatchDeleteCategories() {
    const selectedIds = Array.from(document.querySelectorAll('.category-select:checked'))
        .map(cb => cb.dataset.id);

    if (selectedIds.length === 0) return;

    const message = selectedIds.length === 1
        ? 'Möchten Sie wirklich 1 Kategorie löschen?'
        : `Möchten Sie wirklich ${selectedIds.length} Kategorien löschen?`;

    AdminUI.showConfirmDialog(
        'Ausgewählte löschen',
        message,
        async () => {
            showLoading();
            try {
                let successCount = 0;
                let errorCount = 0;

                for (const id of selectedIds) {
                    try {
                        await AdminAPI.deleteCategory(id);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        console.error(`Error deleting category ${id}:`, error);
                    }
                }

                if (errorCount === 0) {
                    showToast(`${successCount} Kategorien erfolgreich gelöscht`, 'success');
                } else {
                    showToast(`${successCount} Kategorien gelöscht, ${errorCount} Fehler`, 'warning');
                }

                const result = await AdminAPI.getCategories();
                AdminState.categories = result.data || [];
                renderCategoriesList();

                const selectAll = document.getElementById('selectAllCategories');
                if (selectAll) selectAll.checked = false;
                updateBatchDeleteCategoriesButton();
            } catch (error) {
                showToast('Fehler beim Löschen', 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// ==========================================
// TARGET GROUPS PAGE
// ==========================================

async function initTargetGroupsPage() {
    showLoading();
    try {
        const result = await AdminAPI.getTargetGroups();
        AdminState.targetGroups = result.data || [];
        renderTargetGroupsList();
        setupTargetGroupsEventListeners();
    } catch (error) {
        showToast(t('errors.loadFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function renderTargetGroupsList() {
    const container = document.getElementById('targetGroupsTableBody');
    if (!container) return;

    const searchInput = document.getElementById('targetGroupSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const translationFilter = document.getElementById('filterTargetGroupTranslation');
    const softwareFilter = document.getElementById('filterTargetGroupSoftware');

    const selectedTranslation = translationFilter ? translationFilter.value : '';
    const selectedSoftware = softwareFilter ? softwareFilter.value : '';

    const filtered = AdminState.targetGroups.filter(item => {
        // Search filter
        if (searchTerm) {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                   (item.description && item.description.toLowerCase().includes(searchTerm));
            if (!matchesSearch) return false;
        }

        // Translation filter
        if (selectedTranslation) {
            const hasTranslation = item.name_en && item.description_en;
            if (selectedTranslation === 'complete' && !hasTranslation) return false;
            if (selectedTranslation === 'missing' && hasTranslation) return false;
        }

        // Software filter
        if (selectedSoftware) {
            const softwareCount = item.software_count || 0;
            if (selectedSoftware === 'with' && softwareCount === 0) return false;
            if (selectedSoftware === 'without' && softwareCount > 0) return false;
        }

        return true;
    });

    const columns = [
        {
            key: 'select',
            label: '<input type="checkbox" id="selectAllTargetGroups" title="Alle auswählen">',
            render: (item) => `<input type="checkbox" class="target-group-select" data-id="${item.id}">`
        },
        {
            key: 'name',
            label: t('common.name'),
            render: (item) => `<strong>${escapeHtml(item.name)}</strong>`
        },
        {
            key: 'description',
            label: t('common.description'),
            render: (item) => escapeHtml(item.description || '-')
        },
        {
            key: 'translation',
            label: t('common.translation'),
            render: (item) => {
                const hasTranslation = item.name_en;
                const statusIcon = hasTranslation ?
                    '<span class="translation-status complete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' :
                    '<span class="translation-status missing"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>';
                const translateBtn = `<button class="btn-icon-sm" onclick="translateTargetGroup('${item.id}')" title="Mit KI übersetzen" style="margin-left:0.25rem;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg></button>`;
                return `<div style="display:flex;align-items:center;">${statusIcon}${translateBtn}</div>`;
            }
        },
        {
            key: 'software_count',
            label: t('stats.softwareCount'),
            render: (item) => `<span class="badge badge-gray">${item.software_count || 0}</span>`
        }
    ];

    AdminUI.renderDataTable(container, columns, filtered, {
        onEdit: (id) => openTargetGroupModal(id),
        onDelete: (id) => confirmDeleteTargetGroup(id),
        emptyMessage: t('targetGroups.noTargetGroups')
    });

    updateBatchDeleteTargetGroupsButton();
}

function setupTargetGroupsEventListeners() {
    // Search
    const searchInput = document.getElementById('targetGroupSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderTargetGroupsList, 300);
        });
    }

    // Filter listeners
    const translationFilter = document.getElementById('filterTargetGroupTranslation');
    const softwareFilter = document.getElementById('filterTargetGroupSoftware');
    const clearFiltersBtn = document.getElementById('clearTargetGroupFiltersBtn');

    if (translationFilter) {
        translationFilter.addEventListener('change', renderTargetGroupsList);
    }
    if (softwareFilter) {
        softwareFilter.addEventListener('change', renderTargetGroupsList);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (translationFilter) translationFilter.value = '';
            if (softwareFilter) softwareFilter.value = '';
            if (searchInput) searchInput.value = '';
            renderTargetGroupsList();
        });
    }

    // Select all / Einzel-Checkboxen
    document.addEventListener('change', (e) => {
        if (e.target.id === 'selectAllTargetGroups') {
            document.querySelectorAll('.target-group-select').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBatchDeleteTargetGroupsButton();
        } else if (e.target.classList?.contains('target-group-select')) {
            updateBatchDeleteTargetGroupsButton();
        }
    });

    // New button
    const newBtn = document.getElementById('newTargetGroupBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => openTargetGroupModal());
    }
}

function updateBatchDeleteTargetGroupsButton() {
    const batchBtn = document.getElementById('batchDeleteTargetGroupsBtn');
    const countSpan = document.getElementById('batchDeleteTargetGroupsCount');
    const batchTransBtn = document.getElementById('batchTranslateTargetGroupsBtn');
    const transCountSpan = document.getElementById('batchTranslateTargetGroupsCount');

    const selectedCount = document.querySelectorAll('.target-group-select:checked').length;

    if (batchBtn && countSpan) {
        if (selectedCount > 0) {
            batchBtn.style.display = 'inline-flex';
            batchBtn.disabled = false;
            countSpan.textContent = `Löschen (${selectedCount})`;
        } else {
            batchBtn.disabled = true;
            batchBtn.style.display = 'none';
            countSpan.textContent = 'Löschen (0)';
        }
    }

    if (batchTransBtn && transCountSpan) {
        if (selectedCount > 0) {
            batchTransBtn.style.display = 'inline-flex';
            batchTransBtn.disabled = false;
            transCountSpan.textContent = `Übersetzen (${selectedCount})`;
        } else {
            batchTransBtn.disabled = true;
            batchTransBtn.style.display = 'none';
            transCountSpan.textContent = 'Übersetzen (0)';
        }
    }
}

function openTargetGroupModal(id = null) {
    const modal = document.getElementById('targetGroupModal');
    const form = document.getElementById('targetGroupForm');
    const title = document.getElementById('targetGroupModalTitle');

    form.reset();
    document.getElementById('targetGroupId').value = '';

    if (id) {
        title.textContent = t('targetGroups.edit');
        const item = AdminState.targetGroups.find(tg => tg.id === id);
        if (item) {
            document.getElementById('targetGroupId').value = item.id;
            document.getElementById('targetGroupName').value = item.name || '';
            document.getElementById('targetGroupNameEn').value = item.name_en || '';
            document.getElementById('targetGroupDescription').value = item.description || '';
            document.getElementById('targetGroupDescriptionEn').value = item.description_en || '';
        }
    } else {
        title.textContent = t('targetGroups.new');
    }

    openModal('targetGroupModal');
}

async function saveTargetGroup(e) {
    e.preventDefault();
    showLoading();

    const id = document.getElementById('targetGroupId').value;
    const data = {
        name: document.getElementById('targetGroupName').value,
        name_en: document.getElementById('targetGroupNameEn').value,
        description: document.getElementById('targetGroupDescription').value,
        description_en: document.getElementById('targetGroupDescriptionEn').value
    };

    try {
        if (id) {
            await AdminAPI.updateTargetGroup(id, data);
            showToast(t('targetGroups.updated'), 'success');
        } else {
            await AdminAPI.createTargetGroup(data);
            showToast(t('targetGroups.created'), 'success');
        }

        closeModal('targetGroupModal');

        const result = await AdminAPI.getTargetGroups();
        AdminState.targetGroups = result.data || [];
        renderTargetGroupsList();
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function confirmDeleteTargetGroup(id) {
    const item = AdminState.targetGroups.find(tg => tg.id === id);
    if (!item) return;

    AdminUI.showConfirmDialog(
        t('common.confirmDelete'),
        t('targetGroups.deleteConfirm', { name: item.name }),
        async () => {
            showLoading();
            try {
                await AdminAPI.deleteTargetGroup(id);
                showToast(t('targetGroups.deleted'), 'success');

                const result = await AdminAPI.getTargetGroups();
                AdminState.targetGroups = result.data || [];
                renderTargetGroupsList();
            } catch (error) {
                showToast(error.message || t('errors.deleteFailed'), 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// Batch delete target groups
function confirmBatchDeleteTargetGroups() {
    const selectedIds = Array.from(document.querySelectorAll('.target-group-select:checked'))
        .map(cb => cb.dataset.id);

    if (selectedIds.length === 0) return;

    const message = selectedIds.length === 1
        ? 'Möchten Sie wirklich 1 Zielgruppe löschen?'
        : `Möchten Sie wirklich ${selectedIds.length} Zielgruppen löschen?`;

    AdminUI.showConfirmDialog(
        'Ausgewählte löschen',
        message,
        async () => {
            showLoading();
            try {
                let successCount = 0;
                let errorCount = 0;

                for (const id of selectedIds) {
                    try {
                        await AdminAPI.deleteTargetGroup(id);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        console.error(`Error deleting target group ${id}:`, error);
                    }
                }

                if (errorCount === 0) {
                    showToast(`${successCount} Zielgruppen erfolgreich gelöscht`, 'success');
                } else {
                    showToast(`${successCount} Zielgruppen gelöscht, ${errorCount} Fehler`, 'warning');
                }

                const result = await AdminAPI.getTargetGroups();
                AdminState.targetGroups = result.data || [];
                renderTargetGroupsList();

                const selectAll = document.getElementById('selectAllTargetGroups');
                if (selectAll) selectAll.checked = false;
                updateBatchDeleteTargetGroupsButton();
            } catch (error) {
                showToast('Fehler beim Löschen', 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

// ==========================================
// USERS PAGE
// ==========================================

async function initUsersPage() {
    showLoading();
    try {
        const result = await AdminAPI.getUsers();
        AdminState.users = result.data || [];
        renderUsersList();
        setupUsersEventListeners();
    } catch (error) {
        showToast(t('errors.loadFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function renderUsersList() {
    const container = document.getElementById('usersTableBody');
    if (!container) return;

    const searchInput = document.getElementById('usersSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = AdminState.users.filter(item => {
        if (!searchTerm) return true;
        return item.name.toLowerCase().includes(searchTerm) ||
               item.email.toLowerCase().includes(searchTerm);
    });

    const columns = [
        {
            key: 'name',
            label: t('users.name'),
            render: (item) => `<strong>${escapeHtml(item.name)}</strong>`
        },
        {
            key: 'email',
            label: t('users.email'),
            render: (item) => escapeHtml(item.email)
        },
        {
            key: 'role',
            label: t('users.role'),
            render: (item) => {
                const badgeClass = item.role === 'ADMIN' ? 'badge-primary' : 'badge-gray';
                const roleText = item.role === 'ADMIN' ? t('users.admin') : t('users.user');
                return `<span class="badge ${badgeClass}">${roleText}</span>`;
            }
        },
        {
            key: 'created_at',
            label: t('common.createdAt'),
            render: (item) => formatDate(item.created_at)
        }
    ];

    AdminUI.renderDataTable(container, columns, filtered, {
        onEdit: (id) => openUserModal(id),
        onDelete: (id) => confirmDeleteUser(id),
        emptyMessage: t('users.noUsers')
    });
}

function setupUsersEventListeners() {
    // Search
    const searchInput = document.getElementById('usersSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderUsersList, 300);
        });
    }

    // New button
    const newBtn = document.getElementById('newUserBtn');
    if (newBtn) {
        newBtn.addEventListener('click', () => openUserModal());
    }
}

function openUserModal(id = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    const passwordGroup = document.getElementById('passwordGroup');

    form.reset();
    document.getElementById('userId').value = '';

    const passwordInput = document.getElementById('userPassword');
    const passwordHint = document.getElementById('passwordHint');

    if (id) {
        title.textContent = t('users.edit');
        passwordGroup.classList.remove('hidden');
        passwordInput.required = false;
        passwordInput.placeholder = '••••••••';
        if (passwordHint) passwordHint.style.display = '';
        const item = AdminState.users.find(u => u.id === id);
        if (item) {
            document.getElementById('userId').value = item.id;
            document.getElementById('userName').value = item.name || '';
            document.getElementById('userEmail').value = item.email || '';
            document.getElementById('userRole').value = item.role || 'USER';
        }
    } else {
        title.textContent = t('users.new');
        passwordGroup.classList.remove('hidden');
        passwordInput.required = true;
        passwordInput.placeholder = '';
        if (passwordHint) passwordHint.style.display = 'none';
    }

    openModal('userModal');
}

async function saveUser(e) {
    e.preventDefault();
    showLoading();

    const id = document.getElementById('userId').value;
    const data = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value
    };

    // Include password if filled in (required for new users, optional for edit)
    const password = document.getElementById('userPassword').value;
    const passwordConfirm = document.getElementById('userPasswordConfirm').value;
    if (password) {
        if (password !== passwordConfirm) {
            hideLoading();
            showToast('Passwörter stimmen nicht überein', 'error');
            return;
        }
        data.password = password;
    }

    try {
        if (id) {
            await AdminAPI.updateUser(id, data);
            showToast(t('users.updated'), 'success');
        } else {
            await AdminAPI.createUser(data);
            showToast(t('users.created'), 'success');
        }

        closeModal('userModal');

        const result = await AdminAPI.getUsers();
        AdminState.users = result.data || [];
        renderUsersList();
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function confirmDeleteUser(id) {
    const item = AdminState.users.find(u => u.id === id);
    if (!item) return;

    AdminUI.showConfirmDialog(
        t('common.confirmDelete'),
        t('users.deleteConfirm', { name: item.name }),
        async () => {
            showLoading();
            try {
                await AdminAPI.deleteUser(id);
                showToast(t('users.deleted'), 'success');

                const result = await AdminAPI.getUsers();
                AdminState.users = result.data || [];
                renderUsersList();
            } catch (error) {
                showToast(error.message || t('errors.deleteFailed'), 'error');
            } finally {
                hideLoading();
            }
        }
    );
}

function openPasswordResetModal(id) {
    const item = AdminState.users.find(u => u.id === id);
    if (!item) return;

    document.getElementById('resetPasswordUserId').value = id;
    document.getElementById('resetPasswordUserName').textContent = item.name;
    document.getElementById('newPassword').value = '';

    openModal('passwordResetModal');
}

async function resetPassword(e) {
    e.preventDefault();
    showLoading();

    const id = document.getElementById('resetPasswordUserId').value;
    const password = document.getElementById('newPassword').value;

    try {
        await AdminAPI.resetUserPassword(id, password);
        showToast(t('users.passwordReset'), 'success');
        closeModal('passwordResetModal');
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

// ==========================================
// SETTINGS PAGE
// ==========================================

async function initSettingsPage() {
    showLoading();
    try {
        const result = await AdminAPI.getSettings();
        // Settings API returns object directly, not wrapped in .data
        AdminState.settings = result?.data ?? result ?? {};
        if (typeof AdminState.settings !== 'object' || AdminState.settings === null) {
            AdminState.settings = {};
        }
        renderSettings();
        setupSettingsEventListeners();
    } catch (error) {
        console.error('Settings load error:', error);
        showToast(t('errors.loadFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function renderSettings() {
    const s = AdminState.settings || {};
    const setVal = (id, value) => { const el = document.getElementById(id); if (el) el.value = value; };
    const setCheck = (id, checked) => { const el = document.getElementById(id); if (el) el.checked = checked; };

    // Badge settings
    setVal('badgeText', s.badge_available_text || '');
    setCheck('badgeShow', s.badge_show === 'true');
    setVal('badgeBgColor', s.badge_available_color || '#22c55e');
    setVal('badgeBgColorText', s.badge_available_color || '#22c55e');
    setVal('badgeTextColor', s.badge_available_text_color || '#ffffff');
    setVal('badgeTextColorText', s.badge_available_text_color || '#ffffff');

    // Link settings
    setCheck('showHeader', s.show_header !== 'false');
    setCheck('showFooter', s.show_footer !== 'false');
    setVal('impressumUrl', s.impressum_url || '');
    setVal('datenschutzUrl', s.datenschutz_url || '');
    setCheck('linksNewTab', s.links_new_tab === 'true');
    setCheck('showFooterLinks', s.show_footer_links === 'true');

    // DSGVO settings / Inhouse
    setCheck('showDsgvoIndicator', s.dsgvo_indicator_show === 'true');
    setVal('dsgvoColorGreen', s.dsgvo_color_green || '#22c55e');
    setVal('dsgvoColorGreenText', s.dsgvo_color_green || '#22c55e');
    setVal('dsgvoColorYellow', s.dsgvo_color_yellow || '#eab308');
    setVal('dsgvoColorYellowText', s.dsgvo_color_yellow || '#eab308');
    setVal('dsgvoColorRed', s.dsgvo_color_red || '#ef4444');
    setVal('dsgvoColorRedText', s.dsgvo_color_red || '#ef4444');
    setVal('categoryBadgeBg', s.category_badge_bg || '#99f6e4');
    setVal('categoryBadgeBgText', s.category_badge_bg || '#99f6e4');
    setVal('categoryBadgeColor', s.category_badge_text_color || '#004d44');
    setVal('categoryBadgeColorText', s.category_badge_text_color || '#004d44');
    setVal('inhouseLogo', s.inhouse_logo_url || '');
    setVal('inhouseTooltip', s.inhouse_tooltip || '');

    // Badge icon settings
    setVal('badgeIcon', s.badge_icon || '');
    setVal('badgeIconColor', s.badge_icon_color || (s.badge_available_text_color || '#ffffff'));
    setVal('badgeIconColorText', s.badge_icon_color || (s.badge_available_text_color || '#ffffff'));
    setVal('badgeIconPosition', s.badge_icon_position || 'before');

    updateBadgePreview();

    // AI settings
    const aiProvider = s.AI_PROVIDER || 'gemini';
    setVal('aiProvider', aiProvider);
    setVal('geminiApiKey', s.GOOGLE_GEMINI_API_KEY || '');
    setVal('geminiModel', s.GEMINI_MODEL || 'gemini-1.5-flash');
    setVal('mistralApiKey', s.MISTRAL_API_KEY || '');
    setVal('mistralModel', s.MISTRAL_MODEL || 'mistral-small-latest');
    setVal('aiDescriptionWords', s.AI_DESCRIPTION_WORDS || '100');
    setVal('aiShortDescriptionWords', s.AI_SHORT_DESCRIPTION_WORDS || '20');
    setVal('aiOptimizePrompt', s.AI_OPTIMIZE_PROMPT || getDefaultOptimizePrompt());

    toggleAiProviderSettings(aiProvider);
    updateAiStatusBadges();
}

function setupSettingsEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');

            // Initialize tab-specific functionality when switching tabs
            if (btn.dataset.tab === 'importExportTab') {
                setupImportExportTab();
            } else if (btn.dataset.tab === 'footerLinksTab') {
                setupFooterLinksTab();
            } else if (btn.dataset.tab === 'embedTab') {
                setupEmbedTab();
            } else if (btn.dataset.tab === 'brandingTab') {
                setupBrandingTab();
            }
        });
    });

    // Save badge settings
    document.getElementById('saveBadgeSettings')?.addEventListener('click', saveBadgeSettings);

    // Save link settings
    document.getElementById('saveLinkSettings')?.addEventListener('click', saveLinkSettings);

    // AI provider change
    document.getElementById('aiProvider')?.addEventListener('change', (e) => {
        toggleAiProviderSettings(e.target.value);
    });

    // Save AI settings
    document.getElementById('saveAiSettings')?.addEventListener('click', saveAiSettings);

    // Test API keys
    document.getElementById('testGeminiKey')?.addEventListener('click', () => testApiKey('gemini'));
    document.getElementById('testMistralKey')?.addEventListener('click', () => testApiKey('mistral'));

    // Delete API keys
    document.getElementById('deleteGeminiKey')?.addEventListener('click', deleteGeminiKey);
    document.getElementById('deleteMistralKey')?.addEventListener('click', deleteMistralKey);

    // Reset optimize prompt
    document.getElementById('resetOptimizePrompt')?.addEventListener('click', () => {
        document.getElementById('aiOptimizePrompt').value = getDefaultOptimizePrompt();
        showToast('Prompt auf Standard zurückgesetzt', 'info');
    });

    // Live-Preview für Badge / DSGVO
    ['badgeText', 'badgeBgColor', 'badgeTextColor', 'badgeIcon', 'badgeIconColor', 'badgeIconPosition', 'showDsgvoIndicator', 'dsgvoColorGreen', 'dsgvoColorYellow', 'dsgvoColorRed', 'inhouseLogo', 'inhouseTooltip']
        .forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const evt = el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change';
            el.addEventListener(evt, updateBadgePreview);
        });

    // Sync DSGVO and category badge color picker <-> text
    [['dsgvoColorGreen', 'dsgvoColorGreenText'], ['dsgvoColorYellow', 'dsgvoColorYellowText'], ['dsgvoColorRed', 'dsgvoColorRedText'], ['categoryBadgeBg', 'categoryBadgeBgText'], ['categoryBadgeColor', 'categoryBadgeColorText']].forEach(([colorId, textId]) => {
        const colorEl = document.getElementById(colorId);
        const textEl = document.getElementById(textId);
        if (colorEl) colorEl.addEventListener('change', () => { if (textEl) textEl.value = colorEl.value; });
        if (textEl) textEl.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(textEl.value) && colorEl) colorEl.value = textEl.value; });
    });

    // Initialize all tabs immediately
    setupImportExportTab();
    // Footer links tab initializes on demand when tab is clicked
    setupEmbedTab();
}

async function saveBadgeSettings() {
    showLoading();

    const settings = {
        badge_available_text: document.getElementById('badgeText').value,
        badge_show: document.getElementById('badgeShow').checked ? 'true' : 'false',
        badge_available_color: document.getElementById('badgeBgColor').value,
        badge_available_text_color: document.getElementById('badgeTextColor').value,
        dsgvo_indicator_show: document.getElementById('showDsgvoIndicator').checked ? 'true' : 'false',
        dsgvo_color_green: document.getElementById('dsgvoColorGreen').value,
        dsgvo_color_yellow: document.getElementById('dsgvoColorYellow').value,
        dsgvo_color_red: document.getElementById('dsgvoColorRed').value,
        category_badge_bg: document.getElementById('categoryBadgeBg')?.value || '#99f6e4',
        category_badge_text_color: document.getElementById('categoryBadgeColor')?.value || '#004d44',
        inhouse_logo_url: document.getElementById('inhouseLogo').value,
        inhouse_tooltip: document.getElementById('inhouseTooltip').value,
        badge_icon: document.getElementById('badgeIcon').value,
        badge_icon_color: document.getElementById('badgeIconColor').value,
        badge_icon_position: document.getElementById('badgeIconPosition').value || 'before'
    };

    try {
        await AdminAPI.updateSettings(settings);
        Object.assign(AdminState.settings, settings);
        showToast(t('settings.saved'), 'success');
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function updateBadgePreview() {
    try {
        const text = document.getElementById('badgeText')?.value || 'Verfügbar';
        const bgColor = document.getElementById('badgeBgColor')?.value || '#22c55e';
        const textColor = document.getElementById('badgeTextColor')?.value || '#ffffff';
        const icon = document.getElementById('badgeIcon')?.value || '';
        const iconColor = document.getElementById('badgeIconColor')?.value || textColor;
        const iconPosition = document.getElementById('badgeIconPosition')?.value || 'before';
        const showDsgvo = document.getElementById('showDsgvoIndicator')?.checked ?? true;
        const inhouseLogo = document.getElementById('inhouseLogo')?.value || '';
        const inhouseTooltip = document.getElementById('inhouseTooltip')?.value || '';

        const avail = document.getElementById('availabilityBadgePreview');
        const availIcon = document.getElementById('availabilityBadgePreviewIcon');
        const availText = document.getElementById('availabilityBadgePreviewText');
        if (avail && availIcon && availText) {
            avail.style.backgroundColor = bgColor;
            avail.style.color = textColor;

            let iconChar = '';
            if (icon === 'check') iconChar = '✔';
            else if (icon === 'dot') iconChar = '●';
            else if (icon === 'star') iconChar = '★';

            availIcon.textContent = iconChar || '';
            availIcon.style.display = iconChar ? 'inline-flex' : 'none';
            availIcon.style.color = iconColor;

            availText.textContent = text;

            if (iconPosition === 'after') {
                avail.appendChild(availIcon);
            } else {
                avail.insertBefore(availIcon, availText);
            }
        }

        const privacy = document.getElementById('privacyBadgePreview');
        const dotGreen = document.getElementById('privacyBadgePreviewDotGreen');
        const dotYellow = document.getElementById('privacyBadgePreviewDotYellow');
        const dotRed = document.getElementById('privacyBadgePreviewDotRed');
        const privacyText = document.getElementById('privacyBadgePreviewText');
        const privacyInhouse = document.getElementById('privacyBadgePreviewInhouse');
        const colorGreen = document.getElementById('dsgvoColorGreen')?.value || '#22c55e';
        const colorYellow = document.getElementById('dsgvoColorYellow')?.value || '#eab308';
        const colorRed = document.getElementById('dsgvoColorRed')?.value || '#ef4444';
        if (privacy && dotGreen && dotYellow && dotRed && privacyText && privacyInhouse) {
            privacy.style.display = showDsgvo ? 'inline-flex' : 'none';
            dotGreen.style.backgroundColor = colorGreen;
            dotYellow.style.backgroundColor = colorYellow;
            dotRed.style.backgroundColor = colorRed;
            privacyText.textContent = 'Grün · Gelb · Rot';
            if (inhouseLogo) {
                privacyInhouse.style.display = 'inline-block';
                privacyInhouse.style.backgroundImage = `url(${inhouseLogo})`;
                privacyInhouse.title = inhouseTooltip || '';
            } else {
                privacyInhouse.style.display = 'none';
                privacyInhouse.style.backgroundImage = '';
                privacyInhouse.title = '';
            }
        }
    } catch (e) {
        console.warn('updateBadgePreview:', e);
    }
}

async function saveLinkSettings() {
    showLoading();

    const settings = {
        show_header: document.getElementById('showHeader').checked ? 'true' : 'false',
        show_footer: document.getElementById('showFooter').checked ? 'true' : 'false',
        impressum_url: document.getElementById('impressumUrl').value,
        datenschutz_url: document.getElementById('datenschutzUrl').value,
        links_new_tab: document.getElementById('linksNewTab').checked ? 'true' : 'false',
        show_footer_links: document.getElementById('showFooterLinks').checked ? 'true' : 'false'
    };

    try {
        await AdminAPI.updateSettings(settings);
        Object.assign(AdminState.settings, settings);
        showToast(t('settings.saved'), 'success');
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function toggleAiProviderSettings(provider) {
    const geminiSettings = document.getElementById('geminiSettings');
    const mistralSettings = document.getElementById('mistralSettings');
    if (!geminiSettings || !mistralSettings) return;

    if (provider === 'mistral') {
        geminiSettings.style.display = 'none';
        mistralSettings.style.display = 'block';
    } else {
        geminiSettings.style.display = 'block';
        mistralSettings.style.display = 'none';
    }
}

function getDefaultOptimizePrompt() {
    return `Du bist ein technischer Redakteur. Optimiere die folgenden Beschreibungsfelder einer Software.
Regeln:
- 'short_description': Prägnante Kurzbeschreibung, exakt ca. {{short_description_words}} Wörter. Ein Satz, der den Hauptzweck beschreibt.
- 'description': Ausführliche Beschreibung, exakt ca. {{description_words}} Wörter. Klar strukturiert, sachlich, informativ.
- 'features': Liste der wichtigsten Features als kommaseparierter Text. Jedes Feature kurz und prägnant (2-5 Wörter pro Feature).
- 'name': Nicht verändern, 1:1 übernehmen.
- Sprache: Deutsch beibehalten.
- Formatierung: Kein Markdown, kein HTML, reiner Text.
- Inhalt beibehalten, nur Länge und Formulierung optimieren.

Eingabe:
{{fields_json}}

Gib NUR ein JSON-Objekt zurück mit denselben Schlüsseln und optimierten Texten, ohne Erklärungen oder Markdown:`;
}

async function saveAiSettings() {
    showLoading();

    const provider = document.getElementById('aiProvider').value;
    const settings = {
        AI_PROVIDER: provider,
        GOOGLE_GEMINI_API_KEY: document.getElementById('geminiApiKey').value,
        GEMINI_MODEL: document.getElementById('geminiModel').value,
        MISTRAL_API_KEY: document.getElementById('mistralApiKey').value,
        MISTRAL_MODEL: document.getElementById('mistralModel').value,
        AI_DESCRIPTION_WORDS: document.getElementById('aiDescriptionWords').value,
        AI_SHORT_DESCRIPTION_WORDS: document.getElementById('aiShortDescriptionWords').value,
        AI_OPTIMIZE_PROMPT: document.getElementById('aiOptimizePrompt').value
    };

    try {
        await AdminAPI.updateSettings(settings);
        Object.assign(AdminState.settings, settings);
        // Update status badges after saving
        updateAiStatusBadges();
        showToast(t('settings.saved'), 'success');
    } catch (error) {
        showToast(error.message || t('errors.saveFailed'), 'error');
    } finally {
        hideLoading();
    }
}

async function deleteGeminiKey() {
    if (!confirm('Google Gemini API-Key wirklich löschen?')) {
        return;
    }

    showLoading();

    try {
        const settings = {
            GOOGLE_GEMINI_API_KEY: ''
        };
        await AdminAPI.updateSettings(settings);
        AdminState.settings.GOOGLE_GEMINI_API_KEY = '';
        const input = document.getElementById('geminiApiKey');
        if (input) input.value = '';
        updateAiStatusBadges();
        showToast('Gemini API-Key gelöscht.', 'success');
    } catch (error) {
        showToast(error.message || 'Fehler beim Löschen des API-Keys', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteMistralKey() {
    if (!confirm('Mistral API-Key wirklich löschen?')) {
        return;
    }

    showLoading();

    try {
        const settings = {
            MISTRAL_API_KEY: ''
        };
        await AdminAPI.updateSettings(settings);
        AdminState.settings.MISTRAL_API_KEY = '';
        const input = document.getElementById('mistralApiKey');
        if (input) input.value = '';
        updateAiStatusBadges();
        showToast('Mistral API-Key gelöscht.', 'success');
    } catch (error) {
        showToast(error.message || 'Fehler beim Löschen des API-Keys', 'error');
    } finally {
        hideLoading();
    }
}

async function testApiKey(provider) {
    const apiKey = provider === 'mistral'
        ? document.getElementById('mistralApiKey').value
        : document.getElementById('geminiApiKey').value;

    if (!apiKey) {
        showToast('Bitte API-Key eingeben', 'warning');
        return;
    }

    showLoading();

    try {
        const result = await AdminAPI.testApiKey(apiKey, provider);
        if (result.success) {
            showToast('API-Key ist gültig!', 'success');
            // Update status badges after successful test
            updateAiStatusBadges();
        } else {
            showToast(result.error || 'API-Key ist ungültig', 'error');
        }
    } catch (error) {
        showToast(error.message || 'Fehler beim Testen des API-Keys', 'error');
    } finally {
        hideLoading();
    }
}

function updateAiStatusBadges() {
    const activeProviderBadge = document.getElementById('activeProviderBadge');
    const geminiStatusBadge = document.getElementById('geminiStatusBadge');
    const mistralStatusBadge = document.getElementById('mistralStatusBadge');

    if (!activeProviderBadge || !geminiStatusBadge || !mistralStatusBadge) {
        return; // Badges not on this page
    }

    const currentProvider = AdminState.settings?.AI_PROVIDER || 'gemini';
    const hasGeminiKey = !!(AdminState.settings?.GOOGLE_GEMINI_API_KEY);
    const hasMistralKey = !!(AdminState.settings?.MISTRAL_API_KEY);

    // Update active provider badge
    if (currentProvider === 'gemini' && hasGeminiKey) {
        activeProviderBadge.textContent = 'Google Gemini';
        activeProviderBadge.style.background = '#10b981'; // Green
    } else if (currentProvider === 'mistral' && hasMistralKey) {
        activeProviderBadge.textContent = 'Mistral AI';
        activeProviderBadge.style.background = '#10b981'; // Green
    } else {
        activeProviderBadge.textContent = 'Nicht konfiguriert';
        activeProviderBadge.style.background = '#ef4444'; // Red
    }

    // Update Gemini status badge
    if (hasGeminiKey) {
        geminiStatusBadge.textContent = 'Konfiguriert';
        geminiStatusBadge.style.background = currentProvider === 'gemini' ? '#10b981' : '#f59e0b'; // Green if active, orange if not
    } else {
        geminiStatusBadge.textContent = 'Nicht konfiguriert';
        geminiStatusBadge.style.background = '#6b7280'; // Gray
    }

    // Update Mistral status badge
    if (hasMistralKey) {
        mistralStatusBadge.textContent = 'Konfiguriert';
        mistralStatusBadge.style.background = currentProvider === 'mistral' ? '#10b981' : '#f59e0b'; // Green if active, orange if not
    } else {
        mistralStatusBadge.textContent = 'Nicht konfiguriert';
        mistralStatusBadge.style.background = '#6b7280'; // Gray
    }
}

// ==========================================
// IMPORT/EXPORT TAB
// ==========================================

let importExportTabInitialized = false;

function setupImportExportTab() {
    if (importExportTabInitialized) {
        return;
    }
    importExportTabInitialized = true;

    // Export CSV
    document.getElementById('exportCSV')?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/export.php?format=csv');
            if (!response.ok) throw new Error('Export fehlgeschlagen');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'software-liste-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('CSV Export erfolgreich', 'success');
        } catch (error) {
            showToast('Fehler beim CSV Export: ' + error.message, 'error');
        }
    });

    // Export Excel
    document.getElementById('exportExcel')?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/export.php?format=xlsx');
            if (!response.ok) throw new Error('Export fehlgeschlagen');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'software-liste-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('Excel Export erfolgreich', 'success');
        } catch (error) {
            showToast('Fehler beim Excel Export: ' + error.message, 'error');
        }
    });

    // Download Excel Template
    document.getElementById('downloadExcelTemplate')?.addEventListener('click', async () => {
        try {
            showLoading();
            const response = await fetch('/api/excel-template.php', {
                method: 'GET',
                credentials: 'same-origin'
            });
            if (!response.ok) throw new Error('Download fehlgeschlagen');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'software-hub-vorlage-' + new Date().toISOString().slice(0, 10) + '.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('Excel-Vorlage erfolgreich heruntergeladen', 'success');
        } catch (error) {
            showToast('Fehler beim Download: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    });

    // Import file selection (Input liegt über Button – Klick öffnet nativ den Datei-Dialog)
    const fileInput = document.getElementById('importFile');
    const importFileNameEl = document.getElementById('importFileName');
    const importCSVBtn = document.getElementById('importCSV');
    const importExcelBtn = document.getElementById('importExcel');

    fileInput?.addEventListener('change', () => {
        const hasFile = fileInput.files.length > 0;
        if (importFileNameEl) {
            importFileNameEl.textContent = hasFile ? fileInput.files[0].name : '';
        }
        if (importCSVBtn) importCSVBtn.disabled = !hasFile;
        if (importExcelBtn) importExcelBtn.disabled = !hasFile;
    });

    // Import CSV
    importCSVBtn?.addEventListener('click', async () => {
        const file = fileInput?.files?.[0];
        if (!file) {
            showToast('Bitte zuerst eine Datei auswählen.', 'error');
            return;
        }

        const progressDiv = document.getElementById('importProgress');
        const resultsDiv = document.getElementById('importResults');
        const statusText = document.getElementById('importStatus');
        const progressFill = document.getElementById('progressFill');

        if (progressDiv) progressDiv.style.display = 'block';
        if (resultsDiv) resultsDiv.style.display = 'none';
        importCSVBtn.disabled = true;
        if (statusText) statusText.textContent = 'Importiere...';
        if (progressFill) progressFill.style.width = '50%';

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (AdminState.csrfToken) formData.append('csrfToken', AdminState.csrfToken);
            const headers = {};
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const importUrl = (typeof AdminAPI !== 'undefined' && AdminAPI.baseUrl) ? AdminAPI.baseUrl + '/import.php' : '/api/import.php';
            const response = await fetch(importUrl, {
                method: 'POST',
                headers,
                credentials: 'same-origin',
                body: formData
            });
            if (!response.headers.get('Content-Type')?.includes('application/json')) {
                throw new Error(response.status === 403 ? 'CSRF-Token ungültig. Bitte Seite neu laden.' : 'Server-Fehler ' + response.status);
            }
            const result = await response.json();
            if (progressFill) progressFill.style.width = '100%';
            if (statusText) statusText.textContent = 'Import abgeschlossen';

            if (result.success || result.imported > 0) {
                if (resultsDiv) resultsDiv.style.display = 'block';
                const resultsContent = document.getElementById('importResultsContent');
                if (resultsContent) {
                    resultsContent.innerHTML =
                        '<strong>Import abgeschlossen</strong><br>' +
                        result.imported + ' von ' + result.total + ' Einträgen erfolgreich importiert.<br>' +
                        (result.errors && result.errors.length > 0
                            ? '<br><strong>Fehler (' + result.errors.length + '):</strong><br><ul style="margin: 0.5rem 0; padding-left: 1.5rem;">' +
                              result.errors.map(e => '<li>' + escapeHtml(e) + '</li>').join('') + '</ul>'
                            : '');
                    if (resultsContent.parentElement) resultsContent.parentElement.className =
                        result.errors && result.errors.length > 0 ? 'alert alert-warning' : 'alert alert-success';
                }
                if (result.imported > 0) setTimeout(() => window.location.reload(), 2000);
            } else {
                throw new Error(result.error || 'Import fehlgeschlagen');
            }
        } catch (error) {
            if (progressFill) { progressFill.style.width = '100%'; progressFill.style.backgroundColor = 'var(--danger)'; }
            if (statusText) statusText.textContent = 'Fehler beim Import';
            if (resultsDiv) resultsDiv.style.display = 'block';
            const resultsContent = document.getElementById('importResultsContent');
            if (resultsContent) {
                resultsContent.innerHTML = '<strong>Fehler:</strong> ' + escapeHtml(error.message);
                if (resultsContent.parentElement) resultsContent.parentElement.className = 'alert alert-error';
            }
            showToast(error.message || 'Fehler beim Import', 'error');
        } finally {
            importCSVBtn.disabled = false;
            setTimeout(() => {
                if (progressDiv) progressDiv.style.display = 'none';
                if (progressFill) { progressFill.style.width = '0%'; progressFill.style.backgroundColor = ''; }
            }, 3000);
        }
    });

    // Import Excel
    importExcelBtn?.addEventListener('click', async () => {
        const file = fileInput?.files?.[0];
        if (!file) {
            showToast('Bitte zuerst eine Datei auswählen.', 'error');
            return;
        }
        try {
            await performExcelImport(file, false);
        } catch (err) {
            console.error('Excel import error:', err);
            showToast('Import fehlgeschlagen: ' + (err.message || 'Unbekannter Fehler'), 'error');
        }
    });

    // Show import confirmation modal
    function showImportConfirmationModal(result, file) {
        console.log('showImportConfirmationModal called', {result, file});
        const modalHtml = `
            <div class="modal-overlay active" id="importConfirmModal" style="display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 9999; align-items: center; justify-content: center; opacity: 1; visibility: visible;">
                <div class="modal" style="background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; max-height: 80vh; overflow-y: auto; padding: 0;">
                    <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb;">
                        <h3 class="modal-title" style="margin: 0; font-size: 1.25rem; font-weight: 600;">Neue Kategorien und Zielgruppen</h3>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem;">
                        <p style="margin-bottom: 1rem;">${result.message}</p>

                        ${result.missingCategories && result.missingCategories.length > 0 ? `
                            <div style="margin-bottom: 1rem;">
                                <strong>Neue Kategorien (${result.missingCategories.length}):</strong>
                                <ul style="margin: 0.5rem 0; padding-left: 1.5rem; max-height: 150px; overflow-y: auto;">
                                    ${result.missingCategories.map(c => '<li>' + escapeHtml(c) + '</li>').join('')}
                                </ul>
                            </div>
                        ` : ''}

                        ${result.missingTargetGroups && result.missingTargetGroups.length > 0 ? `
                            <div style="margin-bottom: 1rem;">
                                <strong>Neue Zielgruppen (${result.missingTargetGroups.length}):</strong>
                                <ul style="margin: 0.5rem 0; padding-left: 1.5rem; max-height: 150px; overflow-y: auto;">
                                    ${result.missingTargetGroups.map(tg => '<li>' + escapeHtml(tg) + '</li>').join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <p style="margin-top: 1rem; padding: 1rem; background: var(--color-gray-100); border-radius: 0.375rem;">
                            <strong>Anzahl zu importierender Einträge:</strong> ${result.totalEntries}
                        </p>
                    </div>
                    <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="closeImportConfirmModal()" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">Abbrechen</button>
                        <button class="btn btn-primary" onclick="confirmImport()" style="padding: 0.5rem 1rem; background: #0d9488; color: white; border: none; border-radius: 4px; cursor: pointer;">Ja, anlegen und importieren</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal directly into body without wrapper
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        console.log('Modal added to DOM');
        const modal = document.getElementById('importConfirmModal');
        console.log('Modal element:', modal);

        if (modal) {
            const computed = window.getComputedStyle(modal);
            console.log('Modal styles:', {
                display: computed.display,
                position: computed.position,
                zIndex: computed.zIndex,
                top: computed.top,
                left: computed.left,
                right: computed.right,
                bottom: computed.bottom,
                visibility: computed.visibility,
                opacity: computed.opacity,
                pointerEvents: computed.pointerEvents,
                width: computed.width,
                height: computed.height
            });
            const rect = modal.getBoundingClientRect();
            console.log('Modal position:', rect);
            console.log('Viewport size:', {width: window.innerWidth, height: window.innerHeight});
            console.log('Modal parent:', modal.parentElement);
        }

        window._pendingImportFile = file;
    }

    // Close import confirmation modal
    window.closeImportConfirmModal = function() {
        const modal = document.getElementById('importConfirmModal');
        if (modal) {
            modal.remove();
        }
        window._pendingImportFile = null;
    };

    // Confirm and proceed with import
    window.confirmImport = async function() {
        const file = window._pendingImportFile;
        closeImportConfirmModal();

        if (file) {
            await performExcelImport(file, true);
        }
    };

    // Helper function to perform Excel import
    async function performExcelImport(file, confirmed = false) {
        const progressDiv = document.getElementById('importProgress');
        const resultsDiv = document.getElementById('importResults');
        const statusText = document.getElementById('importStatus');
        const progressFill = document.getElementById('progressFill');
        const resultsContent = document.getElementById('importResultsContent');

        if (progressDiv) progressDiv.style.display = 'block';
        if (resultsDiv) resultsDiv.style.display = 'none';
        if (importExcelBtn) importExcelBtn.disabled = true;
        if (statusText) statusText.textContent = confirmed ? 'Importiere Excel...' : 'Analysiere Datei...';
        if (progressFill) progressFill.style.width = '50%';

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', 'xlsx');
            if (confirmed) formData.append('confirmed', 'true');
            if (AdminState.csrfToken) {
                formData.append('csrfToken', AdminState.csrfToken);
            }
            const headers = {};
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;

            const importUrl = (typeof AdminAPI !== 'undefined' && AdminAPI.baseUrl) ? AdminAPI.baseUrl + '/import.php' : '/api/import.php';
            const response = await fetch(importUrl, {
                method: 'POST',
                headers,
                credentials: 'same-origin',
                body: formData
            });

            let result;
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                throw new Error(response.status === 403 ? 'CSRF-Token ungültig. Bitte Seite neu laden.' : (response.status >= 400 ? `Server-Fehler ${response.status}` : 'Unerwartete Antwort vom Server'));
            }

            if (result.needsConfirmation) {
                if (progressDiv) progressDiv.style.display = 'none';
                if (importExcelBtn) importExcelBtn.disabled = false;
                showImportConfirmationModal(result, file);
                showToast('Bitte bestätigen: Sollen fehlende Kategorien/Zielgruppen angelegt werden?', 'info');
                return;
            }

            if (progressFill) progressFill.style.width = '100%';
            if (statusText) statusText.textContent = 'Import abgeschlossen';

            if (result.success || (result.imported !== undefined && result.imported > 0)) {
                if (resultsDiv) resultsDiv.style.display = 'block';
                const imported = result.imported ?? 0;
                const total = result.total ?? 0;
                const errList = Array.isArray(result.errors) && result.errors.length > 0
                    ? '<br><strong>Fehler (' + result.errors.length + '):</strong><br><ul style="margin: 0.5rem 0; padding-left: 1.5rem;">' +
                      result.errors.map(e => '<li>' + escapeHtml(String(e)) + '</li>').join('') + '</ul>'
                    : '';
                if (resultsContent) {
                    resultsContent.innerHTML =
                        '<strong>Import abgeschlossen</strong><br>' +
                        imported + ' von ' + total + ' Einträgen erfolgreich importiert.' + errList;
                    const parent = resultsContent.parentElement;
                    if (parent) parent.className = (Array.isArray(result.errors) && result.errors.length > 0) ? 'alert alert-warning' : 'alert alert-success';
                }
                showToast(imported + ' von ' + total + ' Einträgen importiert.', 'success');
                if (imported > 0) setTimeout(() => window.location.reload(), 2000);
            } else {
                throw new Error(result.error || 'Import fehlgeschlagen');
            }
        } catch (error) {
            if (progressFill) {
                progressFill.style.width = '100%';
                progressFill.style.backgroundColor = 'var(--danger)';
            }
            if (statusText) statusText.textContent = 'Fehler beim Import';
            if (resultsDiv) resultsDiv.style.display = 'block';
            if (resultsContent) {
                resultsContent.innerHTML = '<strong>Fehler:</strong> ' + escapeHtml(error.message);
                const parent = resultsContent.parentElement;
                if (parent) parent.className = 'alert alert-error';
            }
            showToast(error.message || 'Fehler beim Import', 'error');
        } finally {
            if (importExcelBtn) importExcelBtn.disabled = false;
            setTimeout(() => {
                if (progressDiv) progressDiv.style.display = 'none';
                if (progressFill) {
                    progressFill.style.width = '0%';
                    progressFill.style.backgroundColor = '';
                }
            }, 3000);
        }
    }

    // Load demo data
    document.getElementById('loadDemoData')?.addEventListener('click', async () => {
        if (!confirm('Möchten Sie Demo-Daten laden?')) return;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const response = await fetch('/api/demo-data.php?action=load', {
                method: 'POST',
                credentials: 'same-origin',
                headers
            });
            const result = await response.json();
            if (result.success) {
                showToast('Demo-Daten erfolgreich geladen', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error(result.error || 'Fehler beim Laden');
            }
        } catch (error) {
            showToast('Fehler: ' + error.message, 'error');
        }
    });

    // Remove demo data
    document.getElementById('removeDemoData')?.addEventListener('click', async () => {
        if (!confirm('Möchten Sie wirklich alle Demo-Daten entfernen?')) return;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const response = await fetch('/api/demo-data.php?action=delete-all', {
                method: 'POST',
                credentials: 'same-origin',
                headers
            });
            const result = await response.json();
            if (result.success) {
                showToast('Demo-Daten erfolgreich entfernt', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error(result.error || 'Fehler beim Entfernen');
            }
        } catch (error) {
            showToast('Fehler: ' + error.message, 'error');
        }
    });
}

// ==========================================
// FOOTER LINKS TAB
// ==========================================

let footerLinks = [];
let footerLinksTabInitialized = false;

async function loadFooterLinks() {
    try {
        const response = await fetch('/api/footer-links.php');
        const data = await response.json();
        footerLinks = data.data || data;
        renderFooterLinksTable();
    } catch (error) {
        console.error('Error loading footer links:', error);
        showToast('Fehler beim Laden der Footer Links', 'error');
    }
}

function renderFooterLinksTable() {
    const tbody = document.getElementById('footerLinksTableBody');

    if (!tbody) return;

    if (footerLinks.length === 0) {
        tbody.innerHTML = `
            <div class="empty-state">
                <p>Keine Footer Links vorhanden</p>
            </div>
        `;
        return;
    }

    const rows = footerLinks.map(link => `
        <div class="data-table-row">
            <div class="data-table-cell" style="flex: 0 0 50px;">
                <span class="badge badge-secondary">${link.order}</span>
            </div>
            <div class="data-table-cell" style="flex: 2;">
                <strong>${escapeHtml(link.text)}</strong>
                ${link.text_en ? `<br><small class="text-muted">${escapeHtml(link.text_en)}</small>` : ''}
            </div>
            <div class="data-table-cell" style="flex: 2;">
                <a href="${escapeHtml(link.url)}" target="_blank" class="text-primary">${escapeHtml(link.url)}</a>
            </div>
            <div class="data-table-cell" style="flex: 0 0 100px; text-align: center;">
                ${link.is_active ? '<span class="badge badge-success">Aktiv</span>' : '<span class="badge badge-secondary">Inaktiv</span>'}
            </div>
            <div class="data-table-cell" style="flex: 0 0 120px; justify-content: flex-end;">
                <button class="btn-icon" onclick="editLink('${link.id}')" title="Bearbeiten">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon text-danger" onclick="deleteLink('${link.id}')" title="Löschen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    tbody.innerHTML = `
        <div class="data-table" style="border: 1px solid var(--color-gray-200); border-radius: var(--border-radius); overflow: hidden; background: white;">
            <div class="data-table-header-row">
                <div class="data-table-cell" style="flex: 0 0 50px;">Pos.</div>
                <div class="data-table-cell" style="flex: 2;">Text</div>
                <div class="data-table-cell" style="flex: 2;">URL</div>
                <div class="data-table-cell" style="flex: 0 0 100px; text-align: center;">Status</div>
                <div class="data-table-cell" style="flex: 0 0 120px;"></div>
            </div>
            ${rows}
        </div>
    `;
}

function setupFooterLinksTab() {
    if (footerLinksTabInitialized) {
        // Already initialized, just reload the data
        loadFooterLinks();
        return;
    }

    footerLinksTabInitialized = true;

    // New link button
    document.getElementById('newLinkBtn')?.addEventListener('click', () => {
        document.getElementById('linkId').value = '';
        document.getElementById('linkText').value = '';
        document.getElementById('linkTextEn').value = '';
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkOrder').value = footerLinks.length;
        document.getElementById('linkIsActive').checked = true;
        document.getElementById('linkModalTitle').textContent = 'Neuer Footer Link';
        openModal('linkModal');
    });

    // Load footer links for the first time
    loadFooterLinks();
}

async function saveLink(event) {
    event.preventDefault();

    const id = document.getElementById('linkId').value;
    const data = {
        text: document.getElementById('linkText').value,
        text_en: document.getElementById('linkTextEn').value || null,
        url: document.getElementById('linkUrl').value,
        order: parseInt(document.getElementById('linkOrder').value),
        is_active: document.getElementById('linkIsActive').checked
    };

    try {
        let response;
        if (id) {
            data.id = id;
            response = await fetch('/api/footer-links.php', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/footer-links.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();

        if (response.ok) {
            showToast(id ? 'Link aktualisiert' : 'Link erstellt', 'success');
            closeModal('linkModal');
            loadFooterLinks();
        } else {
            showToast(result.error || 'Fehler beim Speichern', 'error');
        }
    } catch (error) {
        console.error('Error saving link:', error);
        showToast('Fehler beim Speichern', 'error');
    }
}

async function editLink(id) {
    const link = footerLinks.find(l => l.id === id);
    if (!link) return;

    document.getElementById('linkId').value = link.id;
    document.getElementById('linkText').value = link.text;
    document.getElementById('linkTextEn').value = link.text_en || '';
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkOrder').value = link.order;
    document.getElementById('linkIsActive').checked = Boolean(link.is_active);
    document.getElementById('linkModalTitle').textContent = 'Footer Link bearbeiten';
    openModal('linkModal');
}

async function deleteLink(id) {
    if (!confirm('Möchten Sie diesen Footer Link wirklich löschen?')) {
        return;
    }

    try {
        const response = await fetch(`/api/footer-links.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showToast('Link gelöscht', 'success');
            loadFooterLinks();
        } else {
            showToast(result.error || 'Fehler beim Löschen', 'error');
        }
    } catch (error) {
        console.error('Error deleting link:', error);
        showToast('Fehler beim Löschen', 'error');
    }
}

// ==========================================
// EMBED TAB
// ==========================================

let embedTabInitialized = false;

function setupEmbedTab() {
    if (embedTabInitialized) return;
    embedTabInitialized = true;

    const baseUrl = window.location.protocol + '//' + window.location.host;
    const categoryFilter = document.getElementById('categoryFilter');
    const searchQuery = document.getElementById('searchQuery');
    const hideHeader = document.getElementById('hideHeader');
    const hideFooter = document.getElementById('hideFooter');
    const generatedUrlEl = document.getElementById('generatedUrl');

    if (!categoryFilter || !searchQuery || !hideHeader || !hideFooter || !generatedUrlEl) return;

    // Load categories
    loadCategoriesForEmbed();

    function generateUrl() {
        let url = baseUrl;
        const params = [];

        if (categoryFilter.value) {
            params.push('categoryId=' + encodeURIComponent(categoryFilter.value));
        }

        if (searchQuery.value.trim()) {
            params.push('q=' + encodeURIComponent(searchQuery.value.trim()));
        }

        if (hideHeader.checked) {
            params.push('hideHeader=true');
        }

        if (hideFooter.checked) {
            params.push('hideFooter=true');
        }

        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        return url;
    }

    function updateCodes() {
        const url = generateUrl();
        generatedUrlEl.textContent = url;

        // iFrame Code
        document.getElementById('iframeCode').textContent =
            '<iframe src="' + url + '"\n' +
            '        width="100%"\n' +
            '        height="800"\n' +
            '        frameborder="0"\n' +
            '        style="border: none;">\n' +
            '</iframe>';

        // JavaScript Loader
        document.getElementById('jsCode').textContent =
            '<div id="software-hub-container"></div>\n' +
            '<script>\n' +
            '  (function() {\n' +
            '    var iframe = document.createElement("iframe");\n' +
            '    iframe.src = "' + url + '";\n' +
            '    iframe.width = "100%";\n' +
            '    iframe.height = "800";\n' +
            '    iframe.frameBorder = "0";\n' +
            '    iframe.style.border = "none";\n' +
            '    document.getElementById("software-hub-container").appendChild(iframe);\n' +
            '  })();\n' +
            '</script>';

        // WordPress Shortcode
        document.getElementById('wpCode').textContent =
            '[iframe src="' + url + '" width="100%" height="800"]';

        // REST API
        document.getElementById('apiCode').textContent =
            'GET ' + baseUrl + '/api/software.php\n\n' +
            'Optional parameters:\n' +
            '  ?category=<category_id>  - Filter by category\n' +
            '  ?search=<term>           - Search term\n' +
            '  ?available=true          - Only available software\n\n' +
            'Example:\n' +
            'curl "' + baseUrl + '/api/software.php?category=cat_office&available=true"';
    }

    async function loadCategoriesForEmbed() {
        try {
            const response = await fetch('/api/categories.php');
            const result = await response.json();
            const categories = result.data || result;

            categoryFilter.innerHTML = '<option value="">Alle Kategorien</option>' +
                categories.map(cat => `<option value="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</option>`).join('');
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Event listeners
    categoryFilter.addEventListener('change', updateCodes);
    searchQuery.addEventListener('input', updateCodes);
    hideHeader.addEventListener('change', updateCodes);
    hideFooter.addEventListener('change', updateCodes);

    // Initial update
    updateCodes();
}

// Global copyToClipboard function for embed tab
window.copyToClipboard = function(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Code kopiert!', 'success');
    }).catch(err => {
        showToast('Fehler beim Kopieren', 'error');
    });
};

// ==========================================
// BRANDING TAB
// ==========================================

let brandingTabInitialized = false;

async function setupBrandingTab() {
    if (brandingTabInitialized) {
        return;
    }
    brandingTabInitialized = true;

    // Load current branding settings
    const s = AdminState.settings || {};
    try {
        const response = await fetch('/api/branding.php');
        const branding = await response.json();

        // Show logo preview if exists
        if (branding.logo) {
            document.getElementById('logoPreview').style.display = 'block';
            document.getElementById('logoPreviewImg').src = branding.logo + '?v=' + Date.now();
        }

        // Show favicon preview if exists
        if (branding.favicon) {
            document.getElementById('faviconPreview').style.display = 'block';
            document.getElementById('faviconPreviewImg').src = branding.favicon + '?v=' + Date.now();
        }

        // Set app name
        if (branding.app_name) {
            document.getElementById('appName').value = branding.app_name;
        }
    } catch (error) {
        console.error('Error loading branding:', error);
    }

    // Background color from settings
    const bgColorVal = s.background_color || '#f9fafb';
    const bgColorEl = document.getElementById('bgColor');
    const bgColorPickerEl = document.getElementById('bgColorPicker');
    if (bgColorEl) bgColorEl.value = bgColorVal;
    if (bgColorPickerEl) bgColorPickerEl.value = bgColorVal;

    // Sync color picker and text input
    bgColorPickerEl?.addEventListener('input', () => {
        if (bgColorEl) bgColorEl.value = bgColorPickerEl.value;
    });
    bgColorEl?.addEventListener('input', () => {
        if (bgColorPickerEl && /^#[0-9a-fA-F]{6}$/.test(bgColorEl.value)) {
            bgColorPickerEl.value = bgColorEl.value;
        }
    });

    // Schriftarten aus Einstellungen
    const fontFamilyEl = document.getElementById('fontFamily');
    const customFontUrlEl = document.getElementById('customFontUrl');
    if (fontFamilyEl) fontFamilyEl.value = s.font_family || '';
    if (customFontUrlEl) customFontUrlEl.value = s.custom_font_url || '';

    // Font-Upload: nach Upload URL in customFontUrl eintragen
    document.getElementById('customFontUpload')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'font');
        try {
            const headers = {};
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const response = await fetch('/api/upload.php?action=font', {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: formData
            });
            const result = await response.json();
            if (result.path) {
                document.getElementById('customFontUrl').value = result.path;
                showToast('Schriftart hochgeladen', 'success');
            } else {
                throw new Error(result.error || 'Upload fehlgeschlagen');
            }
        } catch (err) {
            showToast('Fehler: ' + err.message, 'error');
        }
        e.target.value = '';
    });

    // Save branding settings button
    document.getElementById('saveBrandingSettings')?.addEventListener('click', async () => {
        const appName = document.getElementById('appName').value;
        const fontFamily = document.getElementById('fontFamily')?.value || '';
        const customFontUrl = document.getElementById('customFontUrl')?.value?.trim() || '';
        const backgroundColor = document.getElementById('bgColor')?.value?.trim() || '#f9fafb';

        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
        try {
            const response = await fetch('/api/settings.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify({
                    app_name: appName,
                    font_family: fontFamily,
                    custom_font_url: customFontUrl,
                    background_color: backgroundColor
                })
            });

            const result = await response.json();
            if (result.success) {
                showToast('Branding-Einstellungen gespeichert', 'success');
            } else {
                showToast(result.error || 'Fehler beim Speichern', 'error');
            }
        } catch (error) {
            console.error('Error saving branding:', error);
            showToast('Fehler beim Speichern: ' + error.message, 'error');
        }
    });
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (m, c) => c.toUpperCase());
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(currentLanguage === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==========================================
// AI GENERATION
// ==========================================

async function generateWithAI() {
    const softwareName = document.getElementById('softwareName').value.trim();

    if (!softwareName) {
        showToast('Bitte geben Sie zuerst einen Software-Namen ein.', 'warning');
        return;
    }

    const btn = document.getElementById('aiGenerateBtn');
    const wasDisabled = btn.disabled;

    btn.disabled = true;
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.style.cssText = 'width:16px;height:16px;border-width:2px;margin-right:0.5rem';
    const textSpan = btn.querySelector('span[data-t]');
    const originalText = textSpan ? textSpan.textContent : '';
    if (textSpan) textSpan.textContent = 'Generiere...';

    try {
        // Prepare classification options
        const classificationOptions = {
            includeClassification: true,
            categories: AdminState.categories.map(c => ({ id: c.id, name: c.name })),
            targetGroups: AdminState.targetGroups.map(tg => ({ id: tg.id, name: tg.name }))
        };

        // Generate for German with classification
        const resultDE = await AdminAPI.generateWithAI(softwareName, 'de', classificationOptions);

        // Debug logging for API response
        console.log('AI Generation Result (DE):', {
            success: resultDE.success,
            hasData: !!resultDE.data,
            hasDescription: !!resultDE.data?.description,
            hasShortDescription: !!resultDE.data?.short_description,
            hasFeatures: !!resultDE.data?.features,
            hasUrl: !!resultDE.data?.url,
            url: resultDE.data?.url,
            hasLogo: !!resultDE.data?.logo,
            logo: resultDE.data?.logo,
            hasNameEn: !!resultDE.data?.name_en,
            hasTypes: !!resultDE.data?.types,
            types: resultDE.data?.types,
            hasCategories: !!resultDE.data?.categories,
            categories: resultDE.data?.categories,
            hasTargetGroups: !!resultDE.data?.target_groups,
            targetGroups: resultDE.data?.target_groups,
            fullData: resultDE.data
        });

        if (resultDE.success && resultDE.data) {
            document.getElementById('softwareDescription').value = resultDE.data.description || '';
            document.getElementById('softwareShortDescription').value = resultDE.data.short_description || '';
            document.getElementById('softwareFeatures').value = resultDE.data.features || '';

            // Fill URL if found
            if (resultDE.data.url) {
                document.getElementById('softwareUrl').value = resultDE.data.url;
            }

            // Fill English name if found
            if (resultDE.data.name_en) {
                document.getElementById('softwareNameEn').value = resultDE.data.name_en;
            }

            // Display logo preview if found
            if (resultDE.data.logo) {
                console.log('Logo found in response, displaying preview and storing path:', resultDE.data.logo);
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreview) {
                    logoPreview.innerHTML = `
                        <div style="margin-bottom: 0.5rem;">
                            <img src="${resultDE.data.logo}" alt="Logo" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid var(--color-gray-300);">
                        </div>
                    `;
                }
                // Store logo path for later submission
                document.getElementById('softwareName').dataset.aiLogo = resultDE.data.logo;
            } else {
                console.log('No logo in AI response');
            }

            // Apply AI classifications
            if (resultDE.data.types && Array.isArray(resultDE.data.types)) {
                console.log('Applying AI-classified types:', resultDE.data.types);
                document.getElementById('typeWeb').checked = resultDE.data.types.includes('WEB');
                document.getElementById('typeDesktop').checked = resultDE.data.types.includes('DESKTOP');
                document.getElementById('typeMobile').checked = resultDE.data.types.includes('MOBILE');
            }

            if (resultDE.data.categories && Array.isArray(resultDE.data.categories)) {
                console.log('Applying AI-classified categories:', resultDE.data.categories);
                // Uncheck all category checkboxes first
                const categoryCheckboxes = document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]');
                categoryCheckboxes.forEach(cb => cb.checked = false);
                // Check the ones from AI
                resultDE.data.categories.forEach(categoryId => {
                    const checkbox = document.querySelector(`#categoryCheckboxes input[value="${categoryId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (resultDE.data.target_groups && Array.isArray(resultDE.data.target_groups)) {
                console.log('Applying AI-classified target groups:', resultDE.data.target_groups);
                // Uncheck all target group checkboxes first
                const targetGroupCheckboxes = document.querySelectorAll('#targetGroupCheckboxes input[type="checkbox"]');
                targetGroupCheckboxes.forEach(cb => cb.checked = false);
                // Check the ones from AI
                resultDE.data.target_groups.forEach(targetGroupId => {
                    const checkbox = document.querySelector(`#targetGroupCheckboxes input[value="${targetGroupId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }

        // Generate for English (without classification to avoid duplication)
        try {
            const resultEN = await AdminAPI.generateWithAI(softwareName, 'en');
            console.log('AI Generation Result (EN):', {
                success: resultEN.success,
                hasData: !!resultEN.data,
                hasDescription: !!resultEN.data?.description,
                hasShortDescription: !!resultEN.data?.short_description,
                hasFeatures: !!resultEN.data?.features,
                fullData: resultEN.data
            });

            if (resultEN.success && resultEN.data) {
                document.getElementById('softwareDescriptionEn').value = resultEN.data.description || '';
                document.getElementById('softwareShortDescriptionEn').value = resultEN.data.short_description || '';
                document.getElementById('softwareFeaturesEn').value = resultEN.data.features || '';
            } else {
                console.warn('English generation returned no data');
                showToast('Deutsche Inhalte generiert. Englische Übersetzung fehlgeschlagen.', 'warning');
            }
        } catch (enError) {
            console.error('English generation failed:', enError);
            showToast('Deutsche Inhalte generiert. Englische Übersetzung fehlgeschlagen: ' + (enError.message || 'Unbekannter Fehler'), 'warning');
        }

        showToast('KI-Inhalte erfolgreich generiert!', 'success');
    } catch (error) {
        console.error('AI generation error:', error);
        showToast(error.message || 'Fehler bei der KI-Generierung', 'error');
    } finally {
        btn.disabled = wasDisabled;
        if (textSpan) textSpan.textContent = originalText;
    }
}

// ==========================================
// FAVICON FETCHING
// ==========================================

async function fetchFavicon() {
    const urlInput = document.getElementById('softwareUrl');
    const url = urlInput.value.trim();

    if (!url) {
        showToast('Bitte geben Sie zuerst eine URL ein.', 'warning');
        urlInput.focus();
        return;
    }

    const btn = document.getElementById('fetchFaviconBtn');
    const wasDisabled = btn.disabled;

    btn.disabled = true;
    const textSpan = btn.querySelector('span');
    const originalText = textSpan ? textSpan.textContent : '';
    if (textSpan) textSpan.textContent = 'Lädt...';

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;

        const response = await fetch(`${AdminAPI.baseUrl}/fetch-favicon.php`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ url }),
            credentials: 'same-origin'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Fehler beim Laden des Favicons');
        }

        // Display logo preview
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview && result.data.url) {
            logoPreview.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <img src="${result.data.url}" alt="Favicon" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid var(--color-gray-300);">
                </div>
            `;

            // Store logo path for later submission
            document.getElementById('softwareName').dataset.fetchedLogo = result.data.url;

            showToast('Favicon erfolgreich geladen!', 'success');
        }
    } catch (error) {
        console.error('Favicon fetch error:', error);
        showToast(error.message || 'Fehler beim Laden des Favicons', 'error');
    } finally {
        btn.disabled = wasDisabled;
        if (textSpan) textSpan.textContent = originalText;
    }
}

// Translate single category
async function translateCategory(id) {
    showLoading();
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
        const response = await fetch('/api/translate-item.php', {
            method: 'POST', credentials: 'same-origin', headers,
            body: JSON.stringify({ type: 'category', id: id })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Kategorie übersetzt', 'success');
            const catResult = await AdminAPI.getCategories();
            AdminState.categories = catResult.data || catResult || [];
            renderCategoriesList();
        } else {
            showToast(result.error || 'Übersetzung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showToast('Fehler bei der Übersetzung', 'error');
    } finally {
        hideLoading();
    }
}

// Batch translate categories
async function batchTranslateCategories() {
    const selectedIds = Array.from(document.querySelectorAll('.category-select:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length === 0) { showToast('Keine Kategorien ausgewählt', 'info'); return; }
    if (!confirm(`${selectedIds.length} Kategorien übersetzen?`)) return;

    const btn = document.getElementById('batchTranslateCategoriesBtn');
    const countSpan = document.getElementById('batchTranslateCategoriesCount');
    if (btn) btn.disabled = true;

    let success = 0, failed = 0;
    for (let i = 0; i < selectedIds.length; i++) {
        if (countSpan) countSpan.textContent = `Übersetze ${i + 1}/${selectedIds.length}...`;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const res = await fetch('/api/translate-item.php', {
                method: 'POST', credentials: 'same-origin', headers,
                body: JSON.stringify({ type: 'category', id: selectedIds[i] })
            });
            const result = await res.json();
            if (result.success) success++; else failed++;
        } catch (e) { failed++; }
    }

    showToast(`${success} übersetzt, ${failed} fehlgeschlagen`, success > 0 ? 'success' : 'error');
    const catResult = await AdminAPI.getCategories();
    AdminState.categories = catResult.data || catResult || [];
    renderCategoriesList();
    if (btn) btn.disabled = false;
}

// Translate single target group
async function translateTargetGroup(id) {
    showLoading();
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
        const response = await fetch('/api/translate-item.php', {
            method: 'POST', credentials: 'same-origin', headers,
            body: JSON.stringify({ type: 'target_group', id: id })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Zielgruppe übersetzt', 'success');
            const tgResult = await AdminAPI.getTargetGroups();
            AdminState.targetGroups = tgResult.data || tgResult || [];
            renderTargetGroupsList();
        } else {
            showToast(result.error || 'Übersetzung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showToast('Fehler bei der Übersetzung', 'error');
    } finally {
        hideLoading();
    }
}

// Batch translate target groups
async function batchTranslateTargetGroups() {
    const selectedIds = Array.from(document.querySelectorAll('.target-group-select:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length === 0) { showToast('Keine Zielgruppen ausgewählt', 'info'); return; }
    if (!confirm(`${selectedIds.length} Zielgruppen übersetzen?`)) return;

    const btn = document.getElementById('batchTranslateTargetGroupsBtn');
    const countSpan = document.getElementById('batchTranslateTargetGroupsCount');
    if (btn) btn.disabled = true;

    let success = 0, failed = 0;
    for (let i = 0; i < selectedIds.length; i++) {
        if (countSpan) countSpan.textContent = `Übersetze ${i + 1}/${selectedIds.length}...`;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const res = await fetch('/api/translate-item.php', {
                method: 'POST', credentials: 'same-origin', headers,
                body: JSON.stringify({ type: 'target_group', id: selectedIds[i] })
            });
            const result = await res.json();
            if (result.success) success++; else failed++;
        } catch (e) { failed++; }
    }

    showToast(`${success} übersetzt, ${failed} fehlgeschlagen`, success > 0 ? 'success' : 'error');
    const tgResult = await AdminAPI.getTargetGroups();
    AdminState.targetGroups = tgResult.data || tgResult || [];
    renderTargetGroupsList();
    if (btn) btn.disabled = false;
}

// ==========================================
// DEPARTMENTS PAGE
// ==========================================

async function initDepartmentsPage() {
    showLoading();
    try {
        const result = await AdminAPI.getDepartments();
        AdminState.departments = result.data || [];
        renderDepartmentsList();
        setupDepartmentsEventListeners();
    } catch (error) {
        showToast('Fehler beim Laden der Abteilungen', 'error');
    } finally {
        hideLoading();
    }
}

function renderDepartmentsList() {
    const container = document.getElementById('departmentsTableBody');
    if (!container) return;

    const searchInput = document.getElementById('departmentSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const translationFilter = document.getElementById('filterDepartmentTranslation');
    const softwareFilter = document.getElementById('filterDepartmentSoftware');
    const selectedTranslation = translationFilter ? translationFilter.value : '';
    const selectedSoftware = softwareFilter ? softwareFilter.value : '';

    const filtered = AdminState.departments.filter(item => {
        if (searchTerm) {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                   (item.description && item.description.toLowerCase().includes(searchTerm));
            if (!matchesSearch) return false;
        }
        if (selectedTranslation) {
            const hasTranslation = item.name_en && item.name_en.trim();
            if (selectedTranslation === 'complete' && !hasTranslation) return false;
            if (selectedTranslation === 'missing' && hasTranslation) return false;
        }
        if (selectedSoftware) {
            const softwareCount = item.software_count || 0;
            if (selectedSoftware === 'with' && softwareCount === 0) return false;
            if (selectedSoftware === 'without' && softwareCount > 0) return false;
        }
        return true;
    });

    const columns = [
        {
            key: 'select',
            label: '<input type="checkbox" id="selectAllDepartments" title="Alle auswählen">',
            render: (item) => `<input type="checkbox" class="department-select" data-id="${item.id}">`
        },
        {
            key: 'name',
            label: t('common.name'),
            render: (item) => `<strong>${escapeHtml(item.name)}</strong>`
        },
        {
            key: 'description',
            label: t('common.description'),
            render: (item) => escapeHtml(item.description || '-')
        },
        {
            key: 'translation',
            label: t('common.translation'),
            render: (item) => {
                const hasTranslation = item.name_en;
                const statusIcon = hasTranslation ?
                    '<span class="translation-status complete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' :
                    '<span class="translation-status missing"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>';
                const translateBtn = `<button class="btn-icon-sm" onclick="translateDepartment('${item.id}')" title="${t('common.translate')}" style="margin-left:0.25rem;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg></button>`;
                return `<div style="display:flex;align-items:center;">${statusIcon}${translateBtn}</div>`;
            }
        },
        {
            key: 'software_count',
            label: t('stats.softwareCount'),
            render: (item) => `<span class="badge badge-gray">${item.software_count || 0}</span>`
        }
    ];

    AdminUI.renderDataTable(container, columns, filtered, {
        onEdit: (id) => openDepartmentModal(id),
        onDelete: (id) => confirmDeleteDepartment(id),
        emptyMessage: t('departments.noDepartments')
    });

    updateBatchDepartmentsButtons();
}

function setupDepartmentsEventListeners() {
    const searchInput = document.getElementById('departmentSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderDepartmentsList, 300);
        });
    }

    const translationFilter = document.getElementById('filterDepartmentTranslation');
    const softwareFilter = document.getElementById('filterDepartmentSoftware');
    const clearFiltersBtn = document.getElementById('clearDepartmentFiltersBtn');

    if (translationFilter) translationFilter.addEventListener('change', renderDepartmentsList);
    if (softwareFilter) softwareFilter.addEventListener('change', renderDepartmentsList);
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (translationFilter) translationFilter.value = '';
            if (softwareFilter) softwareFilter.value = '';
            if (searchInput) searchInput.value = '';
            renderDepartmentsList();
        });
    }

    document.addEventListener('change', (e) => {
        if (e.target.id === 'selectAllDepartments') {
            document.querySelectorAll('.department-select').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBatchDepartmentsButtons();
        } else if (e.target.classList?.contains('department-select')) {
            updateBatchDepartmentsButtons();
        }
    });

    const newBtn = document.getElementById('newDepartmentBtn');
    if (newBtn) newBtn.addEventListener('click', () => openDepartmentModal());

    const batchDeleteBtn = document.getElementById('batchDeleteDepartmentsBtn');
    if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', confirmBatchDeleteDepartments);

    const batchTransBtn = document.getElementById('batchTranslateDepartmentsBtn');
    if (batchTransBtn) batchTransBtn.addEventListener('click', batchTranslateDepartments);
}

function updateBatchDepartmentsButtons() {
    const batchBtn = document.getElementById('batchDeleteDepartmentsBtn');
    const countSpan = document.getElementById('batchDeleteDepartmentsCount');
    const batchTransBtn = document.getElementById('batchTranslateDepartmentsBtn');
    const transCountSpan = document.getElementById('batchTranslateDepartmentsCount');
    const selectedCount = document.querySelectorAll('.department-select:checked').length;

    if (batchBtn && countSpan) {
        batchBtn.style.display = selectedCount > 0 ? 'inline-flex' : 'none';
        batchBtn.disabled = selectedCount === 0;
        countSpan.textContent = `Löschen (${selectedCount})`;
    }
    if (batchTransBtn && transCountSpan) {
        batchTransBtn.style.display = selectedCount > 0 ? 'inline-flex' : 'none';
        batchTransBtn.disabled = selectedCount === 0;
        transCountSpan.textContent = `Übersetzen (${selectedCount})`;
    }
}

function openDepartmentModal(id = null) {
    const form = document.getElementById('departmentForm');
    const title = document.getElementById('departmentModalTitle');

    form.reset();
    document.getElementById('departmentId').value = '';

    if (id) {
        title.textContent = t('departments.edit');
        const item = AdminState.departments.find(d => d.id === id);
        if (item) {
            document.getElementById('departmentId').value = item.id;
            document.getElementById('departmentName').value = item.name || '';
            document.getElementById('departmentNameEn').value = item.name_en || '';
            document.getElementById('departmentDescription').value = item.description || '';
            document.getElementById('departmentDescriptionEn').value = item.description_en || '';
        }
    } else {
        title.textContent = t('departments.new');
    }

    openModal('departmentModal');
}

async function saveDepartment(e) {
    e.preventDefault();
    showLoading();

    const id = document.getElementById('departmentId').value;
    const data = {
        name: document.getElementById('departmentName').value,
        nameEn: document.getElementById('departmentNameEn').value,
        description: document.getElementById('departmentDescription').value,
        descriptionEn: document.getElementById('departmentDescriptionEn').value
    };

    try {
        if (id) {
            await AdminAPI.updateDepartment(id, data);
            showToast(t('departments.updated'), 'success');
        } else {
            await AdminAPI.createDepartment(data);
            showToast(t('departments.created'), 'success');
        }

        closeModal('departmentModal');
        const result = await AdminAPI.getDepartments();
        AdminState.departments = result.data || [];
        renderDepartmentsList();
    } catch (error) {
        showToast('Fehler beim Speichern', 'error');
    } finally {
        hideLoading();
    }
}

async function confirmDeleteDepartment(id) {
    if (!confirm('Abteilung wirklich löschen?')) return;
    showLoading();
    try {
        await AdminAPI.deleteDepartment(id);
        showToast(t('departments.deleted'), 'success');
        const result = await AdminAPI.getDepartments();
        AdminState.departments = result.data || [];
        renderDepartmentsList();
    } catch (error) {
        showToast(error.message || 'Fehler beim Löschen', 'error');
    } finally {
        hideLoading();
    }
}

async function confirmBatchDeleteDepartments() {
    const selectedIds = Array.from(document.querySelectorAll('.department-select:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} Abteilungen löschen?`)) return;

    showLoading();
    let success = 0, failed = 0;
    for (const id of selectedIds) {
        try {
            await AdminAPI.deleteDepartment(id);
            success++;
        } catch (e) { failed++; }
    }
    showToast(`${success} gelöscht, ${failed} fehlgeschlagen`, success > 0 ? 'success' : 'error');
    const result = await AdminAPI.getDepartments();
    AdminState.departments = result.data || [];
    renderDepartmentsList();
    hideLoading();
}

async function translateDepartment(id) {
    showLoading();
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
        const response = await fetch('/api/translate-item.php', {
            method: 'POST', credentials: 'same-origin', headers,
            body: JSON.stringify({ type: 'department', id: id })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Abteilung übersetzt', 'success');
            const deptResult = await AdminAPI.getDepartments();
            AdminState.departments = deptResult.data || [];
            renderDepartmentsList();
        } else {
            showToast(result.error || 'Übersetzung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showToast('Fehler bei der Übersetzung', 'error');
    } finally {
        hideLoading();
    }
}

async function batchTranslateDepartments() {
    const selectedIds = Array.from(document.querySelectorAll('.department-select:checked')).map(cb => cb.dataset.id);
    if (selectedIds.length === 0) { showToast('Keine Abteilungen ausgewählt', 'info'); return; }
    if (!confirm(`${selectedIds.length} Abteilungen übersetzen?`)) return;

    const btn = document.getElementById('batchTranslateDepartmentsBtn');
    const countSpan = document.getElementById('batchTranslateDepartmentsCount');
    if (btn) btn.disabled = true;

    let success = 0, failed = 0;
    for (let i = 0; i < selectedIds.length; i++) {
        if (countSpan) countSpan.textContent = `Übersetze ${i + 1}/${selectedIds.length}...`;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;
            const res = await fetch('/api/translate-item.php', {
                method: 'POST', credentials: 'same-origin', headers,
                body: JSON.stringify({ type: 'department', id: selectedIds[i] })
            });
            const result = await res.json();
            if (result.success) success++; else failed++;
        } catch (e) { failed++; }
    }

    showToast(`${success} übersetzt, ${failed} fehlgeschlagen`, success > 0 ? 'success' : 'error');
    const deptResult = await AdminAPI.getDepartments();
    AdminState.departments = deptResult.data || [];
    renderDepartmentsList();
    if (btn) btn.disabled = false;
}

// Generate descriptions and features with AI
async function generateDescriptionsWithAI() {
    const softwareName = document.getElementById('softwareName').value.trim();
    if (!softwareName) {
        showToast('Bitte zuerst einen Software-Namen eingeben', 'warning');
        return;
    }

    const shortDesc = document.getElementById('softwareShortDescription').value.trim();
    const url = document.getElementById('softwareUrl').value.trim();

    showLoading();
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;

        const response = await fetch('/api/generate-descriptions.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ name: softwareName, short_description: shortDesc, url: url })
        });

        const result = await response.json();
        if (result.success && result.data) {
            // Set DE fields
            if (result.data.description) {
                document.getElementById('softwareDescription').value = result.data.description;
                setQuillContent('editorDescription', result.data.description);
            }
            if (result.data.features) {
                document.getElementById('softwareFeatures').value = result.data.features;
                setQuillContent('editorFeatures', result.data.features);
            }
            // Set EN fields
            if (result.data.description_en) {
                document.getElementById('softwareDescriptionEn').value = result.data.description_en;
                setQuillContent('editorDescriptionEn', result.data.description_en);
            }
            if (result.data.features_en) {
                document.getElementById('softwareFeaturesEn').value = result.data.features_en;
                setQuillContent('editorFeaturesEn', result.data.features_en);
            }
            showToast('Beschreibungen generiert', 'success');
        } else {
            showToast(result.error || 'Generierung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showToast('Fehler bei der KI-Generierung', 'error');
    } finally {
        hideLoading();
    }
}

// Translate a single field from DE to EN using AI
async function translateField(fieldName) {
    // Map field names to Quill editor IDs
    const editorMap = {
        'description': { de: 'editorDescription', en: 'editorDescriptionEn' },
        'features': { de: 'editorFeatures', en: 'editorFeaturesEn' },
        'reason_hnee': { de: 'editorReasonHnee', en: 'editorReasonHneeEn' }
    };

    const mapping = editorMap[fieldName];
    if (!mapping) return;

    const deText = getQuillContent(mapping.de);
    if (!deText || deText.trim() === '') {
        showToast('Kein deutscher Text vorhanden', 'info');
        return;
    }

    // Strip HTML for translation prompt
    const tmp = document.createElement('div');
    tmp.innerHTML = deText;
    const plainText = tmp.textContent || tmp.innerText || '';

    showLoading();
    try {
        const prompt = "Übersetze den folgenden Text von Deutsch nach Englisch. " +
            "Gib NUR die englische Übersetzung zurück, ohne Erklärungen oder Markdown-Formatierung.\n\n" +
            plainText;

        const headers = { 'Content-Type': 'application/json' };
        if (AdminState.csrfToken) headers['X-CSRF-Token'] = AdminState.csrfToken;

        const response = await fetch('/api/translate-field.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ text: plainText })
        });

        const result = await response.json();
        if (result.success && result.translation) {
            setQuillContent(mapping.en, '<p>' + escapeHtml(result.translation) + '</p>');
            showToast('Feld übersetzt', 'success');
        } else {
            showToast(result.error || 'Übersetzung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showToast('Fehler bei der Übersetzung', 'error');
    } finally {
        hideLoading();
    }
}

// Make functions globally accessible
window.initLoginPage = initLoginPage;
window.initAdminPage = initAdminPage;
window.initDashboardPage = initDashboardPage;
window.initSoftwarePage = initSoftwarePage;
window.initCategoriesPage = initCategoriesPage;
window.initTargetGroupsPage = initTargetGroupsPage;
window.initDepartmentsPage = initDepartmentsPage;
window.initUsersPage = initUsersPage;
window.initSettingsPage = initSettingsPage;
window.saveSoftware = saveSoftware;
window.closeSoftwareEditPage = closeSoftwareEditPage;
window.saveSoftwareStay = saveSoftwareStay;
window.previewSoftware = previewSoftware;
window.generateDescriptionsWithAI = generateDescriptionsWithAI;
window.closePreview = closePreview;
window.translateField = translateField;
window.saveCategory = saveCategory;
window.saveTargetGroup = saveTargetGroup;
window.saveDepartment = saveDepartment;
window.saveUser = saveUser;
window.resetPassword = resetPassword;
window.openPasswordResetModal = openPasswordResetModal;
window.generateWithAI = generateWithAI;
window.fetchFavicon = fetchFavicon;
window.saveLink = saveLink;
window.editLink = editLink;
window.deleteLink = deleteLink;
window.confirmBatchDelete = confirmBatchDelete;
window.reloadFavicon = reloadFavicon;
window.translateSoftware = translateSoftware;
window.batchTranslateSoftware = batchTranslateSoftware;
window.optimizeSoftware = optimizeSoftware;
window.optimizeSoftwareInModal = optimizeSoftwareInModal;
window.batchOptimizeSoftware = batchOptimizeSoftware;
window.removeSteckbrief = function() {
    document.getElementById('softwareSteckbriefPath').value = '';
    document.getElementById('softwareSteckbrief').value = '';
    document.getElementById('steckbriefPreview').style.display = 'none';
};
window.translateCategory = translateCategory;
window.batchTranslateCategories = batchTranslateCategories;
window.translateTargetGroup = translateTargetGroup;
window.batchTranslateTargetGroups = batchTranslateTargetGroups;
window.translateDepartment = translateDepartment;
window.batchTranslateDepartments = batchTranslateDepartments;
window.AdminUI = AdminUI;

// Export demo data as CSV
document.getElementById('exportDemoCSV')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/demo-data.php?action=export&format=csv');
        if (!response.ok) throw new Error('Export fehlgeschlagen');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'demo-daten-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Demo-Daten als CSV exportiert', 'success');
    } catch (error) {
        showToast('Fehler beim CSV Export: ' + error.message, 'error');
    }
});

// Export demo data as Excel
document.getElementById('exportDemoExcel')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/demo-data.php?action=export&format=xlsx');
        if (!response.ok) throw new Error('Export fehlgeschlagen');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'demo-daten-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Demo-Daten als Excel exportiert', 'success');
    } catch (error) {
        showToast('Fehler beim Excel Export: ' + error.message, 'error');
    }
});
