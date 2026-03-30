<?php
/**
 * TargetGroup Model
 */

declare(strict_types=1);

class TargetGroup
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Alle Zielgruppen abrufen
     */
    public function getAll(): array
    {
        $stmt = $this->db->query(
            "SELECT tg.*, COUNT(stg.software_id) as software_count
             FROM target_groups tg
             LEFT JOIN software_target_groups stg ON tg.id = stg.target_group_id
             GROUP BY tg.id
             ORDER BY tg.name ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Einzelne Zielgruppe abrufen
     */
    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM target_groups WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Zielgruppe erstellen
     */
    public function create(array $data): array
    {
        $id = Database::generateId();

        $stmt = $this->db->prepare(
            "INSERT INTO target_groups (id, name, description, name_en, description_en) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['name'],
            $data['description'] ?? null,
            $data['nameEn'] ?? null,
            $data['descriptionEn'] ?? null
        ]);

        logAudit('create', 'target_group', $id, $data);

        return $this->getById($id);
    }

    /**
     * Zielgruppe aktualisieren
     */
    public function update(string $id, array $data): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $stmt = $this->db->prepare(
            "UPDATE target_groups SET
             name = COALESCE(?, name),
             description = COALESCE(?, description),
             name_en = COALESCE(?, name_en),
             description_en = COALESCE(?, description_en)
             WHERE id = ?"
        );
        $stmt->execute([
            $data['name'] ?? null,
            $data['description'] ?? null,
            $data['nameEn'] ?? null,
            $data['descriptionEn'] ?? null,
            $id
        ]);

        logAudit('update', 'target_group', $id, $data);

        return $this->getById($id);
    }

    /**
     * Zielgruppe löschen
     */
    public function delete(string $id): array
    {
        // Prüfen, ob Zielgruppe verwendet wird
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM software_target_groups WHERE target_group_id = ?");
        $stmt->execute([$id]);
        $count = (int)$stmt->fetch()['count'];

        if ($count > 0) {
            return [
                'success' => false,
                'error' => "Zielgruppe wird von $count Software-Einträgen verwendet"
            ];
        }

        $existing = $this->getById($id);
        if (!$existing) {
            return ['success' => false, 'error' => 'Zielgruppe nicht gefunden'];
        }

        $stmt = $this->db->prepare("DELETE FROM target_groups WHERE id = ?");
        $stmt->execute([$id]);

        logAudit('delete', 'target_group', $id, $existing);

        return ['success' => true];
    }

    /**
     * Alle Zielgruppen löschen
     */
    public function deleteAll(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM target_groups");
        $count = (int)$stmt->fetch()['count'];

        $this->db->exec("DELETE FROM software_target_groups");
        $this->db->exec("DELETE FROM target_groups");

        return $count;
    }
}
