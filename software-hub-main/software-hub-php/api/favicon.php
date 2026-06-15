<?php
/**
 * Favicon Fetch API (Admin only)
 * Software Hub - PHP Version
 */

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    jsonResponse(['error' => 'Methode nicht erlaubt'], false);
    exit;
}

requireAdminCsrf();

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['software_id']) || empty($input['url'])) {
    jsonResponse(['error' => 'Software-ID und URL erforderlich'], false);
    exit;
}

$softwareId = $input['software_id'];
$url = $input['url'];

assertSafeExternalUrl($url);

$parsed = parse_url($url);
$baseUrl = $parsed['scheme'] . '://' . $parsed['host'];

$faviconUrls = [
    $baseUrl . '/favicon.ico',
    $baseUrl . '/favicon.png',
    $baseUrl . '/apple-touch-icon.png',
    $baseUrl . '/apple-touch-icon-precomposed.png',
];

$html = fetchUrlSafe($url, 10, 1048576);
if ($html) {
    if (preg_match('/<link[^>]+rel=["\'](?:shortcut )?icon["\'][^>]*href=["\']([^"\']+)["\']/', $html, $matches)) {
        $iconUrl = $matches[1];
        if (!parse_url($iconUrl, PHP_URL_SCHEME)) {
            if (str_starts_with($iconUrl, '//')) {
                $iconUrl = $parsed['scheme'] . ':' . $iconUrl;
            } elseif (str_starts_with($iconUrl, '/')) {
                $iconUrl = $baseUrl . $iconUrl;
            } else {
                $iconUrl = $baseUrl . '/' . $iconUrl;
            }
        }
        if (isSafeExternalUrl($iconUrl)) {
            array_unshift($faviconUrls, $iconUrl);
        }
    }
}

$faviconData = null;
$faviconMimeType = null;

foreach ($faviconUrls as $faviconUrl) {
    $faviconData = fetchUrlSafe($faviconUrl, 5, 1048576);
    if ($faviconData && strlen($faviconData) > 0) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $faviconMimeType = $finfo->buffer($faviconData);
        if (str_starts_with($faviconMimeType, 'image/')) {
            break;
        }
        $faviconData = null;
    }
}

if (!$faviconData) {
    jsonResponse(['error' => 'Favicon konnte nicht gefunden werden'], false);
    exit;
}

$extension = match ($faviconMimeType) {
    'image/svg+xml' => 'svg',
    'image/png' => 'png',
    'image/jpeg', 'image/jpg' => 'jpg',
    'image/x-icon', 'image/vnd.microsoft.icon' => 'ico',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    default => 'png'
};

$uploadsDir = dirname(__DIR__) . '/uploads/logos';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$filename = 'logo_' . preg_replace('/[^a-zA-Z0-9_-]/', '', $softwareId) . '_' . time() . '.' . $extension;
$filepath = $uploadsDir . '/' . $filename;

if (!file_put_contents($filepath, $faviconData)) {
    jsonResponse(['error' => 'Fehler beim Speichern des Favicons'], false);
    exit;
}

if ($extension === 'svg') {
    sanitizeSvgUpload($filepath);
}

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
