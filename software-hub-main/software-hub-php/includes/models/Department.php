<?php
/**
 * Department Model
 */

declare(strict_types=1);

class Department
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(): array
    {
        $stmt = $this->db->query(
            "SELECT d.*, COUNT(sd.software_id) as software_count
             FROM departments d
             LEFT JOIN software_departments sd ON d.id = sd.department_id
             GROUP BY d.id
             ORDER BY d.name ASC"
        );
        return $stmt->fetchAll();
    }

    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM departments WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): array
    {
        $id = Database::generateId();

        $stmt = $this->db->prepare(
            "INSERT INTO departments (id, name, description, name_en, description_en) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['name'],
            $data['description'] ?? null,
            $data['nameEn'] ?? $data['name_en'] ?? null,
            $data['descriptionEn'] ?? $data['description_en'] ?? null
        ]);

        logAudit('create', 'department', $id, $data);

        return $this->getById($id);
    }

    public function update(string $id, array $data): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $stmt = $this->db->prepare(
            "UPDATE departments SET
             name = COALESCE(?, name),
             description = COALESCE(?, description),
             name_en = COALESCE(?, name_en),
             description_en = COALESCE(?, description_en)
             WHERE id = ?"
        );
        $stmt->execute([
            $data['name'] ?? null,
            $data['description'] ?? null,
            $data['nameEn'] ?? $data['name_en'] ?? null,
            $data['descriptionEn'] ?? $data['description_en'] ?? null,
            $id
        ]);

        logAudit('update', 'department', $id, $data);

        return $this->getById($id);
    }

    public function delete(string $id): array
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM software_departments WHERE department_id = ?");
        $stmt->execute([$id]);
        $count = (int)$stmt->fetch()['count'];

        if ($count > 0) {
            return [
                'success' => false,
                'error' => "Abteilung wird von $count Software-Einträgen verwendet"
            ];
        }

        $existing = $this->getById($id);
        if (!$existing) {
            return ['success' => false, 'error' => 'Abteilung nicht gefunden'];
        }

        $stmt = $this->db->prepare("DELETE FROM departments WHERE id = ?");
        $stmt->execute([$id]);

        logAudit('delete', 'department', $id, $existing);

        return ['success' => true];
    }

    public function deleteAll(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM departments");
        $count = (int)$stmt->fetch()['count'];

        $this->db->exec("DELETE FROM software_departments");
        $this->db->exec("DELETE FROM departments");

        return $count;
    }
}
