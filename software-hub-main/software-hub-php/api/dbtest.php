<?php
/**
 * Database Test API Endpoint
 * Test database connection and return basic info (Admin only)
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
setApiCorsHeaders('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

requireAdmin();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $db = Database::getInstance();

        $stmt = $db->query("SELECT VERSION() as version");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $counts = [];
        $countTables = ['software', 'categories', 'target_groups', 'users', 'settings', 'audit_log'];

        foreach ($countTables as $table) {
            if (in_array($table, $tables, true)) {
                $stmt = $db->query("SELECT COUNT(*) FROM `{$table}`");
                $counts[$table] = (int)$stmt->fetchColumn();
            }
        }

        jsonResponse([
            'success' => true,
            'database' => DB_NAME,
            'version' => $result['version'] ?? 'unknown',
            'tables' => count($tables),
            'tableList' => $tables,
            'counts' => $counts
        ]);
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("DB Test Error: " . $e->getMessage());
    jsonError('Datenbankverbindung fehlgeschlagen', 500);
}
