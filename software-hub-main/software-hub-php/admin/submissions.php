<?php
/**
 * Submitted Software Management
 */

$pageTitle = 'Eingereichte Software';
$currentPage = 'submissions';

require_once __DIR__ . '/../includes/admin-header.php';
?>

<div id="submissionsListView">
    <div class="data-table-wrapper">
        <div class="data-table-header">
            <div class="data-table-search relative">
                <svg class="data-table-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="submissionsSearch" class="form-input" style="padding-left: 2.5rem;" data-t-placeholder="common.search" placeholder="Suchen...">
            </div>
            <div class="data-table-filters" style="margin:0;">
                <select id="submissionsStatusFilter" class="form-select">
                    <option value="" data-t="common.all">Alle</option>
                    <option value="pending" data-t="submission.status.pending">Offen</option>
                    <option value="approved" data-t="submission.status.approved">Freigegeben</option>
                    <option value="rejected" data-t="submission.status.rejected">Abgelehnt</option>
                </select>
            </div>
        </div>
        <div id="submissionsTableBody"></div>
    </div>
</div>

<div id="submissionEditPage" class="hidden">
    <div class="software-edit-topbar">
        <a href="#" onclick="closeSubmissionEditPage(); return false;" class="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            <span data-t="common.back">Zurück zur Liste</span>
        </a>
        <h2 id="submissionEditTitle" class="software-edit-title">Einreichung bearbeiten</h2>
        <button type="button" class="btn btn-ghost" onclick="closeSubmissionEditPage()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>

    <form id="submissionAdminForm" onsubmit="saveSubmission(event)">
        <input type="hidden" id="submissionId">

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="submission.submitter">Anfragender</h4></div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group"><label class="form-label" data-t="submission.submitterName">Name</label><input type="text" id="submSubmitterName" class="form-input" required></div>
                    <div class="form-group"><label class="form-label" data-t="submission.submitterEmail">E-Mail</label><input type="email" id="submSubmitterEmail" class="form-input" required></div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="software.basicInfo">Grundinformationen</h4></div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="submSoftwareName" data-t="software.name">Name</label><input type="text" id="submSoftwareName" class="form-input" required></div>
                    <div class="form-group"><label class="form-label" for="submSoftwareNameEn">Name (EN)</label><input type="text" id="submSoftwareNameEn" class="form-input"></div>
                </div>
                <div class="form-group"><label class="form-label" for="submSoftwareUrl" data-t="software.url">URL</label><input type="url" id="submSoftwareUrl" class="form-input" placeholder="https://..."></div>
                <div class="form-group">
                    <label class="form-label" data-t="software.logo">Logo</label>
                    <div id="submLogoPreview"></div>
                    <input type="file" id="submSoftwareLogo" class="form-input" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.svg">
                    <input type="hidden" id="submSoftwareLogoPath" value="">
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label" for="submSoftwareShortDescription" data-t="software.shortDescription">Kurzbeschreibung</label><input type="text" id="submSoftwareShortDescription" class="form-input"></div>
                    <div class="form-group"><label class="form-label" for="submSoftwareShortDescriptionEn">Kurzbeschreibung (EN)</label><input type="text" id="submSoftwareShortDescriptionEn" class="form-input"></div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="software.descriptions">Beschreibungen</h4></div>
            <div class="card-body">
                <div class="editor-pair">
                    <div class="editor-col"><label class="form-label" data-t="software.description">Beschreibung</label><div id="submEditorDescription" class="quill-editor"></div><textarea id="submSoftwareDescription" style="display:none;"></textarea></div>
                    <div class="editor-col"><label class="form-label">Beschreibung (EN)</label><div id="submEditorDescriptionEn" class="quill-editor"></div><textarea id="submSoftwareDescriptionEn" style="display:none;"></textarea></div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col"><label class="form-label" data-t="software.features">Funktionen</label><div id="submEditorFeatures" class="quill-editor"></div><textarea id="submSoftwareFeatures" style="display:none;"></textarea></div>
                    <div class="editor-col"><label class="form-label">Funktionen (EN)</label><div id="submEditorFeaturesEn" class="quill-editor"></div><textarea id="submSoftwareFeaturesEn" style="display:none;"></textarea></div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col"><label class="form-label" data-t="submission.reasonHnee">Warum HNEE?</label><div id="submEditorReasonHnee" class="quill-editor"></div><textarea id="submSoftwareReasonHnee" style="display:none;"></textarea></div>
                    <div class="editor-col"><label class="form-label">Why HNEE? (EN)</label><div id="submEditorReasonHneeEn" class="quill-editor"></div><textarea id="submSoftwareReasonHneeEn" style="display:none;"></textarea></div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="submission.costs">Kosten &amp; Lizenzen</h4></div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" data-t="submission.costType">Kosten</label>
                        <select id="submSoftwareCosts" class="form-select">
                            <option value="kostenlos">Kostenlos</option>
                            <option value="kostenpflichtig">Kostenpflichtig</option>
                            <option value="abo">Abo / Lizenz</option>
                            <option value="einmalig">Einmalige Kosten</option>
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label" data-t="submission.costModel">Kostenmodell</label><input type="text" id="submSoftwareCostModel" class="form-input"></div>
                </div>
                <div class="form-group"><label class="form-label" data-t="submission.costPrice">Preis</label><input type="text" id="submSoftwareCostPrice" class="form-input"></div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="submission.moreInfo">Weitere Informationen</h4></div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group"><label class="form-label" data-t="submission.alternatives">Alternativen</label><input type="text" id="submSoftwareAlternatives" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Alternatives (EN)</label><input type="text" id="submSoftwareAlternativesEn" class="form-input"></div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col"><label class="form-label" data-t="submission.tutorials">Tutorials</label><div id="submEditorTutorials" class="quill-editor"></div><textarea id="submSoftwareTutorials" style="display:none;"></textarea></div>
                    <div class="editor-col"><label class="form-label">Tutorials (EN)</label><div id="submEditorTutorialsEn" class="quill-editor"></div><textarea id="submSoftwareTutorialsEn" style="display:none;"></textarea></div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col"><label class="form-label" data-t="submission.accessInfo">Zugangsinformationen</label><div id="submEditorAccessInfo" class="quill-editor"></div><textarea id="submSoftwareAccessInfo" style="display:none;"></textarea></div>
                    <div class="editor-col"><label class="form-label">Access Info (EN)</label><div id="submEditorAccessInfoEn" class="quill-editor"></div><textarea id="submSoftwareAccessInfoEn" style="display:none;"></textarea></div>
                </div>
                <div class="editor-pair">
                    <div class="editor-col"><label class="form-label" data-t="submission.notes">Anmerkungen</label><div id="submEditorNotes" class="quill-editor"></div><textarea id="submSoftwareNotes" style="display:none;"></textarea></div>
                    <div class="editor-col"><label class="form-label">Notes (EN)</label><div id="submEditorNotesEn" class="quill-editor"></div><textarea id="submSoftwareNotesEn" style="display:none;"></textarea></div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="submission.steckbrief">Steckbrief (PDF)</h4></div>
            <div class="card-body">
                <div id="submSteckbriefPreview" style="display:none;margin-bottom:0.75rem;">
                    <a id="submSteckbriefLink" href="#" target="_blank" class="btn btn-secondary btn-sm"><span id="submSteckbriefFilename">Steckbrief.pdf</span></a>
                </div>
                <input type="file" id="submSoftwareSteckbrief" class="form-input" accept="application/pdf">
                <input type="hidden" id="submSoftwareSteckbriefPath" value="">
                <input type="hidden" id="submSoftwareSteckbriefOriginalName" value="">
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="software.classification">Klassifizierung</h4></div>
            <div class="card-body classification-body">
                <div class="form-group">
                    <label class="form-label" data-t="software.type">Typ</label>
                    <div class="flex gap-4">
                        <label class="form-checkbox"><input type="checkbox" id="submTypeWeb"><span>Web</span></label>
                        <label class="form-checkbox"><input type="checkbox" id="submTypeDesktop"><span>Desktop</span></label>
                        <label class="form-checkbox"><input type="checkbox" id="submTypeMobile"><span>Mobile</span></label>
                    </div>
                </div>
                <div class="form-group"><label class="form-label" data-t="software.categories">Kategorien</label><div id="submCategoryCheckboxes" class="checkbox-grid"></div></div>
                <div class="form-group"><label class="form-label" data-t="software.targetGroups">Zielgruppen</label><div id="submTargetGroupCheckboxes" class="checkbox-grid"></div></div>
                <div class="form-group"><label class="form-label" data-t="departments.title">Abteilungen</label><div id="submDepartmentCheckboxes" class="checkbox-grid"></div></div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="software.privacyHosting">Datenschutz &amp; Hosting</h4></div>
            <div class="card-body">
                <div class="form-group">
                    <label class="form-label" data-t="software.privacyStatus">Datenschutz</label>
                    <div class="privacy-options">
                        <label class="privacy-option"><input type="radio" name="submPrivacyStatus" value="COMPLIANT"><span class="privacy-dot" style="background:#22c55e;"></span><span>Konform</span></label>
                        <label class="privacy-option"><input type="radio" name="submPrivacyStatus" value="PARTIAL"><span class="privacy-dot" style="background:#eab308;"></span><span>Teilweise</span></label>
                        <label class="privacy-option"><input type="radio" name="submPrivacyStatus" value="IN_PROGRESS"><span class="privacy-dot" style="background:#f97316;"></span><span>In Umsetzung</span></label>
                        <label class="privacy-option"><input type="radio" name="submPrivacyStatus" value="NON_COMPLIANT"><span class="privacy-dot" style="background:#ef4444;"></span><span>Nicht konform</span></label>
                        <label class="privacy-option"><input type="radio" name="submPrivacyStatus" value="UNKNOWN" checked><span class="privacy-dot" style="background:#9ca3af;"></span><span>Unbekannt</span></label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-t="submission.hosting">Hosting</label>
                    <div class="flex gap-4" style="flex-wrap:wrap;">
                        <label class="form-checkbox"><input type="radio" name="submHostingLocation" value="HNEE"><span>HNEE</span></label>
                        <label class="form-checkbox"><input type="radio" name="submHostingLocation" value="DE"><span>Deutschland</span></label>
                        <label class="form-checkbox"><input type="radio" name="submHostingLocation" value="EU"><span>EU</span></label>
                        <label class="form-checkbox"><input type="radio" name="submHostingLocation" value="NON_EU"><span>Nicht-EU</span></label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" data-t="submission.privacyNote">Bemerkungen</label>
                    <div id="submEditorPrivacyNote" class="quill-editor"></div>
                    <textarea id="submPrivacyNote" style="display:none;"></textarea>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h4 data-t="submission.contacts">Ansprechpersonen</h4></div>
            <div class="card-body">
                <div id="submContactsList" class="space-y-3"></div>
                <button type="button" id="submAddContactBtn" class="btn btn-secondary btn-sm mt-2">
                    <span data-t="submission.addContact">Ansprechperson hinzufügen</span>
                </button>
            </div>
        </div>

        <div class="software-edit-savebar">
            <button type="button" class="btn btn-secondary" onclick="closeSubmissionEditPage()" data-t="common.cancel">Abbrechen</button>
            <button type="button" class="btn btn-secondary" onclick="previewSubmission()" data-t="common.details">Vorschau</button>
            <button type="button" class="btn btn-danger" id="submRejectBtn" onclick="rejectSubmission()" data-t="submission.reject">Ablehnen</button>
            <button type="button" class="btn btn-primary" id="submApproveBtn" onclick="approveSubmission()" data-t="submission.approve">Freigeben</button>
            <button type="submit" class="btn btn-primary" data-t="common.save">Speichern</button>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
