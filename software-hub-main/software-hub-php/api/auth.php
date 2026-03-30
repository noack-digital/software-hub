<?php
/**
 * Auth API Endpoint
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$auth = new Auth();

try {
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonError('Methode nicht erlaubt', 405);
            }
            requireCsrf();

            $data = getJsonBody();
            if (empty($data['email']) || empty($data['password'])) {
                jsonError('E-Mail und Passwort erforderlich');
            }

            $result = $auth->login($data['email'], $data['password']);
            if ($result['success']) {
                jsonResponse($result);
            } else {
                jsonError($result['error'], 401);
            }
            break;

        case 'logout':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonError('Methode nicht erlaubt', 405);
            }
            requireCsrf();
            Auth::logout();
            jsonResponse(['success' => true]);
            break;

        case 'session':
            if (Auth::isLoggedIn()) {
                jsonResponse([
                    'authenticated' => true,
                    'user' => Auth::getCurrentUser(),
                    'csrfToken' => Auth::getCsrfToken()
                ]);
            } else {
                jsonResponse([
                    'authenticated' => false,
                    'csrfToken' => Auth::getCsrfToken()
                ]);
            }
            break;

        case 'reset-request':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonError('Methode nicht erlaubt', 405);
            }
            requireCsrf();

            $data = getJsonBody();
            if (empty($data['email'])) {
                jsonError('E-Mail erforderlich');
            }

            $result = $auth->generateResetToken($data['email']);
            // Immer Erfolg melden (Sicherheit: keine Info über existierende E-Mails)
            jsonResponse(['success' => true, 'message' => 'Falls die E-Mail existiert, wurde ein Reset-Link versendet']);
            break;

        case 'reset-password':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonError('Methode nicht erlaubt', 405);
            }
            requireCsrf();

            $data = getJsonBody();
            if (empty($data['token']) || empty($data['password'])) {
                jsonError('Token und neues Passwort erforderlich');
            }

            $result = $auth->resetPassword($data['token'], $data['password']);
            if ($result['success']) {
                jsonResponse(['success' => true]);
            } else {
                jsonError($result['error'], 400);
            }
            break;

        default:
            jsonError('Ungültige Aktion', 400);
    }
} catch (Exception $e) {
    error_log("Auth API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
