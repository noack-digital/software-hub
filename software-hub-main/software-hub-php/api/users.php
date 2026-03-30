<?php
/**
 * Users API Endpoint (Admin only)
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

// Admin-Zugang erforderlich
if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

$user = new User();

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                $item = $user->getById($_GET['id']);
                if ($item) {
                    jsonResponse($item);
                } else {
                    jsonError('Benutzer nicht gefunden', 404);
                }
            } else {
                $search = $_GET['q'] ?? '';
                jsonResponse(['data' => $user->getAll($search)]);
            }
            break;

        case 'POST':
            requireCsrf();
            $data = getJsonBody();
            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                jsonError('Name, E-Mail und Passwort erforderlich');
            }

            $result = $user->create($data);
            if ($result['success']) {
                jsonResponse($result['user'], 201);
            } else {
                jsonError($result['error'], 400);
            }
            break;

        case 'PATCH':
            requireCsrf();
            $data = getJsonBody();
            if (empty($data['id'])) {
                jsonError('ID ist erforderlich');
            }

            $result = $user->update($data['id'], $data);
            if ($result) {
                jsonResponse($result);
            } else {
                jsonError('Benutzer nicht gefunden oder E-Mail bereits vergeben', 404);
            }
            break;

        case 'DELETE':
            requireCsrf();
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                jsonError('ID ist erforderlich');
            }

            // Selbstlöschung verhindern
            if ($id === Auth::getCurrentUser()['id']) {
                jsonError('Eigenen Account nicht löschbar', 400);
            }

            if ($user->delete($id)) {
                jsonResponse(['success' => true]);
            } else {
                jsonError('Benutzer nicht gefunden oder letzter Admin', 400);
            }
            break;

        default:
            jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Users API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
