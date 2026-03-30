<?php
/**
 * Initialisierungsdatei - Lädt alle benötigten Dateien
 */

declare(strict_types=1);

// Composer Autoloader
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Konfiguration laden
require_once __DIR__ . '/../config/config.php';

// Core-Klassen laden
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/AI.php';
require_once __DIR__ . '/helpers.php';

// Models laden
require_once __DIR__ . '/models/Software.php';
require_once __DIR__ . '/models/Category.php';
require_once __DIR__ . '/models/TargetGroup.php';
require_once __DIR__ . '/models/Department.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/FooterLink.php';

// Session starten
Auth::startSession();
