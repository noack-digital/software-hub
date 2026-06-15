<?php
/**
 * AI Fill Software API Endpoint
 * Auto-generate software descriptions using Gemini AI
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

    if (empty($data['name'])) {
        jsonError('Software-Name ist erforderlich');
    }

    $name = $data['name'];
    $url = $data['url'] ?? null;

    $result = AI::fillSoftware($name, $url);

    if ($result['success']) {
        jsonResponse($result);
    } else {
        jsonError($result['error'], 400);
    }
} catch (Exception $e) {
    error_log("AI Fill Software Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
