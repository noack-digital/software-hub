<?php
/**
 * Stats API Endpoint
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Methode nicht erlaubt', 405);
}

$db = Database::getInstance();

try {
    $stats = [];

    // Software-Statistiken
    $stmt = $db->query("SELECT COUNT(*) as total FROM software");
    $stats['software']['total'] = (int)$stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as available FROM software WHERE available = 1");
    $stats['software']['available'] = (int)$stmt->fetch()['available'];

    $stmt = $db->query("SELECT COUNT(*) as unavailable FROM software WHERE available = 0");
    $stats['software']['unavailable'] = (int)$stmt->fetch()['unavailable'];

    // Kategorien-Statistiken
    $stmt = $db->query("SELECT COUNT(*) as total FROM categories");
    $stats['categories']['total'] = (int)$stmt->fetch()['total'];

    // Zielgruppen-Statistiken
    $stmt = $db->query("SELECT COUNT(*) as total FROM target_groups");
    $stats['targetGroups']['total'] = (int)$stmt->fetch()['total'];

    // Benutzer-Statistiken (nur für Admins)
    if (Auth::isAdmin()) {
        $stmt = $db->query("SELECT COUNT(*) as total FROM users");
        $stats['users']['total'] = (int)$stmt->fetch()['total'];

        $stmt = $db->query("SELECT COUNT(*) as admins FROM users WHERE role = 'ADMIN'");
        $stats['users']['admins'] = (int)$stmt->fetch()['admins'];
    }

    // Software nach Kategorien
    $stmt = $db->query(
        "SELECT c.name, c.name_en, COUNT(sc.software_id) as count
         FROM categories c
         LEFT JOIN software_categories sc ON c.id = sc.category_id
         GROUP BY c.id, c.name, c.name_en
         ORDER BY count DESC
         LIMIT 10"
    );
    $stats['topCategories'] = $stmt->fetchAll();

    // Software nach Zielgruppen
    $stmt = $db->query(
        "SELECT tg.name, tg.name_en, COUNT(stg.software_id) as count
         FROM target_groups tg
         LEFT JOIN software_target_groups stg ON tg.id = stg.target_group_id
         GROUP BY tg.id, tg.name, tg.name_en
         ORDER BY count DESC
         LIMIT 10"
    );
    $stats['topTargetGroups'] = $stmt->fetchAll();

    // Software nach Datenschutzstatus
    $stmt = $db->query(
        "SELECT data_privacy_status, COUNT(*) as count
         FROM software
         GROUP BY data_privacy_status"
    );
    $stats['privacyStatus'] = $stmt->fetchAll();

    // Letzte Aktivitäten (nur für Admins)
    if (Auth::isAdmin()) {
        $stmt = $db->query(
            "SELECT action, model, record_id, changes, created_at
             FROM audit_log
             ORDER BY created_at DESC
             LIMIT 10"
        );
        $stats['recentActivities'] = $stmt->fetchAll();
    }

    jsonResponse($stats);

} catch (Exception $e) {
    error_log("Stats API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
