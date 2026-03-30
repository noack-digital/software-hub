<?php
/**
 * Demo Data API Endpoint
 * Software Hub - PHP Version
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Admin check
if (!Auth::isAdmin()) {
    jsonError('Nicht autorisiert', 401);
}

$action = $_GET['action'] ?? '';
$db = Database::getInstance();

try {
    switch ($action) {
        case 'load':
            requireCsrf();
            loadDemoData($db);
            break;

        case 'import':
            requireCsrf();
            $data = getJsonBody();
            importData($db, $data);
            break;

        case 'delete-all':
            requireCsrf();
            deleteAllData($db);
            break;

        case 'export':
            exportData($db);
            break;

        default:
            jsonError('Ungültige Aktion', 400);
    }
} catch (Exception $e) {
    error_log("Demo Data API Error: " . $e->getMessage());
    jsonError($e->getMessage(), 500);
}

function loadDemoData(PDO $db): void {
    // Demo Categories
    $categories = [
        ['id' => 'cat_elearning', 'name' => 'E-Learning & Medien', 'name_en' => 'E-Learning & Media', 'description' => 'Tools für E-Learning und Medienproduktion', 'description_en' => 'Tools for e-learning and media production'],
        ['id' => 'cat_webconf', 'name' => 'Webkonferenzen', 'name_en' => 'Web Conferencing', 'description' => 'Videokonferenz- und Webmeeting-Tools', 'description_en' => 'Video conferencing and web meeting tools'],
        ['id' => 'cat_office', 'name' => 'Office & Zusammenarbeit', 'name_en' => 'Office & Collaboration', 'description' => 'Office-Anwendungen und Kollaborationstools', 'description_en' => 'Office applications and collaboration tools'],
        ['id' => 'cat_dev', 'name' => 'Programmierung & Entwicklung', 'name_en' => 'Programming & Development', 'description' => 'Entwicklungswerkzeuge und IDEs', 'description_en' => 'Development tools and IDEs'],
        ['id' => 'cat_data', 'name' => 'Datenanalyse & Statistik', 'name_en' => 'Data Analysis & Statistics', 'description' => 'Tools für Datenanalyse und Statistik', 'description_en' => 'Tools for data analysis and statistics'],
        ['id' => 'cat_audio', 'name' => 'Audio', 'name_en' => 'Audio', 'description' => 'Audio-Bearbeitung und -Produktion', 'description_en' => 'Audio editing and production']
    ];

    // Demo Target Groups
    $targetGroups = [
        ['id' => 'tg_teaching', 'name' => 'Lehrende', 'name_en' => 'Teachers', 'description' => 'Dozenten und Lehrpersonal', 'description_en' => 'Lecturers and teaching staff'],
        ['id' => 'tg_students', 'name' => 'Studierende', 'name_en' => 'Students', 'description' => 'Studierende aller Fachrichtungen', 'description_en' => 'Students of all disciplines'],
        ['id' => 'tg_staff', 'name' => 'Mitarbeitende', 'name_en' => 'Staff', 'description' => 'Verwaltungspersonal und Mitarbeiter', 'description_en' => 'Administrative staff and employees']
    ];

    // Demo Software
    $software = [
        [
            'id' => 'sw_zoom',
            'name' => 'Zoom',
            'name_en' => 'Zoom',
            'url' => 'https://zoom.us',
            'logo' => 'https://zoom.us/favicon.ico',
            'short_description' => 'Professionelle Videokonferenz-Plattform',
            'short_description_en' => 'Professional video conferencing platform',
            'description' => 'Zoom ist eine führende Plattform für Videokonferenzen und virtuelle Meetings. Sie bietet HD-Video, Bildschirmfreigabe, Chat und Aufzeichnungsfunktionen.',
            'description_en' => 'Zoom is a leading platform for video conferencing and virtual meetings. It offers HD video, screen sharing, chat and recording features.',
            'features' => 'HD-Video und Audio, Bildschirmfreigabe, Breakout-Räume, Chat, Aufzeichnung, Virtuelle Hintergründe',
            'features_en' => 'HD video and audio, screen sharing, breakout rooms, chat, recording, virtual backgrounds',
            'types' => json_encode(['Web', 'Desktop', 'Mobile']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'EU_HOSTED',
            'categories' => ['cat_webconf'],
            'target_groups' => ['tg_teaching', 'tg_students', 'tg_staff']
        ],
        [
            'id' => 'sw_teams',
            'name' => 'Microsoft Teams',
            'name_en' => 'Microsoft Teams',
            'url' => 'https://teams.microsoft.com',
            'logo' => 'https://teams.microsoft.com/favicon.ico',
            'short_description' => 'Integrierte Kommunikations- und Kollaborationsplattform',
            'short_description_en' => 'Integrated communication and collaboration platform',
            'description' => 'Microsoft Teams vereint Chat, Videokonferenzen, Dateiablage und App-Integration in einer Plattform für effektive Teamarbeit.',
            'description_en' => 'Microsoft Teams combines chat, video conferencing, file storage and app integration in one platform for effective teamwork.',
            'features' => 'Chat, Videokonferenzen, Dateiablage, Office-Integration, Apps & Bots, Kanäle',
            'features_en' => 'Chat, video conferencing, file storage, Office integration, apps & bots, channels',
            'types' => json_encode(['Web', 'Desktop', 'Mobile']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'EU_HOSTED',
            'categories' => ['cat_webconf', 'cat_office'],
            'target_groups' => ['tg_teaching', 'tg_students', 'tg_staff']
        ],
        [
            'id' => 'sw_moodle',
            'name' => 'Moodle',
            'name_en' => 'Moodle',
            'url' => 'https://moodle.org',
            'logo' => 'https://moodle.org/favicon.ico',
            'short_description' => 'Open-Source Lernmanagementsystem',
            'short_description_en' => 'Open-source learning management system',
            'description' => 'Moodle ist ein freies Lernmanagementsystem, das weltweit an Bildungseinrichtungen eingesetzt wird. Es unterstützt flexible Kursgestaltung und vielfältige Lernaktivitäten.',
            'description_en' => 'Moodle is a free learning management system used worldwide at educational institutions. It supports flexible course design and diverse learning activities.',
            'features' => 'Kursmanagement, Aufgaben, Tests, Foren, Wikis, Gradebook, H5P-Integration',
            'features_en' => 'Course management, assignments, quizzes, forums, wikis, gradebook, H5P integration',
            'types' => json_encode(['Web']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'DSGVO_COMPLIANT',
            'inhouse_hosted' => 1,
            'categories' => ['cat_elearning'],
            'target_groups' => ['tg_teaching', 'tg_students']
        ],
        [
            'id' => 'sw_office365',
            'name' => 'Microsoft 365',
            'name_en' => 'Microsoft 365',
            'url' => 'https://www.microsoft.com/microsoft-365',
            'logo' => 'https://www.microsoft.com/favicon.ico',
            'short_description' => 'Umfassende Office-Suite mit Cloud-Diensten',
            'short_description_en' => 'Comprehensive office suite with cloud services',
            'description' => 'Microsoft 365 bietet die klassischen Office-Anwendungen plus Cloud-Speicher und Kollaborationstools für produktives Arbeiten.',
            'description_en' => 'Microsoft 365 offers classic Office applications plus cloud storage and collaboration tools for productive work.',
            'features' => 'Word, Excel, PowerPoint, Outlook, OneDrive, SharePoint, Co-Authoring',
            'features_en' => 'Word, Excel, PowerPoint, Outlook, OneDrive, SharePoint, co-authoring',
            'types' => json_encode(['Web', 'Desktop', 'Mobile']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'EU_HOSTED',
            'categories' => ['cat_office'],
            'target_groups' => ['tg_teaching', 'tg_students', 'tg_staff']
        ],
        [
            'id' => 'sw_vscode',
            'name' => 'Visual Studio Code',
            'name_en' => 'Visual Studio Code',
            'url' => 'https://code.visualstudio.com',
            'logo' => 'https://code.visualstudio.com/favicon.ico',
            'short_description' => 'Leistungsstarker Code-Editor von Microsoft',
            'short_description_en' => 'Powerful code editor from Microsoft',
            'description' => 'Visual Studio Code ist ein kostenloser, leichtgewichtiger aber leistungsstarker Quellcode-Editor mit Unterstützung für Debugging, Git-Integration und Erweiterungen.',
            'description_en' => 'Visual Studio Code is a free, lightweight but powerful source code editor with support for debugging, Git integration and extensions.',
            'features' => 'IntelliSense, Debugging, Git-Integration, Erweiterungen, Terminal, Live Share',
            'features_en' => 'IntelliSense, debugging, Git integration, extensions, terminal, Live Share',
            'types' => json_encode(['Desktop']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'DSGVO_COMPLIANT',
            'categories' => ['cat_dev'],
            'target_groups' => ['tg_teaching', 'tg_students']
        ],
        [
            'id' => 'sw_spss',
            'name' => 'IBM SPSS Statistics',
            'name_en' => 'IBM SPSS Statistics',
            'url' => 'https://www.ibm.com/spss',
            'logo' => 'https://www.ibm.com/favicon.ico',
            'short_description' => 'Professionelle Statistiksoftware',
            'short_description_en' => 'Professional statistics software',
            'description' => 'SPSS ist eine umfassende Statistiksoftware für Datenanalyse, Reporting und Vorhersagemodelle in Forschung und Wirtschaft.',
            'description_en' => 'SPSS is comprehensive statistics software for data analysis, reporting and predictive models in research and business.',
            'features' => 'Statistische Analysen, Datenmanagement, Grafiken, Syntax-Editor, Ausgabemanagement',
            'features_en' => 'Statistical analysis, data management, graphics, syntax editor, output management',
            'types' => json_encode(['Desktop']),
            'costs' => 'einmalig',
            'available' => 1,
            'data_privacy_status' => 'DSGVO_COMPLIANT',
            'categories' => ['cat_data'],
            'target_groups' => ['tg_teaching', 'tg_students']
        ],
        [
            'id' => 'sw_audacity',
            'name' => 'Audacity',
            'name_en' => 'Audacity',
            'url' => 'https://www.audacityteam.org',
            'logo' => 'https://www.audacityteam.org/favicon.ico',
            'short_description' => 'Kostenloser Open-Source Audio-Editor',
            'short_description_en' => 'Free open-source audio editor',
            'description' => 'Audacity ist ein freier, plattformübergreifender Audio-Editor für Aufnahme und Bearbeitung von Audio-Dateien.',
            'description_en' => 'Audacity is a free, cross-platform audio editor for recording and editing audio files.',
            'features' => 'Mehrspurbearbeitung, Effekte, Plugins, Import/Export vieler Formate',
            'features_en' => 'Multi-track editing, effects, plugins, import/export of many formats',
            'types' => json_encode(['Desktop']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'DSGVO_COMPLIANT',
            'categories' => ['cat_audio', 'cat_elearning'],
            'target_groups' => ['tg_teaching', 'tg_students']
        ],
        [
            'id' => 'sw_obs',
            'name' => 'OBS Studio',
            'name_en' => 'OBS Studio',
            'url' => 'https://obsproject.com',
            'logo' => 'https://obsproject.com/favicon.ico',
            'short_description' => 'Open-Source Streaming und Aufnahme',
            'short_description_en' => 'Open-source streaming and recording',
            'description' => 'OBS Studio ist eine freie Software für Video-Aufnahmen und Live-Streaming mit professionellen Funktionen.',
            'description_en' => 'OBS Studio is free software for video recording and live streaming with professional features.',
            'features' => 'Live-Streaming, Szenen, Quellen, Filter, Studio-Modus, Plugins',
            'features_en' => 'Live streaming, scenes, sources, filters, studio mode, plugins',
            'types' => json_encode(['Desktop']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'DSGVO_COMPLIANT',
            'categories' => ['cat_elearning'],
            'target_groups' => ['tg_teaching']
        ],
        [
            'id' => 'sw_camtasia',
            'name' => 'Camtasia',
            'name_en' => 'Camtasia',
            'url' => 'https://www.techsmith.com/camtasia.html',
            'logo' => 'https://www.techsmith.com/favicon.ico',
            'short_description' => 'Professionelle Bildschirmaufnahme und Video-Editing',
            'short_description_en' => 'Professional screen recording and video editing',
            'description' => 'Camtasia ist eine All-in-One-Lösung für Bildschirmaufnahmen, Videobearbeitung und Tutorial-Erstellung.',
            'description_en' => 'Camtasia is an all-in-one solution for screen recording, video editing and tutorial creation.',
            'features' => 'Bildschirmaufnahme, Video-Editor, Effekte, Annotationen, Quizze, Export',
            'features_en' => 'Screen recording, video editor, effects, annotations, quizzes, export',
            'types' => json_encode(['Desktop']),
            'costs' => 'einmalig',
            'available' => 1,
            'data_privacy_status' => 'DSGVO_COMPLIANT',
            'categories' => ['cat_elearning'],
            'target_groups' => ['tg_teaching']
        ],
        [
            'id' => 'sw_overleaf',
            'name' => 'Overleaf',
            'name_en' => 'Overleaf',
            'url' => 'https://www.overleaf.com',
            'logo' => 'https://www.overleaf.com/favicon.ico',
            'short_description' => 'Online LaTeX-Editor für kollaboratives Schreiben',
            'short_description_en' => 'Online LaTeX editor for collaborative writing',
            'description' => 'Overleaf ist ein Online-LaTeX-Editor, der Echtzeit-Kollaboration und automatische Kompilierung bietet.',
            'description_en' => 'Overleaf is an online LaTeX editor that offers real-time collaboration and automatic compilation.',
            'features' => 'Echtzeit-Kollaboration, Templates, Versionierung, Rich-Text-Modus, Referenzmanagement',
            'features_en' => 'Real-time collaboration, templates, versioning, rich text mode, reference management',
            'types' => json_encode(['Web']),
            'costs' => 'kostenlos',
            'available' => 1,
            'data_privacy_status' => 'EU_HOSTED',
            'categories' => ['cat_office'],
            'target_groups' => ['tg_teaching', 'tg_students']
        ]
    ];

    $db->beginTransaction();

    try {
        // Clear existing data
        $db->exec("DELETE FROM software_categories");
        $db->exec("DELETE FROM software_target_groups");
        $db->exec("DELETE FROM software");
        $db->exec("DELETE FROM categories");
        $db->exec("DELETE FROM target_groups");

        // Insert categories
        $catStmt = $db->prepare("INSERT INTO categories (id, name, name_en, description, description_en) VALUES (?, ?, ?, ?, ?)");
        foreach ($categories as $cat) {
            $catStmt->execute([$cat['id'], $cat['name'], $cat['name_en'], $cat['description'], $cat['description_en']]);
        }

        // Insert target groups
        $tgStmt = $db->prepare("INSERT INTO target_groups (id, name, name_en, description, description_en) VALUES (?, ?, ?, ?, ?)");
        foreach ($targetGroups as $tg) {
            $tgStmt->execute([$tg['id'], $tg['name'], $tg['name_en'], $tg['description'], $tg['description_en']]);
        }

        // Insert software
        $swStmt = $db->prepare(
            "INSERT INTO software (id, name, name_en, url, logo, short_description, short_description_en, description, description_en, features, features_en, types, costs, available, data_privacy_status, inhouse_hosted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $scStmt = $db->prepare("INSERT INTO software_categories (software_id, category_id) VALUES (?, ?)");
        $stgStmt = $db->prepare("INSERT INTO software_target_groups (software_id, target_group_id) VALUES (?, ?)");

        // Fiktive Ansprechpersonen für jede 2. Software (Zoom, Moodle, VS Code, Audacity, Camtasia)
        $demoContacts = [
            'sw_zoom' => [
                ['id' => 'ct_zoom_1', 'salutation' => 'Frau', 'first_name' => 'Laura', 'last_name' => 'Schmidt', 'profile_url' => 'https://example.com/profile/lschmidt', 'email' => 'laura.schmidt@example.com', 'contact_roles' => 'administration,training'],
                ['id' => 'ct_zoom_2', 'salutation' => 'Herr', 'first_name' => 'Thomas', 'last_name' => 'Weber', 'profile_url' => null, 'email' => 'thomas.weber@example.com', 'contact_roles' => 'administration'],
            ],
            'sw_moodle' => [
                ['id' => 'ct_moodle_1', 'salutation' => 'Dr.', 'first_name' => 'Anna', 'last_name' => 'Müller', 'profile_url' => 'https://example.com/staff/amueller', 'email' => 'anna.mueller@example.com', 'contact_roles' => 'training'],
            ],
            'sw_vscode' => [
                ['id' => 'ct_vscode_1', 'salutation' => 'Herr', 'first_name' => 'Michael', 'last_name' => 'Fischer', 'profile_url' => null, 'email' => 'michael.fischer@example.com', 'contact_roles' => 'administration'],
            ],
            'sw_audacity' => [
                ['id' => 'ct_audacity_1', 'salutation' => 'Frau', 'first_name' => 'Sarah', 'last_name' => 'Klein', 'profile_url' => 'https://example.com/profile/sklein', 'email' => 'sarah.klein@example.com', 'contact_roles' => 'training'],
            ],
            'sw_camtasia' => [
                ['id' => 'ct_camtasia_1', 'salutation' => 'Prof.', 'first_name' => 'Martin', 'last_name' => 'Bauer', 'profile_url' => 'https://example.com/staff/mbauer', 'email' => 'martin.bauer@example.com', 'contact_roles' => 'administration,training'],
            ],
        ];
        $contactStmt = $db->prepare(
            "INSERT INTO software_contacts (id, software_id, salutation, first_name, last_name, profile_url, email, contact_roles, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        foreach ($software as $sw) {
            $swStmt->execute([
                $sw['id'],
                $sw['name'],
                $sw['name_en'],
                $sw['url'],
                $sw['logo'],
                $sw['short_description'],
                $sw['short_description_en'],
                $sw['description'],
                $sw['description_en'],
                $sw['features'] ?? null,
                $sw['features_en'] ?? null,
                $sw['types'],
                $sw['costs'],
                $sw['available'],
                $sw['data_privacy_status'],
                $sw['inhouse_hosted'] ?? 0
            ]);

            // Categories
            foreach ($sw['categories'] as $catId) {
                $scStmt->execute([$sw['id'], $catId]);
            }

            // Target groups
            foreach ($sw['target_groups'] as $tgId) {
                $stgStmt->execute([$sw['id'], $tgId]);
            }
        }

        // Ansprechpersonen für jede 2. Software einfügen
        foreach ($demoContacts as $softwareId => $contacts) {
            foreach ($contacts as $i => $c) {
                $contactStmt->execute([
                    $c['id'],
                    $softwareId,
                    $c['salutation'],
                    $c['first_name'],
                    $c['last_name'],
                    $c['profile_url'],
                    $c['email'],
                    $c['contact_roles'] ?? null,
                    $i
                ]);
            }
        }

        $db->commit();

        logAudit('create', 'demo_data', 'load', ['software_count' => count($software), 'category_count' => count($categories), 'target_group_count' => count($targetGroups)]);

        jsonResponse(['success' => true, 'message' => 'Demo-Daten geladen', 'counts' => [
            'software' => count($software),
            'categories' => count($categories),
            'targetGroups' => count($targetGroups)
        ]]);
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

function importData(PDO $db, array $data): void {
    $db->beginTransaction();

    try {
        $softwareCount = 0;

        if (!empty($data['software'])) {
            $swStmt = $db->prepare(
                "INSERT INTO software (id, name, name_en, url, logo, short_description, short_description_en, description, description_en, types, costs, available, data_privacy_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE name = VALUES(name), url = VALUES(url)"
            );

            foreach ($data['software'] as $sw) {
                $id = $sw['id'] ?? generateId();
                $types = is_array($sw['types'] ?? null) ? json_encode($sw['types']) : ($sw['types'] ?? '[]');

                $swStmt->execute([
                    $id,
                    $sw['name'] ?? '',
                    $sw['name_en'] ?? null,
                    $sw['url'] ?? null,
                    $sw['logo'] ?? null,
                    $sw['short_description'] ?? null,
                    $sw['short_description_en'] ?? null,
                    $sw['description'] ?? null,
                    $sw['description_en'] ?? null,
                    $types,
                    $sw['costs'] ?? 'kostenlos',
                    isset($sw['available']) ? ($sw['available'] ? 1 : 0) : 1,
                    $sw['data_privacy_status'] ?? 'UNKNOWN'
                ]);
                $softwareCount++;
            }
        }

        $db->commit();

        logAudit('create', 'import', 'bulk', ['software_count' => $softwareCount]);

        jsonResponse(['success' => true, 'imported' => ['software' => $softwareCount]]);
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

function deleteAllData(PDO $db): void {
    $db->beginTransaction();

    try {
        $db->exec("DELETE FROM software_contacts");
        $db->exec("DELETE FROM software_categories");
        $db->exec("DELETE FROM software_target_groups");
        $db->exec("DELETE FROM software");
        $db->exec("DELETE FROM categories");
        $db->exec("DELETE FROM target_groups");

        $db->commit();

        logAudit('delete', 'all_data', 'bulk', []);

        jsonResponse(['success' => true, 'message' => 'Alle Daten gelöscht']);
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

function exportData(PDO $db): void {
    $format = $_GET['format'] ?? 'json';

    // Get all software with categories and target groups
    $software = new Software();
    $allSoftware = $software->getAll();

    // Transform data for export (similar to export.php)
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
        header('Content-Disposition: attachment; filename="demo-daten-' . date('Y-m-d_His') . '.csv"');

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
        $sheet->setTitle('Demo-Daten');

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
        header('Content-Disposition: attachment; filename="demo-daten-' . date('Y-m-d_His') . '.xlsx"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    } else {
        // JSON format (default)
        $stmt = $db->query("SELECT * FROM software");
        $software = $stmt->fetchAll();

        $stmt = $db->query("SELECT * FROM categories");
        $categories = $stmt->fetchAll();

        $stmt = $db->query("SELECT * FROM target_groups");
        $targetGroups = $stmt->fetchAll();

        jsonResponse([
            'software' => $software,
            'categories' => $categories,
            'targetGroups' => $targetGroups
        ]);
    }
}
