<?php
/**
 * AI Helper Class for Google Gemini API Integration
 * Software Hub - PHP Version
 */

class AIHelper
{
    private string $apiKey;
    private string $model;
    private string $provider;
    private array $availableModels = [
        'gemini' => [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ],
        'mistral' => [
            'mistral-small-latest',
            'mistral-medium-latest',
            'mistral-large-latest'
        ]
    ];

    public function __construct(string $apiKey, string $model = 'gemini-1.5-flash', string $provider = 'gemini')
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
        $this->provider = $provider;
    }

    /**
     * Test if API key is valid
     * @return array ['valid' => bool, 'error' => string|null]
     */
    public function testApiKey(): array
    {
        try {
            $result = $this->generateContent('Test', 10);
            return ['valid' => !empty($result), 'error' => null];
        } catch (Exception $e) {
            return ['valid' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Generate content using AI API (supports Gemini and Mistral)
     */
    public function generateContent(string $prompt, int $maxWords = 100): string
    {
        if ($this->provider === 'mistral') {
            return $this->generateContentMistral($prompt, $maxWords);
        }

        return $this->generateContentGemini($prompt, $maxWords);
    }

    /**
     * Generate content using Gemini API with cURL
     */
    private function generateContentGemini(string $prompt, int $maxWords = 100): string
    {
        $url = "https://generativelanguage.googleapis.com/v1/models/{$this->model}:generateContent?key={$this->apiKey}";

        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => $maxWords * 2,
                'topP' => 0.95,
                'topK' => 40
            ]
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("CURL error: $error");
        }

        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['error']['message'] ?? 'Unknown error';
            throw new Exception("API error ($httpCode): $errorMessage");
        }

        $result = json_decode($response, true);

        if (empty($result['candidates'][0]['content']['parts'][0]['text'])) {
            throw new Exception('No content generated');
        }

        return trim($result['candidates'][0]['content']['parts'][0]['text']);
    }

    /**
     * Generate content using Mistral API with cURL
     */
    private function generateContentMistral(string $prompt, int $maxWords = 100): string
    {
        $url = "https://api.mistral.ai/v1/chat/completions";

        $data = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.7,
            'max_tokens' => $maxWords * 2,
            'top_p' => 0.95
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey
            ],
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("CURL error: $error");
        }

        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['error']['message'] ?? $errorData['message'] ?? 'Unknown error';
            throw new Exception("API error ($httpCode): $errorMessage");
        }

        $result = json_decode($response, true);

        if (empty($result['choices'][0]['message']['content'])) {
            throw new Exception('No content generated');
        }

        return trim($result['choices'][0]['message']['content']);
    }

    /**
     * Generate software description
     */
    public function generateDescription(string $softwareName, int $maxWords = 100, string $language = 'de'): string
    {
        if ($language === 'en') {
            $prompt = "Create a professional, informative description for the software '$softwareName' in English. "
                . "The description should be about $maxWords words and cover the following aspects: "
                . "Main features, use cases, advantages. "
                . "Use a factual, professional tone. "
                . "Start directly with the description without title or heading.";
        } else {
            $prompt = "Erstelle eine professionelle, informative Beschreibung für die Software '$softwareName' auf Deutsch. "
                . "Die Beschreibung soll etwa $maxWords Wörter umfassen und folgende Aspekte abdecken: "
                . "Hauptfunktionen, Einsatzgebiete, Vorteile. "
                . "Verwende einen sachlichen, professionellen Ton. "
                . "Beginne direkt mit der Beschreibung ohne Titel oder Überschrift.";
        }

        return $this->generateContent($prompt, $maxWords);
    }

    /**
     * Generate short description
     */
    public function generateShortDescription(string $softwareName, int $maxWords = 20, string $language = 'de'): string
    {
        if ($language === 'en') {
            $prompt = "Create a concise short description for the software '$softwareName' in English. "
                . "The description should be at most $maxWords words and no more than 150 characters. "
                . "Summarize in one sentence what the software does. "
                . "No heading, just the description text.";
        } else {
            $prompt = "Erstelle eine prägnante Kurzbeschreibung für die Software '$softwareName' auf Deutsch. "
                . "Die Beschreibung soll maximal $maxWords Wörter und höchstens 150 Zeichen umfassen. "
                . "Fasse in einem Satz zusammen, was die Software macht. "
                . "Keine Überschrift, direkt der Beschreibungstext.";
        }

        return $this->generateContent($prompt, $maxWords);
    }

    /**
     * Generate features list
     */
    public function generateFeatures(string $softwareName, string $language = 'de'): string
    {
        if ($language === 'en') {
            $prompt = "List the most important features of the software '$softwareName' in English. "
                . "Return 5-7 main features as a list. "
                . "Each feature should be described concisely in 5-10 words. "
                . "Use bullet points (•) or line breaks for separation.";
        } else {
            $prompt = "Liste die wichtigsten Funktionen der Software '$softwareName' auf Deutsch auf. "
                . "Gib 5-7 Hauptfunktionen als Aufzählung zurück. "
                . "Jede Funktion soll prägnant in 5-10 Wörtern beschrieben werden. "
                . "Verwende Bullet Points (•) oder Zeilenumbrüche zur Trennung.";
        }

        return $this->generateContent($prompt, 150);
    }

    /**
     * Generate alternatives
     */
    public function generateAlternatives(string $softwareName, int $count = 5, string $language = 'de'): string
    {
        $langPrompt = $language === 'en' ? 'in English' : 'auf Deutsch';

        $prompt = "Nenne $count alternative Softwareprodukte zu '$softwareName' $langPrompt. "
            . "Liste nur die Namen der Alternativen auf, getrennt durch Kommas oder Zeilenumbrüche. "
            . "Keine Beschreibungen, nur die Namen.";

        return $this->generateContent($prompt, $count * 5);
    }

    /**
     * Generate software URL
     */
    public function generateUrl(string $softwareName): ?string
    {
        $prompt = "What is the official website URL for the software '$softwareName'? "
            . "Respond ONLY with the URL, nothing else. "
            . "If the software has an official website, provide it. "
            . "If unsure, leave blank. "
            . "Examples: https://obsproject.com, https://www.mozilla.org/firefox";

        try {
            $url = trim($this->generateContent($prompt, 30));
            // Validate URL format
            if (filter_var($url, FILTER_VALIDATE_URL)) {
                // Follow redirects to get the final URL
                $finalUrl = $this->followRedirects($url);
                return $finalUrl ?: $url; // Return final URL or original if following fails
            }
            return null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Follow redirects and return the final URL
     * Returns the final URL after all redirects (301, 302, etc.)
     */
    private function followRedirects(string $url): ?string
    {
        try {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                CURLOPT_NOBODY => true // HEAD request only, no body needed
            ]);

            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            curl_close($ch);

            // Only return the final URL if we got a successful response
            if ($httpCode >= 200 && $httpCode < 400 && !empty($finalUrl)) {
                return $finalUrl;
            }

            return null;
        } catch (Exception $e) {
            error_log("Redirect following error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate English name
     */
    public function generateEnglishName(string $germanName): string
    {
        $prompt = "What is the English name/spelling for the software '$germanName'? "
            . "Respond ONLY with the English name, nothing else. "
            . "If the name is the same in English, just return the same name. "
            . "Examples: 'Tabellenkalkulation' -> 'Spreadsheet', 'Firefox' -> 'Firefox'";

        try {
            return trim($this->generateContent($prompt, 10));
        } catch (Exception $e) {
            return $germanName; // Fallback to original name
        }
    }

    /**
     * Classify software types
     * Returns array of types: WEB, DESKTOP, MOBILE
     */
    public function classifyTypes(string $softwareName): array
    {
        $prompt = "For the software '$softwareName', determine which platform types it supports. "
            . "Respond with a comma-separated list containing ONLY these values: WEB, DESKTOP, MOBILE. "
            . "Include only the types that apply. "
            . "Examples: "
            . "'Google Chrome' -> 'WEB,DESKTOP,MOBILE' (browser available on all platforms), "
            . "'Microsoft Word' -> 'DESKTOP,MOBILE' (not a web app), "
            . "'Gmail' -> 'WEB,MOBILE' (web-based email with mobile app), "
            . "'Instagram' -> 'WEB,MOBILE' (primarily mobile but has web access). "
            . "Respond ONLY with the comma-separated types, nothing else.";

        try {
            $result = trim($this->generateContent($prompt, 20));
            $types = array_map('trim', explode(',', strtoupper($result)));
            // Filter to valid types only
            $validTypes = ['WEB', 'DESKTOP', 'MOBILE'];
            return array_values(array_intersect($types, $validTypes));
        } catch (Exception $e) {
            error_log("Type classification error: " . $e->getMessage());
            return []; // Fallback to empty array
        }
    }

    /**
     * Classify software categories
     * Returns array of category IDs based on available categories
     */
    public function classifyCategories(string $softwareName, array $availableCategories): array
    {
        if (empty($availableCategories)) {
            return [];
        }

        $categoryList = array_map(function($cat) {
            return $cat['id'] . ':' . $cat['name'];
        }, $availableCategories);
        $categoryListStr = implode(', ', $categoryList);

        $prompt = "For the software '$softwareName', select the most appropriate categories from this list: "
            . "$categoryListStr. "
            . "Respond with ONLY the category IDs (the text before the colon), comma-separated. "
            . "Select 1-3 most relevant categories. "
            . "Examples: "
            . "If the list contains 'cat_office:Office', 'cat_comm:Communication', 'cat_graphics:Graphics' and software is 'Microsoft Word', respond: 'cat_office' "
            . "If the list contains 'cat_office:Office', 'cat_comm:Communication', 'cat_graphics:Graphics' and software is 'Zoom', respond: 'cat_comm' "
            . "Respond ONLY with comma-separated IDs, nothing else.";

        try {
            $result = trim($this->generateContent($prompt, 20));
            $ids = array_map('trim', explode(',', $result));
            // Filter to valid category IDs only
            $validIds = array_column($availableCategories, 'id');
            return array_values(array_intersect($ids, $validIds));
        } catch (Exception $e) {
            error_log("Category classification error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Classify target groups
     * Returns array of target group IDs based on available target groups
     */
    public function classifyTargetGroups(string $softwareName, array $availableTargetGroups): array
    {
        if (empty($availableTargetGroups)) {
            return [];
        }

        $targetGroupList = array_map(function($tg) {
            return $tg['id'] . ':' . $tg['name'];
        }, $availableTargetGroups);
        $targetGroupListStr = implode(', ', $targetGroupList);

        $prompt = "For the software '$softwareName', select the most appropriate target groups from this list: "
            . "$targetGroupListStr. "
            . "Respond with ONLY the target group IDs (the text before the colon), comma-separated. "
            . "Select all relevant target groups. "
            . "Examples: "
            . "If the list contains 'tg_students:Students', 'tg_teachers:Teachers', 'tg_devs:Developers' and software is 'Visual Studio Code', respond: 'tg_devs' "
            . "If the list contains 'tg_students:Students', 'tg_teachers:Teachers', 'tg_devs:Developers' and software is 'Microsoft Teams', respond: 'tg_students,tg_teachers,tg_devs' "
            . "Respond ONLY with comma-separated IDs, nothing else.";

        try {
            $result = trim($this->generateContent($prompt, 20));
            $ids = array_map('trim', explode(',', $result));
            // Filter to valid target group IDs only
            $validIds = array_column($availableTargetGroups, 'id');
            return array_values(array_intersect($ids, $validIds));
        } catch (Exception $e) {
            error_log("Target group classification error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch and save favicon from URL
     */
    public function fetchAndSaveFavicon(string $url, string $softwareName): ?string
    {
        try {
            error_log("fetchAndSaveFavicon called for: $url");

            // Parse domain from URL
            $domain = parse_url($url, PHP_URL_HOST);
            if (!$domain) {
                error_log("Failed to parse domain from URL: $url");
                return null;
            }

            error_log("Parsed domain: $domain");

            // Use Google's Favicon Service (high quality, 128x128)
            $faviconUrl = "https://www.google.com/s2/favicons?domain={$domain}&sz=128";

            // Fetch favicon
            $ch = curl_init($faviconUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (Software Hub)'
            ]);

            $imageData = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);

            error_log("Favicon fetch: HTTP $httpCode, Content-Type: $contentType, Size: " . strlen($imageData) . " bytes");

            if ($httpCode !== 200 || empty($imageData)) {
                error_log("Failed to fetch favicon: HTTP $httpCode, empty: " . (empty($imageData) ? 'yes' : 'no'));
                return null;
            }

            // Determine file extension from content type
            $extension = 'png'; // Default
            if (strpos($contentType, 'image/jpeg') !== false) {
                $extension = 'jpg';
            } elseif (strpos($contentType, 'image/svg') !== false) {
                $extension = 'svg';
            } elseif (strpos($contentType, 'image/ico') !== false || strpos($contentType, 'image/x-icon') !== false) {
                $extension = 'ico';
            }

            // Generate safe filename
            $safeFilename = preg_replace('/[^a-zA-Z0-9-_]/', '-', strtolower($softwareName));
            $filename = 'logo-' . $safeFilename . '-' . time() . '.' . $extension;

            // Ensure uploads directory exists
            $uploadsDir = __DIR__ . '/../uploads';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0755, true);
            }

            // Save file
            $filepath = $uploadsDir . '/' . $filename;
            $bytesWritten = file_put_contents($filepath, $imageData);
            if ($bytesWritten === false) {
                error_log("Failed to save favicon to: $filepath");
                return null;
            }

            error_log("Favicon saved successfully: $filepath ($bytesWritten bytes)");

            // Return relative path for database (with leading slash for absolute web path)
            $relativePath = '/uploads/' . $filename;
            error_log("Returning relative path: $relativePath");
            return $relativePath;
        } catch (Exception $e) {
            error_log("Favicon fetch error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate all content at once
     */
    public function generateAllContent(
        string $softwareName,
        int $descriptionWords = 100,
        int $shortDescriptionWords = 20,
        int $alternativesCount = 5,
        string $language = 'de'
    ): array {
        $result = [
            'description' => $this->generateDescription($softwareName, $descriptionWords, $language),
            'short_description' => $this->generateShortDescription($softwareName, $shortDescriptionWords, $language),
            'features' => $this->generateFeatures($softwareName, $language),
            'alternatives' => $this->generateAlternatives($softwareName, $alternativesCount, $language)
        ];

        // Generate English name and URL only for German language (to avoid duplication)
        if ($language === 'de') {
            $url = $this->generateUrl($softwareName);
            if ($url) {
                $result['url'] = $url;

                // Try to fetch favicon if URL was found
                $logo = $this->fetchAndSaveFavicon($url, $softwareName);
                if ($logo) {
                    $result['logo'] = $logo;
                }
            }

            $result['name_en'] = $this->generateEnglishName($softwareName);
        }

        return $result;
    }

    /**
     * Try operation with model fallback
     */
    public function tryWithFallback(callable $operation)
    {
        $lastException = null;
        $models = $this->availableModels[$this->provider] ?? [];

        foreach ($models as $model) {
            try {
                $this->model = $model;
                return $operation();
            } catch (Exception $e) {
                $lastException = $e;
                continue;
            }
        }

        throw new Exception('All models failed. Last error: ' . $lastException->getMessage());
    }
}
