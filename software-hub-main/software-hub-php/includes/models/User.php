<?php
/**
 * User Model
 */

declare(strict_types=1);

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Alle Benutzer abrufen
     */
    public function getAll(string $search = ''): array
    {
        if ($search) {
            $stmt = $this->db->prepare(
                "SELECT id, name, email, role, created_at, updated_at FROM users
                 WHERE name LIKE ? OR email LIKE ?
                 ORDER BY name ASC"
            );
            $searchTerm = '%' . $search . '%';
            $stmt->execute([$searchTerm, $searchTerm]);
        } else {
            $stmt = $this->db->query(
                "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY name ASC"
            );
        }
        return $stmt->fetchAll();
    }

    /**
     * Einzelnen Benutzer abrufen
     */
    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Benutzer nach E-Mail abrufen
     */
    public function getByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, name, email, role, created_at, updated_at FROM users WHERE email = ?"
        );
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Benutzer erstellen
     */
    public function create(array $data): array
    {
        // E-Mail-Prüfung
        if ($this->getByEmail($data['email'])) {
            return ['success' => false, 'error' => 'E-Mail bereits registriert'];
        }

        $id = Database::generateId();
        $hashedPassword = Auth::hashPassword($data['password']);

        $stmt = $this->db->prepare(
            "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['name'],
            $data['email'],
            $hashedPassword,
            $data['role'] ?? 'USER'
        ]);

        logAudit('create', 'user', $id, ['name' => $data['name'], 'email' => $data['email'], 'role' => $data['role'] ?? 'USER']);

        return [
            'success' => true,
            'user' => $this->getById($id)
        ];
    }

    /**
     * Benutzer aktualisieren
     */
    public function update(string $id, array $data): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        // E-Mail-Prüfung bei Änderung
        if (isset($data['email']) && $data['email'] !== $existing['email']) {
            if ($this->getByEmail($data['email'])) {
                return null;
            }
        }

        $updates = [];
        $params = [];

        if (isset($data['name'])) {
            $updates[] = 'name = ?';
            $params[] = $data['name'];
        }
        if (isset($data['email'])) {
            $updates[] = 'email = ?';
            $params[] = $data['email'];
        }
        if (isset($data['role'])) {
            $updates[] = 'role = ?';
            $params[] = $data['role'];
        }
        if (isset($data['password']) && !empty($data['password'])) {
            $updates[] = 'password = ?';
            $params[] = Auth::hashPassword($data['password']);
        }

        if (empty($updates)) {
            return $existing;
        }

        $params[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        logAudit('update', 'user', $id, $data);

        return $this->getById($id);
    }

    /**
     * Benutzer löschen
     */
    public function delete(string $id): bool
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return false;
        }

        // Verhindere Löschen des letzten Admins
        if ($existing['role'] === 'ADMIN') {
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'");
            if ((int)$stmt->fetch()['count'] <= 1) {
                return false;
            }
        }

        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        logAudit('delete', 'user', $id, $existing);

        return true;
    }

    /**
     * Benutzeranzahl
     */
    public function count(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM users");
        return (int)$stmt->fetch()['count'];
    }
}
