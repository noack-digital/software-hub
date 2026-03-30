SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE `users` (
    `id` VARCHAR(25) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `reset_token` VARCHAR(64) DEFAULT NULL,
    `reset_token_expiry` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
    `id` VARCHAR(25) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `name_en` VARCHAR(255) DEFAULT NULL,
    `description_en` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `target_groups` (
    `id` VARCHAR(25) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `name_en` VARCHAR(255) DEFAULT NULL,
    `description_en` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `software` (
    `id` VARCHAR(25) NOT NULL,
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
    `access_info` TEXT DEFAULT NULL,
    `features` TEXT DEFAULT NULL,
    `alternatives` TEXT DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `available` TINYINT(1) NOT NULL DEFAULT 1,
    `data_privacy_status` VARCHAR(50) DEFAULT 'EU_HOSTED',
    `inhouse_hosted` TINYINT(1) NOT NULL DEFAULT 0,
    `name_en` VARCHAR(255) DEFAULT NULL,
    `short_description_en` TEXT DEFAULT NULL,
    `description_en` TEXT DEFAULT NULL,
    `features_en` TEXT DEFAULT NULL,
    `alternatives_en` TEXT DEFAULT NULL,
    `notes_en` TEXT DEFAULT NULL,
    `user_id` VARCHAR(25) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_software_available` (`available`),
    KEY `idx_software_name` (`name`),
    KEY `idx_software_user_id` (`user_id`),
    CONSTRAINT `fk_software_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `software_categories` (
    `software_id` VARCHAR(25) NOT NULL,
    `category_id` VARCHAR(25) NOT NULL,
    PRIMARY KEY (`software_id`, `category_id`),
    KEY `idx_sc_category_id` (`category_id`),
    CONSTRAINT `fk_sc_software` FOREIGN KEY (`software_id`) REFERENCES `software` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sc_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `software_target_groups` (
    `software_id` VARCHAR(25) NOT NULL,
    `target_group_id` VARCHAR(25) NOT NULL,
    PRIMARY KEY (`software_id`, `target_group_id`),
    KEY `idx_stg_target_group_id` (`target_group_id`),
    CONSTRAINT `fk_stg_software` FOREIGN KEY (`software_id`) REFERENCES `software` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_stg_target_group` FOREIGN KEY (`target_group_id`) REFERENCES `target_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `software_contacts` (
    `id` VARCHAR(25) NOT NULL,
    `software_id` VARCHAR(25) NOT NULL,
    `salutation` VARCHAR(50) DEFAULT NULL,
    `first_name` VARCHAR(255) NOT NULL DEFAULT '',
    `last_name` VARCHAR(255) NOT NULL DEFAULT '',
    `profile_url` VARCHAR(2048) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `contact_roles` VARCHAR(255) DEFAULT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_contacts_software_id` (`software_id`),
    CONSTRAINT `fk_contacts_software` FOREIGN KEY (`software_id`) REFERENCES `software` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `settings` (
    `id` VARCHAR(25) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_log` (
    `id` VARCHAR(25) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `model` VARCHAR(100) NOT NULL,
    `record_id` VARCHAR(255) NOT NULL,
    `changes` JSON DEFAULT NULL,
    `user_id` VARCHAR(25) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_created_at` (`created_at`),
    KEY `idx_audit_user_id` (`user_id`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `footer_links` (
    `id` VARCHAR(25) NOT NULL,
    `text` VARCHAR(255) NOT NULL DEFAULT '',
    `text_en` VARCHAR(255) DEFAULT NULL,
    `url` VARCHAR(2048) NOT NULL DEFAULT '',
    `order` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
