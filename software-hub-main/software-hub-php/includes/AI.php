<?php
/**
 * AI Helper Class - Gemini & Mistral API Integration
 */

declare(strict_types=1);

class AI
{
    private const GEMINI_MODELS = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.0-pro'
    ];

    private const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
    private const MISTRAL_API_BASE = 'https://api.mistral.ai/v1/chat/completions';

    /**
     * Get configured provider (gemini or mistral)
     */
    private static function getProvider(): string
    {
        $provider = getSetting('AI_PROVIDER') ?: getSetting('ai_provider') ?: 'gemini';
        return strtolower($provider);
    }

    /**
     * Get API key for the configured provider
     */
    private static function getApiKey(): ?string
    {
        $provider = self::getProvider();
        if ($provider === 'mistral') {
            return getSetting('MISTRAL_API_KEY') ?: getSetting('mistral_api_key') ?: null;
        }
        return getSetting('GOOGLE_GEMINI_API_KEY') ?: getSetting('ai_api_key') ?: null;
    }

    /**
     * Get model for the configured provider
     */
    private static function getModel(): string
    {
        $provider = self::getProvider();
        if ($provider === 'mistral') {
            return getSetting('MISTRAL_MODEL') ?: getSetting('mistral_model') ?: 'mistral-small-latest';
        }
        return getSetting('GEMINI_MODEL') ?: getSetting('gemini_model') ?: self::GEMINI_MODELS[0];
    }

    /**
     * Test if API key is valid
     */
    public static function testApiKey(string $apiKey): array
    {
        $provider = self::getProvider();

        if ($provider === 'mistral') {
            $result = self::mistralRequest('Hello, are you working?', 'mistral-small-latest', $apiKey);
        } else {
            $model = self::GEMINI_MODELS[0];
            $url = self::GEMINI_API_BASE . $model . ':generateContent?key=' . urlencode($apiKey);
            $data = [
                'contents' => [['parts' => [['text' => 'Hello, are you working?']]]],
            ];
            $result = self::makeRequest($url, $data);
        }

        if (isset($result['error'])) {
            return ['success' => false, 'error' => $result['error']];
        }

        return [
            'success' => true,
            'model' => $provider === 'mistral' ? 'mistral-small-latest' : self::GEMINI_MODELS[0],
            'response' => self::extractText($result, $provider)
        ];
    }

    /**
     * Test available models
     */
    public static function testModels(): array
    {
        $apiKey = self::getApiKey();
        if (!$apiKey) {
            return ['success' => false, 'error' => 'API Key nicht konfiguriert'];
        }

        $provider = self::getProvider();
        $results = [];

        if ($provider === 'mistral') {
            $model = self::getModel();
            $result = self::mistralRequest('Test', $model, $apiKey);
            $results[$model] = [
                'available' => !isset($result['error']),
                'error' => $result['error'] ?? null
            ];
        } else {
            foreach (self::GEMINI_MODELS as $model) {
                $url = self::GEMINI_API_BASE . $model . ':generateContent?key=' . urlencode($apiKey);
                $data = [
                    'contents' => [['parts' => [['text' => 'Test']]]],
                ];
                $result = self::makeRequest($url, $data);
                $results[$model] = [
                    'available' => !isset($result['error']),
                    'error' => $result['error'] ?? null
                ];
            }
        }

        return ['success' => true, 'models' => $results];
    }

    /**
     * Auto-fill software description using AI
     */
    public static function fillSoftware(string $softwareName, string $url = null): array
    {
        $apiKey = self::getApiKey();
        if (!$apiKey) {
            return ['success' => false, 'error' => 'API Key nicht konfiguriert'];
        }

        $descWords = (int)(getSetting('AI_DESCRIPTION_WORDS') ?: getSetting('ai_description_words') ?: 100);
        $shortDescWords = (int)(getSetting('AI_SHORT_DESCRIPTION_WORDS') ?: getSetting('ai_short_description_words') ?: 30);

        $prompt = "Du bist ein Experte für Software und Tools. Analysiere die Software '{$softwareName}'"
            . ($url ? " (URL: {$url})" : "") . " und erstelle folgende Informationen:\n\n"
            . "1. Eine kurze Beschreibung in maximal {$shortDescWords} Wörtern\n"
            . "2. Eine ausführliche Beschreibung in maximal {$descWords} Wörtern\n"
            . "3. Eine Liste der wichtigsten Features (5-7 Stichpunkte)\n"
            . "4. Eine Liste von 3-5 Alternativen zur Software\n"
            . "5. Wichtige Hinweise zur Nutzung (optional)\n\n"
            . "Antworte im JSON-Format:\n"
            . "{\n"
            . "  \"shortDescription\": \"...\",\n"
            . "  \"description\": \"...\",\n"
            . "  \"features\": [\"Feature 1\", \"Feature 2\", ...],\n"
            . "  \"alternatives\": [\"Alternative 1\", \"Alternative 2\", ...],\n"
            . "  \"notes\": \"...\"\n"
            . "}";

        $result = self::prompt($prompt, $apiKey);

        if (!isset($result['error'])) {
            $text = self::extractText($result, self::getProvider());
            $jsonMatch = [];
            if (preg_match('/\{.*\}/s', $text, $jsonMatch)) {
                $data = json_decode($jsonMatch[0], true);
                if ($data) {
                    return [
                        'success' => true,
                        'model' => self::getModel(),
                        'data' => $data
                    ];
                }
            }
        }

        return ['success' => false, 'error' => $result['error'] ?? 'KI-Antwort konnte nicht verarbeitet werden'];
    }

    /**
     * Translate text using configured AI provider
     */
    public static function translate(string $text, string $targetLang = 'en'): array
    {
        $apiKey = self::getApiKey();
        if (!$apiKey) {
            return ['success' => false, 'error' => 'API Key nicht konfiguriert'];
        }

        $sourceLang = $targetLang === 'en' ? 'Deutsch' : 'English';
        $targetLangName = $targetLang === 'en' ? 'English' : 'Deutsch';

        $prompt = "Übersetze folgenden Text von {$sourceLang} nach {$targetLangName}. "
            . "Gib NUR die Übersetzung zurück, ohne zusätzliche Erklärungen:\n\n{$text}";

        $result = self::prompt($prompt, $apiKey);

        if (!isset($result['error'])) {
            $translation = self::extractText($result, self::getProvider());
            return [
                'success' => true,
                'model' => self::getModel(),
                'translation' => trim($translation)
            ];
        }

        return ['success' => false, 'error' => $result['error'] ?? 'Übersetzung fehlgeschlagen'];
    }

    /**
     * Send prompt to configured provider (with fallback for Gemini)
     */
    private static function prompt(string $prompt, string $apiKey): array
    {
        $provider = self::getProvider();

        if ($provider === 'mistral') {
            $model = self::getModel();
            return self::mistralRequest($prompt, $model, $apiKey);
        }

        // Gemini: try configured model first, then fallback
        $configuredModel = self::getModel();
        $models = array_unique(array_merge([$configuredModel], self::GEMINI_MODELS));

        foreach ($models as $model) {
            $result = self::generateGeminiContent($model, $prompt, $apiKey);
            if (!isset($result['error'])) {
                return $result;
            }
        }

        return ['error' => 'Alle Modelle sind derzeit nicht verfügbar'];
    }

    /**
     * Extract text from API response
     */
    private static function extractText(array $result, string $provider): string
    {
        if ($provider === 'mistral') {
            return $result['choices'][0]['message']['content'] ?? '';
        }
        return $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    /**
     * Generate content using Gemini
     */
    private static function generateGeminiContent(string $model, string $prompt, string $apiKey): array
    {
        $url = self::GEMINI_API_BASE . $model . ':generateContent?key=' . urlencode($apiKey);

        $data = [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
            ]
        ];

        return self::makeRequest($url, $data);
    }

    // Keep old method name for compatibility
    private static function generateContent(string $model, string $prompt, string $apiKey): array
    {
        return self::generateGeminiContent($model, $prompt, $apiKey);
    }

    /**
     * Send request to Mistral API
     */
    private static function mistralRequest(string $prompt, string $model, string $apiKey): array
    {
        $data = [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 2048,
        ];

        return self::makeRequest(self::MISTRAL_API_BASE, $data, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
    }

    /**
     * Make HTTP request
     */
    private static function makeRequest(string $url, array $data, array $headers = null): array
    {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers ?? ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            return ['error' => 'cURL Error: ' . $error];
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200) {
            $errorMessage = $result['error']['message'] ?? $result['message'] ?? 'Unbekannter Fehler (HTTP ' . $httpCode . ')';
            return ['error' => $errorMessage];
        }

        return $result;
    }
}
