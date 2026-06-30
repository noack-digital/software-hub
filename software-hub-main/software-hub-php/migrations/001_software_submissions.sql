-- Software submissions (public suggestions awaiting admin review)

CREATE TABLE IF NOT EXISTS `software_submissions` (
    `id` VARCHAR(25) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `submitter_name` VARCHAR(255) NOT NULL,
    `submitter_email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `url` VARCHAR(2048) DEFAULT NULL,
    `logo` VARCHAR(2048) DEFAULT NULL,
    `short_description` TEXT DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `types` JSON DEFAULT NULL,
    `costs` VARCHAR(100) DEFAULT 'kostenlos',
    `cost_model` VARCHAR(255) DEFAULT NULL,
    `cost_price` VARCHAR(255) DEFAULT NULL,
    `tutorials` TEXT DEFAULT NULL,
    `tutorials_en` TEXT DEFAULT NULL,
    `access_info` TEXT DEFAULT NULL,
    `access_info_en` TEXT DEFAULT NULL,
    `features` TEXT DEFAULT NULL,
    `alternatives` TEXT DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `data_privacy_status` VARCHAR(50) DEFAULT 'UNKNOWN',
    `inhouse_hosted` TINYINT(1) NOT NULL DEFAULT 0,
    `hosting_location` VARCHAR(50) DEFAULT 'UNKNOWN',
    `privacy_note` TEXT DEFAULT NULL,
    `name_en` VARCHAR(255) DEFAULT NULL,
    `short_description_en` TEXT DEFAULT NULL,
    `description_en` TEXT DEFAULT NULL,
    `features_en` TEXT DEFAULT NULL,
    `alternatives_en` TEXT DEFAULT NULL,
    `notes_en` TEXT DEFAULT NULL,
    `reason_hnee` TEXT DEFAULT NULL,
    `reason_hnee_en` TEXT DEFAULT NULL,
    `steckbrief_path` VARCHAR(2048) DEFAULT NULL,
    `steckbrief_original_name` VARCHAR(255) DEFAULT NULL,
    `show_account_request` TINYINT(1) DEFAULT 1,
    `reviewed_at` DATETIME DEFAULT NULL,
    `reviewed_by_user_id` VARCHAR(25) DEFAULT NULL,
    `approved_software_id` VARCHAR(25) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_submissions_status` (`status`),
    KEY `idx_submissions_created_at` (`created_at`),
    KEY `idx_submissions_name` (`name`),
    CONSTRAINT `fk_submissions_reviewer` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_submissions_software` FOREIGN KEY (`approved_software_id`) REFERENCES `software` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `submission_categories` (
    `submission_id` VARCHAR(25) NOT NULL,
    `category_id` VARCHAR(25) NOT NULL,
    PRIMARY KEY (`submission_id`, `category_id`),
    KEY `idx_subcat_category_id` (`category_id`),
    CONSTRAINT `fk_subcat_submission` FOREIGN KEY (`submission_id`) REFERENCES `software_submissions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_subcat_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `submission_target_groups` (
    `submission_id` VARCHAR(25) NOT NULL,
    `target_group_id` VARCHAR(25) NOT NULL,
    PRIMARY KEY (`submission_id`, `target_group_id`),
    KEY `idx_subtg_target_group_id` (`target_group_id`),
    CONSTRAINT `fk_subtg_submission` FOREIGN KEY (`submission_id`) REFERENCES `software_submissions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_subtg_target_group` FOREIGN KEY (`target_group_id`) REFERENCES `target_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `submission_departments` (
    `submission_id` VARCHAR(25) NOT NULL,
    `department_id` VARCHAR(25) NOT NULL,
    PRIMARY KEY (`submission_id`, `department_id`),
    KEY `idx_subdept_department_id` (`department_id`),
    CONSTRAINT `fk_subdept_submission` FOREIGN KEY (`submission_id`) REFERENCES `software_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `submission_contacts` (
    `id` VARCHAR(25) NOT NULL,
    `submission_id` VARCHAR(25) NOT NULL,
    `salutation` VARCHAR(50) DEFAULT NULL,
    `first_name` VARCHAR(255) NOT NULL DEFAULT '',
    `last_name` VARCHAR(255) NOT NULL DEFAULT '',
    `profile_url` VARCHAR(2048) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `contact_roles` VARCHAR(255) DEFAULT NULL,
    `is_account_recipient` TINYINT(1) NOT NULL DEFAULT 0,
    `sort_order` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_subcontacts_submission_id` (`submission_id`),
    CONSTRAINT `fk_subcontacts_submission` FOREIGN KEY (`submission_id`) REFERENCES `software_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
