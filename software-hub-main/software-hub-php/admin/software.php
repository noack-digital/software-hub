<?php
/**
 * Software Management
 * Software Hub - PHP Version
 */

$pageTitle = 'Software';
$currentPage = 'software';

require_once __DIR__ . '/../includes/admin-header.php';
?>

<!-- Software List View -->
<div id="softwareListView">
    <div class="data-table-wrapper">
        <div class="data-table-header">
            <div class="data-table-search relative">
                <svg class="data-table-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="softwareSearch" class="form-input" style="padding-left: 2.5rem;" data-t-placeholder="common.search" placeholder="Suchen...">
            </div>
            <div class="data-table-actions">
                <button id="batchOptimizeBtn" class="btn btn-secondary" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg>
                    <span id="batchOptimizeCount">Optimieren (0)</span>
                </button>
                <button id="batchTranslateBtn" class="btn btn-secondary" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                    <span id="batchTranslateCount">Übersetzen (0)</span>
                </button>
                <button id="batchDeleteBtn" class="btn btn-danger" style="display: none;" onclick="confirmBatchDelete()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span id="batchDeleteCount">Löschen (0)</span>
                </button>
                <button id="newSoftwareBtn" class="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span data-t="software.new">Neue Software</span>
                </button>
            </div>
        </div>
        <div class="data-table-filters">
            <div class="form-group" style="margin: 0;">
                <label class="form-label" for="filterCategory" data-t="software.categories">Kategorie</label>
                <select id="filterCategory" class="form-select"><option value="" data-t="common.all">Alle</option></select>
            </div>
            <div class="form-group" style="margin: 0;">
                <label class="form-label" for="filterPrivacy" data-t="software.privacyStatus">Datenschutz</label>
                <select id="filterPrivacy" class="form-select">
                    <option value="">Alle</option>
                    <option value="COMPLIANT">Konform</option><option value="PARTIAL">Teilweise</option>
                    <option value="IN_PROGRESS">In Umsetzung</option><option value="NON_COMPLIANT">Nicht konform</option>
                    <option value="UNKNOWN">Unbekannt</option>
                </select>
            </div>
            <div class="form-group" style="margin: 0;">
                <label class="form-label" for="filterTranslation" data-t="common.translation">Übersetzung</label>
                <select id="filterTranslation" class="form-select"><option value="" data-t="common.all">Alle</option><option value="complete">Vollständig</option><option value="missing">Unvollständig</option></select>
            </div>
            <div class="form-group" style="margin: 0;">
                <button id="clearFiltersBtn" class="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    Filter zurücksetzen
                </button>
            </div>
        </div>
        <div id="softwareTableBody"></div>
    </div>
</div>

<!-- Software Edit Page -->
<div id="softwareEditPage" class="hidden">
    <div class="software-edit-topbar">
        <a href="#" onclick="closeSoftwareEditPage(); return false;" class="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span data-t="common.back">Zurück zur Liste</span>
        </a>
        <h2 id="softwareEditTitle" class="software-edit-title">Software bearbeiten</h2>
        <button type="button" class="btn btn-ghost" onclick="closeSoftwareEditPage()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>

    <form id="softwareForm" onsubmit="saveSoftware(event)">
        <input type="hidden" id="softwareId">

        <!-- 1. Grundinformationen -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 data-t="software.basicInfo">Grundinformationen</h4>
                <button type="button" id="aiGenerateBtn" class="btn btn-secondary btn-sm" onclick="generateWithAI()" title="Mit KI ausfüllen" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>
                    <span>KI</span>
                </button>
            </div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="softwareName" data-t="software.name">Name</label><input type="text" id="softwareName" class="form-input" required></div>
                    <div class="form-group"><label class="form-label" for="softwareNameEn">Name (EN)</label><input type="text" id="softwareNameEn" class="form-input"></div>
                </div>
                <div class="form-group"><label class="form-label" for="softwareUrl" data-t="software.url">URL</label><input type="url" id="softwareUrl" class="form-input" placeholder="https://..."></div>
                <div class="form-group">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <label class="form-label" data-t="software.logo" style="margin:0;">Logo</label>
                        <button type="button" id="fetchFaviconBtn" class="btn btn-secondary btn-sm" onclick="fetchFavicon()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Favicon holen
                        </button>
                    </div>
                    <div id="logoPreview"></div>
                    <input type="file" id="softwareLogo" class="form-input" accept="image/*">
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="softwareShortDescription" data-t="software.shortDescription">Kurzbeschreibung</label><input type="text" id="softwareShortDescription" class="form-input"></div>
                    <div class="form-group"><label class="form-label" for="softwareShortDescriptionEn">Kurzbeschreibung (EN)</label><input type="text" id="softwareShortDescriptionEn" class="form-input"></div>
                </div>
            </div>
        </div>

        <!-- 2. Beschreibungen -->
        <div class="card mb-4">
            <div class="card-header">
                <h4 data-t="software.descriptions">Beschreibungen</h4>
                <div style="display:flex;gap:0.5rem;">
                    <button type="button" id="aiDescBtn" class="btn btn-secondary btn-sm" onclick="generateDescriptionsWithAI()" title="Beschreibungen mit KI generieren" style="display: none;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>
                        KI
                    </button>
                    <button type="button" id="optimizeDescBtn" class="btn btn-secondary btn-sm" onclick="optimizeSoftwareInModal()" title="Beschreibungen mit KI optimieren" style="display: none;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                        Optimieren
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="editor-pair">
                    <div class="editor-col">
                        <label class="form-label" data-t="software.description">Beschreibung</label>
                        <div id="editorDescription" class="quill-editor"></div>
                        <textarea id="softwareDescription" style="display:none;"></textarea>
                    </div>
                    <div class="editor-mid">
                        <button type="button" class="btn-translate-field" onclick="translateField('description')" title="Mit KI übersetzen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                        </button>
                    </div>
                    <div class="editor-col">
                        <label class="form-label">Beschreibung (EN)</label>
                        <div id="editorDescriptionEn" class="quill-editor"></div>
                        <textarea id="softwareDescriptionEn" style="display:none;"></textarea>
                    </div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col">
                        <label class="form-label" data-t="software.features">Funktionen</label>
                        <div id="editorFeatures" class="quill-editor"></div>
                        <textarea id="softwareFeatures" style="display:none;"></textarea>
                    </div>
                    <div class="editor-mid">
                        <button type="button" class="btn-translate-field" onclick="translateField('features')" title="Mit KI übersetzen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                        </button>
                    </div>
                    <div class="editor-col">
                        <label class="form-label">Funktionen (EN)</label>
                        <div id="editorFeaturesEn" class="quill-editor"></div>
                        <textarea id="softwareFeaturesEn" style="display:none;"></textarea>
                    </div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col">
                        <label class="form-label">Warum wird diese Software an der HNEE eingesetzt?</label>
                        <div id="editorReasonHnee" class="quill-editor"></div>
                        <textarea id="softwareReasonHnee" style="display:none;"></textarea>
                    </div>
                    <div class="editor-mid">
                        <button type="button" class="btn-translate-field" onclick="translateField('reason_hnee')" title="Mit KI übersetzen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                        </button>
                    </div>
                    <div class="editor-col">
                        <label class="form-label">Why is this software used at HNEE? (EN)</label>
                        <div id="editorReasonHneeEn" class="quill-editor"></div>
                        <textarea id="softwareReasonHneeEn" style="display:none;"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2b. Kosten & Lizenzen -->
        <div class="card mb-4">
            <div class="card-header"><h4>Kosten &amp; Lizenzen</h4></div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Kosten</label>
                        <select id="softwareCosts" class="form-select">
                            <option value="kostenlos">Kostenlos</option>
                            <option value="kostenpflichtig">Kostenpflichtig</option>
                            <option value="abo">Abo / Lizenz</option>
                            <option value="einmalig">Einmalige Kosten</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kostenmodell</label>
                        <input type="text" id="softwareCostModel" class="form-input" placeholder="z.B. Campuslizenz, pro Nutzer, ...">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Preis</label>
                    <input type="text" id="softwareCostPrice" class="form-input" placeholder="z.B. 49€/Jahr, kostenlos für Studierende, ...">
                </div>
            </div>
        </div>

        <!-- 2c. Weitere Informationen -->
        <div class="card mb-4">
            <div class="card-header"><h4>Weitere Informationen</h4></div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Alternativen</label>
                        <input type="text" id="softwareAlternatives" class="form-input" placeholder="Kommasepariert">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Alternatives (EN)</label>
                        <input type="text" id="softwareAlternativesEn" class="form-input" placeholder="Comma-separated">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Tutorials / Anleitungen (URLs)</label>
                    <textarea id="softwareTutorials" class="form-textarea" rows="2" placeholder="URLs zu Anleitungen, eine pro Zeile"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Zugangsinformationen</label>
                    <textarea id="softwareAccessInfo" class="form-textarea" rows="2" placeholder="Wie erhält man Zugang zu dieser Software?"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Anmerkungen</label>
                        <textarea id="softwareNotes" class="form-textarea" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes (EN)</label>
                        <textarea id="softwareNotesEn" class="form-textarea" rows="2"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. Steckbrief -->
        <div class="card mb-4">
            <div class="card-header"><h4>Steckbrief / Anleitungen (PDF)</h4></div>
            <div class="card-body">
                <div id="steckbriefPreview" style="display:none;margin-bottom:0.75rem;">
                    <a id="steckbriefLink" href="#" target="_blank" class="btn btn-secondary btn-sm" style="margin-right:0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span id="steckbriefFilename">Steckbrief.pdf</span>
                    </a>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeSteckbrief()">Entfernen</button>
                </div>
                <input type="file" id="softwareSteckbrief" class="form-input" accept="application/pdf">
                <input type="hidden" id="softwareSteckbriefPath" value="">
            </div>
        </div>

        <!-- 4. Klassifizierung -->
        <div class="card mb-4">
            <div class="card-header"><h4 data-t="software.classification">Klassifizierung</h4></div>
            <div class="card-body classification-body">
                <div class="form-group">
                    <label class="form-label" data-t="software.type">Typ</label>
                    <div class="flex gap-4">
                        <label class="form-checkbox"><input type="checkbox" id="typeWeb"><span>Web</span></label>
                        <label class="form-checkbox"><input type="checkbox" id="typeDesktop"><span>Desktop</span></label>
                        <label class="form-checkbox"><input type="checkbox" id="typeMobile"><span>Mobile</span></label>
                    </div>
                </div>
                <div class="form-group"><label class="form-label" data-t="software.categories">Kategorien</label><div id="categoryCheckboxes" class="checkbox-grid"></div></div>
                <div class="form-group"><label class="form-label" data-t="software.targetGroups">Zielgruppen</label><div id="targetGroupCheckboxes" class="checkbox-grid"></div></div>
                <div class="form-group"><label class="form-label">Abteilungen</label><div id="departmentCheckboxes" class="checkbox-grid"></div></div>
            </div>
        </div>

        <!-- 5. Datenschutz & Hosting -->
        <div class="card mb-4">
            <div class="card-header"><h4>Datenschutz & Hosting</h4></div>
            <div class="card-body">
                <div class="editor-pair">
                    <div class="editor-col">
                        <label class="form-label">Datenschutz</label>
                        <div class="privacy-options">
                            <label class="privacy-option"><input type="radio" name="privacyStatus" id="privacyCompliant" value="COMPLIANT"><span class="privacy-dot" style="background:#22c55e;"></span><span>Konform / DSGVO-konform</span></label>
                            <label class="privacy-option"><input type="radio" name="privacyStatus" id="privacyPartial" value="PARTIAL"><span class="privacy-dot" style="background:#eab308;"></span><span>Teilweise konform</span></label>
                            <label class="privacy-option"><input type="radio" name="privacyStatus" id="privacyInProgress" value="IN_PROGRESS"><span class="privacy-dot" style="background:#f97316;"></span><span>In Umsetzung</span></label>
                            <label class="privacy-option"><input type="radio" name="privacyStatus" id="privacyNonCompliant" value="NON_COMPLIANT"><span class="privacy-dot" style="background:#ef4444;"></span><span>Nicht konform / Kritische Lücke</span></label>
                            <label class="privacy-option"><input type="radio" name="privacyStatus" id="privacyUnknown" value="UNKNOWN" checked><span class="privacy-dot" style="background:#9ca3af;"></span><span>Unbekannt / Noch nicht bewertet</span></label>
                        </div>
                    </div>
                    <div class="editor-col">
                        <label class="form-label">Bemerkungen</label>
                        <div id="editorPrivacyNote" class="quill-editor"></div>
                        <textarea id="privacyNote" style="display:none;"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Hosting</label>
                    <div class="flex gap-4" style="flex-wrap:wrap;">
                        <label class="form-checkbox"><input type="radio" name="hostingLocation" id="hostingHNEE" value="HNEE"><span>HNEE</span></label>
                        <label class="form-checkbox"><input type="radio" name="hostingLocation" id="hostingDE" value="DE"><span>Deutschland</span></label>
                        <label class="form-checkbox"><input type="radio" name="hostingLocation" id="hostingEU" value="EU"><span>EU</span></label>
                        <label class="form-checkbox"><input type="radio" name="hostingLocation" id="hostingNonEU" value="NON_EU"><span>Nicht-EU</span></label>
                    </div>
                </div>
            </div>
        </div>

        <!-- 6. Ansprechpersonen -->
        <div class="card mb-4">
            <div class="card-header"><h4>Ansprechpersonen</h4></div>
            <div class="card-body">
                <p class="text-sm text-gray-500 mb-2">Administration, Fragen und Schulungen.</p>
                <div class="form-group" style="margin-bottom:1rem;">
                    <label class="form-checkbox"><input type="checkbox" id="showAccountRequest" checked><span>Formular "Nutzerkonto beantragen" anzeigen</span></label>
                </div>
                <div id="softwareContactsList" class="space-y-3"></div>
                <button type="button" id="addContactBtn" class="btn btn-secondary btn-sm mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ansprechperson hinzufügen
                </button>
            </div>
        </div>

        <!-- Save Bar -->
        <div class="software-edit-savebar">
            <button type="button" class="btn btn-secondary" onclick="closeSoftwareEditPage()">Abbrechen</button>
            <button type="button" class="btn btn-secondary" onclick="previewSoftware()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Vorschau
            </button>
            <button type="button" class="btn btn-primary" onclick="saveSoftwareStay(event)">Speichern</button>
            <button type="submit" class="btn btn-primary">Speichern &amp; Schließen</button>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
