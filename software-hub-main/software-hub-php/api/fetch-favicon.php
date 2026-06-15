<?php
/**
 * Fetch Favicon from URL (Admin only)
 * POST /api/fetch-favicon.php
 */

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
setApiCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

requireAdminCsrf();

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $url = $input['url'] ?? '';

    if (empty($url)) {
        throw new Exception('URL is required');
    }

    assertSafeExternalUrl($url);

    $parsedUrl = parse_url($url);
    $domain = preg_replace('/^www\./', '', $parsedUrl['host'] ?? '');

    if ($domain === '') {
        throw new Exception('Could not extract domain from URL');
    }

    $faviconUrls = [
        "https://icons.duckduckgo.com/ip3/{$domain}.ico",
        "https://www.google.com/s2/favicons?domain={$domain}&sz=128",
        "https://{$domain}/favicon.ico"
    ];

    $faviconData = null;

    foreach ($faviconUrls as $faviconUrl) {
        if (!isSafeExternalUrl($faviconUrl)) {
            continue;
        }
        $data = fetchUrlSafe($faviconUrl, 5, 1048576);
        if ($data !== null && strlen($data) > 100) {
            $faviconData = $data;
            break;
        }
    }

    if (empty($faviconData)) {
        throw new Exception('Could not download favicon from any source');
    }

    $filename = 'favicon_' . preg_replace('/[^a-z0-9]/i', '_', $domain) . '_' . time() . '.png';
    $uploadDir = __DIR__ . '/../uploads/logos/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $filePath = $uploadDir . $filename;

    if (!file_put_contents($filePath, $faviconData)) {
        throw new Exception('Could not save favicon. Check uploads directory permissions.');
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'filename' => $filename,
            'url' => '/uploads/logos/' . $filename
        ]
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
