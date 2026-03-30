# Browser-Automatisierung: Software Hub im IDE-Browser bedienen

## Ziel

Der Assistent (Claude/Cursor) soll den Software Hub **selbst im Browser bedienen und prüfen** können – Login, Navigation, Formulare, Einstellungen – ohne dass Refs oder DOM manuell nachgereicht werden müssen.

## Welches MCP nutzen?

| MCP | Snapshot mit Refs? | Empfehlung |
|-----|--------------------|------------|
| **Playwright** (`plugin-playwright-playwright`) | ✅ Ja – Snapshot in jeder Antwort (navigate, click, …) | **Für alle Automatisierungen nutzen** |
| **cursor-ide-browser** | ❌ Nein – liefert nur Metadaten (viewId, title, url), keine Element-Refs | Nicht für Formulare/Klicks nutzen |

**Fazit:** Für Login, Klicks und Formulare immer **Playwright** verwenden. Dann hat der Assistent die nötigen Refs direkt aus der Antwort.

## Ablauf (Playwright)

1. **Seite öffnen:** `browser_navigate` mit `url: "http://sh.lokal/admin/index.php"`
2. **Antwort auswerten:** In der Antwort steht ein **Snapshot** im YAML-Format mit allen interaktiven Elementen und ihren **ref**-IDs (z. B. `[ref=e14]`).
3. **Formular ausfüllen:** `browser_fill_form` mit `fields: [{ name, type: "textbox", ref: "e14", value: "..." }, ...]` – Refs aus dem Snapshot übernehmen.
4. **Klick ausführen:** `browser_click` mit `ref: "e18"` (z. B. „Anmelden“).
5. **Nach jeder Aktion:** Die neue Antwort enthält wieder einen **Snapshot der aktuellen Seite** – daraus die nächsten Refs für weitere Klicks/Formulare nehmen.

Refs sind **pro Seite/Antwort gültig** und können sich nach Navigation/Reload ändern. Immer die **letzte Snapshot-Antwort** für die nächste Aktion verwenden.

## Login-Daten (lokal)

- **URL:** http://sh.lokal/admin/
- **E-Mail:** admin@example.com  
- **Passwort:** admin123  

## Typische Refs (Beispiel Login-Seite)

Aus dem Snapshot nach `browser_navigate` auf die Login-Seite (können sich je nach Build ändern):

- E-Mail: `textbox "E-Mail" [ref=e14]` → **e14**
- Passwort: `textbox "Passwort" [ref=e17]` → **e17**
- Button Anmelden: `button "Anmelden" [ref=e18]` → **e18**

Nach dem Login (Dashboard) z. B.:

- Einstellungen: `link "Einstellungen" [ref=e36]` → **e36**

## Snapshot in Datei speichern (Playwright)

Falls der Snapshot für spätere Auswertung gespeichert werden soll:

```text
browser_snapshot mit filename: "snapshot.md"
```

Die Datei wird im Projekt (oder vom Playwright-MCP vorgegebenen Ort) geschrieben.

## Checkliste für neue Features/Tests

- [ ] Playwright-MCP verwenden (nicht cursor-ide-browser für Formulare/Klicks).
- [ ] Nach `browser_navigate` oder `browser_click` den Snapshot in der Antwort nach Refs durchsuchen.
- [ ] Refs aus dem **aktuellsten** Snapshot verwenden.
- [ ] Bei Fehlern: `browser_console_messages` (level: "error") prüfen.

## Hinweis: Manuelle Klicks im Playwright-Browser

Im **von Playwright geöffneten** Browserfenster können manuelle Klicks auf Datei-Inputs (z. B. „Datei auswählen“ im Import/Export-Tab) manchmal nichts bewirken – z. B. wenn zuvor Datei-Dialoge durch Automatisierung geöffnet wurden und „pending“ sind. In einer **normalen Chrome-Instanz** funktioniert dasselbe Verhalten. Für manuelles Testen also die gewohnte Browser-Instanz nutzen; den Playwright-Browser für automatische Tests (z. B. `npx playwright test`).

---

*Stand: Februar 2026. Getestet mit plugin-playwright-playwright; Login → Dashboard → Einstellungen durchgespielt.*
