<?php
/**
 * Test AI Classification
 * This script tests the AI classification functionality
 */

require_once __DIR__ . '/includes/init.php';
require_once __DIR__ . '/includes/AIHelper.php';

// Login required
if (!Auth::isLoggedIn()) {
    die('Please login first at <a href="/admin/">Admin Panel</a>');
}

// Get categories and target groups
$categoryModel = new Category();
$targetGroupModel = new TargetGroup();

$categories = $categoryModel->getAll();
$targetGroups = $targetGroupModel->getAll();

// Test software name
$testSoftware = $_GET['software'] ?? 'Visual Studio Code';

// Get AI settings
$provider = getSetting('AI_PROVIDER', 'gemini');
$apiKey = null;
$model = null;

if ($provider === 'mistral') {
    $apiKey = getSetting('MISTRAL_API_KEY');
    $model = getSetting('MISTRAL_MODEL', 'mistral-small-latest');
} else {
    $apiKey = getSetting('GOOGLE_GEMINI_API_KEY');
    $model = getSetting('GEMINI_MODEL', 'gemini-1.5-flash');
}

if (empty($apiKey)) {
    die('No API key configured. Please configure it in AI Settings.');
}

$ai = new AIHelper($apiKey, $model, $provider);

echo "<h1>AI Classification Test</h1>";
echo "<p>Testing with software: <strong>" . htmlspecialchars($testSoftware) . "</strong></p>";
echo "<p>Change software: <a href='?software=Microsoft Word'>Microsoft Word</a> | <a href='?software=Gmail'>Gmail</a> | <a href='?software=Photoshop'>Photoshop</a></p>";
echo "<hr>";

try {
    // Test type classification
    echo "<h2>Type Classification</h2>";
    $types = $ai->classifyTypes($testSoftware);
    echo "<pre>";
    print_r($types);
    echo "</pre>";

    // Test category classification
    echo "<h2>Category Classification</h2>";
    echo "<p>Available categories:</p>";
    echo "<ul>";
    foreach ($categories as $cat) {
        echo "<li>" . e($cat['id']) . ": " . e($cat['name']) . "</li>";
    }
    echo "</ul>";

    $classifiedCategories = $ai->classifyCategories($testSoftware, $categories);
    echo "<p>AI selected categories:</p>";
    echo "<pre>";
    print_r($classifiedCategories);
    echo "</pre>";

    // Test target group classification
    echo "<h2>Target Group Classification</h2>";
    echo "<p>Available target groups:</p>";
    echo "<ul>";
    foreach ($targetGroups as $tg) {
        echo "<li>" . e($tg['id']) . ": " . e($tg['name']) . "</li>";
    }
    echo "</ul>";

    $classifiedTargetGroups = $ai->classifyTargetGroups($testSoftware, $targetGroups);
    echo "<p>AI selected target groups:</p>";
    echo "<pre>";
    print_r($classifiedTargetGroups);
    echo "</pre>";

} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><a href='/admin/'>Back to Admin Panel</a></p>";
