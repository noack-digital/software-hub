<?php
/**
 * Categories Management
 * Software Hub - PHP Version
 */

$pageTitle = 'Kategorien';
$currentPage = 'categories';

require_once __DIR__ . '/../includes/admin-header.php';
?>

<div class="data-table-wrapper">
    <div class="data-table-header">
        <div class="data-table-search relative">
            <svg class="data-table-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="categorySearch" class="form-input" style="padding-left: 2.5rem;" data-t-placeholder="common.search" placeholder="Suchen...">
        </div>
        <div class="data-table-actions">
            <button id="batchTranslateCategoriesBtn" class="btn btn-secondary" style="display: none;" onclick="batchTranslateCategories()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
                </svg>
                <span id="batchTranslateCategoriesCount">Übersetzen (0)</span>
            </button>
            <button id="batchDeleteCategoriesBtn" class="btn btn-danger" style="display: none;" onclick="confirmBatchDeleteCategories()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span id="batchDeleteCategoriesCount">Löschen (0)</span>
            </button>
            <button id="newCategoryBtn" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span data-t="categories.new">Neue Kategorie</span>
            </button>
        </div>
    </div>
    <div class="data-table-filters">
        <div class="form-group" style="margin: 0;">
            <label class="form-label" for="filterCategoryTranslation" data-t="common.translation">Übersetzung</label>
            <select id="filterCategoryTranslation" class="form-select">
                <option value="" data-t="common.all">Alle</option>
                <option value="complete">Vollständig</option>
                <option value="missing">Unvollständig</option>
            </select>
        </div>
        <div class="form-group" style="margin: 0;">
            <label class="form-label" for="filterCategorySoftware">Software</label>
            <select id="filterCategorySoftware" class="form-select">
                <option value="" data-t="common.all">Alle</option>
                <option value="with">Mit Software</option>
                <option value="without">Ohne Software</option>
            </select>
        </div>
        <div class="form-group" style="margin: 0;">
            <button id="clearCategoryFiltersBtn" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Filter zurücksetzen
            </button>
        </div>
    </div>
    <div id="categoriesTableBody">
        <!-- Table content will be rendered by JavaScript -->
    </div>
</div>

<!-- Category Modal -->
<div class="modal-overlay" id="categoryModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title" id="categoryModalTitle">Kategorie</h3>
            <button class="modal-close" onclick="closeModal('categoryModal')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <form id="categoryForm" onsubmit="saveCategory(event)">
            <input type="hidden" id="categoryId">
            <div class="modal-body">
                <div class="form-section">
                    <h4 class="form-section-title">Deutsch</h4>
                    <div class="form-group">
                        <label class="form-label" for="categoryName" data-t="common.name">Name</label>
                        <input type="text" id="categoryName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="categoryDescription" data-t="common.description">Beschreibung</label>
                        <textarea id="categoryDescription" class="form-textarea" rows="2"></textarea>
                    </div>
                </div>
                <div class="form-section">
                    <h4 class="form-section-title">English</h4>
                    <div class="form-group">
                        <label class="form-label" for="categoryNameEn">Name (EN)</label>
                        <input type="text" id="categoryNameEn" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="categoryDescriptionEn">Description (EN)</label>
                        <textarea id="categoryDescriptionEn" class="form-textarea" rows="2"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('categoryModal')" data-t="common.cancel">Abbrechen</button>
                <button type="submit" class="btn btn-primary" data-t="common.save">Speichern</button>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
