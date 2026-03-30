<?php
/**
 * Translation API - uses configured AI provider (Mistral/Gemini)
 * Translates all fields in a single AI call per software entry
 */

require_once __DIR__ . '/../includes/init.php';

set_time_limit(120);

header('Content-Type: application/json');

if (!Auth::isLoggedIn()) {
    http_response_code(401);
    jsonResponse(['error' => 'Nicht authentifiziert'], false);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    jsonResponse(['error' => 'Methode nicht erlaubt'], false);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['software_id'])) {
    jsonResponse(['error' => 'Software-ID erforderlich'], false);
    exit;
}

$result = translateSoftwareEntry($input['software_id']);
if ($result['success']) {
    jsonResponse($result);
} else {
    jsonResponse($result, false);
}

/**
 * Translate a single software entry using one AI call for all fields
 */
function translateSoftwareEntry(string $softwareId): array
{
    try {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT name, description, short_description, features, reason_hnee FROM software WHERE id = :id");
        $stmt->execute(['id' => $softwareId]);
        $software = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$software) {
            return ['success' => false, 'error' => 'Software nicht gefunden'];
        }

        // Build a single prompt for all fields
        $fields = [];
        foreach (['name', 'short_description', 'description', 'features', 'reason_hnee'] as $field) {
            $fields[$field] = $software[$field] ?? '';
        }

        $prompt = "Übersetze die folgenden Felder einer Software-Beschreibung von Deutsch nach Englisch. "
            . "Gib NUR ein JSON-Objekt zurück, ohne Erklärungen oder Markdown-Formatierung.\n\n"
            . "Eingabe:\n"
            . json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
            . "\n\nAusgabe als JSON mit denselben Schlüsseln, aber englischen Übersetzungen:";

        // Retry up to 3 times
        $translations = null;
        $lastError = '';
        for ($attempt = 0; $attempt < 3; $attempt++) {
            if ($attempt > 0) {
                sleep(2 * $attempt); // exponential backoff
            }

            $result = AI::translate($prompt, 'raw');
            // AI::translate returns text, but we called it with a special prompt
            // Use the lower-level method instead
            break;
        }

        // Use AI class directly for the prompt
        $apiResult = aiPrompt($prompt);

        if (!$apiResult['success']) {
            return ['success' => false, 'error' => $apiResult['error'] ?? 'Übersetzung fehlgeschlagen'];
        }

        $text = $apiResult['text'];

        // Extract JSON from response
        $jsonMatch = [];
        if (preg_match('/\{.*\}/s', $text, $jsonMatch)) {
            $parsed = json_decode($jsonMatch[0], true);
            if ($parsed) {
                $translations = [
                    'name_en' => isset($parsed['name']) ? stripMarkdown($parsed['name']) : null,
                    'short_description_en' => isset($parsed['short_description']) ? stripMarkdown($parsed['short_description']) : null,
                    'description_en' => isset($parsed['description']) ? stripMarkdown($parsed['description']) : null,
                    'features_en' => isset($parsed['features']) ? stripMarkdown($parsed['features']) : null,
                    'reason_hnee_en' => isset($parsed['reason_hnee']) ? stripMarkdown($parsed['reason_hnee']) : null,
                ];
            }
        }

        if (!$translations) {
            return ['success' => false, 'error' => 'KI-Antwort konnte nicht als JSON verarbeitet werden'];
        }

        // Update database
        $stmt = $db->prepare("
            UPDATE software
            SET name_en = :name_en,
                description_en = :description_en,
                short_description_en = :short_description_en,
                features_en = :features_en,
                reason_hnee_en = :reason_hnee_en
            WHERE id = :id
        ");

        $stmt->execute([
            'name_en' => $translations['name_en'],
            'description_en' => $translations['description_en'],
            'short_description_en' => $translations['short_description_en'],
            'features_en' => $translations['features_en'],
            'reason_hnee_en' => $translations['reason_hnee_en'],
            'id' => $softwareId
        ]);

        return [
            'success' => true,
            'translations' => $translations,
            'message' => 'Übersetzung erfolgreich'
        ];

    } catch (Exception $e) {
        error_log("Translation error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Fehler: ' . $e->getMessage()];
    }
}

/**
 * Send a prompt to the configured AI and return the text
 */
function aiPrompt(string $prompt): array
{
    for ($attempt = 0; $attempt < 3; $attempt++) {
        if ($attempt > 0) {
            sleep(2 * $attempt);
        }

        $result = AI::translate($prompt, 'en');

        if ($result['success']) {
            return ['success' => true, 'text' => $result['translation']];
        }

        $lastError = $result['error'] ?? 'Unbekannter Fehler';

        // Don't retry on auth/config errors
        if (str_contains($lastError, 'API Key') || str_contains($lastError, 'konfiguriert')) {
            return ['success' => false, 'error' => $lastError];
        }
    }

    return ['success' => false, 'error' => $lastError ?? 'Übersetzung fehlgeschlagen nach 3 Versuchen'];
}
