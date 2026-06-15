<?php
/**
 * AI Translate API Endpoint
 * Translate text using Gemini AI
 */

declare(strict_types=1);

require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
setApiCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Methode nicht erlaubt', 405);
}

requireAdminCsrf();

try {
    $data = getJsonBody();

    if (empty($data['text'])) {
        jsonError('Text ist erforderlich');
    }

    $text = $data['text'];
    $targetLang = $data['targetLang'] ?? 'en';

    $result = AI::translate($text, $targetLang);

    if ($result['success']) {
        jsonResponse($result);
    } else {
        jsonError($result['error'], 400);
    }
} catch (Exception $e) {
    error_log("AI Translate Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
