# Release v1.2.0 – Demo-Daten & Inhouse-Ampel

## Highlights

- **Inhouse-Hosting-Indikator:** Neue Checkbox in allen Admin-Formularen, API-Unterstützung sowie DSGVO-Ampel-Anzeige im Frontend inkl. frei konfigurierbarem Tooltip und Logo-Upload/Favicon-Import.
- **Demo-Datensatz:** Immer verfügbarer Referenzbestand (17 Software, 6 Kategorien, 3 Zielgruppen) mit Ein-Klick-Import, Bannern bei leeren Datenbanken und Import/Export-Steuerung im Admin-Bereich.
- **Badge-Einstellungen:** Vollständig überarbeiteter Bereich mit Inhouse-spezifischem Panel, Tooltip-Eingabe und konsolidierter DSGVO-Ampel-Schaltergruppe.
- **Navigation & Hinweise:** Import/Export befindet sich nun unter „Einstellungen“; Admin- und Frontend-Oberflächen zeigen kontextbezogene Hinweise für leere Installationen.
- **Release-Artefakt:** Aktualisiertes `software-hub.zip` für den neuen Stand.

## Breaking / Security

- Release **v1.1.0** wurde entfernt, da es sicherheitsrelevante Schwachstellen enthielt. Bitte ausschließlich v1.2.0 oder neuer einsetzen.

## Weitere Änderungen

- README und CHANGELOG an den Funktionsumfang von v1.2.0 angepasst.
- Automatischer Hinweis-/Onboarding-Flow für Erstinstallation implementiert.
- Diverse Build-/Hydration-Fehler im Badge-Settings-UI behoben.

## Checks

- `npx eslint` für die geänderten Kern-Dateien (`src/app/page.tsx`, `src/app/admin/settings/badge/page.tsx`, `src/components/layout/Sidebar.tsx`) erfolgreich ausgeführt.
- `npm run lint` scheiterte wegen fehlender Schreibrechte auf einem systemweiten `.next`-Verzeichnis. Siehe Entwickler-Notizen im PR/Release-Text.


