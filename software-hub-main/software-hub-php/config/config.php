<?php
/**
 * Software Hub - Konfigurationsdatei
 * PHP 8.3+ Version
 */

// Fehlerbehandlung für Entwicklung
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Zeitzone setzen
date_default_timezone_set('Europe/Berlin');

// Session-Konfiguration
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_path', '/');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
}
ini_set('session.cookie_samesite', 'Lax');

// Datenbankverbindung – alle Werte müssen über Umgebungsvariablen gesetzt sein
define('DB_HOST', $_ENV['DB_HOST'] ?? 'software-hub-php-db');
define('DB_NAME', $_ENV['DB_NAME'] ?? '');
define('DB_USER', $_ENV['DB_USER'] ?? '');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');
define('DB_CHARSET', 'utf8mb4');

if (empty(DB_NAME) || empty(DB_USER) || empty(DB_PASS)) {
    error_log('FATAL: DB credentials missing - check environment variables');
    http_response_code(500);
    exit('Server configuration error');
}

// Anwendungseinstellungen
define('APP_NAME', 'Software Hub');
define('APP_VERSION', '1.2.2');
define('APP_URL', $_ENV['APP_URL'] ?? 'http://sh.lokal');

// Upload-Einstellungen
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', APP_URL . '/uploads/');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5 MB

// Sicherheitseinstellungen
define('BCRYPT_COST', 12);
define('SESSION_LIFETIME', 86400); // 24 Stunden
define('CSRF_TOKEN_NAME', 'csrf_token');

// Standardsprache
define('DEFAULT_LANGUAGE', 'de');
define('SUPPORTED_LANGUAGES', ['de', 'en']);

// API-Einstellungen
define('API_RATE_LIMIT', 100); // Anfragen pro Minute
