<?php
/**
 * Settings API Endpoint
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db = Database::getInstance();

// Einstellungen, die ohne Admin-Login abrufbar sind (z. B. für öffentliches Frontend).
// API-Keys, Passwörter und interne Keys sind NICHT enthalten.
const PUBLIC_SETTING_KEYS = [
    'app_name', 'logo_path',
    'badge_show', 'badge_available_text', 'badge_available_color', 'badge_available_text_color',
    'badge_unavailable_text', 'badge_unavailable_color',
    'badge_icon', 'badge_icon_color', 'badge_icon_position',
    'dsgvo_indicator_show', 'dsgvo_color_green', 'dsgvo_color_yellow', 'dsgvo_color_red',
    'category_badge_bg', 'category_badge_text_color',
    'font_family', 'custom_font_url', 'background_color',
    'inhouse_logo_url', 'inhouse_tooltip',
    'footer_show', 'footer_impressum_url', 'footer_datenschutz_url', 'show_header', 'show_footer',
    'sticky_header'
];

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $isAdmin = Auth::isAdmin();
            if (isset($_GET['key'])) {
                $key = $_GET['key'];
                if (!$isAdmin && !in_array($key, PUBLIC_SETTING_KEYS, true)) {
                    jsonError('Einstellung nicht gefunden', 404);
                }
                $value = getSetting($key);
                if ($value !== null) {
                    jsonResponse(['key' => $key, 'value' => $value]);
                } else {
                    jsonError('Einstellung nicht gefunden', 404);
                }
            } else {
                $stmt = $db->query("SELECT `key`, value, description FROM settings ORDER BY `key`");
                $settings = [];
                foreach ($stmt->fetchAll() as $row) {
                    if ($isAdmin || in_array($row['key'], PUBLIC_SETTING_KEYS, true)) {
                        $settings[$row['key']] = $row['value'];
                    }
                }
                jsonResponse($settings);
            }
            break;

        case 'PATCH':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $data = getJsonBody();
            if (empty($data['key'])) {
                jsonError('Key ist erforderlich');
            }

            if (setSetting($data['key'], $data['value'] ?? '', $data['description'] ?? null)) {
                logAudit('update', 'settings', $data['key'], $data);
                jsonResponse(['success' => true]);
            } else {
                jsonError('Fehler beim Speichern', 500);
            }
            break;

        case 'POST':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $data = getJsonBody();
            foreach ($data as $key => $value) {
                if (is_string($key) && is_string($value)) {
                    setSetting($key, $value);
                }
            }
            logAudit('update', 'settings', 'bulk', $data);
            jsonResponse(['success' => true]);
            break;

        case 'DELETE':
            requireCsrf();
            if (!Auth::isAdmin()) {
                jsonError('Nicht autorisiert', 401);
            }

            $key = $_GET['key'] ?? '';
            if (empty($key)) {
                jsonError('Key ist erforderlich');
            }

            $stmt = $db->prepare("DELETE FROM settings WHERE `key` = ?");
            $stmt->execute([$key]);

            logAudit('delete', 'settings', $key, []);
            jsonResponse(['success' => true]);
            break;

        default:
            jsonError('Methode nicht erlaubt', 405);
    }
} catch (Exception $e) {
    error_log("Settings API Error: " . $e->getMessage());
    jsonError('Serverfehler', 500);
}
