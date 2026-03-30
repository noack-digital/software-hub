<?php
/**
 * Branding API - Logo and Favicon Upload
 * Software Hub - PHP Version
 */

require_once __DIR__ . '/../includes/init.php';

// Set JSON header
header('Content-Type: application/json');

// Check authentication
if (!Auth::isLoggedIn()) {
    http_response_code(401);
    jsonResponse(['error' => 'Nicht authentifiziert'], false);
    exit;
}

$user = Auth::getCurrentUser();
if ($user['role'] !== 'ADMIN') {
    http_response_code(403);
    jsonResponse(['error' => 'Keine Berechtigung'], false);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Upload Logo or Favicon
if ($method === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['error' => 'Keine Datei hochgeladen'], false);
        exit;
    }

    $file = $_FILES['file'];
    $type = $_POST['type'] ?? 'logo'; // 'logo' or 'favicon'

    // Validate file type
    $allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/x-icon'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        jsonResponse(['error' => 'Ungültiger Dateityp. Erlaubt: SVG, PNG, JPG, ICO'], false);
        exit;
    }

    // Validate file size (max 2MB)
    if ($file['size'] > 2 * 1024 * 1024) {
        jsonResponse(['error' => 'Datei zu groß (max. 2MB)'], false);
        exit;
    }

    // Determine file extension
    $extension = match($mimeType) {
        'image/svg+xml' => 'svg',
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/x-icon' => 'ico',
        default => 'png'
    };

    // Define target paths
    $rootPath = dirname(__DIR__);

    if ($type === 'favicon') {
        // For favicon, save as favicon.{ext}
        $targetPath = $rootPath . '/favicon.' . $extension;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            jsonResponse(['error' => 'Fehler beim Speichern der Datei'], false);
            exit;
        }

        jsonResponse([
            'success' => true,
            'path' => '/favicon.' . $extension,
            'message' => 'Favicon erfolgreich hochgeladen'
        ]);
    } else {
        // For logo
        $targetPath = $rootPath . '/assets/images/logo.' . $extension;

        // Create images directory if it doesn't exist
        if (!is_dir($rootPath . '/assets/images')) {
            mkdir($rootPath . '/assets/images', 0755, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            jsonResponse(['error' => 'Fehler beim Speichern der Datei'], false);
            exit;
        }

        // Save logo path to settings
        try {
            $db = Database::getInstance();
            $stmt = $db->prepare("
                INSERT INTO settings (`key`, value, updated_at)
                VALUES ('logo_path', :path, NOW())
                ON DUPLICATE KEY UPDATE
                    value = :path,
                    updated_at = NOW()
            ");
            $stmt->execute(['path' => '/assets/images/logo.' . $extension]);
        } catch (PDOException $e) {
            error_log("Error saving logo path: " . $e->getMessage());
        }

        jsonResponse([
            'success' => true,
            'path' => '/assets/images/logo.' . $extension,
            'message' => 'Logo erfolgreich hochgeladen'
        ]);
    }
}

// Delete Logo or Favicon
elseif ($method === 'DELETE') {
    $type = $_GET['type'] ?? 'logo';
    $rootPath = dirname(__DIR__);

    if ($type === 'favicon') {
        // Remove all favicon files
        $files = ['favicon.svg', 'favicon.png', 'favicon.ico', 'favicon-32.png', 'favicon-192.png', 'favicon.jpg'];
        foreach ($files as $file) {
            $path = $rootPath . '/' . $file;
            if (file_exists($path)) {
                @unlink($path);
            }
        }

        jsonResponse([
            'success' => true,
            'message' => 'Favicon entfernt'
        ]);
    } else {
        // Remove logo files
        $patterns = ['logo.svg', 'logo.png', 'logo.jpg', 'logo.ico'];
        foreach ($patterns as $pattern) {
            $path = $rootPath . '/assets/images/' . $pattern;
            if (file_exists($path)) {
                @unlink($path);
            }
        }

        // Remove from settings
        try {
            $db = Database::getInstance();
            $stmt = $db->prepare("DELETE FROM settings WHERE `key` = 'logo_path'");
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error removing logo path: " . $e->getMessage());
        }

        jsonResponse([
            'success' => true,
            'message' => 'Logo entfernt'
        ]);
    }
}

// Get current branding settings
elseif ($method === 'GET') {
    $rootPath = dirname(__DIR__);
    $branding = [];

    // Check for logo
    foreach (['svg', 'png', 'jpg'] as $ext) {
        $path = $rootPath . '/assets/images/logo.' . $ext;
        if (file_exists($path)) {
            $branding['logo'] = '/assets/images/logo.' . $ext;
            break;
        }
    }

    // Check for favicon
    foreach (['svg', 'png', 'ico'] as $ext) {
        $path = $rootPath . '/favicon.' . $ext;
        if (file_exists($path)) {
            $branding['favicon'] = '/favicon.' . $ext;
            break;
        }
    }

    // Get app name from settings
    try {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT value FROM settings WHERE `key` = 'app_name'");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            $branding['app_name'] = $result['value'];
        }
    } catch (PDOException $e) {
        error_log("Error fetching app name: " . $e->getMessage());
    }

    jsonResponse($branding);
}

else {
    http_response_code(405);
    jsonResponse(['error' => 'Methode nicht erlaubt'], false);
}
