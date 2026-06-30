<?php
/**
 * Software Submission Model (public suggestions)
 */

declare(strict_types=1);

class SoftwareSubmission
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(array $filters = []): array
    {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = '(s.name LIKE ? OR s.submitter_name LIKE ? OR s.submitter_email LIKE ?)';
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if (!empty($filters['status'])) {
            $where[] = 's.status = ?';
            $params[] = $filters['status'];
        }

        $sql = "SELECT s.* FROM software_submissions s WHERE " . implode(' AND ', $where) . " ORDER BY s.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            $item = $this->enrichItem($item);
        }

        return $items;
    }

    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM software_submissions WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if (!$item) {
            return null;
        }
        return $this->enrichItem($item);
    }

    public function countPending(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as cnt FROM software_submissions WHERE status = 'pending'");
        return (int)$stmt->fetch()['cnt'];
    }

    public function create(array $data): array
    {
        $id = Database::generateId();

        $stmt = $this->db->prepare(
            "INSERT INTO software_submissions (
                id, status, submitter_name, submitter_email, name, url, logo,
                short_description, description, types, costs, cost_model, cost_price,
                tutorials, tutorials_en, access_info, access_info_en, features, alternatives, notes,
                data_privacy_status, inhouse_hosted, hosting_location, privacy_note,
                name_en, short_description_en, description_en, features_en, alternatives_en, notes_en,
                reason_hnee, reason_hnee_en, steckbrief_path, steckbrief_original_name, show_account_request
            ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute($this->buildInsertParams($id, $data));

        if (!empty($data['categories'])) {
            $this->setCategories($id, $data['categories']);
        }
        if (!empty($data['target_groups']) || !empty($data['targetGroups'])) {
            $this->setTargetGroups($id, $data['target_groups'] ?? $data['targetGroups']);
        }
        if (!empty($data['departments'])) {
            $this->setDepartments($id, $data['departments']);
        }
        if (isset($data['contacts']) && is_array($data['contacts'])) {
            $this->setContacts($id, $data['contacts']);
        }

        return $this->getById($id);
    }

    public function update(string $id, array $data): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $stmt = $this->db->prepare(
            "UPDATE software_submissions SET
                submitter_name = COALESCE(?, submitter_name),
                submitter_email = COALESCE(?, submitter_email),
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
            $data['submitter_name'] ?? $data['submitterName'] ?? null,
            $data['submitter_email'] ?? $data['submitterEmail'] ?? null,
            $data['name'] ?? null,
            $data['url'] ?? null,
            $data['logo'] ?? null,
            $data['short_description'] ?? $data['shortDescription'] ?? null,
            $data['description'] ?? null,
            isset($data['types']) ? json_encode($data['types']) : null,
            $data['costs'] ?? null,
            $data['cost_model'] ?? $data['costModel'] ?? null,
            $data['cost_price'] ?? $data['costPrice'] ?? null,
            $data['tutorials'] ?? null,
            $data['tutorials_en'] ?? $data['tutorialsEn'] ?? null,
            $data['access_info'] ?? $data['accessInfo'] ?? null,
            $data['access_info_en'] ?? $data['accessInfoEn'] ?? null,
            $data['features'] ?? null,
            $data['alternatives'] ?? null,
            $data['notes'] ?? null,
            $data['privacy_status'] ?? $data['dataPrivacyStatus'] ?? null,
            isset($data['is_inhouse']) ? ($data['is_inhouse'] ? 1 : 0) : (isset($data['inhouseHosted']) ? ($data['inhouseHosted'] ? 1 : 0) : null),
            $data['hosting_location'] ?? $data['hostingLocation'] ?? null,
            $data['privacy_note'] ?? $data['privacyNote'] ?? null,
            $data['name_en'] ?? $data['nameEn'] ?? null,
            $data['short_description_en'] ?? $data['shortDescriptionEn'] ?? null,
            $data['description_en'] ?? $data['descriptionEn'] ?? null,
            $data['features_en'] ?? $data['featuresEn'] ?? null,
            $data['alternatives_en'] ?? $data['alternativesEn'] ?? null,
            $data['notes_en'] ?? $data['notesEn'] ?? null,
            $data['reason_hnee'] ?? $data['reasonHnee'] ?? null,
            $data['reason_hnee_en'] ?? $data['reasonHneeEn'] ?? null,
            array_key_exists('steckbrief_path', $data) ? $data['steckbrief_path'] : null,
            array_key_exists('steckbrief_original_name', $data) ? $data['steckbrief_original_name'] : null,
            isset($data['show_account_request']) ? ($data['show_account_request'] ? 1 : 0) : null,
            $id
        ]);

        if (isset($data['categories'])) {
            $this->setCategories($id, $data['categories']);
        }
        if (isset($data['target_groups']) || isset($data['targetGroups'])) {
            $this->setTargetGroups($id, $data['target_groups'] ?? $data['targetGroups']);
        }
        if (isset($data['departments'])) {
            $this->setDepartments($id, $data['departments']);
        }
        if (array_key_exists('contacts', $data)) {
            $this->setContacts($id, is_array($data['contacts']) ? $data['contacts'] : []);
        }

        logAudit('update', 'software_submission', $id, $data);

        return $this->getById($id);
    }

    public function approve(string $id, ?string $reviewerId = null): ?array
    {
        $submission = $this->getById($id);
        if (!$submission || $submission['status'] === 'approved') {
            return null;
        }

        $softwareData = $this->mapToSoftwareData($submission);
        $softwareData['available'] = true;

        $software = new Software();
        $created = $software->create($softwareData);

        $stmt = $this->db->prepare(
            "UPDATE software_submissions SET status = 'approved', reviewed_at = NOW(), reviewed_by_user_id = ?, approved_software_id = ? WHERE id = ?"
        );
        $stmt->execute([$reviewerId, $created['id'], $id]);

        logAudit('approve', 'software_submission', $id, ['approved_software_id' => $created['id']]);

        return [
            'submission' => $this->getById($id),
            'software' => $created
        ];
    }

    public function reject(string $id, ?string $reviewerId = null): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $stmt = $this->db->prepare(
            "UPDATE software_submissions SET status = 'rejected', reviewed_at = NOW(), reviewed_by_user_id = ? WHERE id = ?"
        );
        $stmt->execute([$reviewerId, $id]);

        logAudit('reject', 'software_submission', $id, []);

        return $this->getById($id);
    }

    public function delete(string $id): bool
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return false;
        }

        $stmt = $this->db->prepare("DELETE FROM software_submissions WHERE id = ?");
        $stmt->execute([$id]);

        logAudit('delete', 'software_submission', $id, $existing);

        return true;
    }

    private function buildInsertParams(string $id, array $data): array
    {
        return [
            $id,
            $data['submitter_name'] ?? $data['submitterName'] ?? '',
            $data['submitter_email'] ?? $data['submitterEmail'] ?? '',
            $data['name'],
            $data['url'] ?? null,
            $data['logo'] ?? null,
            $data['short_description'] ?? $data['shortDescription'] ?? null,
            $data['description'] ?? '',
            json_encode($data['types'] ?? []),
            $data['costs'] ?? 'kostenlos',
            $data['cost_model'] ?? $data['costModel'] ?? null,
            $data['cost_price'] ?? $data['costPrice'] ?? null,
            $data['tutorials'] ?? null,
            $data['tutorials_en'] ?? $data['tutorialsEn'] ?? null,
            $data['access_info'] ?? $data['accessInfo'] ?? null,
            $data['access_info_en'] ?? $data['accessInfoEn'] ?? null,
            $data['features'] ?? null,
            $data['alternatives'] ?? null,
            $data['notes'] ?? null,
            $data['privacy_status'] ?? $data['dataPrivacyStatus'] ?? 'UNKNOWN',
            isset($data['is_inhouse']) ? ($data['is_inhouse'] ? 1 : 0) : (isset($data['inhouseHosted']) ? ($data['inhouseHosted'] ? 1 : 0) : 0),
            $data['hosting_location'] ?? $data['hostingLocation'] ?? 'UNKNOWN',
            $data['privacy_note'] ?? $data['privacyNote'] ?? null,
            $data['name_en'] ?? $data['nameEn'] ?? null,
            $data['short_description_en'] ?? $data['shortDescriptionEn'] ?? null,
            $data['description_en'] ?? $data['descriptionEn'] ?? null,
            $data['features_en'] ?? $data['featuresEn'] ?? null,
            $data['alternatives_en'] ?? $data['alternativesEn'] ?? null,
            $data['notes_en'] ?? $data['notesEn'] ?? null,
            $data['reason_hnee'] ?? $data['reasonHnee'] ?? null,
            $data['reason_hnee_en'] ?? $data['reasonHneeEn'] ?? null,
            $data['steckbrief_path'] ?? null,
            $data['steckbrief_original_name'] ?? $data['steckbriefOriginalName'] ?? null,
            isset($data['show_account_request']) ? ($data['show_account_request'] ? 1 : 0) : 1,
        ];
    }

    private function mapToSoftwareData(array $submission): array
    {
        $logo = $this->promoteUploadPath($submission['logo'] ?? null, 'logos');
        $steckbrief = $this->promoteUploadPath($submission['steckbrief_path'] ?? null, 'steckbriefe');

        return [
            'name' => $submission['name'],
            'name_en' => $submission['name_en'],
            'url' => $submission['url'],
            'logo' => $logo,
            'short_description' => $submission['short_description'],
            'short_description_en' => $submission['short_description_en'],
            'description' => $submission['description'],
            'description_en' => $submission['description_en'],
            'types' => $submission['types'] ?? [],
            'costs' => $submission['costs'],
            'cost_model' => $submission['cost_model'],
            'cost_price' => $submission['cost_price'],
            'tutorials' => $submission['tutorials'],
            'tutorials_en' => $submission['tutorials_en'],
            'access_info' => $submission['access_info'],
            'access_info_en' => $submission['access_info_en'],
            'features' => $submission['features'],
            'features_en' => $submission['features_en'],
            'alternatives' => $submission['alternatives'],
            'alternatives_en' => $submission['alternatives_en'],
            'notes' => $submission['notes'],
            'notes_en' => $submission['notes_en'],
            'reason_hnee' => $submission['reason_hnee'],
            'reason_hnee_en' => $submission['reason_hnee_en'],
            'privacy_status' => $submission['data_privacy_status'],
            'is_inhouse' => (bool)$submission['inhouse_hosted'],
            'hosting_location' => $submission['hosting_location'],
            'privacy_note' => $submission['privacy_note'],
            'steckbrief_path' => $steckbrief,
            'steckbrief_original_name' => $submission['steckbrief_original_name'],
            'show_account_request' => (bool)$submission['show_account_request'],
            'categories' => array_column($submission['categories'] ?? [], 'id'),
            'targetGroups' => array_column($submission['targetGroups'] ?? [], 'id'),
            'departments' => array_column($submission['departments'] ?? [], 'id'),
            'contacts' => $submission['contacts'] ?? [],
        ];
    }

    private function promoteUploadPath(?string $path, string $targetSubdir): ?string
    {
        if (!$path) {
            return null;
        }

        if (!str_contains($path, '/uploads/submissions/')) {
            return $path;
        }

        $basename = basename($path);
        $sourceFile = UPLOAD_DIR . 'submissions/' . $targetSubdir . '/' . $basename;
        if (!is_file($sourceFile)) {
            $sourceFile = UPLOAD_DIR . ltrim(str_replace('/uploads/', '', $path), '/');
        }
        if (!is_file($sourceFile)) {
            return $path;
        }

        $targetDir = UPLOAD_DIR . $targetSubdir . '/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $newName = Database::generateId() . '_' . $basename;
        $targetFile = $targetDir . $newName;
        if (@copy($sourceFile, $targetFile)) {
            return '/uploads/' . $targetSubdir . '/' . $newName;
        }

        return $path;
    }

    private function enrichItem(array $item): array
    {
        $item['types'] = json_decode($item['types'] ?? '[]', true);
        $item['categories'] = $this->getCategories($item['id']);
        $item['targetGroups'] = $this->getTargetGroups($item['id']);
        $item['departments'] = $this->getDepartments($item['id']);
        $item['contacts'] = $this->getContacts($item['id']);
        $item['submitterName'] = $item['submitter_name'];
        $item['submitterEmail'] = $item['submitter_email'];
        $item['dataPrivacyStatus'] = $item['data_privacy_status'];
        $item['shortDescription'] = $item['short_description'];
        $item['shortDescriptionEn'] = $item['short_description_en'];
        $item['nameEn'] = $item['name_en'];
        return $item;
    }

    private function getCategories(string $submissionId): array
    {
        $stmt = $this->db->prepare(
            "SELECT c.* FROM categories c
             INNER JOIN submission_categories sc ON c.id = sc.category_id
             WHERE sc.submission_id = ?"
        );
        $stmt->execute([$submissionId]);
        return $stmt->fetchAll();
    }

    private function getTargetGroups(string $submissionId): array
    {
        $stmt = $this->db->prepare(
            "SELECT tg.* FROM target_groups tg
             INNER JOIN submission_target_groups stg ON tg.id = stg.target_group_id
             WHERE stg.submission_id = ?"
        );
        $stmt->execute([$submissionId]);
        return $stmt->fetchAll();
    }

    private function getDepartments(string $submissionId): array
    {
        $stmt = $this->db->prepare(
            "SELECT d.* FROM departments d
             INNER JOIN submission_departments sd ON d.id = sd.department_id COLLATE utf8mb4_unicode_ci
             WHERE sd.submission_id = ?"
        );
        $stmt->execute([$submissionId]);
        return $stmt->fetchAll();
    }

    public function getContacts(string $submissionId): array
    {
        try {
            $stmt = $this->db->prepare(
                "SELECT id, salutation, first_name, last_name, profile_url, email, contact_roles, is_account_recipient, sort_order
                 FROM submission_contacts WHERE submission_id = ? ORDER BY sort_order ASC, last_name ASC"
            );
            $stmt->execute([$submissionId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            return [];
        }
    }

    private function setCategories(string $submissionId, array $categoryIds): void
    {
        $this->db->prepare("DELETE FROM submission_categories WHERE submission_id = ?")->execute([$submissionId]);
        $stmt = $this->db->prepare("INSERT INTO submission_categories (submission_id, category_id) VALUES (?, ?)");
        foreach ($categoryIds as $categoryId) {
            $stmt->execute([$submissionId, $categoryId]);
        }
    }

    private function setTargetGroups(string $submissionId, array $targetGroupIds): void
    {
        $this->db->prepare("DELETE FROM submission_target_groups WHERE submission_id = ?")->execute([$submissionId]);
        $stmt = $this->db->prepare("INSERT INTO submission_target_groups (submission_id, target_group_id) VALUES (?, ?)");
        foreach ($targetGroupIds as $targetGroupId) {
            $stmt->execute([$submissionId, $targetGroupId]);
        }
    }

    private function setDepartments(string $submissionId, array $departmentIds): void
    {
        $this->db->prepare("DELETE FROM submission_departments WHERE submission_id = ?")->execute([$submissionId]);
        $stmt = $this->db->prepare("INSERT INTO submission_departments (submission_id, department_id) VALUES (?, ?)");
        foreach ($departmentIds as $departmentId) {
            $stmt->execute([$submissionId, $departmentId]);
        }
    }

    private function setContacts(string $submissionId, array $contacts): void
    {
        $this->db->prepare("DELETE FROM submission_contacts WHERE submission_id = ?")->execute([$submissionId]);
        if (empty($contacts)) {
            return;
        }

        $stmt = $this->db->prepare(
            "INSERT INTO submission_contacts (id, submission_id, salutation, first_name, last_name, profile_url, email, contact_roles, is_account_recipient, sort_order)
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
                $submissionId,
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
    }
}
