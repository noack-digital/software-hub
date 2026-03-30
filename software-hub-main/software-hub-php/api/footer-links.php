<?php
/**
 * Footer Links API Endpoint
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$footerLink = new FooterLink();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // GET single footer link by ID or all footer links
            if (isset($_GET['id'])) {
                $item = $footerLink->getById($_GET['id']);
                if ($item) {
                    jsonResponse($item);
                } else {
                    jsonError('Footer Link nicht gefunden', 404);
                }
            } else {
                // Support ?active=true to get only active links
                $activeOnly = isset($_GET['active']) && $_GET['active'] === 'true';
                jsonResponse($footerLink->getAll($activeOnly));
            }
            break;

        case 'POST':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $data = getJsonBody();

            // Check for reorder operation
            if (isset($data['action']) && $data['action'] === 'reorder') {
                if (empty($data['orderedIds']) || !is_array($data['orderedIds'])) {
                    jsonError('orderedIds ist erforderlich');
                }
                $result = $footerLink->reorder($data['orderedIds']);
                if ($result) {
                    jsonResponse(['success' => true]);
                } else {
                    jsonError('Fehler beim Sortieren', 400);
                }
                break;
            }

            // Regular creation
            if (empty($data['text']) || empty($data['url'])) {
                jsonError('Text und URL sind erforderlich');
            }

            $result = $footerLink->create($data);
            jsonResponse($result, 201);
            break;

        case 'PATCH':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $data = getJsonBody();
            if (empty($data['id'])) {
                jsonError('ID ist erforderlich');
            }

            $result = $footerLink->update($data['id'], $data);
            if ($result) {
                jsonResponse($result);
            } else {
                jsonError('Footer Link nicht gefunden', 404);
            }
            break;

        case 'DELETE':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                jsonError('ID ist erforderlich');
            }

            $result = $footerLink->delete($id);
            if ($result) {
                jsonResponse(['success' => true]);
            } else {
                jsonError('Footer Link nicht gefunden', 404);
            }
            break;

        default:
            jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Footer Links API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
