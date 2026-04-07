<?php
/**
 * Software Model
 */

declare(strict_types=1);

class Software
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Alle Software abrufen mit optionalen Filtern
     */
    public function getAll(array $filters = []): array
    {
        $where = ['1=1'];
        $params = [];

        // Suchfilter
        if (!empty($filters['search'])) {
            $where[] = '(s.name LIKE ? OR s.short_description LIKE ? OR s.description LIKE ?)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Kategorie-Filter
        if (!empty($filters['category'])) {
            $where[] = 'EXISTS (SELECT 1 FROM software_categories sc WHERE sc.software_id = s.id AND sc.category_id = ?)';
            $params[] = $filters['category'];
        }

        // Zielgruppen-Filter
        if (!empty($filters['targetGroup'])) {
            $where[] = 'EXISTS (SELECT 1 FROM software_target_groups stg WHERE stg.software_id = s.id AND stg.target_group_id = ?)';
            $params[] = $filters['targetGroup'];
        }

        // Verfügbarkeits-Filter
        if (isset($filters['available'])) {
            $where[] = 's.available = ?';
            $params[] = $filters['available'] ? 1 : 0;
        }

        $sql = "SELECT s.* FROM software s WHERE " . implode(' AND ', $where) . " ORDER BY s.name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $software = $stmt->fetchAll();

        // Kategorien und Zielgruppen für jede Software laden
        foreach ($software as &$item) {
            $item['categories'] = $this->getCategories($item['id']);
            $item['targetGroups'] = $this->getTargetGroups($item['id']);
            $item['departments'] = $this->getDepartments($item['id']);
            $item['types'] = json_decode($item['types'] ?? '[]', true);
        }

        return $software;
    }

    /**
     * ID einer Software anhand des Namens (exakte Übereinstimmung, für Import-Deduplizierung)
     */
    public function getIdByName(string $name): ?string
    {
        $stmt = $this->db->prepare("SELECT id FROM software WHERE name = ? LIMIT 1");
        $stmt->execute([trim($name)]);
        $row = $stmt->fetch();
        return $row ? $row['id'] : null;
    }

    /**
     * Einzelne Software abrufen
     */
    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM software WHERE id = ?");
        $stmt->execute([$id]);
        $software = $stmt->fetch();

        if (!$software) {
            return null;
        }

        $software['categories'] = $this->getCategories($id);
        $software['targetGroups'] = $this->getTargetGroups($id);
        $software['departments'] = $this->getDepartments($id);
        $software['types'] = json_decode($software['types'] ?? '[]', true);
        $software['contacts'] = $this->getContacts($id);

        return $software;
    }

    /**
     * Ansprechpersonen einer Software abrufen
     */
    public function getContacts(string $softwareId): array
    {
        try {
        $stmt = $this->db->prepare(
            "SELECT id, salutation, first_name, last_name, profile_url, email, contact_roles, is_account_recipient, sort_order
             FROM software_contacts WHERE software_id = ? ORDER BY sort_order ASC, last_name ASC"
        );
            $stmt->execute([$softwareId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            return [];
        }
    }

    /**
     * Kategorien einer Software abrufen
     */
    private function getCategories(string $softwareId): array
    {
        $stmt = $this->db->prepare(
            "SELECT c.* FROM categories c
             INNER JOIN software_categories sc ON c.id = sc.category_id
             WHERE sc.software_id = ?"
        );
        $stmt->execute([$softwareId]);
        return $stmt->fetchAll();
    }

    /**
     * Zielgruppen einer Software abrufen
     */
    private function getTargetGroups(string $softwareId): array
    {
        $stmt = $this->db->prepare(
            "SELECT tg.* FROM target_groups tg
             INNER JOIN software_target_groups stg ON tg.id = stg.target_group_id
             WHERE stg.software_id = ?"
        );
        $stmt->execute([$softwareId]);
        return $stmt->fetchAll();
    }

    /**
     * Abteilungen einer Software abrufen
     */
    private function getDepartments(string $softwareId): array
    {
        $stmt = $this->db->prepare(
            "SELECT d.* FROM departments d
             INNER JOIN software_departments sd ON d.id = sd.department_id
             WHERE sd.software_id = ?"
        );
        $stmt->execute([$softwareId]);
        return $stmt->fetchAll();
    }

    /**
     * Abteilungen für Software setzen
     */
    private function setDepartments(string $softwareId, array $departmentIds): void
    {
        $this->db->prepare("DELETE FROM software_departments WHERE software_id = ?")->execute([$softwareId]);

        $stmt = $this->db->prepare(
            "INSERT INTO software_departments (software_id, department_id) VALUES (?, ?)"
        );
        foreach ($departmentIds as $departmentId) {
            $stmt->execute([$softwareId, $departmentId]);
        }
    }

    /**
     * Software erstellen
     */
    public function create(array $data): array
    {
        $id = Database::generateId();

        $stmt = $this->db->prepare(
            "INSERT INTO software (id, name, url, logo, short_description, description, types, costs, cost_model, cost_price,
             tutorials, tutorials_en, access_info, access_info_en, features, alternatives, notes, available, data_privacy_status, inhouse_hosted, hosting_location, privacy_note,
             name_en, short_description_en, description_en, features_en, alternatives_en, notes_en, reason_hnee, reason_hnee_en, steckbrief_path, steckbrief_original_name, show_account_request, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $id,
            $data['name'],
            $data['url'] ?? null,
            $data['logo'] ?? null,
            $data['short_description'] ?? $data['shortDescription'] ?? null,
            $data['description'] ?? '',
            json_encode($data['types'] ?? []),
            $data['costs'] ?? 'kostenlos',
            $data['cost_model'] ?? null,
            $data['cost_price'] ?? null,
            $data['tutorials'] ?? null,
            $data['tutorials_en'] ?? null,
            $data['access_info'] ?? $data['accessInfo'] ?? null,
            $data['access_info_en'] ?? null,
            $data['features'] ?? null,
            $data['alternatives'] ?? null,
            $data['notes'] ?? null,
            isset($data['available']) ? ($data['available'] ? 1 : 0) : 1,
            $data['privacy_status'] ?? $data['dataPrivacyStatus'] ?? 'UNKNOWN',
            isset($data['is_inhouse']) ? ($data['is_inhouse'] ? 1 : 0) : (isset($data['inhouseHosted']) ? ($data['inhouseHosted'] ? 1 : 0) : 0),
            $data['hosting_location'] ?? 'UNKNOWN',
            $data['privacy_note'] ?? null,
            $data['name_en'] ?? $data['nameEn'] ?? null,
            $data['short_description_en'] ?? $data['shortDescriptionEn'] ?? null,
            $data['description_en'] ?? $data['descriptionEn'] ?? null,
            $data['features_en'] ?? $data['featuresEn'] ?? null,
            $data['alternatives_en'] ?? $data['alternativesEn'] ?? null,
            $data['notes_en'] ?? $data['notesEn'] ?? null,
            $data['reason_hnee'] ?? null,
            $data['reason_hnee_en'] ?? null,
            $data['steckbrief_path'] ?? null,
            $data['steckbrief_original_name'] ?? null,
            isset($data['show_account_request']) ? ($data['show_account_request'] ? 1 : 0) : 1,
            Auth::getCurrentUser()['id'] ?? null
        ]);

        // Kategorien zuweisen
        if (!empty($data['categories'])) {
            $this->setCategories($id, $data['categories']);
        }

        // Zielgruppen zuweisen
        if (!empty($data['target_groups']) || !empty($data['targetGroups'])) {
            $this->setTargetGroups($id, $data['target_groups'] ?? $data['targetGroups']);
        }

        // Abteilungen zuweisen
        if (!empty($data['departments'])) {
            $this->setDepartments($id, $data['departments']);
        }

        // Ansprechpersonen
        if (isset($data['contacts']) && is_array($data['contacts'])) {
            $this->setContacts($id, $data['contacts']);
        }

        logAudit('create', 'software', $id, $data);

        return $this->getById($id);
    }

    /**
     * Software aktualisieren
     */
    public function update(string $id, array $data): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $stmt = $this->db->prepare(
            "UPDATE software SET
             name = COALESCE(?, name),
             url = COALESCE(?, url),
             logo = COALESCE(?, logo),
             short_description = COALESCE(?, short_description),
             description = COALESCE(?, description),
             types = COALESCE(?, types),
             costs = COALESCE(?, costs),
             cost_model = COALESCE(?, cost_model),
             cost_price = COALESCE(?, cost_price),
             tutorials = COALESCE(?, tutorials),
             tutorials_en = COALESCE(?, tutorials_en),
             access_info = COALESCE(?, access_info),
             access_info_en = COALESCE(?, access_info_en),
             features = COALESCE(?, features),
             alternatives = COALESCE(?, alternatives),
             notes = COALESCE(?, notes),
             available = COALESCE(?, available),
             data_privacy_status = COALESCE(?, data_privacy_status),
             inhouse_hosted = COALESCE(?, inhouse_hosted),
             hosting_location = COALESCE(?, hosting_location),
             privacy_note = COALESCE(?, privacy_note),
             name_en = COALESCE(?, name_en),
             short_description_en = COALESCE(?, short_description_en),
             description_en = COALESCE(?, description_en),
             features_en = COALESCE(?, features_en),
             alternatives_en = COALESCE(?, alternatives_en),
             notes_en = COALESCE(?, notes_en),
             reason_hnee = COALESCE(?, reason_hnee),
             reason_hnee_en = COALESCE(?, reason_hnee_en),
             steckbrief_path = COALESCE(?, steckbrief_path),
             steckbrief_original_name = COALESCE(?, steckbrief_original_name),
             show_account_request = COALESCE(?, show_account_request)
             WHERE id = ?"
        );

        $stmt->execute([
            $data['name'] ?? null,
            $data['url'] ?? null,
            $data['logo'] ?? null,
            $data['short_description'] ?? $data['shortDescription'] ?? null,
            $data['description'] ?? null,
            isset($data['types']) ? json_encode($data['types']) : null,
            $data['costs'] ?? null,
            $data['cost_model'] ?? null,
            $data['cost_price'] ?? null,
            $data['tutorials'] ?? null,
            $data['tutorials_en'] ?? null,
            $data['access_info'] ?? $data['accessInfo'] ?? null,
            $data['access_info_en'] ?? null,
            $data['features'] ?? null,
            $data['alternatives'] ?? null,
            $data['notes'] ?? null,
            isset($data['available']) ? ($data['available'] ? 1 : 0) : null,
            $data['privacy_status'] ?? $data['dataPrivacyStatus'] ?? null,
            isset($data['is_inhouse']) ? ($data['is_inhouse'] ? 1 : 0) : (isset($data['inhouseHosted']) ? ($data['inhouseHosted'] ? 1 : 0) : null),
            $data['hosting_location'] ?? null,
            $data['privacy_note'] ?? null,
            $data['name_en'] ?? $data['nameEn'] ?? null,
            $data['short_description_en'] ?? $data['shortDescriptionEn'] ?? null,
            $data['description_en'] ?? $data['descriptionEn'] ?? null,
            $data['features_en'] ?? $data['featuresEn'] ?? null,
            $data['alternatives_en'] ?? $data['alternativesEn'] ?? null,
            $data['notes_en'] ?? $data['notesEn'] ?? null,
            $data['reason_hnee'] ?? null,
            $data['reason_hnee_en'] ?? null,
            array_key_exists('steckbrief_path', $data) ? $data['steckbrief_path'] : null,
            array_key_exists('steckbrief_original_name', $data) ? $data['steckbrief_original_name'] : null,
            isset($data['show_account_request']) ? ($data['show_account_request'] ? 1 : 0) : null,
            $id
        ]);

        // Kategorien aktualisieren
        if (isset($data['categories'])) {
            $this->setCategories($id, $data['categories']);
        }

        // Zielgruppen aktualisieren
        if (isset($data['target_groups']) || isset($data['targetGroups'])) {
            $this->setTargetGroups($id, $data['target_groups'] ?? $data['targetGroups']);
        }

        // Abteilungen aktualisieren
        if (isset($data['departments'])) {
            $this->setDepartments($id, $data['departments']);
        }

        // Ansprechpersonen aktualisieren
        if (array_key_exists('contacts', $data)) {
            $this->setContacts($id, is_array($data['contacts']) ? $data['contacts'] : []);
        }

        logAudit('update', 'software', $id, $data);

        return $this->getById($id);
    }

    /**
     * Software löschen
     */
    public function delete(string $id): bool
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return false;
        }

        $stmt = $this->db->prepare("DELETE FROM software WHERE id = ?");
        $stmt->execute([$id]);

        logAudit('delete', 'software', $id, $existing);

        return true;
    }

    /**
     * Kategorien für Software setzen
     */
    private function setCategories(string $softwareId, array $categoryIds): void
    {
        $this->db->prepare("DELETE FROM software_categories WHERE software_id = ?")->execute([$softwareId]);

        $stmt = $this->db->prepare(
            "INSERT INTO software_categories (software_id, category_id) VALUES (?, ?)"
        );
        foreach ($categoryIds as $categoryId) {
            $stmt->execute([$softwareId, $categoryId]);
        }
    }

    /**
     * Zielgruppen für Software setzen
     */
    private function setTargetGroups(string $softwareId, array $targetGroupIds): void
    {
        $this->db->prepare("DELETE FROM software_target_groups WHERE software_id = ?")->execute([$softwareId]);

        $stmt = $this->db->prepare(
            "INSERT INTO software_target_groups (software_id, target_group_id) VALUES (?, ?)"
        );
        foreach ($targetGroupIds as $targetGroupId) {
            $stmt->execute([$softwareId, $targetGroupId]);
        }
    }

    /**
     * Ansprechpersonen für Software setzen
     */
    private function setContacts(string $softwareId, array $contacts): void
    {
        try {
            $this->db->prepare("DELETE FROM software_contacts WHERE software_id = ?")->execute([$softwareId]);
        } catch (PDOException $e) {
            return;
        }

        if (empty($contacts)) {
            return;
        }

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO software_contacts (id, software_id, salutation, first_name, last_name, profile_url, email, contact_roles, is_account_recipient, sort_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $order = 0;
            foreach ($contacts as $c) {
                $id = $c['id'] ?? Database::generateId();
                $firstName = trim($c['first_name'] ?? $c['firstName'] ?? '');
                $lastName = trim($c['last_name'] ?? $c['lastName'] ?? '');
                if ($firstName === '' && $lastName === '') {
                    continue;
                }
                $roles = $c['contact_roles'] ?? $c['contactRoles'] ?? null;
                if (is_array($roles)) {
                    $roles = implode(',', array_map('trim', $roles));
                }
                $stmt->execute([
                    $id,
                    $softwareId,
                    $c['salutation'] ?? null,
                    $firstName,
                    $lastName,
                    $c['profile_url'] ?? $c['profileUrl'] ?? null,
                    $c['email'] ?? null,
                    $roles ?: null,
                    isset($c['is_account_recipient']) ? ($c['is_account_recipient'] ? 1 : 0) : 0,
                    (int)($c['sort_order'] ?? $c['sortOrder'] ?? $order++)
                ]);
            }
        } catch (PDOException $e) {
            // Tabelle fehlt z. B. vor Migration
        }
    }

    /**
     * Statistiken abrufen
     */
    public function getStats(): array
    {
        $stats = [];

        // Gesamtanzahl
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM software");
        $stats['total'] = (int)$stmt->fetch()['total'];

        // Verfügbare Software
        $stmt = $this->db->query("SELECT COUNT(*) as available FROM software WHERE available = 1");
        $stats['available'] = (int)$stmt->fetch()['available'];

        // Nach Kategorien
        $stmt = $this->db->query(
            "SELECT c.name, COUNT(sc.software_id) as count
             FROM categories c
             LEFT JOIN software_categories sc ON c.id = sc.category_id
             GROUP BY c.id, c.name
             ORDER BY count DESC"
        );
        $stats['byCategory'] = $stmt->fetchAll();

        return $stats;
    }

    /**
     * Alle Software löschen (für Demo-Reset)
     */
    public function deleteAll(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM software");
        $count = (int)$stmt->fetch()['count'];

        $this->db->exec("DELETE FROM software");

        return $count;
    }
}
