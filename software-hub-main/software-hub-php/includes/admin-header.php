<?php
/**
 * Admin Layout Header Template
 * Software Hub - PHP Version
 *
 * Usage: Include at the top of admin pages
 * Required variables:
 * - $pageTitle: Title of the current page
 * - $currentPage: Current page identifier for nav highlighting
 */

require_once __DIR__ . '/init.php';

// Auth check - redirect to login if not authenticated
if (!Auth::isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$currentUser = Auth::getCurrentUser();
$isAdmin = $currentUser['role'] === 'ADMIN';

// Get current page from filename if not set
if (!isset($currentPage)) {
    $currentPage = basename($_SERVER['PHP_SELF'], '.php');
}

// Default page title
if (!isset($pageTitle)) {
    $pageTitle = ucfirst($currentPage);
}

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
        $path = __DIR__ . '/../assets/images/logo.' . $ext;
        if (file_exists($path)) {
            $logoPath = '/assets/images/logo.' . $ext;
            break;
        }
    }
}

// Find favicon files
$faviconFiles = [];
foreach (['svg', 'png', 'ico'] as $ext) {
    $path = __DIR__ . '/../favicon.' . $ext;
    if (file_exists($path)) {
        $faviconFiles[$ext] = '../favicon.' . $ext . '?v=' . filemtime($path);
    }
}
// Also check for sized versions
foreach (['32', '192'] as $size) {
    $path = __DIR__ . '/../favicon-' . $size . '.png';
    if (file_exists($path)) {
        $faviconFiles['png' . $size] = '../favicon-' . $size . '.png?v=' . filemtime($path);
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?> - <?= htmlspecialchars($appName) ?> Admin</title>
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
    <link rel="stylesheet" href="../assets/css/style.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="../assets/css/admin.css?v=<?php echo time(); ?>">
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet">
</head>
<body data-page="admin" data-admin-page="<?= htmlspecialchars($currentPage) ?>">
    <div class="admin-layout">
        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>

        <!-- Sidebar -->
        <nav class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <a href="/" class="sidebar-logo">
                    <?php if ($logoPath): ?>
                        <img src="<?= htmlspecialchars($logoPath) ?>" alt="Logo" style="width: 32px; height: 32px; object-fit: contain;">
                    <?php else: ?>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    <?php endif; ?>
                    <span class="sidebar-logo-text"><?= htmlspecialchars($appName) ?></span>
                </a>
                <button class="sidebar-toggle" id="sidebarToggle" title="Sidebar ein-/ausklappen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="11 17 6 12 11 7"></polyline>
                        <polyline points="18 17 13 12 18 7"></polyline>
                    </svg>
                </button>
            </div>

            <div class="sidebar-nav">
                <!-- Dashboard -->
                <a href="dashboard.php" class="sidebar-nav-item <?= $currentPage === 'dashboard' ? 'active' : '' ?>" data-tooltip="Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span data-t="navigation.dashboard">Dashboard</span>
                </a>

                <!-- Software -->
                <a href="software.php" class="sidebar-nav-item <?= $currentPage === 'software' ? 'active' : '' ?>" data-tooltip="Software">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <span data-t="navigation.software">Software</span>
                </a>

                <!-- Categories -->
                <a href="categories.php" class="sidebar-nav-item <?= $currentPage === 'categories' ? 'active' : '' ?>" data-tooltip="Kategorien">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                        <path d="M7 7h.01"></path>
                    </svg>
                    <span data-t="navigation.categories">Kategorien</span>
                </a>

                <!-- Departments -->
                <a href="departments.php" class="sidebar-nav-item <?= $currentPage === 'departments' ? 'active' : '' ?>" data-tooltip="Abteilungen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 20V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16"/>
                        <path d="M2 10h20"/>
                        <path d="M10 2v20"/>
                    </svg>
                    <span data-t="departments.title">Abteilungen</span>
                </a>

                <!-- Target Groups -->
                <a href="target-groups.php" class="sidebar-nav-item <?= $currentPage === 'target-groups' ? 'active' : '' ?>" data-tooltip="Zielgruppen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span data-t="navigation.targetGroups">Zielgruppen</span>
                </a>

                <?php if ($isAdmin): ?>
                <!-- Users (Admin only) -->
                <a href="users.php" class="sidebar-nav-item <?= $currentPage === 'users' ? 'active' : '' ?>" data-tooltip="Benutzer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="19" y1="8" x2="19" y2="14"></line>
                        <line x1="22" y1="11" x2="16" y2="11"></line>
                    </svg>
                    <span data-t="navigation.users">Benutzer</span>
                </a>

                <!-- Settings (Admin only) -->
                <a href="settings.php" class="sidebar-nav-item <?= $currentPage === 'settings' ? 'active' : '' ?>" data-tooltip="Einstellungen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span data-t="navigation.settings">Einstellungen</span>
                </a>
                <?php endif; ?>
            </div>

            <!-- Sidebar Footer -->
            <div class="sidebar-footer">
                <div class="sidebar-user">
                    <div class="sidebar-user-avatar">
                        <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
                    </div>
                    <div class="sidebar-user-info">
                        <span class="sidebar-user-name"><?= htmlspecialchars($currentUser['name']) ?></span>
                        <span class="sidebar-user-role"><?= $isAdmin ? 'Administrator' : 'Benutzer' ?></span>
                    </div>
                </div>
                <button id="logoutBtn" class="btn btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span data-t="auth.logout">Abmelden</span>
                </button>
            </div>
        </nav>

        <!-- Mobile Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <!-- Main Content -->
        <main class="admin-content">
            <!-- Page Header -->
            <header class="admin-header">
                <div class="admin-header-left">
                    <h1 class="admin-title"><?= htmlspecialchars($pageTitle) ?></h1>
                </div>
                <div class="admin-header-right">
                    <div class="language-switcher">
                        <button data-lang="de" class="active">DE</button>
                        <button data-lang="en">EN</button>
                    </div>
                </div>
            </header>

            <!-- Page Content (will be filled by each page) -->
            <div class="admin-page-content">
