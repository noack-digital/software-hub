<?php
/**
 * Category Model
 */

declare(strict_types=1);

class Category
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Alle Kategorien abrufen
     */
    public function getAll(): array
    {
        $stmt = $this->db->query(
            "SELECT c.*, COUNT(sc.software_id) as software_count
             FROM categories c
             LEFT JOIN software_categories sc ON c.id = sc.category_id
             GROUP BY c.id
             ORDER BY c.name ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Einzelne Kategorie abrufen
     */
    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Kategorie erstellen
     */
    public function create(array $data): array
    {
        $id = Database::generateId();

        $stmt = $this->db->prepare(
            "INSERT INTO categories (id, name, description, name_en, description_en) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['name'],
            $data['description'] ?? null,
            $data['nameEn'] ?? null,
            $data['descriptionEn'] ?? null
        ]);

        logAudit('create', 'category', $id, $data);

        return $this->getById($id);
    }

    /**
     * Kategorie aktualisieren
     */
    public function update(string $id, array $data): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $stmt = $this->db->prepare(
            "UPDATE categories SET
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

        logAudit('update', 'category', $id, $data);

        return $this->getById($id);
    }

    /**
     * Kategorie löschen
     */
    public function delete(string $id): array
    {
        // Prüfen, ob Kategorie verwendet wird
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM software_categories WHERE category_id = ?");
        $stmt->execute([$id]);
        $count = (int)$stmt->fetch()['count'];

        if ($count > 0) {
            return [
                'success' => false,
                'error' => "Kategorie wird von $count Software-Einträgen verwendet"
            ];
        }

        $existing = $this->getById($id);
        if (!$existing) {
            return ['success' => false, 'error' => 'Kategorie nicht gefunden'];
        }

        $stmt = $this->db->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);

        logAudit('delete', 'category', $id, $existing);

        return ['success' => true];
    }

    /**
     * Alle Kategorien löschen
     */
    public function deleteAll(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM categories");
        $count = (int)$stmt->fetch()['count'];

        $this->db->exec("DELETE FROM software_categories");
        $this->db->exec("DELETE FROM categories");

        return $count;
    }
}
