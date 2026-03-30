<?php
/**
 * Import API Endpoint
 * Import software from CSV file
 */

declare(strict_types=1);

// Start output buffering to catch any errors
ob_start();

require_once __DIR__ . '/../includes/init.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

// Clean any output that might have occurred
ob_end_clean();

// Start new output buffer for the actual response
ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

requireCsrf();

/**
 * Parse CSV with proper quote handling
 */
function parseCSVLine(string $line): array
{
    $fields = [];
    $field = '';
    $inQuotes = false;
    $length = strlen($line);

    for ($i = 0; $i < $length; $i++) {
        $char = $line[$i];
        $nextChar = $i + 1 < $length ? $line[$i + 1] : null;

        if ($char === '"') {
            if ($inQuotes && $nextChar === '"') {
                // Escaped quote
                $field .= '"';
                $i++; // Skip next quote
            } else {
                // Toggle quote state
                $inQuotes = !$inQuotes;
            }
        } elseif ($char === ',' && !$inQuotes) {
            // End of field
            $fields[] = trim($field);
            $field = '';
        } else {
            // Regular character
            $field .= $char;
        }
    }

    // Add last field
    $fields[] = trim($field);

    return $fields;
}

/**
 * Parse entire CSV content
 */
function parseCSV(string $content): array
{
    $lines = explode("\n", $content);
    $data = [];
    $headers = null;
    $inQuotes = false;
    $currentLine = '';

    foreach ($lines as $line) {
        $line = rtrim($line, "\r");

        // Handle multi-line fields (fields with newlines inside quotes)
        $currentLine .= ($currentLine ? "\n" : '') . $line;

        // Count quotes to determine if we're inside a quoted field
        $quoteCount = substr_count($currentLine, '"') - substr_count($currentLine, '""') * 2;
        if ($quoteCount % 2 !== 0) {
            // Odd number of quotes, we're inside a quoted field
            continue;
        }

        // Process complete line
        $fields = parseCSVLine($currentLine);
        $currentLine = '';

        // Skip empty lines
        if (empty($fields) || (count($fields) === 1 && trim($fields[0]) === '')) {
            continue;
        }

        if ($headers === null) {
            // First non-empty line is headers
            $headers = array_map('trim', $fields);
        } else {
            // Data row
            $row = [];
            foreach ($headers as $index => $header) {
                $row[$header] = $fields[$index] ?? '';
            }
            $data[] = $row;
        }
    }

    return $data;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['file'])) {
            jsonError('Keine Datei hochgeladen');
        }

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonError('Fehler beim Datei-Upload');
        }

        // Determine format from file extension or POST parameter
        $format = $_POST['format'] ?? '';
        $fileName = $file['name'] ?? '';
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        // Auto-detect format if not specified
        if (empty($format)) {
            if (in_array($fileExtension, ['xlsx', 'xls'])) {
                $format = 'xlsx';
            } else {
                $format = 'csv';
            }
        }

        // Parse file based on format
        if ($format === 'xlsx') {
            // Parse Excel file
            $spreadsheet = IOFactory::load($file['tmp_name']);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (empty($rows)) {
                jsonError('Keine Daten zum Importieren gefunden');
            }

            // First row is headers
            $headers = array_shift($rows);
            $data = [];

            foreach ($rows as $row) {
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                $rowData = [];
                foreach ($headers as $index => $header) {
                    $rowData[$header] = $row[$index] ?? '';
                }
                $data[] = $rowData;
            }
        } else {
            // Parse CSV file
            $content = file_get_contents($file['tmp_name']);

            // Remove BOM if present
            $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);

            // Parse CSV
            $data = parseCSV($content);
        }

        if (empty($data)) {
            jsonError('Keine Daten zum Importieren gefunden');
        }

        // Load all categories and target groups for mapping
        $db = Database::getInstance();

        $categoriesStmt = $db->query("SELECT id, name FROM categories");
        $categories = $categoriesStmt->fetchAll(PDO::FETCH_ASSOC);
        $categoryMap = [];
        foreach ($categories as $cat) {
            $categoryMap[strtolower(trim($cat['name']))] = $cat['id'];
        }

        $targetGroupsStmt = $db->query("SELECT id, name FROM target_groups");
        $targetGroups = $targetGroupsStmt->fetchAll(PDO::FETCH_ASSOC);
        $targetGroupMap = [];
        foreach ($targetGroups as $tg) {
            $targetGroupMap[strtolower(trim($tg['name']))] = $tg['id'];
        }

        // First pass: Collect all unique categories and target groups from import data
        $missingCategories = [];
        $missingTargetGroups = [];

        foreach ($data as $row) {
            // Kategorien: Kategorien, categories oder Tools-Apps "Kategorie"
            $categoriesValue = $row['Kategorien'] ?? $row['categories'] ?? $row['Kategorie'] ?? '';
            if (!empty($categoriesValue)) {
                $categoryNames = array_map('trim', explode(',', $categoriesValue));
                foreach ($categoryNames as $catName) {
                    if (empty($catName)) continue;
                    $catKey = strtolower($catName);
                    if (!isset($categoryMap[$catKey]) && !in_array($catName, $missingCategories)) {
                        $missingCategories[] = $catName;
                    }
                }
            }

            // Zielgruppen: Zielgruppen, targetGroups oder Tools-Apps "Für wen?"
            $targetGroupsValue = $row['Zielgruppen'] ?? $row['targetGroups'] ?? $row['Für wen?'] ?? '';
            if (!empty($targetGroupsValue)) {
                $tgNames = array_map('trim', explode(',', $targetGroupsValue));
                foreach ($tgNames as $tgName) {
                    if (empty($tgName)) continue;
                    $tgKey = strtolower($tgName);
                    if (!isset($targetGroupMap[$tgKey]) && !in_array($tgName, $missingTargetGroups)) {
                        $missingTargetGroups[] = $tgName;
                    }
                }
            }
        }

        // If there are missing items and no confirmation yet, ask for confirmation
        $confirmed = isset($_POST['confirmed']) && $_POST['confirmed'] === 'true';

        if ((count($missingCategories) > 0 || count($missingTargetGroups) > 0) && !$confirmed) {
            jsonResponse([
                'needsConfirmation' => true,
                'missingCategories' => $missingCategories,
                'missingTargetGroups' => $missingTargetGroups,
                'totalEntries' => count($data),
                'message' => 'Einige Kategorien und/oder Zielgruppen existieren noch nicht. Sollen diese automatisch angelegt werden?'
            ]);
            exit;
        }

        // If confirmed, create missing categories and target groups
        if ($confirmed) {
            foreach ($missingCategories as $catName) {
                try {
                    $id = Database::generateId();
                    $stmt = $db->prepare("INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
                    $stmt->execute([$id, $catName]);
                    $categoryMap[strtolower($catName)] = $id;
                    error_log("Created category: $catName");
                } catch (PDOException $e) {
                    error_log("Error creating category $catName: " . $e->getMessage());
                }
            }

            foreach ($missingTargetGroups as $tgName) {
                try {
                    $id = Database::generateId();
                    $stmt = $db->prepare("INSERT INTO target_groups (id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
                    $stmt->execute([$id, $tgName]);
                    $targetGroupMap[strtolower($tgName)] = $id;
                    error_log("Created target group: $tgName");
                } catch (PDOException $e) {
                    error_log("Error creating target group $tgName: " . $e->getMessage());
                }
            }
        }

        // Import data
        $imported = 0;
        $errors = [];
        $software = new Software();

        foreach ($data as $index => $row) {
            $lineNum = $index + 2; // +1 for header, +1 for 1-based indexing

            try {
                // Map German column names to English (for template compatibility)
                $normalizedRow = [];
                foreach ($row as $key => $value) {
                    $normalizedKey = trim($key);
                    // Remove asterisks from headers
                    $normalizedKey = str_replace('*', '', $normalizedKey);
                    $normalizedKey = trim($normalizedKey);

                    // Map German headers to expected field names (inkl. Tools-Apps Excel)
                    $keyMap = [
                        'ID' => 'id',
                        'Name' => 'name',
                        'Toolname' => 'name',
                        'Name (EN)' => 'nameEn',
                        'Kurzbeschreibung' => 'shortDescription',
                        'Kurzbeschreibung- 180 Zeichen' => 'shortDescription',
                        'Kurzbeschreibung (EN)' => 'shortDescriptionEn',
                        'Beschreibung' => 'description',
                        'Informationen zum Tool - möglichst kurz halten' => 'description',
                        'Informationen zum Tool - möglichst kurz halten ' => 'description',
                        'Beschreibung (EN)' => 'descriptionEn',
                        'Funktionen' => 'features',
                        'Funktionen (EN)' => 'featuresEn',
                        'URL' => 'url',
                        'Webseite' => 'url',
                        'Logo-Pfad' => 'logo',
                        'Typ (Web)' => 'typeWeb',
                        'Typ (Desktop)' => 'typeDesktop',
                        'Typ (Mobile)' => 'typeMobile',
                        'Programmtyp' => 'programmtyp',
                        'Datenschutz-Status' => 'dataPrivacyStatus',
                        'Inhouse' => 'inhouseHosted',
                        'Kategorien' => 'categories',
                        'Kategorie' => 'categories',
                        'Zielgruppen' => 'targetGroups',
                        'Für wen?' => 'targetGroups',
                        'Kosten' => 'costs',
                        'Anleitungen' => 'tutorials',
                        'Zusätzliche Informationen (Zugang)' => 'accessInfo',
                        'Wie kann ich es nutzen (Zugang)?' => 'accessInfo'
                    ];

                    $mappedKey = $keyMap[$normalizedKey] ?? $normalizedKey;
                    $normalizedRow[$mappedKey] = $value;
                }

                // Use normalized row for processing
                $row = $normalizedRow;

                // Validate required fields
                if (empty($row['name'])) {
                    $errors[] = "Zeile {$lineNum}: Name ist erforderlich";
                    continue;
                }

                // Parse available field
                $available = in_array(strtolower(trim($row['available'] ?? 'nein')), ['ja', 'true', '1', 'yes']);

                // Parse inhouse hosted field
                $inhouseHosted = in_array(strtolower(trim($row['inhouseHosted'] ?? 'nein')), ['ja', 'true', '1', 'yes']);

                // Parse types: Typ (Web/Desktop/Mobile) oder Programmtyp (Tools-Apps: Webbasiert, Desktop, Mobile)
                $types = [];
                if (isset($row['typeWeb']) && strtoupper(trim($row['typeWeb'])) === 'JA') {
                    $types[] = 'Web';
                }
                if (isset($row['typeDesktop']) && strtoupper(trim($row['typeDesktop'])) === 'JA') {
                    $types[] = 'Desktop';
                }
                if (isset($row['typeMobile']) && strtoupper(trim($row['typeMobile'])) === 'JA') {
                    $types[] = 'Mobile';
                }
                if (empty($types) && !empty($row['programmtyp'])) {
                    $raw = trim($row['programmtyp']);
                    $programmtypMap = ['webbasiert' => 'Web', 'web' => 'Web', 'desktop' => 'Desktop', 'mobile' => 'Mobile'];
                    foreach (array_map('trim', explode(',', $raw)) as $t) {
                        $key = strtolower($t);
                        if (isset($programmtypMap[$key]) && !in_array($programmtypMap[$key], $types)) {
                            $types[] = $programmtypMap[$key];
                        }
                    }
                }
                if (empty($types) && !empty($row['types'])) {
                    $types = array_map('trim', explode(',', $row['types']));
                    $types = array_filter($types);
                }

                // Map category names to IDs
                $categoryIds = [];
                if (!empty($row['categories'])) {
                    $categoryNames = array_map('trim', explode(',', $row['categories']));
                    foreach ($categoryNames as $catName) {
                        $catKey = strtolower($catName);
                        if (isset($categoryMap[$catKey])) {
                            $categoryIds[] = $categoryMap[$catKey];
                        }
                    }
                }

                // Map target group names to IDs
                $targetGroupIds = [];
                if (!empty($row['targetGroups'])) {
                    $tgNames = array_map('trim', explode(',', $row['targetGroups']));
                    foreach ($tgNames as $tgName) {
                        $tgKey = strtolower($tgName);
                        if (isset($targetGroupMap[$tgKey])) {
                            $targetGroupIds[] = $targetGroupMap[$tgKey];
                        }
                    }
                }

                // Kosten normalisieren (kostenlos/kostenpflichtig, kurz halten)
                $costs = trim($row['costs'] ?? '');
                if ($costs === '') {
                    $costs = 'kostenlos';
                } else {
                    $lowerCosts = mb_strtolower($costs);
                    if (str_contains($lowerCosts, 'kostenlos')) {
                        $costs = 'kostenlos';
                    } elseif (str_contains($lowerCosts, 'kostenpflichtig')) {
                        $costs = 'kostenpflichtig';
                    }
                    // Sicherheitshalber auf Feldlänge kürzen
                    $costs = mb_substr($costs, 0, 100);
                }

                // Prepare data for creation
                $softwareData = [
                    'name' => $row['name'],
                    'short_description' => $row['shortDescription'] ?? '',
                    'description' => $row['description'] ?? '',
                    'url' => $row['url'] ?? '',
                    'logo' => $row['logo'] ?? '',
                    'types' => $types,
                    'costs' => $costs,
                    'cost_model' => $row['cost_model'] ?? $row['costModel'] ?? null,
                    'cost_price' => $row['cost_price'] ?? $row['costPrice'] ?? null,
                    'tutorials' => $row['tutorials'] ?? null,
                    'access_info' => $row['accessInfo'] ?? null,
                    'available' => $available,
                    'name_en' => $row['nameEn'] ?? '',
                    'short_description_en' => $row['shortDescriptionEn'] ?? '',
                    'description_en' => $row['descriptionEn'] ?? '',
                    'features' => $row['features'] ?? '',
                    'alternatives' => $row['alternatives'] ?? '',
                    'notes' => $row['notes'] ?? '',
                    'features_en' => $row['featuresEn'] ?? '',
                    'alternatives_en' => $row['alternativesEn'] ?? '',
                    'notes_en' => $row['notesEn'] ?? '',
                    'data_privacy_status' => $row['dataPrivacyStatus'] ?? 'EU_HOSTED',
                    'inhouse_hosted' => $inhouseHosted,
                    'categories' => $categoryIds,
                    'targetGroups' => $targetGroupIds
                ];

                // Existierenden Eintrag anhand Name finden (verhindert Duplikate bei erneutem Import)
                $existingId = $software->getIdByName($row['name']);
                if ($existingId) {
                    $software->update($existingId, $softwareData);
                } elseif (!empty($row['id']) && is_string($row['id']) && $software->getById($row['id'])) {
                    $software->update($row['id'], $softwareData);
                } else {
                    $software->create($softwareData);
                }
                $imported++;
            } catch (Exception $e) {
                $errors[] = "Zeile {$lineNum}: " . $e->getMessage();
            }
        }

        // Log audit
        logAudit('IMPORT', 'Software', $format, [
            'total' => count($data),
            'imported' => $imported,
            'errors' => count($errors)
        ]);

        jsonResponse([
            'success' => true,
            'imported' => $imported,
            'total' => count($data),
            'errors' => $errors
        ]);
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Import API Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());

    // Ensure clean output
    if (ob_get_length()) ob_end_clean();

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Serverfehler: ' . $e->getMessage(),
        'imported' => 0,
        'total' => 0,
        'errors' => [$e->getMessage()]
    ]);
    exit;
} catch (Throwable $e) {
    error_log("Import API Fatal Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());

    // Ensure clean output
    if (ob_get_length()) ob_end_clean();

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Kritischer Fehler: ' . $e->getMessage(),
        'imported' => 0,
        'total' => 0,
        'errors' => [$e->getMessage()]
    ]);
    exit;
}
