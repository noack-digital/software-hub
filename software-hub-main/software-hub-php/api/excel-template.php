<?php
/**
 * Excel Template Export API
 * Software Hub - PHP Version
 */

require_once __DIR__ . '/../includes/init.php';
require_once __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

// Check authentication
if (!Auth::isLoggedIn()) {
    http_response_code(401);
    exit('Nicht authentifiziert');
}

$user = Auth::getCurrentUser();
if ($user['role'] !== 'ADMIN') {
    http_response_code(403);
    exit('Keine Berechtigung');
}

try {
    $db = Database::getInstance();

    // Get categories
    $stmt = $db->query("SELECT id, name FROM categories ORDER BY name");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $categoryNames = array_column($categories, 'name');

    // Get target groups
    $stmt = $db->query("SELECT id, name FROM target_groups ORDER BY name");
    $targetGroups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $targetGroupNames = array_column($targetGroups, 'name');

    // Get software data (existing or demo)
    $stmt = $db->query("SELECT COUNT(*) FROM software");
    $count = $stmt->fetchColumn();

    if ($count > 0) {
        // Export existing data
        $stmt = $db->query("
            SELECT
                s.id,
                s.name,
                s.name_en,
                s.short_description,
                s.short_description_en,
                s.description,
                s.description_en,
                s.features,
                s.features_en,
                s.url,
                s.logo,
                s.types,
                s.data_privacy_status,
                s.inhouse_hosted,
                GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') as categories,
                GROUP_CONCAT(DISTINCT tg.name ORDER BY tg.name SEPARATOR ', ') as target_groups
            FROM software s
            LEFT JOIN software_categories sc ON s.id = sc.software_id
            LEFT JOIN categories c ON sc.category_id = c.id
            LEFT JOIN software_target_groups stg ON s.id = stg.software_id
            LEFT JOIN target_groups tg ON stg.target_group_id = tg.id
            GROUP BY s.id
            ORDER BY s.name
        ");
        $softwareData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // Use demo data
        $softwareData = [];
    }

    // Create spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Software');

    // Create hidden sheet for dropdown values
    $dropdownSheet = $spreadsheet->createSheet();
    $dropdownSheet->setTitle('_Dropdown_Values');

    // Add categories to dropdown sheet (column A)
    $dropdownSheet->setCellValue('A1', 'Kategorien');
    foreach ($categoryNames as $index => $catName) {
        $dropdownSheet->setCellValue('A' . ($index + 2), $catName);
    }

    // Add target groups to dropdown sheet (column B)
    $dropdownSheet->setCellValue('B1', 'Zielgruppen');
    foreach ($targetGroupNames as $index => $tgName) {
        $dropdownSheet->setCellValue('B' . ($index + 2), $tgName);
    }

    // Hide the dropdown sheet
    $dropdownSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);

    // Set the main sheet as active
    $spreadsheet->setActiveSheetIndex(0);

    // Define headers
    $headers = [
        'A' => 'ID',
        'B' => 'Name *',
        'C' => 'Name (EN)',
        'D' => 'Kurzbeschreibung',
        'E' => 'Kurzbeschreibung (EN)',
        'F' => 'Beschreibung *',
        'G' => 'Beschreibung (EN)',
        'H' => 'Funktionen',
        'I' => 'Funktionen (EN)',
        'J' => 'URL',
        'K' => 'Logo-Pfad',
        'L' => 'Typ (Web)',
        'M' => 'Typ (Desktop)',
        'N' => 'Typ (Mobile)',
        'O' => 'Datenschutz-Status',
        'P' => 'Inhouse',
        'Q' => 'Kategorien',
        'R' => 'Zielgruppen'
    ];

    // Set headers with styling
    $headerRow = 1;
    foreach ($headers as $col => $header) {
        $cell = $col . $headerRow;
        $sheet->setCellValue($cell, $header);

        // Header styling
        $sheet->getStyle($cell)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0D9488']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);
    }

    // Auto-size columns
    foreach (range('A', 'R') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    // Set minimum widths for important columns
    $sheet->getColumnDimension('B')->setWidth(25); // Name
    $sheet->getColumnDimension('F')->setWidth(40); // Description
    $sheet->getColumnDimension('J')->setWidth(30); // URL
    $sheet->getColumnDimension('Q')->setWidth(30); // Categories
    $sheet->getColumnDimension('R')->setWidth(30); // Target Groups

    // Fill data
    $row = 2;
    foreach ($softwareData as $software) {
        // Parse types JSON
        $types = json_decode($software['types'] ?: '[]', true);
        $hasWeb = in_array('Web', $types);
        $hasDesktop = in_array('Desktop', $types);
        $hasMobile = in_array('Mobile', $types);

        $sheet->setCellValue('A' . $row, $software['id']);
        $sheet->setCellValue('B' . $row, $software['name']);
        $sheet->setCellValue('C' . $row, $software['name_en']);
        $sheet->setCellValue('D' . $row, $software['short_description']);
        $sheet->setCellValue('E' . $row, $software['short_description_en']);
        $sheet->setCellValue('F' . $row, $software['description']);
        $sheet->setCellValue('G' . $row, $software['description_en']);
        $sheet->setCellValue('H' . $row, $software['features']);
        $sheet->setCellValue('I' . $row, $software['features_en']);
        $sheet->setCellValue('J' . $row, $software['url']);
        $sheet->setCellValue('K' . $row, $software['logo']);
        $sheet->setCellValue('L' . $row, $hasWeb ? 'JA' : 'NEIN');
        $sheet->setCellValue('M' . $row, $hasDesktop ? 'JA' : 'NEIN');
        $sheet->setCellValue('N' . $row, $hasMobile ? 'JA' : 'NEIN');
        $sheet->setCellValue('O' . $row, $software['data_privacy_status'] ?: 'EU_HOSTED');
        $sheet->setCellValue('P' . $row, $software['inhouse_hosted'] ? 'JA' : 'NEIN');
        $sheet->setCellValue('Q' . $row, $software['categories']);
        $sheet->setCellValue('R' . $row, $software['target_groups']);

        $row++;
    }

    // Add at least 10 empty rows for new entries
    $emptyRows = max(10, 20 - count($softwareData));
    $endRow = $row + $emptyRows - 1;

    // Apply validation from row 2 (first data row) to include existing and new rows
    $validationStartRow = 2;
    $validationEndRow = $endRow;

    // Add data validation for Type columns (L, M, N)
    foreach (['L', 'M', 'N'] as $col) {
        $validation = $sheet->getCell($col . $validationStartRow)->getDataValidation();
        $validation->setType(DataValidation::TYPE_LIST);
        $validation->setErrorStyle(DataValidation::STYLE_STOP);
        $validation->setAllowBlank(false);
        $validation->setShowDropDown(true);
        $validation->setFormula1('"JA,NEIN"');
        $validation->setShowErrorMessage(true);
        $validation->setErrorTitle('Ungültiger Wert');
        $validation->setError('Bitte wählen Sie JA oder NEIN');

        // Apply to all rows (existing and empty)
        for ($r = $validationStartRow; $r <= $validationEndRow; $r++) {
            $sheet->getCell($col . $r)->setDataValidation(clone $validation);
        }
    }

    // Add data validation for Privacy Status (O)
    $privacyValidation = $sheet->getCell('O' . $validationStartRow)->getDataValidation();
    $privacyValidation->setType(DataValidation::TYPE_LIST);
    $privacyValidation->setErrorStyle(DataValidation::STYLE_STOP);
    $privacyValidation->setAllowBlank(false);
    $privacyValidation->setShowDropDown(true);
    $privacyValidation->setFormula1('"DSGVO_COMPLIANT,EU_HOSTED,NON_EU"');
    $privacyValidation->setShowErrorMessage(true);
    $privacyValidation->setErrorTitle('Ungültiger Wert');
    $privacyValidation->setError('Bitte wählen Sie DSGVO_COMPLIANT, EU_HOSTED oder NON_EU');

    for ($r = $validationStartRow; $r <= $validationEndRow; $r++) {
        $sheet->getCell('O' . $r)->setDataValidation(clone $privacyValidation);
    }

    // Add data validation for Inhouse (P)
    $inhouseValidation = $sheet->getCell('P' . $validationStartRow)->getDataValidation();
    $inhouseValidation->setType(DataValidation::TYPE_LIST);
    $inhouseValidation->setErrorStyle(DataValidation::STYLE_STOP);
    $inhouseValidation->setAllowBlank(false);
    $inhouseValidation->setShowDropDown(true);
    $inhouseValidation->setFormula1('"JA,NEIN"');
    $inhouseValidation->setShowErrorMessage(true);
    $inhouseValidation->setErrorTitle('Ungültiger Wert');
    $inhouseValidation->setError('Bitte wählen Sie JA oder NEIN');

    for ($r = $validationStartRow; $r <= $validationEndRow; $r++) {
        $sheet->getCell('P' . $r)->setDataValidation(clone $inhouseValidation);
    }

    // Add data validation for Categories (Q) - reference hidden sheet
    if (!empty($categoryNames)) {
        $catCount = count($categoryNames);
        $categoryValidation = $sheet->getCell('Q' . $validationStartRow)->getDataValidation();
        $categoryValidation->setType(DataValidation::TYPE_LIST);
        $categoryValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $categoryValidation->setAllowBlank(true);
        $categoryValidation->setShowDropDown(true);
        $categoryValidation->setFormula1('_Dropdown_Values!$A$2:$A$' . ($catCount + 1));
        $categoryValidation->setShowErrorMessage(true);
        $categoryValidation->setErrorTitle('Hinweis');
        $categoryValidation->setError('Mehrfachauswahl: Trennen Sie mehrere Kategorien mit Komma und Leerzeichen');
        $categoryValidation->setPromptTitle('Kategorien');
        $categoryValidation->setPrompt('Wählen Sie eine oder mehrere Kategorien (mit ", " getrennt)');
        $categoryValidation->setShowInputMessage(true);

        for ($r = $validationStartRow; $r <= $validationEndRow; $r++) {
            $sheet->getCell('Q' . $r)->setDataValidation(clone $categoryValidation);
        }
    }

    // Add data validation for Target Groups (R) - reference hidden sheet
    if (!empty($targetGroupNames)) {
        $tgCount = count($targetGroupNames);
        $targetGroupValidation = $sheet->getCell('R' . $validationStartRow)->getDataValidation();
        $targetGroupValidation->setType(DataValidation::TYPE_LIST);
        $targetGroupValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $targetGroupValidation->setAllowBlank(true);
        $targetGroupValidation->setShowDropDown(true);
        $targetGroupValidation->setFormula1('_Dropdown_Values!$B$2:$B$' . ($tgCount + 1));
        $targetGroupValidation->setShowErrorMessage(true);
        $targetGroupValidation->setErrorTitle('Hinweis');
        $targetGroupValidation->setError('Mehrfachauswahl: Trennen Sie mehrere Zielgruppen mit Komma und Leerzeichen');
        $targetGroupValidation->setPromptTitle('Zielgruppen');
        $targetGroupValidation->setPrompt('Wählen Sie eine oder mehrere Zielgruppen (mit ", " getrennt)');
        $targetGroupValidation->setShowInputMessage(true);

        for ($r = $validationStartRow; $r <= $validationEndRow; $r++) {
            $sheet->getCell('R' . $r)->setDataValidation(clone $targetGroupValidation);
        }
    }

    // Freeze header row
    $sheet->freezePane('A2');

    // Generate filename
    $filename = 'software-hub-template-' . date('Y-m-d-His') . '.xlsx';

    // Set headers for download
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $filename . '"');
    header('Cache-Control: max-age=0');

    // Write to output
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');

    exit;

} catch (Exception $e) {
    error_log("Error generating Excel template: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    header('Content-Type: text/plain');
    exit('Fehler beim Erstellen der Vorlage: ' . $e->getMessage() . "\n\nStack trace:\n" . $e->getTraceAsString());
}
