<?php
/**
 * FooterLink Model Class
 */

declare(strict_types=1);

class FooterLink
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all footer links ordered by order field
     */
    public function getAll(bool $activeOnly = false): array
    {
        $sql = "SELECT * FROM footer_links";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY `order` ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get a footer link by ID
     */
    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM footer_links WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Create a new footer link
     */
    public function create(array $data): array
    {
        $id = generateId();
        $text = $data['text'] ?? '';
        $text_en = $data['text_en'] ?? null;
        $url = $data['url'] ?? '';
        $order = isset($data['order']) ? (int)$data['order'] : 0;
        $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;

        $stmt = $this->db->prepare(
            "INSERT INTO footer_links (id, text, text_en, url, `order`, is_active)
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $id,
            $text,
            $text_en,
            $url,
            $order,
            $is_active ? 1 : 0
        ]);

        logAudit('CREATE', 'FooterLink', $id, $data);

        return $this->getById($id);
    }

    /**
     * Update a footer link
     */
    public function update(string $id, array $data): ?array
    {
        $current = $this->getById($id);
        if (!$current) {
            return null;
        }

        $updates = [];
        $params = [];

        if (isset($data['text'])) {
            $updates[] = "text = ?";
            $params[] = $data['text'];
        }
        if (isset($data['text_en'])) {
            $updates[] = "text_en = ?";
            $params[] = $data['text_en'];
        }
        if (isset($data['url'])) {
            $updates[] = "url = ?";
            $params[] = $data['url'];
        }
        if (isset($data['order'])) {
            $updates[] = "`order` = ?";
            $params[] = (int)$data['order'];
        }
        if (isset($data['is_active'])) {
            $updates[] = "is_active = ?";
            $params[] = (bool)$data['is_active'] ? 1 : 0;
        }

        if (empty($updates)) {
            return $current;
        }

        $params[] = $id;
        $sql = "UPDATE footer_links SET " . implode(', ', $updates) . " WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        logAudit('UPDATE', 'FooterLink', $id, $data);

        return $this->getById($id);
    }

    /**
     * Delete a footer link
     */
    public function delete(string $id): bool
    {
        $current = $this->getById($id);
        if (!$current) {
            return false;
        }

        $stmt = $this->db->prepare("DELETE FROM footer_links WHERE id = ?");
        $result = $stmt->execute([$id]);

        if ($result) {
            logAudit('DELETE', 'FooterLink', $id, $current);
        }

        return $result;
    }

    /**
     * Reorder footer links
     */
    public function reorder(array $orderedIds): bool
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("UPDATE footer_links SET `order` = ? WHERE id = ?");

            foreach ($orderedIds as $index => $id) {
                $stmt->execute([$index, $id]);
            }

            $this->db->commit();
            logAudit('REORDER', 'FooterLink', 'multiple', ['orderedIds' => $orderedIds]);
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("FooterLink reorder error: " . $e->getMessage());
            return false;
        }
    }
}
