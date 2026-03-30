<?php
/**
 * Konvertiert Tools-Apps_v2_1.xlsx in das Software-Hub-Import-Format.
 * Ausgabe: ../Software-Hub-Import-Tools-Apps.xlsx
 * Die Original-Excel kann auch direkt im Admin unter Import hochgeladen werden
 * (Spalten werden automatisch gemappt).
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$sourcePath = __DIR__ . '/../Tools-Apps_v2_1.xlsx';
$outPath = __DIR__ . '/../Software-Hub-Import-Tools-Apps.xlsx';

if (!is_readable($sourcePath)) {
    fwrite(STDERR, "Datei nicht gefunden: $sourcePath\n");
    exit(1);
}

$spreadsheet = IOFactory::load($sourcePath);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$headers = $rows[0] ?? [];
$programmtypMap = ['webbasiert' => 'Web', 'web' => 'Web', 'desktop' => 'Desktop', 'mobile' => 'Mobile'];

// Neue Kopfzeile im Software-Hub-Format
$outHeaders = [
    'Name',
    'Kurzbeschreibung',
    'Beschreibung',
    'URL',
    'Typ (Web)',
    'Typ (Desktop)',
    'Typ (Mobile)',
    'Kategorien',
    'Zielgruppen',
    'Kosten',
    'Anleitungen',
    'Zusätzliche Informationen (Zugang)'
];

$outRows = [];
for ($i = 1; $i < count($rows); $i++) {
    $row = $rows[$i];
    $assoc = [];
    foreach ($headers as $j => $h) {
        $assoc[trim((string)$h)] = $row[$j] ?? '';
    }

    $name = trim($assoc['Toolname'] ?? '');
    if ($name === '') {
        continue;
    }

    $programmtyp = trim($assoc['Programmtyp'] ?? '');
    $types = [];
    foreach (array_map('trim', explode(',', $programmtyp)) as $t) {
        $key = strtolower($t);
        if (isset($programmtypMap[$key]) && !in_array($programmtypMap[$key], $types)) {
            $types[] = $programmtypMap[$key];
        }
    }

    $outRows[] = [
        $name,
        trim($assoc['Kurzbeschreibung- 180 Zeichen'] ?? ''),
        trim($assoc['Informationen zum Tool - möglichst kurz halten '] ?? $assoc['Informationen zum Tool - möglichst kurz halten'] ?? ''),
        trim($assoc['Webseite'] ?? ''),
        in_array('Web', $types) ? 'Ja' : '',
        in_array('Desktop', $types) ? 'Ja' : '',
        in_array('Mobile', $types) ? 'Ja' : '',
        trim($assoc['Kategorie'] ?? ''),
        trim($assoc['Für wen?'] ?? ''),
        trim($assoc['Kosten'] ?? '') ?: 'kostenlos',
        trim($assoc['Anleitungen'] ?? ''),
        trim($assoc['Wie kann ich es nutzen (Zugang)?'] ?? '')
    ];
}

$out = new Spreadsheet();
$outSheet = $out->getActiveSheet();
$outSheet->setTitle('Import');
$outSheet->fromArray(array_merge([$outHeaders], $outRows), null, 'A1');

$writer = new Xlsx($out);
$writer->save($outPath);

echo "Konvertierung fertig: " . count($outRows) . " Zeilen geschrieben nach $outPath\n";
