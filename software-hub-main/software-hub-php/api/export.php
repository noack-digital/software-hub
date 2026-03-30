<?php
/**
 * Export API Endpoint
 * Export all software as CSV
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $format = $_GET['format'] ?? 'csv';

        $software = new Software();
        $allSoftware = $software->getAll();

        // Transform data for export
        $exportData = [];
        foreach ($allSoftware as $item) {
            $exportData[] = [
                'id' => $item['id'],
                'name' => $item['name'],
                'shortDescription' => $item['short_description'] ?? '',
                'description' => $item['description'] ?? '',
                'url' => $item['url'] ?? '',
                'logo' => $item['logo'] ?? '',
                'types' => is_array($item['types']) ? implode(', ', $item['types']) : $item['types'],
                'costs' => $item['costs'] ?? '',
                'available' => $item['available'] ? 'Ja' : 'Nein',
                'categories' => implode(', ', array_map(fn($c) => $c['name'], $item['categories'] ?? [])),
                'nameEn' => $item['name_en'] ?? '',
                'shortDescriptionEn' => $item['short_description_en'] ?? '',
                'descriptionEn' => $item['description_en'] ?? '',
                'features' => $item['features'] ?? '',
                'alternatives' => $item['alternatives'] ?? '',
                'notes' => $item['notes'] ?? '',
                'featuresEn' => $item['features_en'] ?? '',
                'alternativesEn' => $item['alternatives_en'] ?? '',
                'notesEn' => $item['notes_en'] ?? '',
                'targetGroups' => implode(', ', array_map(fn($tg) => $tg['name'], $item['targetGroups'] ?? [])),
                'dataPrivacyStatus' => $item['data_privacy_status'] ?? '',
                'inhouseHosted' => $item['inhouse_hosted'] ? 'Ja' : 'Nein'
            ];
        }

        if ($format === 'csv') {
            // Generate CSV
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="software-liste-' . date('Y-m-d_His') . '.csv"');

            $output = fopen('php://output', 'w');

            // Write UTF-8 BOM for Excel compatibility
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write header
            if (!empty($exportData)) {
                fputcsv($output, array_keys($exportData[0]));

                // Write data rows
                foreach ($exportData as $row) {
                    fputcsv($output, $row);
                }
            }

            fclose($output);
            exit;
        } elseif ($format === 'xlsx') {
            // Generate Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Software');

            if (!empty($exportData)) {
                // Add header row
                $headers = array_keys($exportData[0]);
                $col = 'A';
                foreach ($headers as $header) {
                    $sheet->setCellValue($col . '1', $header);
                    $col++;
                }

                // Style header row
                $lastCol = chr(ord('A') + count($headers) - 1);
                $headerRange = 'A1:' . $lastCol . '1';
                $sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF']
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '0D9488'] // Teal color
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ]);

                // Add data rows
                $row = 2;
                foreach ($exportData as $data) {
                    $col = 'A';
                    foreach ($data as $value) {
                        $sheet->setCellValue($col . $row, $value);
                        $col++;
                    }
                    $row++;
                }

                // Auto-size columns
                foreach (range('A', $lastCol) as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            }

            // Output to browser
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment; filename="software-liste-' . date('Y-m-d_His') . '.xlsx"');
            header('Cache-Control: max-age=0');

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            exit;
        } else {
            jsonError('Ungültiges Format', 400);
        }
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Export API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
