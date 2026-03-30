<?php
/**
 * Admin Dashboard
 * Software Hub - PHP Version
 */

$pageTitle = 'Dashboard';
$currentPage = 'dashboard';

require_once __DIR__ . '/../includes/admin-header.php';
?>

<div id="dashboardContent">
    <!-- Content will be rendered by JavaScript -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-card-header">
                <span class="stat-label">Lade...</span>
            </div>
            <div class="stat-value">-</div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/admin-footer.php'; ?>
