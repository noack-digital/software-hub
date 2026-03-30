<?php
/**
 * Generate all AI content at once
 * POST /api/ai/generate-all.php
 */

require_once __DIR__ . '/../../includes/init.php';
require_once __DIR__ . '/../../includes/AIHelper.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

requireCsrf();

// Login required
if (!Auth::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $softwareName = $input['softwareName'] ?? '';
    $language = $input['language'] ?? 'de';
    $includeClassification = $input['includeClassification'] ?? false;
    $availableCategories = $input['categories'] ?? [];
    $availableTargetGroups = $input['targetGroups'] ?? [];

    if (empty($softwareName)) {
        throw new Exception('Software name is required');
    }

    // Get AI provider settings
    $provider = getSetting('AI_PROVIDER', 'gemini');
    $apiKey = null;
    $model = null;

    if ($provider === 'mistral') {
        $apiKey = getSetting('MISTRAL_API_KEY');
        $model = getSetting('MISTRAL_MODEL', 'mistral-small-latest');
        if (empty($apiKey)) {
            throw new Exception('Mistral API key not configured. Please configure it in AI Settings.');
        }
    } else {
        $apiKey = getSetting('GOOGLE_GEMINI_API_KEY');
        $model = getSetting('GEMINI_MODEL', 'gemini-1.5-flash');
        if (empty($apiKey)) {
            throw new Exception('Google Gemini API key not configured. Please configure it in AI Settings.');
        }
    }

    $descriptionWords = (int) (getSetting('AI_DESCRIPTION_WORDS') ?? 100);
    $shortDescriptionWords = (int) (getSetting('AI_SHORT_DESCRIPTION_WORDS') ?? 20);
    $alternativesCount = (int) (getSetting('AI_ALTERNATIVES_COUNT') ?? 5);

    // Initialize AI helper
    $ai = new AIHelper($apiKey, $model, $provider);

    // Generate content with fallback
    $content = $ai->tryWithFallback(function() use ($ai, $softwareName, $descriptionWords, $shortDescriptionWords, $alternativesCount, $language) {
        return $ai->generateAllContent(
            $softwareName,
            $descriptionWords,
            $shortDescriptionWords,
            $alternativesCount,
            $language
        );
    });

    // Add classification if requested (only for German to avoid duplication)
    if ($includeClassification && $language === 'de') {
        try {
            // Classify types
            $content['types'] = $ai->classifyTypes($softwareName);

            // Classify categories
            if (!empty($availableCategories)) {
                $content['categories'] = $ai->classifyCategories($softwareName, $availableCategories);
            }

            // Classify target groups
            if (!empty($availableTargetGroups)) {
                $content['target_groups'] = $ai->classifyTargetGroups($softwareName, $availableTargetGroups);
            }
        } catch (Exception $e) {
            error_log("Classification error: " . $e->getMessage());
            // Continue without classification if it fails
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $content
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
