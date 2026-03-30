<?php
/**
 * AI Translate API Endpoint
 * Translate text using Gemini AI
 */

declare(strict_types=1);

require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("AI Translate Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
