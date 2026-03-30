<?php
/**
 * Test Google Gemini API Key
 * POST /api/ai/test-key.php
 */

require_once __DIR__ . '/../../includes/init.php';
require_once __DIR__ . '/../../includes/AIHelper.php';

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

requireCsrf();

// Admin only
if (!Auth::isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $apiKey = $input['apiKey'] ?? '';
    $provider = $input['provider'] ?? 'gemini';

    if (empty($apiKey)) {
        throw new Exception('API key is required');
    }

    // Set default model based on provider
    $model = $provider === 'mistral' ? 'mistral-small-latest' : 'gemini-1.5-flash';

    $ai = new AIHelper($apiKey, $model, $provider);
    $result = $ai->testApiKey();

    if ($result['valid']) {
        echo json_encode([
            'success' => true,
            'message' => 'API key is valid'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $result['error'] ?? 'API key is invalid'
        ]);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
