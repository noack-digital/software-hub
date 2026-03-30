<?php
/**
 * Auth - Authentifizierung und Session-Management
 */

declare(strict_types=1);

class Auth
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Startet oder setzt Session fort
     */
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Überprüft Login-Daten und erstellt Session
     */
    public function login(string $email, string $password): array
    {
        $stmt = $this->db->prepare(
            "SELECT id, name, email, password, role FROM users WHERE email = ?"
        );
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'error' => 'E-Mail oder Passwort falsch'];
        }

        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'error' => 'E-Mail oder Passwort falsch'];
        }

        // Session erstellen
        self::startSession();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        $_SESSION['last_activity'] = time();

        // CSRF-Token generieren
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));

        return [
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];
    }

    /**
     * Logout - Session zerstören
     */
    public static function logout(): void
    {
        self::startSession();
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
    }

    /**
     * Prüft, ob Benutzer eingeloggt ist
     */
    public static function isLoggedIn(): bool
    {
        self::startSession();

        if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
            return false;
        }

        // Session-Timeout prüfen
        if (isset($_SESSION['last_activity']) &&
            (time() - $_SESSION['last_activity'] > SESSION_LIFETIME)) {
            self::logout();
            return false;
        }

        $_SESSION['last_activity'] = time();
        return true;
    }

    /**
     * Prüft, ob Benutzer Admin ist
     */
    public static function isAdmin(): bool
    {
        return self::isLoggedIn() &&
               isset($_SESSION['user_role']) &&
               $_SESSION['user_role'] === 'ADMIN';
    }

    /**
     * Gibt aktuellen Benutzer zurück
     */
    public static function getCurrentUser(): ?array
    {
        if (!self::isLoggedIn()) {
            return null;
        }

        return [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'email' => $_SESSION['user_email'] ?? null,
            'role' => $_SESSION['user_role'] ?? null
        ];
    }

    /**
     * Erzwingt Login - Redirect bei nicht eingeloggt
     */
    public static function requireLogin(): void
    {
        if (!self::isLoggedIn()) {
            header('Location: ' . APP_URL . '/admin/');
            exit;
        }
    }

    /**
     * Erzwingt Admin-Zugang
     */
    public static function requireAdmin(): void
    {
        if (!self::isAdmin()) {
            header('Location: ' . APP_URL . '/admin/');
            exit;
        }
    }

    /**
     * CSRF-Token validieren
     */
    public static function validateCsrfToken(string $token): bool
    {
        self::startSession();
        return isset($_SESSION[CSRF_TOKEN_NAME]) &&
               hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
    }

    /**
     * CSRF-Token abrufen
     */
    public static function getCsrfToken(): string
    {
        self::startSession();
        if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
            $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
        }
        return $_SESSION[CSRF_TOKEN_NAME];
    }

    /**
     * Passwort hashen
     */
    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    }

    /**
     * Benutzer erstellen
     */
    public function createUser(string $name, string $email, string $password, string $role = 'USER'): array
    {
        // E-Mail prüfen
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'error' => 'E-Mail bereits registriert'];
        }

        $id = Database::generateId();
        $hashedPassword = self::hashPassword($password);

        $stmt = $this->db->prepare(
            "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$id, $name, $email, $hashedPassword, $role]);

        return [
            'success' => true,
            'user' => [
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'role' => $role
            ]
        ];
    }

    /**
     * Passwort-Reset-Token generieren
     */
    public function generateResetToken(string $email): array
    {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'error' => 'E-Mail nicht gefunden'];
        }

        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $stmt = $this->db->prepare(
            "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?"
        );
        $stmt->execute([$token, $expiry, $user['id']]);

        return ['success' => true, 'token' => $token];
    }

    /**
     * Passwort mit Token zurücksetzen
     */
    public function resetPassword(string $token, string $newPassword): array
    {
        $stmt = $this->db->prepare(
            "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()"
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'error' => 'Token ungültig oder abgelaufen'];
        }

        $hashedPassword = self::hashPassword($newPassword);

        $stmt = $this->db->prepare(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?"
        );
        $stmt->execute([$hashedPassword, $user['id']]);

        return ['success' => true];
    }
}
