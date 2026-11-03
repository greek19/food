import { test, expect } from '@playwright/test';

async function navigate(page, name) {
  const menu = page.getByRole('button', { name: 'Apri menu' });
  if (await menu.isVisible()) await menu.click();
  await page.locator('.sidebar').getByRole('button', { name, exact: false }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route('https://images.unsplash.com/**', (route) => route.abort());
  await page.goto('/e2e/fixture.html');
  await expect(page.getByRole('heading', { name: 'Buongiorno, Greco' })).toBeVisible();
});

test('calendar, searchable recipes, individual portions and balancing persist', async ({ page }, testInfo) => {
  await navigate(page, 'Piano settimanale');
  await page.getByLabel('Settimana del').fill('2030-01-07');
  await expect(page.getByRole('button', { name: 'Genera piano', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Genera piano', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Piano già generato' })).toBeDisabled();
  const lunch = page.locator('.meal-editor').first();
  const picker = lunch.getByRole('combobox');
  await picker.fill('bowl');
  await expect(page.getByRole('option', { name: /Bowl mediterranea/ })).toBeVisible();
  await picker.press('Enter');
  await expect(picker).toHaveValue('Bowl mediterranea');
  await lunch.getByRole('spinbutton').first().fill('1.25');
  await lunch.getByRole('button', { name: 'Salva pasto', exact: true }).click();
  await expect(page.locator('.toast')).toContainText('Piano aggiornato');
  await page.reload();
  await navigate(page, 'Piano settimanale');
  await page.getByLabel('Settimana del').fill('2030-01-07');
  await expect(page.locator('.meal-editor').first().getByRole('combobox')).toHaveValue('Bowl mediterranea');
  await expect(page.locator('.meal-editor').first().getByRole('spinbutton').first()).toHaveValue('1.25');
  await page.getByRole('button', { name: 'Calcola proposta' }).click();
  await expect(page.locator('.balance-preview')).toBeVisible();
  await page.getByRole('button', { name: 'Applica e salva giornata' }).click();
  await expect(page.locator('.balance-preview')).toHaveCount(0);
  await expect(page.locator('.toast')).toContainText('Giornata bilanciata');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
  await page.screenshot({ path: testInfo.outputPath('planner.png'), fullPage: true });
});

test('modal scroll stays internal and keyboard focus returns on Escape', async ({ page }) => {
  await navigate(page, 'Ricette');
  const add = page.getByRole('button', { name: /Nuova ricetta/ });
  await add.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBeTruthy();
  expect(await page.locator('body').evaluate((element) => getComputedStyle(element).overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(add).toBeFocused();
});

test('optional meals persist and logout requires a new login', async ({ page }) => {
  await navigate(page, 'Piano settimanale');
  await page.getByLabel('Colazione', { exact: true }).check();
  await expect(page.locator('.meal-editor').getByRole('heading', { name: 'Colazione' })).toBeVisible();
  await page.reload();
  await navigate(page, 'Piano settimanale');
  await expect(page.getByLabel('Colazione', { exact: true })).toBeChecked();
  await navigate(page, 'Impostazioni');
  await page.getByRole('button', { name: /Esci dalla sessione/ }).click();
  await expect(page.locator('.auth-form')).toBeVisible();
});

test('JSON import rejects malformed input and skips existing recipe titles', async ({ page }) => {
  await navigate(page, 'Ricette');
  await page.getByRole('button', { name: 'Importa JSON' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Testo JSON').fill('{invalid');
  await expect(dialog.locator('.import-errors')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Importa 0 ricette' })).toBeDisabled();
  const recipe = { title: 'Insalata E2E', servings: 2, meal_types: ['lunch'], calories: 400, diet_tags: ['vegan'], ingredients: [{ name: 'Lattuga', quantity: 200, unit: 'g', category: 'Ortofrutta' }], steps: ['Mescola.'] };
  await dialog.getByLabel('Testo JSON').fill(JSON.stringify([recipe, { ...recipe, title: 'Carbonara di zucchine' }]));
  await expect(dialog.locator('.import-preview')).toContainText('Duplicata');
  await dialog.getByRole('button', { name: 'Importa 1 ricette' }).click();
  await expect(dialog.locator('.import-result')).toContainText('1 inserite · 1 ignorate');
  await dialog.locator('.modal-actions').getByRole('button', { name: 'Chiudi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Insalata E2E' })).toBeVisible();
});

test('shopping checks persist after navigation and reload', async ({ page }) => {
  await navigate(page, 'Lista della spesa');
  const first = page.locator('.shopping-item').first();
  const ingredient = await first.locator('span').nth(1).textContent();
  await first.click();
  await page.reload();
  await navigate(page, 'Lista della spesa');
  await expect(page.locator('.shopping-item').filter({ hasText: ingredient }).getByRole('checkbox')).toBeChecked();
});

test('recipe photo validates files, previews and persists after save', async ({ page }) => {
  await navigate(page, 'Ricette');
  await page.getByRole('button', { name: /Nuova ricetta/ }).click();
  const dialog = page.getByRole('dialog');
  const upload = dialog.getByLabel('Scegli una foto dal dispositivo');
  await upload.setInputFiles({ name:'not-an-image.txt', mimeType:'text/plain', buffer:Buffer.from('test') });
  await expect(dialog.getByRole('alert')).toContainText('JPEG, PNG o WebP');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aU1sAAAAASUVORK5CYII=', 'base64');
  await upload.setInputFiles({ name:'photo.png', mimeType:'image/png', buffer:png });
  await expect(dialog.getByAltText('Anteprima foto della ricetta')).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await dialog.getByLabel('Nome', { exact:true }).fill('Foto E2E');
  await dialog.getByLabel('Tempo di preparazione (min)').fill('15');
  await dialog.getByRole('button', { name:'Salva ricetta', exact:true }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await navigate(page, 'Ricette');
  await page.getByRole('heading', { name:'Foto E2E', exact:true }).click();
  await expect(page.getByRole('dialog').locator('.recipe-detail-image')).toHaveAttribute('style', /data:image\/png/);
});
