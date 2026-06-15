<?php
/**
 * Base URL API Endpoint
 * Returns the base URL of the application
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
setApiCorsHeaders('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $baseUrl = $protocol . '://' . $host;

        jsonResponse([
            'baseUrl' => $baseUrl,
            'protocol' => $protocol,
            'host' => $host
        ]);
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Base URL API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
