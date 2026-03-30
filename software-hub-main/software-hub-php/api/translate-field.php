<?php
/**
 * Translate a single text field from DE to EN using AI
 */

require_once __DIR__ . '/../includes/init.php';

set_time_limit(60);

header('Content-Type: application/json');

if (!Auth::isLoggedIn()) {
    http_response_code(401);
    jsonResponse(['error' => 'Nicht authentifiziert'], false);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    jsonResponse(['error' => 'Methode nicht erlaubt'], false);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$text = trim($input['text'] ?? '');

if (empty($text)) {
    jsonResponse(['error' => 'Kein Text angegeben'], false);
    exit;
}

$prompt = "Übersetze den folgenden Text von Deutsch nach Englisch. "
    . "Gib NUR die englische Übersetzung zurück, ohne Erklärungen, ohne Anführungszeichen, ohne Markdown-Formatierung.\n\n"
    . $text;

$lastError = '';
for ($attempt = 0; $attempt < 3; $attempt++) {
    if ($attempt > 0) {
        sleep(2 * $attempt);
    }

    $result = AI::translate($prompt, 'en');

    if ($result['success']) {
        $translation = stripMarkdown($result['translation']);
        jsonResponse([
            'success' => true,
            'translation' => $translation
        ]);
        exit;
    }

    $lastError = $result['error'] ?? 'Unbekannter Fehler';

    if (str_contains($lastError, 'API Key') || str_contains($lastError, 'konfiguriert')) {
        break;
    }
}

jsonResponse(['error' => $lastError], false);
