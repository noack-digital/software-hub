<?php
/**
 * Einmaliges Löschen aller Software-Einträge, Kategorien und Zielgruppen.
 * Nutzung: php scripts/wipe-software-and-categories.php
 */
declare(strict_types=1);

require_once __DIR__ . '/../includes/init.php';

$db = Database::getInstance();
$db->beginTransaction();

try {
    $db->exec("DELETE FROM software_contacts");
    $db->exec("DELETE FROM software_categories");
    $db->exec("DELETE FROM software_target_groups");
    $db->exec("DELETE FROM software");
    $db->exec("DELETE FROM categories");
    $db->exec("DELETE FROM target_groups");
    $db->commit();
    echo "OK: Alle Software-Einträge, Kategorien und Zielgruppen wurden gelöscht.\n";
} catch (Throwable $e) {
    $db->rollBack();
    echo "Fehler: " . $e->getMessage() . "\n";
    exit(1);
}
