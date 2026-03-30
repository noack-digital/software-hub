            </div><!-- /.admin-page-content -->
        </main>
    </div>

    <!-- Confirm Dialog Template -->
    <div class="modal-overlay" id="confirmDialog">
        <div class="modal modal-sm">
            <div class="modal-header">
                <h3 class="modal-title" id="confirmDialogTitle">Bestätigung</h3>
                <button class="modal-close" onclick="AdminUI.hideConfirmDialog()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p id="confirmDialogMessage"></p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="AdminUI.hideConfirmDialog()" data-t="common.cancel">Abbrechen</button>
                <button class="btn btn-danger" id="confirmDialogConfirmBtn" data-t="common.delete">Löschen</button>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="spinner"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>
    <script src="../assets/js/app.js?v=<?php echo time(); ?>"></script>
    <script src="../assets/js/admin.js?v=<?php echo time(); ?>"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            initAdminPage();
        });
    </script>
</body>
</html>
