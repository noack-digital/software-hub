<?php
/**
 * Activities API Endpoint
 * View recent audit log activities (Admin only)
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
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $limit = min(max($limit, 1), 100);

        $db = Database::getInstance();

        $sql = "SELECT
                    a.id,
                    a.action,
                    a.model,
                    a.record_id,
                    a.changes,
                    a.user_id,
                    a.created_at,
                    u.name as user_name,
                    u.email as user_email
                FROM audit_log a
                LEFT JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC
                LIMIT ?";

        $stmt = $db->prepare($sql);
        $stmt->execute([$limit]);
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($activities as &$activity) {
            if ($activity['changes']) {
                $activity['changes'] = json_decode($activity['changes'], true);
            }
        }

        jsonResponse($activities);
    } else {
        jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Activities API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
