-- Fix collation mismatch between departments (general_ci) and submission_departments (unicode_ci)

ALTER TABLE `submission_departments`
    MODIFY `department_id` VARCHAR(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
