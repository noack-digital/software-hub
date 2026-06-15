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
 * Admin-Authentifizierung für API-Endpunkte erzwingen.
 */
function requireAdmin(): void
{
    if (!Auth::isLoggedIn()) {
        jsonError('Nicht authentifiziert', 401);
    }
    if (!Auth::isAdmin()) {
        jsonError('Keine Berechtigung', 403);
    }
}

/**
 * Admin + CSRF für schreibende API-Anfragen.
 */
function requireAdminCsrf(): void
{
    requireAdmin();
    requireCsrf();
}

/**
 * CORS-Header für API-Antworten (nur Same-Origin / APP_URL).
 */
function setApiCorsHeaders(string $methods = 'GET, POST, PATCH, DELETE, OPTIONS'): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = rtrim(APP_URL, '/');
    if ($origin !== '' && strcasecmp($origin, $allowed) === 0) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Allow-Methods: ' . $methods);
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
}

/**
 * Einfaches Rate-Limiting (Datei-basiert, pro Schlüssel).
 */
function checkRateLimit(string $key, int $limit = null, int $windowSeconds = 60): void
{
    $limit = $limit ?? API_RATE_LIMIT;
    $dir = sys_get_temp_dir() . '/software-hub-rate-limit';
    if (!is_dir($dir)) {
        mkdir($dir, 0700, true);
    }
    $file = $dir . '/' . hash('sha256', $key) . '.json';
    $now = time();
    $data = ['count' => 0, 'reset' => $now + $windowSeconds];
    if (is_file($file)) {
        $decoded = json_decode((string)file_get_contents($file), true);
        if (is_array($decoded) && $now <= ($decoded['reset'] ?? 0)) {
            $data = $decoded;
        }
    }
    $data['count'] = ($data['count'] ?? 0) + 1;
    file_put_contents($file, json_encode($data), LOCK_EX);
    if ($data['count'] > $limit) {
        jsonError('Zu viele Anfragen. Bitte später erneut versuchen.', 429);
    }
}

/**
 * Prüft ob ein Host intern/privat ist (SSRF-Schutz).
 */
function isBlockedHost(string $host): bool
{
    $host = strtolower(trim($host, '[]'));
    if ($host === '' || $host === 'localhost' || str_ends_with($host, '.local') || str_ends_with($host, '.internal')) {
        return true;
    }
    $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : (@gethostbynamel($host) ?: []);
    foreach ($ips as $ip) {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return true;
        }
    }
    return false;
}

/**
 * Validiert eine externe HTTP(S)-URL gegen SSRF.
 */
function isSafeExternalUrl(string $url): bool
{
    $url = trim($url);
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    $parsed = parse_url($url);
    $scheme = strtolower($parsed['scheme'] ?? '');
    if (!in_array($scheme, ['http', 'https'], true)) {
        return false;
    }
    $host = $parsed['host'] ?? '';
    return $host !== '' && !isBlockedHost($host);
}

/**
 * Wirft JSON-Fehler wenn URL unsicher ist.
 */
function assertSafeExternalUrl(string $url): void
{
    if (!isSafeExternalUrl($url)) {
        jsonError('URL nicht erlaubt', 400);
    }
}

/**
 * Sicherer HTTP-Download (SSRF-gehärtet, SSL-Verifikation aktiv).
 */
function fetchUrlSafe(string $url, int $timeout = 10, int $maxBytes = 5242880): ?string
{
    if (!isSafeExternalUrl($url)) {
        return null;
    }
    if (!function_exists('curl_init')) {
        return null;
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
        CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
        CURLOPT_USERAGENT => 'Software-Hub/1.0',
    ]);
    $data = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($data === false || $httpCode < 200 || $httpCode >= 300 || strlen($data) > $maxBytes) {
        return null;
    }
    return $data;
}

/**
 * SVG-Inhalt von gefährlichen Elementen bereinigen.
 */
function sanitizeSvgUpload(string $path): void
{
    $content = file_get_contents($path);
    if ($content === false) {
        return;
    }
    $content = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $content) ?? $content;
    $content = preg_replace('/\s+on\w+\s*=\s*"[^"]*"/i', '', $content) ?? $content;
    $content = preg_replace("/\s+on\w+\s*=\s*'[^']*'/i", '', $content) ?? $content;
    file_put_contents($path, $content);
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

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($extension === 'svg' && !in_array($mimeType, $allowedTypes, true)) {
        $mimeType = 'image/svg+xml';
    }

    if (!in_array($mimeType, $allowedTypes, true)) {
        return ['success' => false, 'error' => 'Dateityp nicht erlaubt'];
    }

    $newFilename = Database::generateId() . '.' . $extension;
    $targetPath = $targetDir . $newFilename;

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => false, 'error' => 'Fehler beim Speichern der Datei'];
    }

    if ($extension === 'svg') {
        sanitizeSvgUpload($targetPath);
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
    if (!isSafeExternalUrl($url)) {
        return null;
    }
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
        if (!isSafeExternalUrl($faviconUrl)) {
            continue;
        }
        $data = fetchUrlSafe($faviconUrl, 5, 102400);
        if ($data !== null && strlen($data) > 0) {
            return $faviconUrl;
        }
    }

    $fallback = 'https://www.google.com/s2/favicons?domain=' . $parsed['host'] . '&sz=64';
    return isSafeExternalUrl($fallback) ? $fallback : null;
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
