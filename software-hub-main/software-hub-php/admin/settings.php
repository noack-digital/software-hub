<?php
/**
 * Settings Page
 * Software Hub - PHP Version
 */

$pageTitle = 'Einstellungen';
$currentPage = 'settings';

require_once __DIR__ . '/../includes/admin-header.php';

// Check if user is admin
if ($currentUser['role'] !== 'ADMIN') {
    header('Location: dashboard.php');
    exit;
}
?>

<div class="card">
    <div class="tabs">
        <button class="tab-button active" data-tab="badgeTab" data-t="settings.badge">Badge-Einstellungen</button>
        <button class="tab-button" data-tab="linksTab" data-t="settings.links">Link-Einstellungen</button>
        <button class="tab-button" data-tab="aiTab" data-t="settings.ai">KI-Einstellungen</button>
        <button class="tab-button" data-tab="brandingTab">Branding</button>
        <button class="tab-button" data-tab="importExportTab" data-t="settings.importExport">Import/Export</button>
        <button class="tab-button" data-tab="footerLinksTab" data-t="settings.footerLinks">Footer Links</button>
        <button class="tab-button" data-tab="embedTab" data-t="settings.embed">Embed/Widget</button>
    </div>

    <!-- Badge Settings Tab -->
    <div class="tab-content active" id="badgeTab">
        <div class="card-body">
            <div class="form-section">
                <h4 class="form-section-title" data-t="settings.availabilityBadge">Verfügbarkeits-Badge</h4>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-switch-input" id="badgeShow">
                        <span class="toggle-switch-slider"></span>
                        <span class="toggle-switch-label" data-t="settings.showBadge">Badge anzeigen</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label" for="badgeText" data-t="settings.badgeText">Badge-Text</label>
                    <input type="text" id="badgeText" class="form-input" placeholder="Verfügbar">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="badgeBgColor" data-t="settings.backgroundColor">Hintergrundfarbe</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="badgeBgColor" class="color-input" value="#22c55e">
                            <input type="text" class="form-input" style="flex:1;" id="badgeBgColorText" value="#22c55e">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="badgeTextColor" data-t="settings.textColor">Textfarbe</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="badgeTextColor" class="color-input" value="#ffffff">
                            <input type="text" class="form-input" style="flex:1;" id="badgeTextColorText" value="#ffffff">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="badgeIcon">Icon</label>
                        <select id="badgeIcon" class="form-select">
                            <option value="">Kein Icon</option>
                            <option value="check">Haken</option>
                            <option value="dot">Punkt</option>
                            <option value="star">Stern</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="badgeIconColor">Icon-Farbe</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="badgeIconColor" class="color-input" value="#ffffff">
                            <input type="text" class="form-input" style="flex:1;" id="badgeIconColorText" value="#ffffff">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="badgeIconPosition">Icon-Position</label>
                        <select id="badgeIconPosition" class="form-select">
                            <option value="before">Icon vor Text</option>
                            <option value="after">Icon nach Text</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4 class="form-section-title">Vorschau</h4>
                <div class="badge-preview-row">
                    <div id="availabilityBadgePreview" class="availability-badge">
                        <span id="availabilityBadgePreviewIcon" class="badge-icon-inline"></span>
                        <span id="availabilityBadgePreviewText"></span>
                    </div>
                    <div id="privacyBadgePreview" class="privacy-badge-inline">
                        <span id="privacyBadgePreviewInhouse" class="inhouse-icon" style="display:none;"></span>
                        <span id="privacyBadgePreviewDotGreen" class="privacy-dot" title="DSGVO-konform"></span>
                        <span id="privacyBadgePreviewDotYellow" class="privacy-dot" title="EU-gehostet"></span>
                        <span id="privacyBadgePreviewDotRed" class="privacy-dot" title="Nicht-EU"></span>
                        <span id="privacyBadgePreviewText"></span>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4 class="form-section-title" data-t="settings.dsgvoIndicator">DSGVO-Anzeige</h4>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-switch-input" id="showDsgvoIndicator">
                        <span class="toggle-switch-slider"></span>
                        <span class="toggle-switch-label" data-t="settings.showDsgvoIndicator">DSGVO-Ampel anzeigen</span>
                    </label>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="dsgvoColorGreen">Farbe Grün (DSGVO-konform)</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="dsgvoColorGreen" class="color-input" value="#22c55e">
                            <input type="text" class="form-input" style="flex:1;" id="dsgvoColorGreenText" value="#22c55e">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="dsgvoColorYellow">Farbe Gelb (EU-gehostet)</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="dsgvoColorYellow" class="color-input" value="#eab308">
                            <input type="text" class="form-input" style="flex:1;" id="dsgvoColorYellowText" value="#eab308">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="dsgvoColorRed">Farbe Rot (Nicht-EU)</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="dsgvoColorRed" class="color-input" value="#ef4444">
                            <input type="text" class="form-input" style="flex:1;" id="dsgvoColorRedText" value="#ef4444">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4 class="form-section-title">Kategorie-Badges</h4>
                <p class="text-sm text-gray-500 mb-2">Farben der Kategorie-Buttons / -Badges (Filter und auf Karten)</p>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="categoryBadgeBg">Hintergrundfarbe</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="categoryBadgeBg" class="color-input" value="#99f6e4">
                            <input type="text" class="form-input" style="flex:1;" id="categoryBadgeBgText" value="#99f6e4">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="categoryBadgeColor">Textfarbe</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="categoryBadgeColor" class="color-input" value="#004d44">
                            <input type="text" class="form-input" style="flex:1;" id="categoryBadgeColorText" value="#004d44">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4 class="form-section-title" data-t="settings.inhouseHosting">Inhouse-Hosting</h4>
                <div class="form-group">
                    <label class="form-label" for="inhouseLogo" data-t="settings.inhouseLogo">Inhouse-Logo URL</label>
                    <input type="text" id="inhouseLogo" class="form-input" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label class="form-label" for="inhouseTooltip" data-t="settings.inhouseTooltip">Tooltip-Text</label>
                    <input type="text" id="inhouseTooltip" class="form-input" placeholder="Wird lokal gehostet">
                </div>
            </div>

            <div class="mt-4">
                <button id="saveBadgeSettings" class="btn btn-primary" data-t="common.save">Speichern</button>
            </div>
        </div>
    </div>

    <!-- Links Settings Tab -->
    <div class="tab-content" id="linksTab">
        <div class="card-body">
            <div class="form-section">
                <h4 class="form-section-title">Layout-Einstellungen</h4>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-switch-input" id="showHeader">
                        <span class="toggle-switch-slider"></span>
                        <span class="toggle-switch-label" data-t="settings.showHeader">Header anzeigen</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-switch-input" id="showFooter">
                        <span class="toggle-switch-slider"></span>
                        <span class="toggle-switch-label" data-t="settings.showFooter">Footer anzeigen</span>
                    </label>
                </div>
            </div>

            <div class="form-section">
                <h4 class="form-section-title" data-t="settings.footerLinks">Footer-Links</h4>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-switch-input" id="showFooterLinks">
                        <span class="toggle-switch-slider"></span>
                        <span class="toggle-switch-label" data-t="settings.showFooterLinks">Footer-Links anzeigen</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="form-label" for="impressumUrl" data-t="settings.impressumUrl">Impressum URL</label>
                    <input type="url" id="impressumUrl" class="form-input" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label class="form-label" for="datenschutzUrl" data-t="settings.datenschutzUrl">Datenschutz URL</label>
                    <input type="url" id="datenschutzUrl" class="form-input" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" class="toggle-switch-input" id="linksNewTab">
                        <span class="toggle-switch-slider"></span>
                        <span class="toggle-switch-label" data-t="settings.openInNewTab">Links in neuem Tab öffnen</span>
                    </label>
                </div>
            </div>

            <div class="mt-4">
                <button id="saveLinkSettings" class="btn btn-primary" data-t="common.save">Speichern</button>
            </div>
        </div>
    </div>

    <!-- AI Settings Tab -->
    <div class="tab-content" id="aiTab">
        <div class="card-body">
            <!-- Status Overview -->
            <div class="form-section" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h4 class="form-section-title" style="margin-bottom: 1rem;">KI-Status</h4>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 500; min-width: 120px;">Aktiver Provider:</span>
                        <span id="activeProviderBadge" class="badge" style="background: var(--text-secondary);">Nicht konfiguriert</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 500; min-width: 120px;">Gemini API:</span>
                        <span id="geminiStatusBadge" class="badge" style="background: var(--text-secondary);">Nicht konfiguriert</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 500; min-width: 120px;">Mistral API:</span>
                        <span id="mistralStatusBadge" class="badge" style="background: var(--text-secondary);">Nicht konfiguriert</span>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h4 class="form-section-title" data-t="settings.ai">KI-Einstellungen</h4>

                <div class="form-group">
                    <label class="form-label" for="aiProvider">
                        KI-Anbieter
                        <span style="color: var(--text-secondary); font-size: 0.875rem; font-weight: normal; margin-left: 0.5rem;">
                            (Legt fest, welche KI für die Generierung verwendet wird)
                        </span>
                    </label>
                    <select id="aiProvider" class="form-select">
                        <option value="gemini">Google Gemini</option>
                        <option value="mistral">Mistral AI</option>
                    </select>
                </div>

                <!-- Gemini Settings -->
                <div id="geminiSettings">
                    <div class="form-group">
                        <label class="form-label" for="geminiApiKey">Google Gemini API Key</label>
                        <input type="password" id="geminiApiKey" class="form-input" placeholder="Enter API key...">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="geminiModel">Gemini Model</label>
                        <select id="geminiModel" class="form-select">
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Schnell)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Leistungsstark)</option>
                            <option value="gemini-pro">Gemini Pro</option>
                        </select>
                    </div>
                    <div class="form-group" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                        <button type="button" id="testGeminiKey" class="btn btn-secondary btn-sm">API-Key testen</button>
                        <button type="button" id="deleteGeminiKey" class="btn btn-ghost btn-sm">API-Key löschen</button>
                    </div>
                    <p class="text-sm text-gray-500">
                        Google Gemini wird über
                        <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
                        oder die
                        <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
                        verwaltet. Eine Übersicht zu Modellen und Preisen findest du in der
                        <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer">Gemini-Dokumentation</a>.
                    </p>
                </div>

                <!-- Mistral Settings -->
                <div id="mistralSettings" style="display: none;">
                    <div class="form-group">
                        <label class="form-label" for="mistralApiKey">Mistral API Key</label>
                        <input type="password" id="mistralApiKey" class="form-input" placeholder="Enter API key...">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mistralModel">Mistral Model</label>
                        <select id="mistralModel" class="form-select">
                            <option value="mistral-small-latest">Mistral Small (Schnell)</option>
                            <option value="mistral-medium-latest">Mistral Medium (Ausgewogen)</option>
                            <option value="mistral-large-latest">Mistral Large (Leistungsstark)</option>
                        </select>
                    </div>
                    <div class="form-group" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                        <button type="button" id="testMistralKey" class="btn btn-secondary btn-sm">API-Key testen</button>
                        <button type="button" id="deleteMistralKey" class="btn btn-ghost btn-sm">API-Key löschen</button>
                    </div>
                    <p class="text-sm text-gray-500">
                        Einen Mistral API-Key erhältst du nach Registrierung in der
                        <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer">Mistral Console</a>.
                        Technische Details und Beispiele findest du in der
                        <a href="https://docs.mistral.ai/" target="_blank" rel="noopener noreferrer">Mistral-Dokumentation</a>.
                    </p>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="aiDescriptionWords">Beschreibung (Wortanzahl)</label>
                        <input type="number" id="aiDescriptionWords" class="form-input" value="100" min="50" max="500">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="aiShortDescriptionWords">Kurzbeschreibung (Wortanzahl)</label>
                        <input type="number" id="aiShortDescriptionWords" class="form-input" value="20" min="10" max="50">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="aiOptimizePrompt">
                        Optimierungs-Prompt
                        <span style="color: var(--text-secondary); font-size: 0.875rem; font-weight: normal; margin-left: 0.5rem;">
                            (Platzhalter: <code>{{short_description_words}}</code>, <code>{{description_words}}</code>, <code>{{fields_json}}</code>)
                        </span>
                    </label>
                    <textarea id="aiOptimizePrompt" class="form-input" rows="10" style="font-family: monospace; font-size: 0.85rem;"></textarea>
                    <button type="button" id="resetOptimizePrompt" class="btn btn-ghost btn-sm" style="margin-top: 0.5rem;">Auf Standard zurücksetzen</button>
                </div>
            </div>

            <div class="mt-4">
                <button id="saveAiSettings" class="btn btn-primary" data-t="common.save">Speichern</button>
            </div>
        </div>
    </div>

    <!-- Import/Export Tab -->
    <div class="tab-content" id="importExportTab">
        <div class="card-body">
            <!-- Export Section -->
            <div class="form-section">
                <h4 class="form-section-title">Daten exportieren</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Exportieren Sie alle Software-Einträge als CSV- oder Excel-Datei.
                </p>
                <div style="display: flex; gap: 1rem;">
                    <button id="exportCSV" class="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Als CSV exportieren</span>
                    </button>
                    <button id="exportExcel" class="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Als Excel exportieren</span>
                    </button>
                </div>
            </div>

            <!-- Import Section -->
            <div class="form-section">
                <h4 class="form-section-title">Daten importieren</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Importieren Sie Software-Einträge aus einer CSV- oder Excel-Datei.
                </p>

                <div class="form-group">
                    <label class="form-label">Excel-Vorlage herunterladen</label>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                        Laden Sie eine vorgefertigte Excel-Vorlage mit Dropdown-Listen für Kategorien und Zielgruppen herunter.
                    </p>
                    <button id="downloadExcelTemplate" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Excel-Vorlage herunterladen</span>
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label" for="importFile">Datei auswählen</label>
                    <div class="import-file-row">
                        <input type="file" id="importFile" accept=".csv,.xlsx,.xls" class="import-file-input form-input">
                        <span id="importFileName" class="import-file-name" aria-live="polite"></span>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button id="importCSV" class="btn btn-primary" disabled>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>CSV importieren</span>
                    </button>
                    <button id="importExcel" class="btn btn-primary" disabled>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Excel importieren</span>
                    </button>
                </div>

                <div id="importProgress" style="display: none; margin-top: 1rem;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <p id="importStatus" style="margin-top: 0.5rem;"></p>
                </div>

                <div id="importResults" style="display: none; margin-top: 1rem;">
                    <div class="alert" id="importResultsContent"></div>
                </div>
            </div>

            <!-- Demo Data Section -->
            <div class="form-section">
                <h4 class="form-section-title">Demo-Daten verwalten</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Laden, exportieren oder entfernen Sie Demo-Daten zum Testen.
                </p>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button id="loadDemoData" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Demo-Daten laden</span>
                    </button>
                    <button id="exportDemoCSV" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Demo als CSV exportieren</span>
                    </button>
                    <button id="exportDemoExcel" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Demo als Excel exportieren</span>
                    </button>
                    <button id="removeDemoData" class="btn btn-danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Demo-Daten entfernen</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer Links Tab -->
    <div class="tab-content" id="footerLinksTab">
        <div class="card-body">
            <div class="form-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h4 class="form-section-title" style="margin-bottom: 0.5rem;">Footer Links Verwaltung</h4>
                        <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0;">Verwalten Sie Links, die im Footer angezeigt werden</p>
                    </div>
                    <button id="newLinkBtn" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span data-t="footerLinks.new">Neuer Link</span>
                    </button>
                </div>

                <div id="footerLinksTableBody" style="margin-top: 1.5rem;">
                    <!-- Table content will be rendered by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <!-- Embed/Widget Tab -->
    <div class="tab-content" id="embedTab">
        <div class="card-body">
            <!-- URL Configuration -->
            <div class="form-section">
                <h4 class="form-section-title">URL-Konfiguration</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Passen Sie die URL mit Parametern an, um die Anzeige zu steuern.
                </p>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Kategorie filtern</label>
                        <select id="categoryFilter" class="form-select">
                            <option value="">Alle Kategorien</option>
                            <!-- Will be populated by JavaScript -->
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Suchbegriff vorbelegen</label>
                        <input type="text" id="searchQuery" class="form-input" placeholder="z.B. Office">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="toggle-switch">
                            <input type="checkbox" class="toggle-switch-input" id="hideHeader">
                            <span class="toggle-switch-slider"></span>
                            <span class="toggle-switch-label">Header ausblenden</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="toggle-switch">
                            <input type="checkbox" class="toggle-switch-input" id="hideFooter">
                            <span class="toggle-switch-slider"></span>
                            <span class="toggle-switch-label">Footer ausblenden</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Generierte URL</label>
                    <div style="background: var(--bg-secondary); padding: 0.75rem; border-radius: 8px; font-family: monospace; font-size: 0.875rem; word-break: break-all; border: 1px solid var(--border-color);">
                        <span id="generatedUrl"></span>
                    </div>
                </div>
            </div>

            <!-- iFrame Embed -->
            <div class="form-section">
                <h4 class="form-section-title">iFrame-Einbettung</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Direktes Einbetten per iFrame - funktioniert auf allen Plattformen.
                </p>
                <div class="form-group">
                    <div style="position: relative;">
                        <pre id="iframeCode" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem; border: 1px solid var(--border-color); margin: 0;"></pre>
                        <button class="btn btn-sm btn-secondary" style="position: absolute; top: 0.5rem; right: 0.5rem;" onclick="copyToClipboard('iframeCode')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Kopieren
                        </button>
                    </div>
                </div>
            </div>

            <!-- JavaScript Loader -->
            <div class="form-section">
                <h4 class="form-section-title">JavaScript-Loader</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Dynamisches Laden per JavaScript - ideal für responsive Websites.
                </p>
                <div class="form-group">
                    <div style="position: relative;">
                        <pre id="jsCode" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem; border: 1px solid var(--border-color); margin: 0;"></pre>
                        <button class="btn btn-sm btn-secondary" style="position: absolute; top: 0.5rem; right: 0.5rem;" onclick="copyToClipboard('jsCode')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Kopieren
                        </button>
                    </div>
                </div>
            </div>

            <!-- WordPress -->
            <div class="form-section">
                <h4 class="form-section-title">WordPress-Integration</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Verwenden Sie ein iFrame-Plugin wie "Advanced iFrame" oder "iframe".
                </p>
                <div class="form-group">
                    <div style="position: relative;">
                        <pre id="wpCode" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem; border: 1px solid var(--border-color); margin: 0;"></pre>
                        <button class="btn btn-sm btn-secondary" style="position: absolute; top: 0.5rem; right: 0.5rem;" onclick="copyToClipboard('wpCode')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Kopieren
                        </button>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid var(--primary);">
                    <strong>Schritte:</strong>
                    <ol style="margin: 0.5rem 0 0 1.5rem;">
                        <li>Plugin "Advanced iFrame" oder "iframe" installieren</li>
                        <li>Neuen Beitrag/Seite erstellen</li>
                        <li>Shortcode einfügen</li>
                        <li>Veröffentlichen</li>
                    </ol>
                </div>
            </div>

            <!-- REST API -->
            <div class="form-section">
                <h4 class="form-section-title">REST API-Zugriff</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Direkter API-Zugriff für eigene Implementierungen.
                </p>
                <div class="form-group">
                    <div style="position: relative;">
                        <pre id="apiCode" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.875rem; border: 1px solid var(--border-color); margin: 0;"></pre>
                        <button class="btn btn-sm btn-secondary" style="position: absolute; top: 0.5rem; right: 0.5rem;" onclick="copyToClipboard('apiCode')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Kopieren
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Branding Tab -->
    <div class="tab-content" id="brandingTab">
        <div class="card-body">
            <div class="form-section">
                <h4 class="form-section-title">Schriftarten</h4>
                <p class="text-sm text-gray-500 mb-2">Web-sichere Schriften oder eigene Schriftart (URL/Upload).</p>
                <div class="form-group">
                    <label class="form-label" for="fontFamily">Schriftart (web-sicher)</label>
                    <select id="fontFamily" class="form-select">
                        <option value="">Standard (Inter / System)</option>
                        <option value="Arial, Helvetica, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                        <option value="Verdana, Geneva, sans-serif">Verdana</option>
                        <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                        <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
                        <option value="'Courier New', Courier, monospace">Courier New</option>
                        <option value="Impact, Charcoal, sans-serif">Impact</option>
                        <option value="'Segoe UI', Tahoma, sans-serif">Segoe UI</option>
                        <option value="system-ui, -apple-system, sans-serif">System UI</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="customFontUrl">Eigene Schriftart (URL zu .woff2 / .woff)</label>
                    <input type="url" id="customFontUrl" class="form-input" placeholder="https://... oder /uploads/fonts/meine-schrift.woff2">
                    <p class="text-xs text-gray-500 mt-1">Optional. Wenn gesetzt, wird diese Schrift vor der web-sicheren Schrift verwendet.</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Eigene Schriftart hochladen</label>
                    <input type="file" id="customFontUpload" accept=".woff2,.woff,.ttf" class="form-input">
                    <p class="text-xs text-gray-500 mt-1">.woff2 oder .woff empfohlen. Nach Upload erscheint die URL oben.</p>
                </div>
            </div>
            <div class="form-section">
                <h4 class="form-section-title">Logo & Branding</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    Passen Sie das Erscheinungsbild Ihrer Software Hub-Instanz an.
                </p>

                <!-- Logo Upload -->
                <div class="form-group">
                    <label class="form-label">Logo (SVG empfohlen)</label>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                        Wird im Header angezeigt. Empfohlene Größe: 32×32 bis 48×48 Pixel
                    </p>
                    <div class="file-upload-area" id="logoUploadArea">
                        <input type="file" id="logoUpload" accept="image/svg+xml,image/png,image/jpeg" style="display: none;">
                        <div id="logoPreview" style="margin-bottom: 1rem; display: none;">
                            <img id="logoPreviewImg" style="max-width: 100px; max-height: 100px; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem; background: white;">
                            <button type="button" class="btn btn-sm btn-danger" onclick="removeLogo()" style="margin-left: 1rem;">
                                Entfernen
                            </button>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('logoUpload').click()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Logo hochladen
                        </button>
                    </div>
                </div>

                <!-- Favicon Upload -->
                <div class="form-group">
                    <label class="form-label">Favicon</label>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                        Kleines Icon im Browser-Tab. SVG oder PNG mit mindestens 32×32 Pixel
                    </p>
                    <div class="file-upload-area" id="faviconUploadArea">
                        <input type="file" id="faviconUpload" accept="image/svg+xml,image/png,image/x-icon" style="display: none;">
                        <div id="faviconPreview" style="margin-bottom: 1rem; display: none;">
                            <img id="faviconPreviewImg" style="width: 32px; height: 32px; border: 1px solid var(--border-color); border-radius: 4px; padding: 0.25rem; background: white;">
                            <button type="button" class="btn btn-sm btn-danger" onclick="removeFavicon()" style="margin-left: 1rem;">
                                Entfernen
                            </button>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('faviconUpload').click()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Favicon hochladen
                        </button>
                    </div>
                </div>

                <!-- Application Name -->
                <div class="form-group">
                    <label class="form-label" for="appName">Anwendungsname</label>
                    <input type="text" id="appName" class="form-input" placeholder="Software Hub">
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                        Wird im Seitentitel und Header angezeigt
                    </p>
                </div>

                <!-- Background Color -->
                <div class="form-group">
                    <label class="form-label" for="bgColor">Hintergrundfarbe (Frontend)</label>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <input type="color" id="bgColorPicker" value="#f9fafb" style="width: 48px; height: 36px; padding: 2px; border: 1px solid var(--color-gray-300); border-radius: 0.5rem; cursor: pointer;">
                        <input type="text" id="bgColor" class="form-input" placeholder="#f9fafb" style="max-width: 200px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('bgColor').value='#f9fafb'; document.getElementById('bgColorPicker').value='#f9fafb';">Standard</button>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">
                        Hintergrundfarbe der öffentlichen Software Hub-Seite (Standard: #f9fafb)
                    </p>
                </div>
            </div>

            <div class="mt-4">
                <button id="saveBrandingSettings" class="btn btn-primary">Speichern</button>
            </div>
        </div>
    </div>
</div>

<!-- Footer Link Modal -->
<div class="modal-overlay" id="linkModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title" id="linkModalTitle">Footer Link</h3>
            <button class="modal-close" onclick="closeModal('linkModal')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <form id="linkForm" onsubmit="saveLink(event)">
            <input type="hidden" id="linkId">
            <div class="modal-body">
                <div class="form-section">
                    <h4 class="form-section-title">Deutsch</h4>
                    <div class="form-group">
                        <label class="form-label" for="linkText" data-t="common.text">Text</label>
                        <input type="text" id="linkText" class="form-input" required>
                    </div>
                </div>
                <div class="form-section">
                    <h4 class="form-section-title">English</h4>
                    <div class="form-group">
                        <label class="form-label" for="linkTextEn">Text (EN)</label>
                        <input type="text" id="linkTextEn" class="form-input">
                    </div>
                </div>
                <div class="form-section">
                    <h4 class="form-section-title">Allgemein</h4>
                    <div class="form-group">
                        <label class="form-label" for="linkUrl" data-t="common.url">URL</label>
                        <input type="text" id="linkUrl" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="linkOrder" data-t="common.order">Reihenfolge</label>
                        <input type="number" id="linkOrder" class="form-input" value="0">
                    </div>
                    <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" id="linkIsActive" checked>
                            <span data-t="common.active">Aktiv</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('linkModal')" data-t="common.cancel">Abbrechen</button>
                <button type="submit" class="btn btn-primary" data-t="common.save">Speichern</button>
            </div>
        </form>
    </div>
</div>

<script>
// Sync color inputs with text inputs
document.getElementById('badgeBgColor').addEventListener('input', function() {
    document.getElementById('badgeBgColorText').value = this.value;
});
document.getElementById('badgeBgColorText').addEventListener('input', function() {
    document.getElementById('badgeBgColor').value = this.value;
});
document.getElementById('badgeTextColor').addEventListener('input', function() {
    document.getElementById('badgeTextColorText').value = this.value;
});
document.getElementById('badgeTextColorText').addEventListener('input', function() {
    document.getElementById('badgeTextColor').value = this.value;
});

// Branding Tab Functions
document.getElementById('logoUpload')?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');

    try {
        const response = await fetch('/api/branding.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'HTTP ' + response.status);
        }

        const result = await response.json();

        if (result.success) {
            document.getElementById('logoPreview').style.display = 'block';
            document.getElementById('logoPreviewImg').src = result.path + '?v=' + Date.now();
            showToast('Logo erfolgreich hochgeladen', 'success');
        } else {
            throw new Error(result.error || 'Upload fehlgeschlagen');
        }
    } catch (error) {
        console.error('Logo upload error:', error);
        showToast('Fehler beim Hochladen: ' + error.message, 'error');
    }
});

document.getElementById('faviconUpload')?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'favicon');

    try {
        const response = await fetch('/api/branding.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'HTTP ' + response.status);
        }

        const result = await response.json();

        if (result.success) {
            document.getElementById('faviconPreview').style.display = 'block';
            document.getElementById('faviconPreviewImg').src = result.path + '?v=' + Date.now();
            showToast('Favicon erfolgreich hochgeladen', 'success');
        } else {
            throw new Error(result.error || 'Upload fehlgeschlagen');
        }
    } catch (error) {
        console.error('Favicon upload error:', error);
        showToast('Fehler beim Hochladen: ' + error.message, 'error');
    }
});

function removeLogo() {
    if (confirm('Logo wirklich entfernen?')) {
        fetch('/api/branding.php?type=logo', {
            method: 'DELETE',
            credentials: 'same-origin'
        })
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    document.getElementById('logoPreview').style.display = 'none';
                    document.getElementById('logoUpload').value = '';
                    showToast('Logo entfernt', 'success');
                } else {
                    showToast(result.error || 'Fehler beim Entfernen', 'error');
                }
            })
            .catch(error => {
                console.error('Error removing logo:', error);
                showToast('Fehler beim Entfernen', 'error');
            });
    }
}

function removeFavicon() {
    if (confirm('Favicon wirklich entfernen?')) {
        fetch('/api/branding.php?type=favicon', {
            method: 'DELETE',
            credentials: 'same-origin'
        })
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    document.getElementById('faviconPreview').style.display = 'none';
                    document.getElementById('faviconUpload').value = '';
                    showToast('Favicon entfernt', 'success');
                } else {
                    showToast(result.error || 'Fehler beim Entfernen', 'error');
                }
            })
            .catch(error => {
                console.error('Error removing favicon:', error);
                showToast('Fehler beim Entfernen', 'error');
            });
    }
}
</script>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
