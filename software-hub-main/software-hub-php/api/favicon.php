<?php
/**
 * Favicon Fetch API
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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['software_id']) || !isset($input['url'])) {
        jsonResponse(['error' => 'Software-ID und URL erforderlich'], false);
        exit;
    }

    $softwareId = $input['software_id'];
    $url = $input['url'];

    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        jsonResponse(['error' => 'Ungültige URL'], false);
        exit;
    }

    // Parse URL to get base domain
    $parsed = parse_url($url);
    $baseUrl = $parsed['scheme'] . '://' . $parsed['host'];

    // Try multiple favicon locations
    $faviconUrls = [
        $baseUrl . '/favicon.ico',
        $baseUrl . '/favicon.png',
        $baseUrl . '/apple-touch-icon.png',
        $baseUrl . '/apple-touch-icon-precomposed.png',
    ];

    // Also try to parse HTML for favicon link
    try {
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        ]);

        $html = @file_get_contents($url, false, $context);
        if ($html) {
            // Look for <link rel="icon"> or <link rel="shortcut icon">
            if (preg_match('/<link[^>]+rel=["\'](?:shortcut )?icon["\'][^>]*href=["\']([^"\']+)["\']/', $html, $matches)) {
                $iconUrl = $matches[1];
                // Make absolute URL if relative
                if (!parse_url($iconUrl, PHP_URL_SCHEME)) {
                    if (substr($iconUrl, 0, 2) === '//') {
                        $iconUrl = $parsed['scheme'] . ':' . $iconUrl;
                    } elseif (substr($iconUrl, 0, 1) === '/') {
                        $iconUrl = $baseUrl . $iconUrl;
                    } else {
                        $iconUrl = $baseUrl . '/' . $iconUrl;
                    }
                }
                array_unshift($faviconUrls, $iconUrl);
            }
        }
    } catch (Exception $e) {
        error_log("Error fetching HTML: " . $e->getMessage());
    }

    // Try to download favicon
    $faviconData = null;
    $faviconMimeType = null;

    foreach ($faviconUrls as $faviconUrl) {
        try {
            $context = stream_context_create([
                'http' => [
                    'timeout' => 5,
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ]
            ]);

            $faviconData = @file_get_contents($faviconUrl, false, $context);

            if ($faviconData && strlen($faviconData) > 0) {
                // Detect MIME type
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                $faviconMimeType = $finfo->buffer($faviconData);

                // Only accept image types
                if (strpos($faviconMimeType, 'image/') === 0) {
                    break;
                }
            }

            $faviconData = null;
        } catch (Exception $e) {
            error_log("Error downloading from $faviconUrl: " . $e->getMessage());
        }
    }

    if (!$faviconData) {
        jsonResponse(['error' => 'Favicon konnte nicht gefunden werden'], false);
        exit;
    }

    // Determine file extension
    $extension = match($faviconMimeType) {
        'image/svg+xml' => 'svg',
        'image/png' => 'png',
        'image/jpeg', 'image/jpg' => 'jpg',
        'image/x-icon', 'image/vnd.microsoft.icon' => 'ico',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        default => 'png'
    };

    // Save favicon
    $uploadsDir = dirname(__DIR__) . '/uploads/logos';
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }

    $filename = 'logo_' . $softwareId . '_' . time() . '.' . $extension;
    $filepath = $uploadsDir . '/' . $filename;

    if (!file_put_contents($filepath, $faviconData)) {
        jsonResponse(['error' => 'Fehler beim Speichern des Favicons'], false);
        exit;
    }

    // Update database
    try {
        $db = Database::getInstance();
        $stmt = $db->prepare("UPDATE software SET logo = :logo WHERE id = :id");
        $stmt->execute([
            'logo' => '/uploads/logos/' . $filename,
            'id' => $softwareId
        ]);

        jsonResponse([
            'success' => true,
            'logo' => '/uploads/logos/' . $filename,
            'message' => 'Favicon erfolgreich geladen'
        ]);
    } catch (PDOException $e) {
        error_log("Error updating software: " . $e->getMessage());
        jsonResponse(['error' => 'Datenbankfehler'], false);
    }
} else {
    http_response_code(405);
    jsonResponse(['error' => 'Methode nicht erlaubt'], false);
}
