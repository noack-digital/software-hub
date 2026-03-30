<?php
/**
 * Hilfsfunktionen
 */

declare(strict_types=1);

/**
 * JSON-Antwort senden
 */
function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * JSON-Fehler senden
 */
function jsonError(string $message, int $statusCode = 400): void
{
    jsonResponse(['error' => $message], $statusCode);
}

/**
 * Input sicher auslesen
 */
function getInput(string $key, mixed $default = null): mixed
{
    return $_POST[$key] ?? $_GET[$key] ?? $default;
}

/**
 * JSON-Body parsen
 */
function getJsonBody(): array
{
    static $cache = null;
    if ($cache === null) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $cache = is_array($data) ? $data : [];
    }
    return $cache;
}

/**
 * CSRF-Token für schreibende Anfragen erzwingen.
 * Token aus: Header X-CSRF-Token, JSON-Body csrfToken oder POST (multipart/form-data) csrfToken.
 */
function requireCsrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? getJsonBody()['csrfToken'] ?? $_POST['csrfToken'] ?? '';
    $token = is_string($token) ? trim($token) : '';
    if ($token === '' || !Auth::validateCsrfToken($token)) {
        jsonError('CSRF token ungültig', 403);
    }
}

/**
 * String escapen für HTML-Ausgabe
 */
function e(string $string): string
{
    return htmlspecialchars($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Aktuelle Sprache abrufen
 */
function getCurrentLanguage(): string
{
    return $_COOKIE['language'] ?? DEFAULT_LANGUAGE;
}

/**
 * Übersetzung abrufen
 */
function t(string $key, string $language = null): string
{
    static $translations = [];
    $lang = $language ?? getCurrentLanguage();

    if (!isset($translations[$lang])) {
        $file = __DIR__ . '/../messages/' . $lang . '.json';
        if (file_exists($file)) {
            $translations[$lang] = json_decode(file_get_contents($file), true) ?? [];
        } else {
            $translations[$lang] = [];
        }
    }

    // Dot-Notation auflösen
    $keys = explode('.', $key);
    $value = $translations[$lang];

    foreach ($keys as $k) {
        if (is_array($value) && isset($value[$k])) {
            $value = $value[$k];
        } else {
            // Fallback: Letzten Teil des Keys zurückgeben
            return end($keys);
        }
    }

    return is_string($value) ? $value : $key;
}

/**
 * Markdown-Formatierung aus Text entfernen
 * Wird auf KI-Antworten angewendet, damit keine Markdown-Artefakte in der Ausgabe landen.
 */
function stripMarkdown(string $text): string
{
    // Fenced code blocks (```...```)
    $text = preg_replace('/```[\s\S]*?```/', '', $text);
    // Inline code (`...`)
    $text = preg_replace('/`([^`]+)`/', '$1', $text);
    // Bold / italic (**, __, *, _)
    $text = preg_replace('/\*{1,3}(.*?)\*{1,3}/', '$1', $text);
    $text = preg_replace('/_{1,3}(.*?)_{1,3}/', '$1', $text);
    // Strikethrough (~~...~~)
    $text = preg_replace('/~~(.*?)~~/', '$1', $text);
    // Headers (# ... )
    $text = preg_replace('/^#{1,6}\s+/m', '', $text);
    // Unordered list markers (- , * , + at line start)
    $text = preg_replace('/^[\s]*[-*+]\s+/m', '', $text);
    // Ordered list markers (1. , 2. etc.)
    $text = preg_replace('/^[\s]*\d+\.\s+/m', '', $text);
    // Links [text](url) → text
    $text = preg_replace('/\[([^\]]+)\]\([^)]+\)/', '$1', $text);
    // Images ![alt](url) → alt
    $text = preg_replace('/!\[([^\]]*)\]\([^)]+\)/', '$1', $text);
    // Blockquotes (> )
    $text = preg_replace('/^>\s?/m', '', $text);
    // Horizontal rules (---, ***, ___)
    $text = preg_replace('/^[-*_]{3,}\s*$/m', '', $text);
    // Clean up multiple blank lines
    $text = preg_replace('/\n{3,}/', "\n\n", $text);

    return trim($text);
}

/**
 * Datum formatieren
 */
function formatDate(string $date, string $format = 'd.m.Y H:i'): string
{
    return date($format, strtotime($date));
}

/**
 * URL-sichere Base64-Kodierung
 */
function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * URL-sichere Base64-Dekodierung
 */
function base64UrlDecode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

/**
 * Validiert eine URL
 */
function isValidUrl(string $url): bool
{
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Validiert eine E-Mail-Adresse
 */
function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Slug aus String erstellen
 */
function createSlug(string $string): string
{
    $string = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $string);
    $string = strtolower($string);
    $string = preg_replace('/[^a-z0-9]+/', '-', $string);
    return trim($string, '-');
}

/**
 * Datei-Upload verarbeiten
 */
function handleFileUpload(array $file, string $targetDir, array $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']): array
{
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Upload-Fehler: ' . $file['error']];
    }

    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['success' => false, 'error' => 'Datei zu groß (max. ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . ' MB)'];
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        return ['success' => false, 'error' => 'Dateityp nicht erlaubt'];
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFilename = Database::generateId() . '.' . $extension;
    $targetPath = $targetDir . $newFilename;

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => false, 'error' => 'Fehler beim Speichern der Datei'];
    }

    return [
        'success' => true,
        'filename' => $newFilename,
        'path' => $targetPath,
        'url' => UPLOAD_URL . $newFilename
    ];
}

/**
 * Favicon von URL abrufen
 */
function fetchFavicon(string $url): ?string
{
    $parsed = parse_url($url);
    if (!$parsed || !isset($parsed['host'])) {
        return null;
    }

    $domain = $parsed['scheme'] . '://' . $parsed['host'];
    $faviconUrls = [
        $domain . '/favicon.ico',
        $domain . '/favicon.png',
        'https://www.google.com/s2/favicons?domain=' . $parsed['host'] . '&sz=64'
    ];

    foreach ($faviconUrls as $faviconUrl) {
        $headers = @get_headers($faviconUrl);
        if ($headers && strpos($headers[0], '200') !== false) {
            return $faviconUrl;
        }
    }

    // Google Favicon-Service als Fallback
    return 'https://www.google.com/s2/favicons?domain=' . $parsed['host'] . '&sz=64';
}

/**
 * Einstellung aus Datenbank abrufen
 */
function getSetting(string $key, mixed $default = null): mixed
{
    static $cache = [];

    if (isset($cache[$key])) {
        return $cache[$key];
    }

    try {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT value FROM settings WHERE `key` = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetch();

        if ($result) {
            $cache[$key] = $result['value'];
            return $result['value'];
        }
    } catch (Exception $e) {
        error_log("Error getting setting '$key': " . $e->getMessage());
    }

    return $default;
}

/**
 * Einstellung speichern
 */
function setSetting(string $key, string $value, string $description = null): bool
{
    try {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            "INSERT INTO settings (id, `key`, value, description) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value), description = COALESCE(VALUES(description), description)"
        );
        $stmt->execute([Database::generateId(), $key, $value, $description]);
        return true;
    } catch (Exception $e) {
        error_log("Error setting '$key': " . $e->getMessage());
        return false;
    }
}

/**
 * Audit-Log Eintrag erstellen
 */
function logAudit(string $action, string $model, string $recordId, array $changes = []): void
{
    try {
        $db = Database::getInstance();
        $userId = Auth::getCurrentUser()['id'] ?? null;

        $stmt = $db->prepare(
            "INSERT INTO audit_log (id, action, model, record_id, changes, user_id) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            Database::generateId(),
            $action,
            $model,
            $recordId,
            json_encode($changes, JSON_UNESCAPED_UNICODE),
            $userId
        ]);
    } catch (Exception $e) {
        error_log("Error logging audit: " . $e->getMessage());
    }
}
