<?php
/**
 * Departments API Endpoint
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

$department = new Department();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                $item = $department->getById($_GET['id']);
                if ($item) {
                    jsonResponse($item);
                } else {
                    jsonError('Abteilung nicht gefunden', 404);
                }
            } else {
                jsonResponse(['data' => $department->getAll()]);
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

            $result = $department->create($data);
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

            $result = $department->update($data['id'], $data);
            if ($result) {
                jsonResponse($result);
            } else {
                jsonError('Abteilung nicht gefunden', 404);
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

            $result = $department->delete($id);
            if ($result['success']) {
                jsonResponse(['success' => true]);
            } else {
                jsonError($result['error'], 400);
            }
            break;

        default:
            jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Departments API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
