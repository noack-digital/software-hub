<?php
/**
 * Translation API for Categories and Target Groups
 * Translates name and description fields using configured AI provider
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
$type = $input['type'] ?? '';
$id = $input['id'] ?? '';

if (!in_array($type, ['category', 'target_group', 'department']) || !$id) {
    jsonResponse(['error' => 'Typ und ID erforderlich'], false);
    exit;
}

$tableMap = ['category' => 'categories', 'target_group' => 'target_groups', 'department' => 'departments'];
$table = $tableMap[$type];

try {
    $db = Database::getInstance();
    $stmt = $db->prepare("SELECT name, description FROM {$table} WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        jsonResponse(['error' => 'Eintrag nicht gefunden'], false);
        exit;
    }

    $fields = [
        'name' => $item['name'] ?? '',
        'description' => $item['description'] ?? '',
    ];

    $prompt = "Übersetze die folgenden Felder von Deutsch nach Englisch. "
        . "Gib NUR ein JSON-Objekt zurück, ohne Erklärungen oder Markdown-Formatierung.\n\n"
        . "Eingabe:\n"
        . json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
        . "\n\nAusgabe als JSON mit denselben Schlüsseln, aber englischen Übersetzungen:";

    // Retry up to 3 times
    $lastError = '';
    for ($attempt = 0; $attempt < 3; $attempt++) {
        if ($attempt > 0) {
            sleep(2 * $attempt);
        }

        $result = AI::translate($prompt, 'en');

        if ($result['success']) {
            $text = $result['translation'];

            $jsonMatch = [];
            if (preg_match('/\{.*\}/s', $text, $jsonMatch)) {
                $parsed = json_decode($jsonMatch[0], true);
                if ($parsed) {
                    $nameEn = isset($parsed['name']) ? stripMarkdown($parsed['name']) : null;
                    $descEn = isset($parsed['description']) ? stripMarkdown($parsed['description']) : null;

                    $stmt = $db->prepare("UPDATE {$table} SET name_en = ?, description_en = ? WHERE id = ?");
                    $stmt->execute([$nameEn, $descEn, $id]);

                    jsonResponse([
                        'success' => true,
                        'translations' => [
                            'name_en' => $nameEn,
                            'description_en' => $descEn,
                        ],
                        'message' => 'Übersetzung erfolgreich'
                    ]);
                    exit;
                }
            }

            $lastError = 'KI-Antwort konnte nicht als JSON verarbeitet werden';
            continue;
        }

        $lastError = $result['error'] ?? 'Unbekannter Fehler';

        if (str_contains($lastError, 'API Key') || str_contains($lastError, 'konfiguriert')) {
            break;
        }
    }

    jsonResponse(['error' => $lastError], false);

} catch (Exception $e) {
    error_log("Translate item error: " . $e->getMessage());
    jsonResponse(['error' => 'Fehler: ' . $e->getMessage()], false);
}
