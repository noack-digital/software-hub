<?php
/**
 * Software Submissions API Endpoint
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
setApiCorsHeaders('GET, POST, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$submissions = new SoftwareSubmission();

function validateSubmissionInput(array $data, bool $requireSubmitter = true): void
{
    if (empty($data['name'])) {
        jsonError('Name ist erforderlich');
    }
    if (!empty($data['url']) && !isValidUrl($data['url'])) {
        jsonError('URL ist ungültig');
    }
    if ($requireSubmitter) {
        if (empty($data['submitter_name']) && empty($data['submitterName'])) {
            jsonError('Name des Anfragenden ist erforderlich');
        }
        $email = $data['submitter_email'] ?? $data['submitterEmail'] ?? '';
        if (empty($email) || !isValidEmail($email)) {
            jsonError('Gültige E-Mail-Adresse ist erforderlich');
        }
    }
    if (!empty($data['_website'])) {
        jsonResponse(['success' => true, 'id' => 'ignored'], 201);
    }
}

try {
    $action = $_GET['action'] ?? '';

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            requireAdmin();

            if ($action === 'pending-count') {
                jsonResponse(['count' => $submissions->countPending()]);
            }

            if (isset($_GET['id'])) {
                $item = $submissions->getById($_GET['id']);
                if ($item) {
                    jsonResponse($item);
                }
                jsonError('Einreichung nicht gefunden', 404);
            }

            $filters = [
                'search' => $_GET['search'] ?? '',
                'status' => $_GET['status'] ?? '',
            ];
            jsonResponse(['data' => $submissions->getAll($filters)]);
            break;

        case 'POST':
            $data = getJsonBody();

            if ($action === 'approve') {
                requireAdminCsrf();
                if (empty($data['id'])) {
                    jsonError('ID ist erforderlich');
                }
                $reviewerId = Auth::getCurrentUser()['id'] ?? null;
                $result = $submissions->approve($data['id'], $reviewerId);
                if (!$result) {
                    jsonError('Einreichung konnte nicht freigegeben werden', 400);
                }
                jsonResponse($result);
            }

            if ($action === 'reject') {
                requireAdminCsrf();
                if (empty($data['id'])) {
                    jsonError('ID ist erforderlich');
                }
                $reviewerId = Auth::getCurrentUser()['id'] ?? null;
                $result = $submissions->reject($data['id'], $reviewerId);
                if (!$result) {
                    jsonError('Einreichung nicht gefunden', 404);
                }
                jsonResponse($result);
            }

            checkRateLimit('submission:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 3600);
            validateSubmissionInput($data, true);

            $result = $submissions->create($data);
            jsonResponse($result, 201);
            break;

        case 'PATCH':
            requireAdminCsrf();
            $data = getJsonBody();
            if (empty($data['id'])) {
                jsonError('ID ist erforderlich');
            }
            if (isset($data['name']) && empty(trim((string)$data['name']))) {
                jsonError('Name ist erforderlich');
            }
            if (!empty($data['url']) && !isValidUrl($data['url'])) {
                jsonError('URL ist ungültig');
            }
            if (!empty($data['submitter_email']) && !isValidEmail($data['submitter_email'] ?? $data['submitterEmail'] ?? '')) {
                jsonError('Gültige E-Mail-Adresse ist erforderlich');
            }
            $result = $submissions->update($data['id'], $data);
            if ($result) {
                jsonResponse($result);
            }
            jsonError('Einreichung nicht gefunden', 404);
            break;

        case 'DELETE':
            requireAdminCsrf();
            $id = $_GET['id'] ?? getJsonBody()['id'] ?? '';
            if (empty($id)) {
                jsonError('ID ist erforderlich');
            }
            if ($submissions->delete($id)) {
                jsonResponse(['success' => true]);
            }
            jsonError('Einreichung nicht gefunden', 404);
            break;

        default:
            jsonError('Methode nicht erlaubt', 405);
    }
} catch (Throwable $e) {
    error_log('Software submissions API error: ' . $e->getMessage());
    jsonError('Interner Serverfehler', 500);
}
