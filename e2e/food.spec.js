import { test, expect } from '@playwright/test';

async function navigate(page, name) {
  const menu = page.getByRole('button', { name: /Open menu|Apri menu/ });
  if (await menu.isVisible()) await menu.click();
  await page.locator('.sidebar').getByRole('button', { name, exact: false }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route('https://images.unsplash.com/**', (route) => route.abort());
  await page.goto('/e2e/fixture.html');
  await expect(page.getByRole('heading', { name: 'Hello, Greco' })).toBeVisible();
});

test('calendar, searchable recipes, individual portions and balancing persist', async ({ page }, testInfo) => {
  await navigate(page, 'Weekly plan');
  await page.getByLabel('Week starting').fill('2030-01-07');
  await expect(page.getByRole('button', { name: 'Generate plan', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Generate plan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Plan already generated' })).toBeDisabled();
  const lunch = page.locator('.meal-editor').first();
  const picker = lunch.getByRole('combobox');
  await picker.fill('bowl');
  await expect(page.getByRole('option', { name: /Mediterranean bowl/ })).toBeVisible();
  await picker.press('Enter');
  await expect(picker).toHaveValue('Mediterranean bowl');
  await lunch.getByRole('spinbutton').first().fill('1.25');
  await lunch.getByRole('button', { name: 'Save meal', exact: true }).click();
  await expect(page.locator('.toast')).toContainText('Plan updated');
  await page.reload();
  await navigate(page, 'Weekly plan');
  await page.getByLabel('Week starting').fill('2030-01-07');
  await expect(page.locator('.meal-editor').first().getByRole('combobox')).toHaveValue('Mediterranean bowl');
  await expect(page.locator('.meal-editor').first().getByRole('spinbutton').first()).toHaveValue('1.25');
  await page.getByRole('button', { name: 'Calculate proposal' }).click();
  await expect(page.locator('.balance-preview')).toBeVisible();
  await page.getByRole('button', { name: 'Apply and save day' }).click();
  await expect(page.locator('.balance-preview')).toHaveCount(0);
  await expect(page.locator('.toast')).toContainText('Day balanced');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
  await page.screenshot({ path: testInfo.outputPath('planner.png'), fullPage: true });
});

test('modal scroll stays internal and keyboard focus returns on Escape', async ({ page }) => {
  await navigate(page, 'Recipes');
  const add = page.getByRole('button', { name: /New recipe/ });
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
  await navigate(page, 'Weekly plan');
  await page.getByLabel('Breakfast', { exact: true }).check();
  await expect(page.locator('.meal-editor').getByRole('heading', { name: 'Breakfast' })).toBeVisible();
  await page.reload();
  await navigate(page, 'Weekly plan');
  await expect(page.getByLabel('Breakfast', { exact: true })).toBeChecked();
  await navigate(page, 'Settings');
  await page.locator('.settings-logout').click();
  await expect(page.locator('.auth-form')).toBeVisible();
});

test('JSON import rejects malformed input and skips existing recipe titles', async ({ page }) => {
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: 'Import JSON' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('JSON text').fill('{invalid');
  await expect(dialog.locator('.import-errors')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Import 0 recipes' })).toBeDisabled();
  const recipe = { title: 'E2E salad', servings: 2, meal_types: ['lunch'], calories: 400, diet_tags: ['vegan'], ingredients: [{ name: 'Lettuce', quantity: 200, unit: 'g', category: 'Produce' }], steps: ['Mix.'] };
  await dialog.getByLabel('JSON text').fill(JSON.stringify([recipe, { ...recipe, title: 'Zucchini carbonara' }]));
  await expect(dialog.locator('.import-preview')).toContainText('Duplicate');
  await dialog.getByRole('button', { name: 'Import 1 recipe', exact: true }).click();
  await expect(dialog.locator('.import-result')).toContainText('1 imported · 1 skipped');
  await dialog.locator('.modal-actions').getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'E2E salad' })).toBeVisible();
});

test('shopping checks persist after navigation and reload', async ({ page }) => {
  await navigate(page, 'Shopping list');
  const first = page.locator('.shopping-item').first();
  const ingredient = await first.locator('span').nth(1).textContent();
  await first.click();
  await page.reload();
  await navigate(page, 'Shopping list');
  await expect(page.locator('.shopping-item').filter({ hasText: ingredient }).getByRole('checkbox')).toBeChecked();
});

test('recipe photo validates files, previews and persists after save', async ({ page }) => {
  await navigate(page, 'Recipes');
  await page.getByRole('button', { name: /New recipe/ }).click();
  const dialog = page.getByRole('dialog');
  const upload = dialog.getByLabel('Choose a photo from your device');
  await upload.setInputFiles({ name:'not-an-image.txt', mimeType:'text/plain', buffer:Buffer.from('test') });
  await expect(dialog.getByRole('alert')).toContainText('JPEG, PNG, or WebP');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aU1sAAAAASUVORK5CYII=', 'base64');
  await upload.setInputFiles({ name:'photo.png', mimeType:'image/png', buffer:png });
  await expect(dialog.getByAltText('Recipe photo preview')).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await dialog.getByLabel('Name', { exact:true }).fill('E2E photo');
  await dialog.getByLabel('Preparation time (min)').fill('15');
  await dialog.getByRole('button', { name:'Save recipe', exact:true }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await navigate(page, 'Recipes');
  await page.getByRole('heading', { name:'E2E photo', exact:true }).click();
  await expect(page.getByRole('dialog').locator('.recipe-detail-image')).toHaveAttribute('style', /data:image\/png/);
});

test('language switches without losing edits and persists through reload and logout', async ({ page }, testInfo) => {
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('combobox',{name:'Language'})).toHaveValue('en');
  await navigate(page,'Weekly plan');
  const portion=page.locator('.meal-editor').first().getByRole('spinbutton').first();
  await portion.fill('1.75');
  await page.getByRole('combobox',{name:'Language'}).selectOption('it');
  await expect(page.getByRole('heading',{name:'Piano settimanale',exact:true})).toBeVisible();
  await expect(portion).toHaveValue('1.75');
  await expect(page.getByLabel('Settimana del')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang','it');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:testInfo.outputPath('planner-italian.png'),fullPage:true});
  await page.reload();
  await expect(page.getByRole('heading',{name:'Buongiorno, Greco'})).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Lingua'})).toHaveValue('it');
  await navigate(page,'Ricette');
  await expect(page.getByRole('heading',{name:'Zucchini carbonara'})).toBeVisible();
  await page.getByRole('button',{name:/Nuova ricetta/}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByLabel('Calorie per porzione',{exact:false})).toBeVisible();
  await dialog.getByLabel('Scegli una foto dal dispositivo').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')});
  await expect(dialog.getByRole('alert')).toContainText('Scegli una foto');
  await page.keyboard.press('Escape');
  await navigate(page,'Impostazioni');
  await page.locator('.settings-logout').click();
  await expect(page.getByRole('heading',{name:'Bentornati a tavola.'})).toBeVisible();
  await page.getByRole('combobox',{name:'Lingua'}).selectOption('en');
  await expect(page.getByRole('heading',{name:'Welcome back to the table.'})).toBeVisible();
});
