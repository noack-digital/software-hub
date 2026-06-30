<?php
/**
 * Public Submission Upload API (logo / PDF for software suggestions)
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
setApiCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Methode nicht erlaubt', 405);
}

checkRateLimit('submission-upload:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 20, 3600);

try {
    $action = $_GET['action'] ?? 'logo';

    switch ($action) {
        case 'logo':
            if (!isset($_FILES['file'])) {
                jsonError('Keine Datei hochgeladen');
            }
            $targetDir = UPLOAD_DIR . 'submissions/logos/';
            $result = handleFileUpload($_FILES['file'], $targetDir);
            if ($result['success']) {
                $relativePath = '/uploads/submissions/logos/' . $result['filename'];
                jsonResponse(['path' => $relativePath, 'url' => $relativePath]);
            }
            jsonError($result['error']);
            break;

        case 'steckbrief':
            if (!isset($_FILES['file'])) {
                jsonError('Keine Datei hochgeladen');
            }
            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                jsonError('Upload-Fehler: ' . $file['error']);
            }
            if ($file['size'] > MAX_UPLOAD_SIZE) {
                jsonError('Datei zu groß (max. ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . ' MB)');
            }
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if ($mimeType !== 'application/pdf') {
                jsonError('Nur PDF-Dateien erlaubt');
            }
            $targetDir = UPLOAD_DIR . 'submissions/steckbriefe/';
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $originalName = basename($file['name']);
            $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName) ?: 'steckbrief.pdf';
            $newFilename = Database::generateId() . '_' . $safeName;
            $targetPath = $targetDir . $newFilename;
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                jsonError('Fehler beim Speichern der Datei');
            }
            $relativePath = '/uploads/submissions/steckbriefe/' . $newFilename;
            jsonResponse([
                'path' => $relativePath,
                'originalName' => $originalName,
            ]);
            break;

        default:
            jsonError('Unbekannte Aktion', 400);
    }
} catch (Throwable $e) {
    error_log('Submission upload error: ' . $e->getMessage());
    jsonError('Interner Serverfehler', 500);
}
