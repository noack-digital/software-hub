<?php
/**
 * Users Management
 * Software Hub - PHP Version
 */

$pageTitle = 'Benutzer';
$currentPage = 'users';

require_once __DIR__ . '/../includes/admin-header.php';

// Check if user is admin
if ($currentUser['role'] !== 'ADMIN') {
    header('Location: dashboard.php');
    exit;
}
?>

<div class="data-table-wrapper">
    <div class="data-table-header">
        <div class="data-table-search relative">
            <svg class="data-table-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="usersSearch" class="form-input" style="padding-left: 2.5rem;" data-t-placeholder="common.search" placeholder="Suchen...">
        </div>
        <div class="data-table-actions">
            <button id="newUserBtn" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span data-t="users.new">Neuer Benutzer</span>
            </button>
        </div>
    </div>
    <div id="usersTableBody">
        <!-- Table content will be rendered by JavaScript -->
    </div>
</div>

<!-- User Modal -->
<div class="modal-overlay" id="userModal">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title" id="userModalTitle">Benutzer</h3>
            <button class="modal-close" onclick="closeModal('userModal')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <form id="userForm" onsubmit="saveUser(event)">
            <input type="hidden" id="userId">
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label" for="userName" data-t="users.name">Name</label>
                    <input type="text" id="userName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="userEmail" data-t="users.email">E-Mail</label>
                    <input type="email" id="userEmail" class="form-input" required>
                </div>
                <div class="form-group" id="passwordGroup">
                    <label class="form-label" for="userPassword" data-t="users.password">Passwort</label>
                    <input type="password" id="userPassword" class="form-input" minlength="6">
                </div>
                <div class="form-group">
                    <label class="form-label" for="userRole" data-t="users.role">Rolle</label>
                    <select id="userRole" class="form-select">
                        <option value="USER" data-t="users.user">Benutzer</option>
                        <option value="ADMIN" data-t="users.admin">Administrator</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')" data-t="common.cancel">Abbrechen</button>
                <button type="submit" class="btn btn-primary" data-t="common.save">Speichern</button>
            </div>
        </form>
    </div>
</div>

<!-- Password Reset Modal -->
<div class="modal-overlay" id="passwordResetModal">
    <div class="modal modal-sm">
        <div class="modal-header">
            <h3 class="modal-title" data-t="users.resetPassword">Passwort zurücksetzen</h3>
            <button class="modal-close" onclick="closeModal('passwordResetModal')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <form id="passwordResetForm" onsubmit="resetPassword(event)">
            <input type="hidden" id="resetPasswordUserId">
            <div class="modal-body">
                <p class="mb-4">
                    <span data-t="users.resetPasswordFor">Passwort zurücksetzen für:</span>
                    <strong id="resetPasswordUserName"></strong>
                </p>
                <div class="form-group">
                    <label class="form-label" for="newPassword" data-t="users.newPassword">Neues Passwort</label>
                    <input type="password" id="newPassword" class="form-input" required minlength="6">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('passwordResetModal')" data-t="common.cancel">Abbrechen</button>
                <button type="submit" class="btn btn-primary" data-t="users.resetPassword">Zurücksetzen</button>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
