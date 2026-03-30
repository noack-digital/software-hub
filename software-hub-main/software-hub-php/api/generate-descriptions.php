<?php
/**
 * Generate software descriptions and features using AI
 * Returns DE and EN versions
 */

require_once __DIR__ . '/../includes/init.php';

set_time_limit(120);

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
$name = trim($input['name'] ?? '');
$shortDesc = trim($input['short_description'] ?? '');
$url = trim($input['url'] ?? '');

if (empty($name)) {
    jsonResponse(['error' => 'Software-Name erforderlich'], false);
    exit;
}

$context = "Software: {$name}";
if ($shortDesc) $context .= "\nKurzbeschreibung: {$shortDesc}";
if ($url) $context .= "\nURL: {$url}";

// Generate German descriptions
$promptDE = "Du bist ein technischer Redakteur. Erstelle für die folgende Software eine Beschreibung und eine Feature-Liste auf Deutsch.\n\n"
    . $context . "\n\n"
    . "Regeln:\n"
    . "- 'description': Ausführliche Beschreibung, maximal 2000 Zeichen. Sachlich, informativ, klar strukturiert.\n"
    . "- 'features': Kommaseparierte Liste der wichtigsten Funktionen, maximal 1000 Zeichen. Jedes Feature 2-5 Wörter.\n"
    . "- Kein Markdown, kein HTML, reiner Text.\n"
    . "- Sprache: Deutsch.\n\n"
    . "Gib NUR ein JSON-Objekt zurück mit den Schlüsseln 'description' und 'features', ohne Erklärungen:";

$resultDE = aiPromptWithRetry($promptDE);

$data = [];

if ($resultDE['success']) {
    $jsonMatch = [];
    if (preg_match('/\{.*\}/s', $resultDE['text'], $jsonMatch)) {
        $parsed = json_decode($jsonMatch[0], true);
        if ($parsed) {
            $data['description'] = stripMarkdown(mb_substr($parsed['description'] ?? '', 0, 2000));
            $data['features'] = stripMarkdown(mb_substr($parsed['features'] ?? '', 0, 1000));
        }
    }
}

if (empty($data['description'])) {
    jsonResponse(['error' => $resultDE['error'] ?? 'KI-Antwort konnte nicht verarbeitet werden'], false);
    exit;
}

// Generate English descriptions
$promptEN = "You are a technical writer. Create a description and feature list in English for the following software.\n\n"
    . "Software: {$name}\n"
    . ($shortDesc ? "Short description: {$shortDesc}\n" : "")
    . ($url ? "URL: {$url}\n" : "")
    . "\nRules:\n"
    . "- 'description': Detailed description, max 2000 characters. Factual, informative, well-structured.\n"
    . "- 'features': Comma-separated list of key features, max 1000 characters. Each feature 2-5 words.\n"
    . "- No Markdown, no HTML, plain text only.\n"
    . "- Language: English.\n\n"
    . "Return ONLY a JSON object with keys 'description' and 'features', without explanations:";

$resultEN = aiPromptWithRetry($promptEN);

if ($resultEN['success']) {
    $jsonMatch = [];
    if (preg_match('/\{.*\}/s', $resultEN['text'], $jsonMatch)) {
        $parsed = json_decode($jsonMatch[0], true);
        if ($parsed) {
            $data['description_en'] = stripMarkdown(mb_substr($parsed['description'] ?? '', 0, 2000));
            $data['features_en'] = stripMarkdown(mb_substr($parsed['features'] ?? '', 0, 1000));
        }
    }
}

jsonResponse(['success' => true, 'data' => $data]);

function aiPromptWithRetry(string $prompt): array
{
    $lastError = '';
    for ($attempt = 0; $attempt < 3; $attempt++) {
        if ($attempt > 0) sleep(2 * $attempt);

        $result = AI::translate($prompt, 'en');

        if ($result['success']) {
            return ['success' => true, 'text' => $result['translation']];
        }

        $lastError = $result['error'] ?? 'Unbekannter Fehler';

        if (str_contains($lastError, 'API Key') || str_contains($lastError, 'konfiguriert')) {
            return ['success' => false, 'error' => $lastError];
        }
    }

    return ['success' => false, 'error' => $lastError];
}
