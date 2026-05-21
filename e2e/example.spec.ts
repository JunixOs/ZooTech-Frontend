import { test, expect } from '@playwright/test';

test('debe cargar la pagina de inicio y redireccionar al dashboard', async ({ page }) => {
  await page.goto('/');

  // Debería redirigir a /dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Debería mostrar el título del tablero
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
});

test('debe mostrar la navegacion en la barra lateral', async ({ page }) => {
  await page.goto('/');

  // Debería mostrar la etiqueta de navegación en el sidebar
  const navLabel = page.locator('text=Navegación');
  await expect(navLabel).toBeVisible();
});
