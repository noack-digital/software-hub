<?php
/**
 * Database - PDO Datenbankverbindung für MariaDB
 */

declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Datenbankverbindung fehlgeschlagen");
            }
        }

        return self::$instance;
    }

    /**
     * Generiert eine eindeutige ID (CUID-ähnlich)
     */
    public static function generateId(): string
    {
        $timestamp = dechex((int)(microtime(true) * 1000));
        $random = bin2hex(random_bytes(8));
        return substr('cl' . $timestamp . $random, 0, 25);
    }

    /**
     * Verhindert Klonen
     */
    private function __clone() {}

    /**
     * Verhindert Unserialisierung
     */
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize singleton");
    }
}
