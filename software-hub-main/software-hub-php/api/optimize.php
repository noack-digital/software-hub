<?php
/**
 * Description Optimization API
 * Optimizes software descriptions using configured AI provider
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

if (!isset($input['software_id'])) {
    jsonResponse(['error' => 'Software-ID erforderlich'], false);
    exit;
}

$result = optimizeSoftwareEntry($input['software_id']);
if ($result['success']) {
    jsonResponse($result);
} else {
    jsonResponse($result, false);
}

function optimizeSoftwareEntry(string $softwareId): array
{
    try {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT name, short_description, description, features, name_en, short_description_en, description_en, features_en FROM software WHERE id = :id");
        $stmt->execute(['id' => $softwareId]);
        $software = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$software) {
            return ['success' => false, 'error' => 'Software nicht gefunden'];
        }

        $descWords = (int)(getSetting('AI_DESCRIPTION_WORDS') ?: getSetting('ai_description_words') ?: 100);
        $shortDescWords = (int)(getSetting('AI_SHORT_DESCRIPTION_WORDS') ?: getSetting('ai_short_description_words') ?: 20);

        $fields = [
            'name' => $software['name'] ?? '',
            'short_description' => $software['short_description'] ?? '',
            'description' => $software['description'] ?? '',
            'features' => $software['features'] ?? '',
        ];

        $customPrompt = getSetting('AI_OPTIMIZE_PROMPT') ?: getSetting('ai_optimize_prompt') ?: '';

        if (!empty($customPrompt)) {
            $prompt = str_replace(
                ['{{short_description_words}}', '{{description_words}}', '{{fields_json}}'],
                [$shortDescWords, $descWords, json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)],
                $customPrompt
            );
        } else {
            $prompt = "Du bist ein technischer Redakteur. Optimiere die folgenden Beschreibungsfelder einer Software. "
                . "Regeln:\n"
                . "- 'short_description': Prägnante Kurzbeschreibung, exakt ca. {$shortDescWords} Wörter. Ein Satz, der den Hauptzweck beschreibt.\n"
                . "- 'description': Ausführliche Beschreibung, exakt ca. {$descWords} Wörter. Klar strukturiert, sachlich, informativ.\n"
                . "- 'features': Liste der wichtigsten Features als kommaseparierter Text. Jedes Feature kurz und prägnant (2-5 Wörter pro Feature).\n"
                . "- 'name': Nicht verändern, 1:1 übernehmen.\n"
                . "- Sprache: Deutsch beibehalten.\n"
                . "- Formatierung: Kein Markdown, kein HTML, reiner Text.\n"
                . "- Inhalt beibehalten, nur Länge und Formulierung optimieren.\n\n"
                . "Eingabe:\n"
                . json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                . "\n\nGib NUR ein JSON-Objekt zurück mit denselben Schlüsseln und optimierten Texten, ohne Erklärungen oder Markdown:";
        }

        $aiResult = aiPromptWithRetry($prompt);

        if (!$aiResult['success']) {
            return ['success' => false, 'error' => $aiResult['error']];
        }

        $jsonMatch = [];
        if (preg_match('/\{.*\}/s', $aiResult['text'], $jsonMatch)) {
            $parsed = json_decode($jsonMatch[0], true);
            if ($parsed) {
                $optimized = [
                    'short_description' => stripMarkdown($parsed['short_description'] ?? $software['short_description']),
                    'description' => stripMarkdown($parsed['description'] ?? $software['description']),
                    'features' => stripMarkdown($parsed['features'] ?? $software['features']),
                ];

                // Also optimize English translations if they exist
                $optimizedEn = [];
                $hasEnglish = !empty($software['short_description_en']) || !empty($software['description_en']) || !empty($software['features_en']);

                if ($hasEnglish) {
                    $fieldsEn = [
                        'name' => $software['name_en'] ?? $software['name'] ?? '',
                        'short_description' => $software['short_description_en'] ?? '',
                        'description' => $software['description_en'] ?? '',
                        'features' => $software['features_en'] ?? '',
                    ];

                    $promptEn = "You are a technical editor. Optimize the following software description fields. "
                        . "Rules:\n"
                        . "- 'short_description': Concise short description, exactly about {$shortDescWords} words. One sentence describing the main purpose.\n"
                        . "- 'description': Detailed description, exactly about {$descWords} words. Clearly structured, factual, informative.\n"
                        . "- 'features': List of key features as comma-separated text. Each feature short and concise (2-5 words per feature).\n"
                        . "- 'name': Do not change, keep as-is.\n"
                        . "- Language: Keep English.\n"
                        . "- Formatting: No Markdown, no HTML, plain text only.\n"
                        . "- Keep the content, only optimize length and wording.\n\n"
                        . "Input:\n"
                        . json_encode($fieldsEn, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                        . "\n\nReturn ONLY a JSON object with the same keys and optimized texts, without explanations or Markdown:";

                    $aiResultEn = aiPromptWithRetry($promptEn);

                    if ($aiResultEn['success']) {
                        $jsonMatchEn = [];
                        if (preg_match('/\{.*\}/s', $aiResultEn['text'], $jsonMatchEn)) {
                            $parsedEn = json_decode($jsonMatchEn[0], true);
                            if ($parsedEn) {
                                $optimizedEn = [
                                    'short_description_en' => stripMarkdown($parsedEn['short_description'] ?? $software['short_description_en']),
                                    'description_en' => stripMarkdown($parsedEn['description'] ?? $software['description_en']),
                                    'features_en' => stripMarkdown($parsedEn['features'] ?? $software['features_en']),
                                ];
                            }
                        }
                    }
                }

                // Build UPDATE query
                if (!empty($optimizedEn)) {
                    $stmt = $db->prepare("
                        UPDATE software
                        SET short_description = :short_description,
                            description = :description,
                            features = :features,
                            short_description_en = :short_description_en,
                            description_en = :description_en,
                            features_en = :features_en,
                            optimized = 1
                        WHERE id = :id
                    ");

                    $stmt->execute([
                        'short_description' => $optimized['short_description'],
                        'description' => $optimized['description'],
                        'features' => $optimized['features'],
                        'short_description_en' => $optimizedEn['short_description_en'],
                        'description_en' => $optimizedEn['description_en'],
                        'features_en' => $optimizedEn['features_en'],
                        'id' => $softwareId
                    ]);
                } else {
                    $stmt = $db->prepare("
                        UPDATE software
                        SET short_description = :short_description,
                            description = :description,
                            features = :features,
                            optimized = 1
                        WHERE id = :id
                    ");

                    $stmt->execute([
                        'short_description' => $optimized['short_description'],
                        'description' => $optimized['description'],
                        'features' => $optimized['features'],
                        'id' => $softwareId
                    ]);
                }

                return [
                    'success' => true,
                    'optimized' => array_merge($optimized, $optimizedEn),
                    'message' => $hasEnglish && !empty($optimizedEn)
                        ? 'Beschreibungen optimiert (DE + EN)'
                        : 'Beschreibung optimiert'
                ];
            }
        }

        return ['success' => false, 'error' => 'KI-Antwort konnte nicht verarbeitet werden'];

    } catch (Exception $e) {
        error_log("Optimization error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Fehler: ' . $e->getMessage()];
    }
}

function aiPromptWithRetry(string $prompt): array
{
    $lastError = '';
    for ($attempt = 0; $attempt < 3; $attempt++) {
        if ($attempt > 0) {
            sleep(2 * $attempt);
        }

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
