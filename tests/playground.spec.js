
const { test, expect } = require('@playwright/test');

async function openDemo(page, linkName, urlPattern) {
  await page.goto('/selenium-playground/');

  await page.getByRole('link', {
    name: linkName,
    exact: true
  }).click();

  await expect(page).toHaveURL(urlPattern);
  await page.goto(page.url(), { waitUntil: 'networkidle' });
}

test('Scenario 1: Simple Form Demo', async ({ page }) => {
  await openDemo(
    page,
    'Simple Form Demo',
    /simple-form-demo/
  );

  const message = process.env.TEST_MESSAGE || 'Welcome to TestMu AI';

  await page.getByPlaceholder('Please enter your Message').fill(message);
  await page.getByRole('button', { name: 'Get Checked Value' }).click();

  await expect(page.locator('#message')).toHaveText(message);
});

test('Scenario 2: Drag & Drop Sliders', async ({ page }) => {
  await openDemo(
    page,
    'Drag & Drop Sliders',
    /drag-drop-range-sliders/
  );

  const sliderGroup = page.locator('#slider3');
  const slider = sliderGroup.locator('input[type="range"]');

  await expect(slider).toBeVisible();

  const min = Number(await slider.getAttribute('min') || 0);
  const max = Number(await slider.getAttribute('max') || 100);

  await expect(slider).toHaveValue('15');

  const box = await slider.boundingBox();

  if (!box) {
    throw new Error('Slider position could not be determined');
  }

  const targetValue = 95;
  const targetX =
    box.x + ((targetValue - min) / (max - min)) * box.width;

  const centerY = box.y + box.height / 2;

  await page.mouse.move(box.x + box.width * 0.15, centerY);
  await page.mouse.down();
  await page.mouse.move(targetX, centerY, { steps: 20 });
  await page.mouse.up();

  // Keyboard fallback if pointer movement did not set the target.
  for (let i = 0; i < 100; i++) {
    const current = Number(await slider.inputValue());

    if (current === targetValue) break;

    await slider.press(
      current < targetValue ? 'ArrowRight' : 'ArrowLeft'
    );
  }

  await expect(slider).toHaveValue('95');
  await expect(sliderGroup.locator('output')).toHaveText('95');
});

test('Scenario 3: Input Form Submit', async ({ page }) => {
  await openDemo(
    page,
    'Input Form Submit',
    /input-form-demo/
  );

  const form = page.locator('#seleniumform');
  const name = form.locator('#name');

  await form.getByRole('button', { name: 'Submit' }).click();

  // Verify the browser's required-field validation.
  const isRequired = await name.evaluate(
    element => element.validity.valueMissing
  );

  expect(isRequired).toBe(true);

  const validationMessage = await name.evaluate(
    element => element.validationMessage
  );

  expect(validationMessage).toMatch(/please fill (in|out) this field\./i);

  await name.fill('Tanu Test');
  await form.getByPlaceholder('Email').fill('tanu.test@example.com');
  await form.getByPlaceholder('Password').fill('Example-Only-Password-42!');
  await form.getByPlaceholder('Company').fill('Example Company');
  await form.getByPlaceholder('Website').fill('https://example.com');
  await form.getByPlaceholder('City').fill('New York');
  await form.getByPlaceholder('Address 1').fill('123 Test Street');
  await form.getByPlaceholder('Address 2').fill('Suite 100');
  await form.getByPlaceholder('State').fill('New York');
  await form.getByPlaceholder('Zip code').fill('10001');

  await form.getByRole('combobox').selectOption({
    label: 'United States'
  });

  await form.getByRole('button', { name: 'Submit' }).click();

  await expect(
    page.getByText(
      'Thanks for contacting us, we will get back to you shortly.',
      { exact: true }
    )
  ).toBeVisible();
});
