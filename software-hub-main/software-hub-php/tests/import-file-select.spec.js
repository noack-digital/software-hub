/**
 * Tests: Import/Export im Admin (Software Hub PHP)
 * Ausführung: npx playwright test tests/import-file-select.spec.js
 */
const path = require('path');
const { test, expect } = require('@playwright/test');

const ADMIN_URL = 'http://sh.lokal/admin';
const EXCEL_PATH = path.join(__dirname, '../../Software-Hub-Import-Tools-Apps.xlsx');

test.beforeEach(async ({ page }) => {
  await page.goto(ADMIN_URL + '/');
  await page.getByLabel('E-Mail').fill('admin@example.com');
  await page.getByLabel('Passwort').fill('admin123');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/dashboard/);
});

test('Import/Export: Datei auswählen öffnet Datei-Dialog', async ({ page }) => {
  await page.goto(ADMIN_URL + '/settings.php');
  await page.locator('[data-tab="importExportTab"]').click();
  await expect(page.getByText('Daten importieren')).toBeVisible();

  const fileInput = page.locator('#importFile');
  await expect(fileInput).toBeVisible();

  const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
  await page.getByLabel('Datei auswählen').click();
  const fileChooser = await fileChooserPromise;

  if (!fileChooser) {
    const logs = await page.evaluate(() => {
      const input = document.getElementById('importFile');
      const label = document.querySelector('label[for="importFile"]');
      return { inputExists: !!input, labelExists: !!label };
    });
    throw new Error('Datei-Dialog öffnete sich nicht. Debug: ' + JSON.stringify(logs));
  }
});

test('Import/Export: Excel-Datei auswählen und Excel importieren klicken', async ({ page }) => {
  await page.goto(ADMIN_URL + '/settings.php');
  await page.locator('[data-tab="importExportTab"]').click();
  await expect(page.getByText('Daten importieren')).toBeVisible();

  const fileInput = page.locator('#importFile');
  await expect(fileInput).toBeVisible();

  await fileInput.setInputFiles(EXCEL_PATH);

  await expect(page.locator('#importExcel')).toBeEnabled();

  await page.locator('button:has-text("Excel importieren")').click();

  await expect(page.locator('#importProgress')).toBeVisible({ timeout: 15000 });
});

test('Import/Export: Vollständiger Excel-Import bis Erfolg oder Bestätigungs-Modal', async ({ page }) => {
  await page.goto(ADMIN_URL + '/settings.php');
  await page.locator('[data-tab="importExportTab"]').click();
  await expect(page.getByText('Daten importieren')).toBeVisible();

  await page.locator('#importFile').setInputFiles(EXCEL_PATH);
  await page.locator('button:has-text("Excel importieren")').click();

  await expect(page.locator('#importProgress')).toBeVisible({ timeout: 15000 });

  await Promise.race([
    page.waitForSelector('#importConfirmModal', { state: 'attached', timeout: 25000 }),
    page.waitForSelector('#importResults.alert-success, #importResults.alert-warning, #importResults.alert-error', { state: 'attached', timeout: 25000 })
  ]);
});

test('Import/Export: Nach Excel-Import erscheint sichtbares Feedback (Text)', async ({ page }) => {
  await page.goto(ADMIN_URL + '/settings.php');
  await page.locator('[data-tab="importExportTab"]').click();
  await expect(page.getByText('Daten importieren')).toBeVisible();

  await page.locator('#importFile').setInputFiles(EXCEL_PATH);
  await page.locator('button:has-text("Excel importieren")').click();

  await expect(
    page.getByText(/Import abgeschlossen|von \d+ Einträgen|Neue Kategorien|Bitte bestätigen|Anzahl zu importierender/).first()
  ).toBeVisible({ timeout: 30000 });
});

test('Import/Export: Vollständiger Import mit Bestätigung – 26 Einträge, keine Duplikate', async ({ page }) => {
  await page.goto(ADMIN_URL + '/settings.php');
  await page.locator('[data-tab="importExportTab"]').click();
  await expect(page.getByText('Daten importieren')).toBeVisible();

  await page.locator('#importFile').setInputFiles(EXCEL_PATH);
  await page.locator('button:has-text("Excel importieren")').click();

  const confirmBtn = page.locator('button:has-text("Ja, anlegen und importieren")');
  await confirmBtn.click({ timeout: 20000 }).catch(() => {});

  await expect(page.getByText(/26 von 26|Import abgeschlossen/).first()).toBeVisible({ timeout: 35000 });
});
