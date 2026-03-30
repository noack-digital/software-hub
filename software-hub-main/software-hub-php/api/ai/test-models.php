<?php
/**
 * AI Test Models API Endpoint
 * Test which Gemini models are available
 */

declare(strict_types=1);

require_once __DIR__ . '/../../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $result = AI::testModels();
        jsonResponse($result);
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("AI Test Models Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
