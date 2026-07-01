<?php
/**
 * Public software suggestion modal
 */
?>
<div class="modal-overlay" id="submissionModal">
    <div class="modal modal-xl">
        <div class="modal-header">
            <h3 class="modal-title" data-t="submission.title">Software vorschlagen</h3>
            <button type="button" class="modal-close" onclick="closeSubmissionModal()" data-t-title="submission.close" aria-label="Schließen">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <form id="submissionForm" onsubmit="submitSoftwareSuggestion(event)" novalidate>
            <div class="modal-body submission-modal-body">
                <input type="text" name="_website" id="submissionHoneypot" class="submission-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="submission.submitter">Ihre Kontaktdaten</h4></div>
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="submitterName" id="labelSubmitterName" data-t="submission.submitterName">Ihr Name</label>
                                <input type="text" id="submitterName" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="submitterEmail" id="labelSubmitterEmail" data-t="submission.submitterEmail">Ihre E-Mail</label>
                                <input type="email" id="submitterEmail" class="form-input" required>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="software.basicInfo">Grundinformationen</h4></div>
                    <div class="card-body">
                        <p class="text-sm text-gray-500 mb-3" id="submissionSoftwareBasicHint" data-t="submission.softwareBasicInfoHint">Bitte geben Sie hier den Namen der Software ein, die Sie für den Software Hub vorschlagen möchten. Alle weiteren Angaben sind optional.</p>
                        <div class="form-row">
                            <div class="form-group"><label class="form-label" for="submissionName" id="labelSubmissionName">Name der Software</label><input type="text" id="submissionName" class="form-input" data-t-placeholder="submission.softwareNamePlaceholder" placeholder="z. B. Adobe Acrobat Pro" required></div>
                            <div class="form-group"><label class="form-label" for="submissionNameEn" id="labelSubmissionNameEn">Name der Software (EN)</label><input type="text" id="submissionNameEn" class="form-input" data-t-placeholder="submission.softwareNamePlaceholder" placeholder="z. B. Adobe Acrobat Pro"></div>
                        </div>
                        <div class="form-group"><label class="form-label" for="submissionUrl" id="labelSubmissionUrl">URL / Webseite der Software</label><input type="text" id="submissionUrl" class="form-input" data-t-placeholder="submission.softwareUrlPlaceholder" placeholder="https://www.beispiel-software.de" inputmode="url" autocomplete="url"></div>
                        <div class="form-group">
                            <label class="form-label" data-t="software.logo">Logo</label>
                            <div id="submissionLogoPreview"></div>
                            <input type="file" id="submissionLogo" class="form-input" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.svg">
                            <input type="hidden" id="submissionLogoPath" value="">
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label class="form-label" for="submissionShortDescription" id="labelSubmissionShortDescription" data-t="software.shortDescription">Kurzbeschreibung</label><input type="text" id="submissionShortDescription" class="form-input"></div>
                            <div class="form-group"><label class="form-label" for="submissionShortDescriptionEn" id="labelSubmissionShortDescriptionEn">Kurzbeschreibung (EN)</label><input type="text" id="submissionShortDescriptionEn" class="form-input"></div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="software.descriptions">Beschreibungen</h4></div>
                    <div class="card-body">
                        <div class="editor-pair">
                            <div class="editor-col"><label class="form-label" id="labelSubmissionDescription" data-t="software.description">Beschreibung</label><div id="subEditorDescription" class="quill-editor"></div><textarea id="submissionDescription" style="display:none;"></textarea></div>
                            <div class="editor-col"><label class="form-label" id="labelSubmissionDescriptionEn">Beschreibung (EN)</label><div id="subEditorDescriptionEn" class="quill-editor"></div><textarea id="submissionDescriptionEn" style="display:none;"></textarea></div>
                        </div>
                        <div class="editor-pair">
                            <div class="editor-col"><label class="form-label" id="labelSubmissionFeatures" data-t="software.features">Funktionen</label><div id="subEditorFeatures" class="quill-editor"></div><textarea id="submissionFeatures" style="display:none;"></textarea></div>
                            <div class="editor-col"><label class="form-label" id="labelSubmissionFeaturesEn">Funktionen (EN)</label><div id="subEditorFeaturesEn" class="quill-editor"></div><textarea id="submissionFeaturesEn" style="display:none;"></textarea></div>
                        </div>
                        <div class="editor-pair">
                            <div class="editor-col"><label class="form-label" id="labelSubmissionReasonHnee" data-t="submission.reasonHnee">Warum wird diese Software an der HNEE eingesetzt?</label><div id="subEditorReasonHnee" class="quill-editor"></div><textarea id="submissionReasonHnee" style="display:none;"></textarea></div>
                            <div class="editor-col"><label class="form-label" id="labelSubmissionReasonHneeEn">Why is this software used at HNEE? (EN)</label><div id="subEditorReasonHneeEn" class="quill-editor"></div><textarea id="submissionReasonHneeEn" style="display:none;"></textarea></div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="submission.costs">Kosten &amp; Lizenzen</h4></div>
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" data-t="submission.costType">Kosten</label>
                                <select id="submissionCosts" class="form-select">
                                    <option value="kostenlos">Kostenlos</option>
                                    <option value="kostenpflichtig">Kostenpflichtig</option>
                                    <option value="abo">Abo / Lizenz</option>
                                    <option value="einmalig">Einmalige Kosten</option>
                                </select>
                            </div>
                            <div class="form-group"><label class="form-label" data-t="submission.costModel">Kostenmodell</label><input type="text" id="submissionCostModel" class="form-input"></div>
                        </div>
                        <div class="form-group"><label class="form-label" data-t="submission.costPrice">Preis</label><input type="text" id="submissionCostPrice" class="form-input"></div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="software.classification">Klassifizierung</h4></div>
                    <div class="card-body classification-body">
                        <div class="form-group">
                            <label class="form-label" data-t="software.type">Typ</label>
                            <div class="flex gap-4">
                                <label class="form-checkbox"><input type="checkbox" id="subTypeWeb"><span>Web</span></label>
                                <label class="form-checkbox"><input type="checkbox" id="subTypeDesktop"><span>Desktop</span></label>
                                <label class="form-checkbox"><input type="checkbox" id="subTypeMobile"><span>Mobile</span></label>
                            </div>
                        </div>
                        <div class="form-group"><label class="form-label" data-t="software.categories">Kategorien</label><div id="submissionCategoryCheckboxes" class="checkbox-grid"></div></div>
                        <div class="form-group"><label class="form-label" data-t="software.targetGroups">Zielgruppen</label><div id="submissionTargetGroupCheckboxes" class="checkbox-grid"></div></div>
                        <div class="form-group"><label class="form-label" data-t="departments.title">Abteilungen</label><div id="submissionDepartmentCheckboxes" class="checkbox-grid"></div></div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="software.privacyHosting">Datenschutz &amp; Hosting</h4></div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label" data-t="software.privacyStatus">Datenschutz</label>
                            <div class="privacy-options">
                                <label class="privacy-option"><input type="radio" name="subPrivacyStatus" value="COMPLIANT"><span class="privacy-dot" style="background:#22c55e;"></span><span data-t="software.privacy.COMPLIANT">Konform</span></label>
                                <label class="privacy-option"><input type="radio" name="subPrivacyStatus" value="PARTIAL"><span class="privacy-dot" style="background:#eab308;"></span><span data-t="software.privacy.PARTIAL">Teilweise konform</span></label>
                                <label class="privacy-option"><input type="radio" name="subPrivacyStatus" value="IN_PROGRESS"><span class="privacy-dot" style="background:#f97316;"></span><span data-t="software.privacy.IN_PROGRESS">In Umsetzung</span></label>
                                <label class="privacy-option"><input type="radio" name="subPrivacyStatus" value="NON_COMPLIANT"><span class="privacy-dot" style="background:#ef4444;"></span><span data-t="software.privacy.NON_COMPLIANT">Nicht konform</span></label>
                                <label class="privacy-option"><input type="radio" name="subPrivacyStatus" value="UNKNOWN" checked><span class="privacy-dot" style="background:#9ca3af;"></span><span data-t="software.privacy.UNKNOWN">Unbekannt</span></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-t="submission.hosting">Hosting</label>
                            <div class="flex gap-4" style="flex-wrap:wrap;">
                                <label class="form-checkbox"><input type="radio" name="subHostingLocation" value="HNEE"><span>HNEE</span></label>
                                <label class="form-checkbox"><input type="radio" name="subHostingLocation" value="DE"><span id="labelHostingDE">Deutschland</span></label>
                                <label class="form-checkbox"><input type="radio" name="subHostingLocation" value="EU"><span>EU</span></label>
                                <label class="form-checkbox"><input type="radio" name="subHostingLocation" value="NON_EU"><span id="labelHostingNonEU">Nicht-EU</span></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-t="submission.privacyNote">Datenschutz-Bemerkungen</label>
                            <div id="subEditorPrivacyNote" class="quill-editor"></div>
                            <textarea id="submissionPrivacyNote" style="display:none;"></textarea>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h4 data-t="submission.contacts">Ansprechpersonen</h4></div>
                    <div class="card-body">
                        <div id="submissionContactsList" class="space-y-3"></div>
                        <button type="button" id="submissionAddContactBtn" class="btn btn-secondary btn-sm mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            <span data-t="submission.addContact">Ansprechperson hinzufügen</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeSubmissionModal()" data-t="common.cancel">Abbrechen</button>
                <button type="submit" class="btn btn-primary" data-t="submission.submit">Vorschlag einreichen</button>
            </div>
        </form>
    </div>
</div>
