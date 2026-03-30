<?php
/**
 * Software Hub - Öffentliche Startseite
 * PHP Version
 */

require_once __DIR__ . '/includes/init.php';

// Get app name and logo from settings
$appName = 'Software Hub'; // Default
$logoPath = null;

try {
    $db = Database::getInstance();

    // Get app name
    $stmt = $db->prepare("SELECT value FROM settings WHERE `key` = 'app_name'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result && !empty($result['value'])) {
        $appName = $result['value'];
    }

    // Get logo path
    $stmt = $db->prepare("SELECT value FROM settings WHERE `key` = 'logo_path'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result && !empty($result['value'])) {
        $logoPath = $result['value'];
    }
} catch (Exception $e) {
    error_log("Error loading settings: " . $e->getMessage());
}

// Check if logo file exists, otherwise check filesystem
if (!$logoPath) {
    foreach (['svg', 'png', 'jpg'] as $ext) {
        $path = __DIR__ . '/assets/images/logo.' . $ext;
        if (file_exists($path)) {
            $logoPath = '/assets/images/logo.' . $ext;
            break;
        }
    }
}

// Find favicon files
$faviconFiles = [];
foreach (['svg', 'png', 'ico'] as $ext) {
    $path = __DIR__ . '/favicon.' . $ext;
    if (file_exists($path)) {
        $faviconFiles[$ext] = '/favicon.' . $ext . '?v=' . filemtime($path);
    }
}
// Also check for sized versions
foreach (['32', '192'] as $size) {
    $path = __DIR__ . '/favicon-' . $size . '.png';
    if (file_exists($path)) {
        $faviconFiles['png' . $size] = '/favicon-' . $size . '.png?v=' . filemtime($path);
    }
}

// Get background color
$bgColor = getSetting('background_color', '#f9fafb');

$isLoggedIn = Auth::isLoggedIn();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($appName) ?></title>
    <?php if (isset($faviconFiles['png32'])): ?>
    <link rel="icon" type="image/png" sizes="32x32" href="<?= $faviconFiles['png32'] ?>">
    <?php endif; ?>
    <?php if (isset($faviconFiles['png192'])): ?>
    <link rel="icon" type="image/png" sizes="192x192" href="<?= $faviconFiles['png192'] ?>">
    <?php endif; ?>
    <?php if (isset($faviconFiles['svg'])): ?>
    <link rel="icon" type="image/svg+xml" href="<?= $faviconFiles['svg'] ?>">
    <?php endif; ?>
    <?php if (isset($faviconFiles['png'])): ?>
    <link rel="icon" type="image/png" href="<?= $faviconFiles['png'] ?>">
    <?php endif; ?>
    <?php if (isset($faviconFiles['ico'])): ?>
    <link rel="shortcut icon" href="<?= $faviconFiles['ico'] ?>">
    <?php endif; ?>
    <link rel="stylesheet" href="assets/css/style.css">
    <?php if ($bgColor && $bgColor !== '#f9fafb'): ?>
    <style>body { background-color: <?= htmlspecialchars($bgColor) ?>; }</style>
    <?php endif; ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body data-page="home">
    <!-- Header -->
    <header class="header sticky" id="header">
        <div class="container">
            <div class="header-content">
                <a href="/" class="header-logo">
                    <?php if ($logoPath): ?>
                        <img src="<?= htmlspecialchars($logoPath) ?>" alt="Logo" style="width: 32px; height: 32px; object-fit: contain;">
                    <?php else: ?>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    <?php endif; ?>
                    <span><?= htmlspecialchars($appName) ?></span>
                </a>
                <div class="header-actions">
                    <div class="language-switcher">
                        <button data-lang="de" class="active">DE</button>
                        <button data-lang="en">EN</button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <!-- Search Bar -->
            <div class="search-section">
                <div class="search-wrapper">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="searchInput" class="form-input search-input" data-t-placeholder="common.search" placeholder="Suchen...">
                </div>
            </div>

            <!-- Filter Buttons -->
            <div class="filter-section">
                <div class="filter-buttons" id="categoryFilterButtons">
                    <!-- Category buttons will be rendered here -->
                </div>
            </div>

            <div class="filter-section">
                <div class="filter-buttons" id="targetGroupFilterButtons">
                    <!-- Target group buttons will be rendered here -->
                </div>
            </div>

            <!-- Software Grid -->
            <div id="softwareGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <!-- Software cards will be rendered here by JavaScript -->
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p data-t="app.loading">Laden...</p>
                </div>
            </div>

            <!-- Empty State -->
            <div id="emptyState" class="empty-state hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p data-t="common.noResults">Keine Ergebnisse gefunden</p>
            </div>
        </div>
    </main>

    <!-- Software Detail Landing Page (hidden by default) -->
    <div id="softwareDetailPage" class="software-detail-page hidden">
        <div class="container">
            <div class="detail-page-header">
                <a href="#" id="backToListLink" class="back-link" onclick="closeDetailPage(); return false;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span data-t="software.backToList">Zurück zu den Softwares</span>
                </a>
                <button id="closeDetailPage" class="detail-close-btn" onclick="closeDetailPage()" title="Schließen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div id="detailPageContent">
                <!-- Content rendered by JavaScript -->
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer" id="footer">
        <div class="container">
            <div class="footer-content">
                <span>&copy; <?= date('Y') ?> <?= htmlspecialchars($appName) ?></span>
                <div class="footer-links" id="footerLinks">
                    <!-- Links will be rendered by JavaScript based on settings -->
                </div>
                <a href="/admin/" class="footer-admin-link"><?= $isLoggedIn ? 'zum Admin-Panel' : 'Admin-Panel' ?></a>
            </div>
        </div>
    </footer>

    <!-- Toast Container -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay" style="display: none;">
        <div class="spinner"></div>
    </div>

    <script src="assets/js/app.js"></script>
    <script>
        // Initialize home page
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
