/**
 * Software Hub - Main JavaScript Application
 */

// API Base URL (always absolute from root, regardless of current page location)
const API_BASE = '/api';

// Translations
let translations = {};
let currentLanguage = localStorage.getItem('language') || 'de';

// State
let software = [];
let categories = [];
let targetGroups = [];
let settings = {};
let selectedCategoryId = null;
let selectedTargetGroupId = null;

/**
 * Initialize the application
 */
async function init() {
    await loadTranslations();
    await loadSettings();
    updateLanguageUI();

    // Check which page we're on
    const page = document.body.dataset.page;

    if (page === 'home') {
        // Parse URL parameters for embed mode
        parseUrlParameters();

        // Apply settings visibility after settings are loaded
        applySettingsVisibility();

        await loadHomeData();
        setupHomeEventListeners();

        // Apply URL parameters after data is loaded
        applyUrlParameters();
    }
}

/**
 * Apply visibility settings from database
 */
function applySettingsVisibility() {
    // Hide header if setting is false
    if (settings && settings.show_header === 'false') {
        const header = document.querySelector('.header');
        if (header) {
            header.style.display = 'none';
        }
    }

    // Hide footer if setting is false
    if (settings && settings.show_footer === 'false') {
        const footer = document.getElementById('footer');
        if (footer) {
            footer.style.display = 'none';
        }
    }
}

/**
 * Parse URL parameters
 */
function parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    // Pre-select category from URL
    if (urlParams.has('categoryId')) {
        selectedCategoryId = urlParams.get('categoryId');
    }

    // Pre-fill search query from URL
    const searchQuery = urlParams.get('q');
    if (searchQuery) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
        }
    }

    // Hide header if requested
    if (urlParams.get('hideHeader') === 'true') {
        const header = document.querySelector('.header');
        if (header) {
            header.style.display = 'none';
        }
    }

    // Hide footer if requested
    if (urlParams.get('hideFooter') === 'true') {
        const footer = document.getElementById('footer');
        if (footer) {
            footer.style.display = 'none';
        }
    }

    // Direct link to software detail
    if (urlParams.has('software')) {
        window._pendingSoftwareId = urlParams.get('software');
    }
}

/**
 * Apply URL parameters after data is loaded
 */
function applyUrlParameters() {
    // Re-render filters with pre-selected category
    if (selectedCategoryId) {
        renderCategoryFilter();
    }

    // Re-render grid with search query and/or category
    renderSoftwareGrid();

    // Open software detail if requested via URL
    if (window._pendingSoftwareId) {
        showSoftwareDetails(window._pendingSoftwareId);
        delete window._pendingSoftwareId;

    }
}

/**
 * Load translations
 */
async function loadTranslations() {
    try {
        // Determine base path (handle both root and /admin/ pages)
        const basePath = window.location.pathname.includes('/admin/') ? '..' : '.';
        const response = await fetch(`${basePath}/messages/${currentLanguage}.json`);
        translations = await response.json();
    } catch (error) {
        console.error('Failed to load translations:', error);
        translations = {};
    }
}

/**
 * Get translation
 */
function t(key) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return keys[keys.length - 1];
        }
    }

    return typeof value === 'string' ? value : key;
}

/**
 * Change language
 */
async function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    await loadTranslations();
    updateLanguageUI();

    // Re-render current page content
    const page = document.body.dataset.page;
    if (page === 'home') {
        if (currentDetailItem) {
            renderDetailPage(currentDetailItem);
        } else {
            renderSoftwareGrid();
            renderCategoryFilter();
            renderTargetGroupFilter();
        }
    }
}

/**
 * Update language UI
 */
function updateLanguageUI() {
    // Update language switcher buttons
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-t]').forEach(el => {
        el.textContent = t(el.dataset.t);
    });

    document.querySelectorAll('[data-t-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.tPlaceholder);
    });
}

/**
 * Load settings
 */
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings.php`);
        settings = await response.json();
        applyDesignSettings();
    } catch (error) {
        console.error('Failed to load settings:', error);
        settings = {};
    }
}

/**
 * Apply design settings (category badge colors, fonts) to the page
 */
function applyDesignSettings() {
    const root = document.documentElement;
    const catBg = getSetting('category_badge_bg', '#99f6e4');
    const catColor = getSetting('category_badge_text_color', '#004d44');
    root.style.setProperty('--category-badge-bg', catBg);
    root.style.setProperty('--category-badge-color', catColor);

    const fontFamily = getSetting('font_family', '');
    const customFontUrl = getSetting('custom_font_url', '');
    const fontId = 'custom-font-style';
    let el = document.getElementById(fontId);
    if (customFontUrl) {
        if (!el) {
            el = document.createElement('style');
            el.id = fontId;
            document.head.appendChild(el);
        }
        const fontName = 'SoftwareHubCustomFont';
        const safeUrl = customFontUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        el.textContent = `@font-face { font-family: ${fontName}; src: url("${safeUrl}"); }\n`;
        root.style.setProperty('--font-family', fontFamily ? `${fontName}, ${fontFamily}` : `${fontName}, system-ui, sans-serif`);
    } else {
        if (el) el.textContent = '';
        root.style.setProperty('--font-family', fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    }
}

/**
 * Get setting value
 */
function getSetting(key, defaultValue = '') {
    return settings[key] ?? defaultValue;
}

/**
 * Load home page data
 */
async function loadHomeData() {
    showLoading();

    try {
        const [softwareRes, categoriesRes, targetGroupsRes] = await Promise.all([
            fetch(`${API_BASE}/software.php`),
            fetch(`${API_BASE}/categories.php`),
            fetch(`${API_BASE}/target-groups.php`)
        ]);

        const softwareData = await softwareRes.json();
        const categoriesData = await categoriesRes.json();
        const targetGroupsData = await targetGroupsRes.json();

        // Handle both formats: { data: [...] } and [...]
        software = softwareData.data || softwareData;
        categories = categoriesData.data || categoriesData;
        targetGroups = targetGroupsData.data || targetGroupsData;

        renderCategoryFilter();
        renderTargetGroupFilter();
        renderSoftwareGrid();
    } catch (error) {
        console.error('Failed to load data:', error);
        showToast(t('errors.networkError'), 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Render category filter buttons
 */
function renderCategoryFilter() {
    const container = document.getElementById('categoryFilterButtons');
    if (!container) return;

    const allButton = `<button class="filter-btn ${selectedCategoryId === null ? 'active' : ''}" data-category-id="">
        ${t('categories.all') || 'Alle'}
    </button>`;

    const categoryButtons = categories.map(cat => {
        const name = currentLanguage === 'en' && cat.name_en ? cat.name_en : cat.name;
        const isActive = selectedCategoryId === cat.id;
        return `<button class="filter-btn ${isActive ? 'active' : ''}" data-category-id="${cat.id}">
            ${escapeHtml(name)}
        </button>`;
    }).join('');

    container.innerHTML = allButton + categoryButtons;
    container.classList.add('collapsed');

    // Add click event listeners
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryId = btn.dataset.categoryId || null;
            selectCategory(categoryId);
        });
    });

    applyFilterOverflow(container);
}

/**
 * Render target group filter buttons
 */
function renderTargetGroupFilter() {
    const container = document.getElementById('targetGroupFilterButtons');
    if (!container) return;

    const allButton = `<button class="filter-btn ${selectedTargetGroupId === null ? 'active' : ''}" data-target-group-id="">
        ${t('targetGroups.all') || 'Alle'}
    </button>`;

    const targetGroupButtons = targetGroups.map(tg => {
        const name = currentLanguage === 'en' && tg.name_en ? tg.name_en : tg.name;
        const isActive = selectedTargetGroupId === tg.id;
        return `<button class="filter-btn ${isActive ? 'active' : ''}" data-target-group-id="${tg.id}">
            ${escapeHtml(name)}
        </button>`;
    }).join('');

    container.innerHTML = allButton + targetGroupButtons;
    container.classList.add('collapsed');

    // Add click event listeners
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetGroupId = btn.dataset.targetGroupId || null;
            selectTargetGroup(targetGroupId);
        });
    });

    applyFilterOverflow(container);
}

/**
 * Select category
 */
function selectCategory(categoryId) {
    selectedCategoryId = categoryId;
    renderCategoryFilter();
    renderSoftwareGrid();
}

/**
 * Select target group
 */
function selectTargetGroup(targetGroupId) {
    selectedTargetGroupId = targetGroupId;
    renderTargetGroupFilter();
    renderSoftwareGrid();
}

/**
 * Render software grid
 */
function renderSoftwareGrid() {
    const grid = document.getElementById('softwareGrid');
    if (!grid) return;

    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

    // Filter software
    let filtered = software.filter(item => {
        // Search filter
        if (searchTerm) {
            const name = (currentLanguage === 'en' && item.name_en ? item.name_en : item.name).toLowerCase();
            const shortDesc = (currentLanguage === 'en' && item.short_description_en ? item.short_description_en : item.short_description || '').toLowerCase();
            const description = (currentLanguage === 'en' && item.description_en ? item.description_en : item.description || '').toLowerCase();
            const features = (currentLanguage === 'en' && item.features_en ? item.features_en : item.features || '').toLowerCase();

            const matchesSearch = name.includes(searchTerm) ||
                                 shortDesc.includes(searchTerm) ||
                                 description.includes(searchTerm) ||
                                 features.includes(searchTerm);

            if (!matchesSearch) {
                return false;
            }
        }

        // Category filter
        if (selectedCategoryId && !item.categories?.some(c => c.id === selectedCategoryId)) {
            return false;
        }

        // Target group filter
        if (selectedTargetGroupId && !item.targetGroups?.some(tg => tg.id === selectedTargetGroupId)) {
            return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>${t('common.noResults')}</h3>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => renderSoftwareCard(item)).join('');
}

/**
 * Render a single software card
 */
function renderSoftwareCard(item) {
    const name = currentLanguage === 'en' && item.name_en ? item.name_en : item.name;
    const shortDesc = currentLanguage === 'en' && item.short_description_en ? item.short_description_en : item.short_description;
    const types = item.types || [];
    const showBadge = getSetting('badge_show', 'true') === 'true';
    const showDsgvo = getSetting('dsgvo_indicator_show', 'true') === 'true';
    const inhouseLogo = getSetting('inhouse_logo_url', '');
    const inhouseTooltip = getSetting('inhouse_tooltip', 'Inhouse gehostet');

    // Badge styles
    const badgeColor = item.available
        ? getSetting('badge_available_color', '#22c55e')
        : getSetting('badge_unavailable_color', '#ef4444');
    const badgeTextColor = item.available
        ? getSetting('badge_available_text_color', '#ffffff')
        : '#ffffff';
    const badgeText = item.available
        ? getSetting('badge_available_text', t('software.available'))
        : getSetting('badge_unavailable_text', t('software.unavailable'));

    // Badge icon
    const badgeIcon = getSetting('badge_icon', '');
    const badgeIconColor = getSetting('badge_icon_color', badgeTextColor);
    const badgeIconPosition = getSetting('badge_icon_position', 'before');

    let badgeIconChar = '';
    if (badgeIcon === 'check') badgeIconChar = '✔';
    else if (badgeIcon === 'dot') badgeIconChar = '●';
    else if (badgeIcon === 'star') badgeIconChar = '★';

    const safeBadgeText = escapeHtml(badgeText);
    let badgeInner = safeBadgeText;
    if (badgeIconChar) {
        const iconSpan = `<span class="badge-icon-inline" style="color:${badgeIconColor};">${badgeIconChar}</span>`;
        badgeInner = badgeIconPosition === 'after'
            ? `${safeBadgeText}${iconSpan}`
            : `${iconSpan}${safeBadgeText}`;
    }

    // Privacy status color
    const privacyDotColor = getPrivacyColor(item.data_privacy_status);
    const privacyTooltip = item.privacy_note || getPrivacyLabel(item.data_privacy_status);

    // Hosting icon (emoji-based for broad support)
    const hostingIcons = {
        'HNEE': { icon: '', label: 'HNEE' },
        'DE': { icon: '🇩🇪', label: currentLanguage === 'en' ? 'Germany' : 'Deutschland' },
        'EU': { icon: '🇪🇺', label: 'EU' },
        'NON_EU': { icon: '🌍', label: currentLanguage === 'en' ? 'Non-EU' : 'Nicht-EU' }
    };
    const hostingInfo = hostingIcons[item.hosting_location] || null;

    // Type icons (smaller for inline)
    const webIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    const desktopIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
    const mobileIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    const typeIcons = {
        Web: webIcon, WEB: webIcon,
        Desktop: desktopIcon, DESKTOP: desktopIcon,
        Mobile: mobileIcon, MOBILE: mobileIcon
    };

    return `
        <div class="card software-card-new slide-up">
            <!-- Card content -->
            <div class="software-card-content">
                <!-- Logo + Name + External Link -->
                <div class="software-header-row">
                    <div class="software-title-group">
                        ${item.logo ? `
                            <img src="${escapeHtml(item.logo)}" alt="${escapeHtml(name)}" class="software-logo-small" onerror="this.style.display='none'">
                        ` : ''}
                        <h3 class="software-name-inline">${escapeHtml(name)}</h3>
                        ${item.url ? `
                            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="external-link-icon" title="${t('software.visitWebsite')}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                        ` : ''}
                    </div>
                </div>

                <!-- Short description -->
                ${shortDesc ? `<p class="software-description">${escapeHtml(shortDesc)}</p>` : ''}

                <!-- Category badges -->
                ${item.categories?.length ? `
                    <div class="software-categories">
                        ${item.categories.map(cat => {
                            const catName = currentLanguage === 'en' && cat.name_en ? cat.name_en : cat.name;
                            return `<span class="badge badge-secondary">${escapeHtml(catName)}</span>`;
                        }).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Card footer: meta row + button -->
            <div class="software-card-footer-new">
                <div class="card-meta-row">
                    ${showDsgvo ? `
                        <span class="card-meta-badge" data-tip="${escapeHtml(privacyTooltip)}">
                            ${currentLanguage === 'en' ? 'Privacy' : 'Datenschutz'}: <span class="privacy-dot" style="background-color:${privacyDotColor};"></span>
                        </span>
                    ` : ''}
                    ${hostingInfo ? `
                        <span class="card-meta-badge" data-tip="${escapeHtml(hostingInfo.label)}">
                            Hosting: ${item.hosting_location === 'HNEE' && inhouseLogo
                                ? `<img src="${escapeHtml(inhouseLogo)}" alt="HNEE" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;">`
                                : `<span style="font-size:0.9rem;line-height:1;">${hostingInfo.icon}</span>`
                            }
                        </span>
                    ` : ''}
                    ${types.length > 0 ? `
                        <span class="card-meta-badge" data-tip="${types.map(type => t('software.' + type.toLowerCase())).join(', ')}">
                            Typ: ${types.map(type => `<span style="display:inline-flex;vertical-align:middle;">${typeIcons[type] || ''}</span>`).join(' ')}
                        </span>
                    ` : ''}
                </div>
                <button class="btn btn-primary btn-details" onclick="showSoftwareDetails('${item.id}')">
                    ${t('software.showDetails')}
                </button>
            </div>
        </div>
    `;
}

/**
 * Currently displayed software item on detail page
 */
let currentDetailItem = null;

/**
 * Show software details as landing page
 */
async function showSoftwareDetails(id) {
    let item = software.find(s => s.id === id);
    if (!item) return;
    try {
        const res = await fetch(`/api/software.php?id=${encodeURIComponent(id)}`);
        if (res.ok) {
            const full = await res.json();
            if (full && full.id) item = full;
        }
    } catch (e) { /* use cached item */ }

    currentDetailItem = item;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('software', id);
    history.pushState({ software: id }, '', url);

    renderDetailPage(item);
}

/**
 * Render the detail landing page content
 */
function renderDetailPage(item) {
    const name = currentLanguage === 'en' && item.name_en ? item.name_en : item.name;
    const shortDesc = currentLanguage === 'en' && item.short_description_en ? item.short_description_en : item.short_description;
    const description = currentLanguage === 'en' && item.description_en ? item.description_en : item.description;
    const features = currentLanguage === 'en' && item.features_en ? item.features_en : item.features;
    const alternatives = currentLanguage === 'en' && item.alternatives_en ? item.alternatives_en : item.alternatives;
    const notes = currentLanguage === 'en' && item.notes_en ? item.notes_en : item.notes;
    const reasonHnee = currentLanguage === 'en' && item.reason_hnee_en ? item.reason_hnee_en : item.reason_hnee;

    // Cost label
    let costLabel = t('software.free');
    if (item.costs === 'einmalig') costLabel = t('software.oneTime');
    else if (item.costs === 'abo') costLabel = t('software.subscription');
    else if (item.costs === 'kostenpflichtig') costLabel = t('software.paid');
    if (item.cost_price) costLabel += ' – ' + escapeHtml(item.cost_price);

    const detailPage = document.getElementById('softwareDetailPage');
    const content = document.getElementById('detailPageContent');

    // Hide main content, show detail page
    document.querySelectorAll('.search-section, .filter-section, #softwareGrid, #emptyState').forEach(el => el.style.display = 'none');
    const footer = document.getElementById('footer');
    if (footer) footer.style.display = 'none';
    detailPage.classList.remove('hidden');

    content.innerHTML = `
        <div class="detail-content-card">
            <!-- Header with logo, name, badges -->
            <div class="flex items-start gap-4 mb-4">
                ${item.logo
                    ? `<img src="${escapeHtml(item.logo)}" alt="${escapeHtml(name)}" class="software-logo" style="width:64px;height:64px;border-radius:0.5rem;">`
                    : ''
                }
                <div style="flex:1;">
                    <h3>${escapeHtml(name)}</h3>
                    <div class="software-badges mb-2" style="margin-top:0.5rem;">
                        ${item.categories?.map(cat => {
                            const catName = currentLanguage === 'en' && cat.name_en ? cat.name_en : cat.name;
                            return `<span class="badge badge-primary">${escapeHtml(catName)}</span>`;
                        }).join('') || ''}
                    </div>
                    ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-500">${escapeHtml(item.url)}</a>` : ''}
                </div>
            </div>

            ${shortDesc ? `
                <div class="detail-section">
                    <p class="text-gray-600" style="font-size:1.05rem;">${escapeHtml(shortDesc)}</p>
                </div>
            ` : ''}

            <!-- Meta grid -->
            <div class="detail-meta-grid">
                <div class="detail-meta-item">
                    <div class="meta-label">${t('software.costs')}</div>
                    <div class="meta-value">${costLabel}</div>
                </div>
                <div class="detail-meta-item">
                    <div class="meta-label">${currentLanguage === 'en' ? 'Data Privacy' : 'Datenschutz'}</div>
                    <div class="meta-value" style="display:flex;align-items:center;gap:0.4rem;">
                        <span style="width:12px;height:12px;border-radius:50%;background:${getPrivacyColor(item.data_privacy_status)};flex-shrink:0;"></span>
                        ${getPrivacyLabel(item.data_privacy_status)}
                    </div>
                </div>
                <div class="detail-meta-item">
                    <div class="meta-label">Hosting</div>
                    <div class="meta-value">${getHostingLabel(item.hosting_location)}</div>
                </div>
                ${item.targetGroups?.length > 0 ? `
                    <div class="detail-meta-item">
                        <div class="meta-label">${t('software.targetGroups')}</div>
                        <div class="meta-value">${item.targetGroups.map(tg => {
                            const tgName = currentLanguage === 'en' && tg.name_en ? tg.name_en : tg.name;
                            return escapeHtml(tgName);
                        }).join(', ')}</div>
                    </div>
                ` : ''}
                ${item.departments?.length > 0 ? `
                    <div class="detail-meta-item">
                        <div class="meta-label">${currentLanguage === 'en' ? 'Departments' : 'Abteilungen'}</div>
                        <div class="meta-value">${item.departments.map(d => {
                            const dName = currentLanguage === 'en' && d.name_en ? d.name_en : d.name;
                            return escapeHtml(dName);
                        }).join(', ')}</div>
                    </div>
                ` : ''}
            </div>

            ${description ? `
                <div class="detail-section">
                    <h4>${t('common.description')}</h4>
                    <div class="rich-content">${sanitizeHtml(description)}</div>
                </div>
            ` : ''}

            ${reasonHnee ? `
                <div class="detail-section">
                    <h4>${currentLanguage === 'en' ? 'Why is this software used at HNEE?' : 'Warum wird diese Software an der HNEE eingesetzt?'}</h4>
                    <div class="rich-content">${sanitizeHtml(reasonHnee)}</div>
                </div>
            ` : ''}

            ${features ? `
                <div class="detail-section">
                    <h4>${t('software.features')}</h4>
                    <div class="rich-content">${sanitizeHtml(features)}</div>
                </div>
            ` : ''}

            ${alternatives ? `
                <div class="detail-section">
                    <h4>${t('software.alternatives')}</h4>
                    <p>${escapeHtml(alternatives)}</p>
                </div>
            ` : ''}

            ${(() => {
                const tutorials = currentLanguage === 'en' && item.tutorials_en ? item.tutorials_en : item.tutorials;
                return tutorials ? `
                <div class="detail-section">
                    <h4>${t('software.tutorials')}</h4>
                    <div class="rich-content">${sanitizeHtml(tutorials)}</div>
                </div>` : '';
            })()}

            ${(() => {
                const accessInfo = currentLanguage === 'en' && item.access_info_en ? item.access_info_en : item.access_info;
                return accessInfo ? `
                <div class="detail-section">
                    <h4>${t('software.accessInfo')}</h4>
                    <div class="rich-content">${sanitizeHtml(accessInfo)}</div>
                </div>` : '';
            })()}

            ${notes ? `
                <div class="detail-section">
                    <h4>${t('software.notes')}</h4>
                    <div class="rich-content">${sanitizeHtml(notes)}</div>
                </div>
            ` : ''}

            ${item.steckbrief_path ? (() => {
                const downloadName = item.steckbrief_original_name || item.steckbrief_path.split('/').pop();
                return `
                <div class="detail-section">
                    <h4>${currentLanguage === 'en' ? 'Fact Sheet / Guides (PDF)' : 'Steckbrief / Anleitungen (PDF)'}</h4>
                    <div class="steckbrief-preview">
                        <embed src="${escapeHtml(item.steckbrief_path)}" type="application/pdf">
                    </div>
                    <a href="${escapeHtml(item.steckbrief_path)}" download="${escapeHtml(downloadName)}" class="btn btn-secondary" style="margin-top:0.75rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        ${currentLanguage === 'en' ? 'Download PDF' : 'PDF herunterladen'}
                    </a>
                </div>`;
            })() : ''}

            ${item.contacts && item.contacts.length > 0 ? `
                <div class="detail-section">
                    <h4>${currentLanguage === 'en' ? 'Contact Persons' : 'Ansprechpersonen'}</h4>
                    <div class="flex flex-wrap gap-3">
                        ${item.contacts.map(c => {
                            const fullName = [c.salutation, c.first_name, c.last_name].filter(Boolean).join(' ');
                            const roles = (c.contact_roles || '');
                            const roleLabels = roles ? getContactRoleLabels(roles) : [];
                            const roleHtml = roleLabels.length ? `<span class="text-xs text-gray-500">${roleLabels.join(' · ')}</span>` : '';
                            const btnClass = 'btn btn-secondary btn-sm inline-flex items-center gap-1';
                            const emailBtn = c.email ? `<a href="mailto:${escapeHtml(c.email)}" class="${btnClass}">${currentLanguage === 'en' ? 'E-mail' : 'E-Mail'}</a>` : '';
                            const profileBtn = c.profile_url ? `<a href="${escapeHtml(c.profile_url)}" target="_blank" rel="noopener noreferrer" class="${btnClass}">${currentLanguage === 'en' ? 'Profile' : 'Profil'}</a>` : '';
                            const buttons = [emailBtn, profileBtn].filter(Boolean).join(' ');
                            return `<div class="text-sm border border-gray-200 rounded-lg p-3 min-w-[200px]"><div class="font-medium text-gray-900">${escapeHtml(fullName)}</div>${roleHtml ? `<div class="mt-0.5">${roleHtml}</div>` : ''}<div class="mt-2 flex flex-wrap gap-2">${buttons}</div></div>`;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>

        ${renderAccountRequestForm(item)}
    `;

    window.scrollTo(0, 0);
}

/**
 * Render account request form (Feature 2)
 */
function renderAccountRequestForm(item) {
    // Check if account request form is enabled for this software
    if (item.show_account_request == 0) return '';

    // Find designated account recipient(s), fallback to admin contacts
    const contacts = item.contacts || [];
    const recipients = contacts.filter(c => c.is_account_recipient == 1 && c.email);
    const fallbackRecipients = recipients.length > 0 ? recipients :
        contacts.filter(c => c.contact_roles && c.contact_roles.includes('administration') && c.email);

    if (fallbackRecipients.length === 0) return '';

    const name = currentLanguage === 'en' && item.name_en ? item.name_en : item.name;
    const recipientEmails = fallbackRecipients.map(c => c.email).join(',');

    // Build recipient select if multiple
    const recipientSelect = fallbackRecipients.length > 1 ? `
        <div class="form-group">
            <label class="form-label">${currentLanguage === 'en' ? 'Send to' : 'Senden an'}</label>
            <select id="reqRecipient" class="form-select">
                ${fallbackRecipients.map(c => {
                    const cName = [c.salutation, c.first_name, c.last_name].filter(Boolean).join(' ');
                    return `<option value="${escapeHtml(c.email)}">${escapeHtml(cName)} (${escapeHtml(c.email)})</option>`;
                }).join('')}
            </select>
        </div>
    ` : `<input type="hidden" id="reqRecipient" value="${escapeHtml(fallbackRecipients[0].email)}">`;

    return `
        <div class="account-request-section">
            <h4>${currentLanguage === 'en' ? 'Request User Account' : 'Nutzerkonto beantragen'}</h4>
            <p class="text-sm text-gray-500" style="margin-bottom:1rem;">
                ${currentLanguage === 'en'
                    ? 'Fill in the form and click the button to send an account request via email.'
                    : 'Füllen Sie das Formular aus und klicken Sie auf den Button, um eine Kontoanfrage per E-Mail zu senden.'}
            </p>
            ${recipientSelect}
            <div class="account-request-section form-row">
                <div class="form-group">
                    <label class="form-label">${currentLanguage === 'en' ? 'First Name' : 'Vorname'}</label>
                    <input type="text" id="reqFirstName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">${currentLanguage === 'en' ? 'Last Name' : 'Nachname'}</label>
                    <input type="text" id="reqLastName" class="form-input" required>
                </div>
            </div>
            <div class="account-request-section form-row">
                <div class="form-group">
                    <label class="form-label">${currentLanguage === 'en' ? 'Username' : 'Benutzername'}</label>
                    <input type="text" id="reqUsername" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">${currentLanguage === 'en' ? 'Email Address' : 'E-Mail-Adresse'}</label>
                    <input type="email" id="reqEmail" class="form-input" required>
                </div>
            </div>
            <button type="button" class="btn btn-primary" style="margin-top:0.75rem;" onclick="sendAccountRequest('${escapeHtml(name).replace(/'/g, "\\'")}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                ${currentLanguage === 'en' ? 'Request Account' : 'Nutzerkonto beantragen'}
            </button>
        </div>
    `;
}

/**
 * Send account request via mailto
 */
function sendAccountRequest(softwareName) {
    const firstName = document.getElementById('reqFirstName')?.value?.trim();
    const lastName = document.getElementById('reqLastName')?.value?.trim();
    const username = document.getElementById('reqUsername')?.value?.trim();
    const email = document.getElementById('reqEmail')?.value?.trim();
    const toEmail = document.getElementById('reqRecipient')?.value?.trim();

    if (!firstName || !lastName || !username || !email) {
        showToast(currentLanguage === 'en' ? 'Please fill in all fields' : 'Bitte alle Felder ausfüllen', 'warning');
        return;
    }

    if (!toEmail) {
        showToast(currentLanguage === 'en' ? 'No recipient configured' : 'Kein Empfänger konfiguriert', 'error');
        return;
    }

    const isEn = currentLanguage === 'en';
    const subject = encodeURIComponent(isEn
        ? `Account Request: ${softwareName}`
        : `Nutzerkonto-Anfrage: ${softwareName}`);
    const body = encodeURIComponent(isEn
        ? `Account request for: ${softwareName}\n\nFirst Name: ${firstName}\nLast Name: ${lastName}\nUsername: ${username}\nEmail: ${email}\n`
        : `Nutzerkonto-Anfrage für: ${softwareName}\n\nVorname: ${firstName}\nNachname: ${lastName}\nBenutzername: ${username}\nE-Mail: ${email}\n`
    );

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
}

/**
 * Close the detail page and return to the software list
 */
function closeDetailPage() {
    currentDetailItem = null;

    // Hide detail page
    const detailPage = document.getElementById('softwareDetailPage');
    detailPage.classList.add('hidden');

    // Show main content again
    document.querySelectorAll('.search-section, .filter-section, #softwareGrid').forEach(el => el.style.display = '');
    const footer = document.getElementById('footer');
    if (footer && !(settings && settings.show_footer === 'false')) footer.style.display = '';

    // Update URL back
    const url = new URL(window.location);
    url.searchParams.delete('software');
    history.pushState({}, '', url.search ? url : window.location.pathname);
}

/**
 * Format tutorials field: URLs as links, rest as text
 */
function formatTutorials(tutorialsStr) {
    if (!tutorialsStr || typeof tutorialsStr !== 'string') return '';
    const parts = tutorialsStr.split(/\s+/).filter(Boolean);
    return parts.map(p => {
        const trimmed = p.trim();
        if (/^https?:\/\//i.test(trimmed)) {
            return `<a href="${escapeHtml(trimmed)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${escapeHtml(trimmed)}</a>`;
        }
        return escapeHtml(trimmed);
    }).join(' ');
}

/**
 * Get contact role labels (administration, training) for display
 */
function getContactRoleLabels(rolesStr) {
    if (!rolesStr || typeof rolesStr !== 'string') return [];
    const parts = rolesStr.split(',').map(s => s.trim()).filter(Boolean);
    const labels = [];
    if (parts.includes('administration')) labels.push(currentLanguage === 'en' ? 'Administration' : 'Administration');
    if (parts.includes('training')) labels.push(currentLanguage === 'en' ? 'Questions / Training' : 'Fragen / Schulungen');
    return labels;
}

/**
 * Get privacy status label
 */
function getPrivacyLabel(status) {
    const isEn = currentLanguage === 'en';
    switch (status) {
        case 'COMPLIANT': return isEn ? 'Compliant / GDPR compliant' : 'Konform / DSGVO-konform';
        case 'PARTIAL': return isEn ? 'Partially compliant' : 'Teilweise konform';
        case 'IN_PROGRESS': return isEn ? 'In progress' : 'In Umsetzung';
        case 'NON_COMPLIANT': return isEn ? 'Non-compliant / Critical' : 'Nicht konform / Kritische Lücke';
        case 'UNKNOWN':
        default: return isEn ? 'Unknown / Not yet assessed' : 'Unbekannt / Noch nicht bewertet';
    }
}

function getPrivacyColor(status) {
    switch (status) {
        case 'COMPLIANT':
        case 'DSGVO_COMPLIANT': return '#22c55e';
        case 'PARTIAL': return '#eab308';
        case 'IN_PROGRESS': return '#f97316';
        case 'NON_COMPLIANT': return '#ef4444';
        default: return '#9ca3af';
    }
}

function getHostingLabel(location) {
    const isEn = currentLanguage === 'en';
    switch (location) {
        case 'HNEE': return 'HNEE';
        case 'DE': return isEn ? 'Germany' : 'Deutschland';
        case 'EU': return 'EU';
        case 'NON_EU': return isEn ? 'Non-EU' : 'Nicht-EU';
        default: return isEn ? 'Unknown' : 'Unbekannt';
    }
}

/**
 * Setup home page event listeners
 */
function setupHomeEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(renderSoftwareGrid, 300);
        });
    }

    // Language switcher
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
    });

    // Browser back/forward for detail page
    window.addEventListener('popstate', (e) => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('software')) {
            const id = params.get('software');
            const item = software.find(s => s.id === id);
            if (item) {
                currentDetailItem = item;
                renderDetailPage(item);
            }
        } else {
            closeDetailPage();
        }
    });
}

/**
 * Modal functions
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

/**
 * Loading overlay
 */
function showLoading() {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Toast notifications
 */
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Escape HTML
 */
/**
 * Apply overflow detection to filter button rows.
 * Hides buttons that don't fit in the first row and shows a "Weitere..." toggle.
 */
function applyFilterOverflow(container) {
    if (!container) return;

    // Clean up previous state
    container.querySelector('.filter-more-btn')?.remove();
    container.classList.remove('collapsed');
    container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('overflow-hidden'));

    const buttons = Array.from(container.querySelectorAll('.filter-btn'));
    if (buttons.length <= 1) return;

    // Measure: find the top of the first button row
    const firstTop = buttons[0].getBoundingClientRect().top;
    const overflowing = buttons.filter(btn => Math.abs(btn.getBoundingClientRect().top - firstTop) > 5);

    if (overflowing.length === 0) return;

    // Mark overflowing buttons
    overflowing.forEach(btn => btn.classList.add('overflow-hidden'));
    container.classList.add('collapsed');

    // Create toggle button
    const moreBtn = document.createElement('button');
    moreBtn.className = 'filter-btn filter-more-btn';
    const moreText = (currentLanguage === 'en' ? 'More' : 'Weitere') + ' (' + overflowing.length + ')';
    const lessText = currentLanguage === 'en' ? 'Show less' : 'Weniger';
    moreBtn.textContent = moreText;

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.classList.toggle('collapsed');
        moreBtn.textContent = container.classList.contains('collapsed') ? moreText : lessText;
    });

    // Insert before the first hidden button
    overflowing[0].parentNode.insertBefore(moreBtn, overflowing[0]);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize HTML - allow only safe formatting tags from the Quill editor.
 * Falls back to escapeHtml for plain text (no HTML tags detected).
 */
function sanitizeHtml(html) {
    if (!html) return '';
    // If it doesn't contain any HTML tags, treat as plain text
    if (!/<[a-z][\s\S]*>/i.test(html)) return escapeHtml(html);
    const allowed = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'span'];
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    // Remove script/style/iframe etc.
    tmp.querySelectorAll('script,style,iframe,object,embed,form,input').forEach(el => el.remove());
    // Strip disallowed tags but keep content
    tmp.querySelectorAll('*').forEach(el => {
        if (!allowed.includes(el.tagName.toLowerCase())) {
            el.replaceWith(...el.childNodes);
        } else {
            // Only allow href on <a> tags, remove all other attributes except target
            const tag = el.tagName.toLowerCase();
            const attrs = [...el.attributes];
            attrs.forEach(attr => {
                if (tag === 'a' && (attr.name === 'href' || attr.name === 'target' || attr.name === 'rel')) return;
                el.removeAttribute(attr.name);
            });
            if (tag === 'a') {
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
            }
        }
    });
    return tmp.innerHTML;
}

/**
 * API Helper
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
