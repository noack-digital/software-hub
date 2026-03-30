<?php
/**
 * Fetch Favicon from URL
 * POST /api/fetch-favicon.php
 */

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

requireCsrf();

// Login required
if (!Auth::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $url = $input['url'] ?? '';

    if (empty($url)) {
        throw new Exception('URL is required');
    }

    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        throw new Exception('Invalid URL');
    }

    // Extract domain from URL
    $parsedUrl = parse_url($url);
    $domain = $parsedUrl['host'] ?? '';

    if (empty($domain)) {
        throw new Exception('Could not extract domain from URL');
    }

    // Remove 'www.' prefix for better favicon matching
    $domain = preg_replace('/^www\./', '', $domain);

    // Try multiple favicon sources
    $faviconUrls = [
        // DuckDuckGo icons (usually more accurate)
        "https://icons.duckduckgo.com/ip3/{$domain}.ico",
        // Google favicon service
        "https://www.google.com/s2/favicons?domain={$domain}&sz=128",
        // Direct favicon.ico from domain
        "https://{$domain}/favicon.ico"
    ];

    $faviconData = null;
    $successUrl = null;

    foreach ($faviconUrls as $faviconUrl) {
        $ch = curl_init($faviconUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        $data = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && !empty($data) && strlen($data) > 100) {
            // Valid favicon found (size check to avoid tiny/empty images)
            $faviconData = $data;
            $successUrl = $faviconUrl;
            break;
        }
    }

    if (empty($faviconData)) {
        throw new Exception('Could not download favicon from any source');
    }

    // Generate filename
    $filename = 'favicon_' . preg_replace('/[^a-z0-9]/i', '_', $domain) . '_' . time() . '.png';
    $uploadDir = __DIR__ . '/../uploads/';
    $filePath = $uploadDir . $filename;

    // Save file
    if (!file_put_contents($filePath, $faviconData)) {
        throw new Exception('Could not save favicon. Check uploads directory permissions.');
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'filename' => $filename,
            'url' => '/uploads/' . $filename
        ]
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
