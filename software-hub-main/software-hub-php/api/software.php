<?php
/**
 * Software API Endpoint
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

$software = new Software();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Einzelne Software oder alle abrufen
            if (isset($_GET['id'])) {
                $item = $software->getById($_GET['id']);
                if ($item) {
                    jsonResponse($item);
                } else {
                    jsonError('Software nicht gefunden', 404);
                }
            } else {
                $filters = [
                    'search' => $_GET['search'] ?? '',
                    'category' => $_GET['category'] ?? '',
                    'targetGroup' => $_GET['targetGroup'] ?? '',
                    'available' => isset($_GET['available']) ? $_GET['available'] === 'true' : null
                ];
                jsonResponse(['data' => $software->getAll($filters)]);
            }
            break;

        case 'POST':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $data = getJsonBody();
            if (empty($data['name'])) {
                jsonError('Name ist erforderlich');
            }

            $result = $software->create($data);
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

            $result = $software->update($data['id'], $data);
            if ($result) {
                jsonResponse($result);
            } else {
                jsonError('Software nicht gefunden', 404);
            }
            break;

        case 'DELETE':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            // Check for batch delete (multiple IDs in body)
            $body = @file_get_contents('php://input');
            $jsonData = $body ? json_decode($body, true) : null;

            if ($jsonData && isset($jsonData['ids']) && is_array($jsonData['ids'])) {
                // Batch delete
                $ids = $jsonData['ids'];
                if (empty($ids)) {
                    jsonError('IDs sind erforderlich');
                }

                $deleted = 0;
                $errors = [];

                foreach ($ids as $id) {
                    if ($software->delete($id)) {
                        $deleted++;
                    } else {
                        $errors[] = "Fehler beim Löschen von ID: {$id}";
                    }
                }

                logAudit('BATCH_DELETE', 'Software', 'multiple', ['deleted' => $deleted, 'ids' => $ids]);

                jsonResponse([
                    'success' => true,
                    'deleted' => $deleted,
                    'total' => count($ids),
                    'errors' => $errors
                ]);
            } else {
                // Single delete
                $id = $_GET['id'] ?? '';
                if (empty($id)) {
                    jsonError('ID ist erforderlich');
                }

                if ($software->delete($id)) {
                    jsonResponse(['success' => true]);
                } else {
                    jsonError('Software nicht gefunden', 404);
                }
            }
            break;

        default:
            jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Software API Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    jsonError('Serverfehler', 500);
}
