<?php
/**
 * Upload API Endpoint
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Methode nicht erlaubt', 405);
}

// Admin-Zugang erforderlich
if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

requireCsrf();

try {
    $action = $_GET['action'] ?? 'logo';

    switch ($action) {
        case 'logo':
            // Logo-Upload
            if (!isset($_FILES['file'])) {
                jsonError('Keine Datei hochgeladen');
            }

            $result = handleFileUpload($_FILES['file'], UPLOAD_DIR . 'logos/');
            if ($result['success']) {
                jsonResponse(['url' => $result['url']]);
            } else {
                jsonError($result['error']);
            }
            break;

        case 'favicon':
            // Favicon von URL abrufen
            $data = getJsonBody();
            if (empty($data['url'])) {
                jsonError('URL ist erforderlich');
            }

            $faviconUrl = fetchFavicon($data['url']);
            if ($faviconUrl) {
                jsonResponse(['url' => $faviconUrl]);
            } else {
                jsonError('Favicon konnte nicht abgerufen werden');
            }
            break;

        case 'steckbrief':
            // PDF-Steckbrief Upload – Originaldateinamen beibehalten
            if (!isset($_FILES['file'])) {
                jsonError('Keine Datei hochgeladen');
            }
            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                jsonError('Upload-Fehler: ' . $file['error']);
            }
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if ($mimeType !== 'application/pdf') {
                jsonError('Nur PDF-Dateien erlaubt');
            }
            $targetDir = UPLOAD_DIR . 'steckbriefe/';
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $originalName = $file['name'];
            $safeName = Database::generateId() . '.pdf';
            $targetPath = $targetDir . $safeName;
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                jsonError('Fehler beim Speichern der Datei');
            }
            $relativePath = '/uploads/steckbriefe/' . $safeName;
            jsonResponse(['path' => $relativePath, 'original_name' => $originalName]);
            break;

        case 'font':
            // Schriftart-Upload (.woff2, .woff, .ttf)
            if (!isset($_FILES['file'])) {
                jsonError('Keine Datei hochgeladen');
            }
            $fontTypes = ['font/woff2', 'font/woff', 'font/ttf', 'application/font-woff2', 'application/font-woff', 'application/x-font-ttf'];
            $result = handleFileUpload($_FILES['file'], UPLOAD_DIR . 'fonts/', $fontTypes);
            if ($result['success']) {
                $relativePath = '/uploads/fonts/' . $result['filename'];
                jsonResponse(['path' => $relativePath, 'url' => $result['url']]);
            } else {
                jsonError($result['error']);
            }
            break;

        default:
            jsonError('Ungültige Aktion', 400);
    }
} catch (Exception $e) {
    error_log("Upload API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
