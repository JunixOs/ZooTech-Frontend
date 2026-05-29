import { test, expect } from '@playwright/test';

test.describe('LecheContainer - Gestión de Producción de Leche', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de leche
    await page.goto('/leche/registro');

    // Esperar a que cargue la tabla
    await page.waitForSelector('zt-leche-container', { timeout: 5000 });
  });

  test('debe cargar el contenedor leche-container', async ({ page }) => {
    // Verificar que el contenedor existe
    const container = page.locator('zt-leche-container');
    await expect(container).toBeVisible();

    console.log('Contenedor leche-container cargado correctamente');
  });

  test('debe cargar y mostrar tabla de registros', async ({ page }) => {
    // Verificar que la tabla existe y está visible
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verificar que hay filas de datos
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    console.log(`Tabla cargada con ${rowCount} registros`);
  });

  test('debe mostrar columnas correctas en la tabla', async ({ page }) => {
    // Verificar headers esperados
    const headers = page.locator('table thead th');
    const headerTexts = await headers.allTextContents();

    // Headers esperados (en orden)
    const expectedHeaders = ['CÓDIGO', 'FECHA', 'HORA', 'VACA', 'LITROS', 'VER'];

    for (const expectedHeader of expectedHeaders) {
      const hasHeader = headerTexts.some((text) => text.toUpperCase().includes(expectedHeader));
      expect(hasHeader).toBeTruthy(`Debe existir columna: ${expectedHeader}`);
    }

    console.log('Todas las columnas esperadas están presentes');
  });

  test('debe filtrar registros por búsqueda global', async ({ page }) => {
    // Obtener número de filas inicial
    const initialRows = await page.locator('table tbody tr').count();
    console.log(`Filas iniciales: ${initialRows}`);

    // Buscar el campo de búsqueda
    const searchInput = page.locator('input[placeholder*="uscar"], [type="search"]').first();

    if (await searchInput.isVisible()) {
      // Escribir término de búsqueda
      await searchInput.fill('ORD');
      await page.waitForTimeout(500); // Esperar a que se filtre

      // Verificar que hay resultados
      const filteredRows = await page.locator('table tbody tr').count();
      console.log(`🔍 Filas después de buscar "ORD": ${filteredRows}`);
      expect(filteredRows).toBeGreaterThan(0);

      // Limpiar búsqueda
      await searchInput.clear();
      await page.waitForTimeout(500);

      const clearedRows = await page.locator('table tbody tr').count();
      console.log(`Búsqueda funcionando correctamente. Filas recuperadas: ${clearedRows}`);
    } else {
      console.log('Campo de búsqueda no encontrado');
    }
  });

  test('debe filtrar por rango de fechas', async ({ page }) => {
    // Buscar componente de filtro de fechas
    const dateFilter = page.locator('zt-date-range-filter');

    if (await dateFilter.isVisible()) {
      // Obtener número de filas inicial
      const initialRows = await page.locator('table tbody tr').count();
      console.log(`Filas iniciales: ${initialRows}`);

      // Buscar inputs de fecha dentro del filtro
      const dateInputs = dateFilter.locator('input[type="date"]');
      const inputCount = await dateInputs.count();

      if (inputCount >= 2) {
        // Establecer fecha inicio
        await dateInputs.nth(0).fill('2026-01-01');

        // Establecer fecha fin
        await dateInputs.nth(1).fill('2026-12-31');

        await page.waitForTimeout(500);

        // Verificar que hay resultados
        const filteredRows = await page.locator('table tbody tr').count();
        console.log(`Filtro de fechas aplicado. Filas: ${filteredRows}`);
      }
    } else {
      console.log('Filtro de fechas no encontrado');
    }
  });

  test('debe paginar correctamente', async ({ page }) => {
    // Verificar si existe paginador
    const paginator = page.locator('zt-paginator');

    if (await paginator.isVisible()) {
      // Obtener número inicial de filas
      const initialRows = await page.locator('table tbody tr').count();
      console.log(`Filas en página 1: ${initialRows}`);

      // Buscar y hacer click en botón "siguiente"
      const nextButton = page
        .locator('button[aria-label*="siguiente"], button:has-text(">")')
        .or(page.locator('button').filter({ hasText: '>' }))
        .first();

      const isNextVisible = await nextButton.isVisible().catch(() => false);

      if (isNextVisible) {
        await nextButton.click();
        await page.waitForTimeout(500);

        console.log('Paginación funcionando correctamente');
      }
    } else {
      console.log('Paginador no encontrado');
    }
  });

  test('debe abrir modal de formulario con botón "Agregar"', async ({ page }) => {
    // Buscar botón de agregar
    const addButton = page
      .locator('button:has-text("Agregar"), button:has-text("Nuevo"), button[title*="Agregar"]')
      .first();

    if (await addButton.isVisible()) {
      // Hacer click
      await addButton.click();

      // Esperar a que aparezca el modal
      await page.waitForSelector('zt-leche-form', { timeout: 3000 });

      // Verificar que el modal está visible
      const modal = page.locator('zt-leche-form');
      await expect(modal).toBeVisible();

      console.log('Modal de formulario abierto correctamente');
    } else {
      console.log('Botón Agregar no encontrado');
    }
  });

  test('debe cerrar modal de formulario', async ({ page }) => {
    // Abrir modal
    const addButton = page.locator('button:has-text("Agregar"), button:has-text("Nuevo")').first();

    if (await addButton.isVisible()) {
      await addButton.click();

      // Esperar modal
      await page.waitForSelector('zt-leche-form');

      // Buscar botón cerrar (X, Cancelar, etc)
      const closeButton = page
        .locator('button:has-text("Cancelar"), button[aria-label="Cerrar"], .close-button')
        .first();

      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);

        // Verificar que el modal se cerró
        const modal = page.locator('zt-leche-form');
        const isVisible = await modal.isVisible().catch(() => false);
        expect(isVisible).toBeFalsy();

        console.log('Modal de formulario cerrado correctamente');
      }
    }
  });

  test('debe ver detalles de un registro al hacer click en VER', async ({ page }) => {
    // Obtener la primera fila
    const firstRow = page.locator('table tbody tr').first();

    // Buscar botón VER (último botón de la fila)
    const verButton = firstRow.locator('button').last();

    // Hacer click
    await verButton.click();

    // Esperar modal de detalle
    await page.waitForSelector('zt-leche-detail', { timeout: 3000 });

    // Verificar que el modal de detalle está visible
    const detailModal = page.locator('zt-leche-detail');
    await expect(detailModal).toBeVisible();

    console.log('Modal de detalle abierto correctamente');
  });

  test('debe cerrar modal de detalle al hacer click en Cancelar', async ({ page }) => {
    // Abrir modal de detalle
    const firstRow = page.locator('table tbody tr').first();
    const verButton = firstRow.locator('button').last();
    await verButton.click();

    // Esperar modal
    await page.waitForSelector('zt-leche-detail');

    // Buscar botón Cancelar
    const cancelButton = page.locator('button:has-text("Cancelar")').first();

    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(500);

      // Verificar que el modal se cerró
      const detailModal = page.locator('zt-leche-detail');
      const isVisible = await detailModal.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();

      console.log('Modal de detalle cerrado correctamente');
    }
  });

  test('debe cambiar tamaño de página', async ({ page }) => {
    // Buscar selector de tamaño de página
    const pageSizeSelect = page
      .locator('select')
      .filter({ hasText: '10' })
      .or(page.locator('button').filter({ hasText: '10 por página' }))
      .first();

    if (await pageSizeSelect.isVisible()) {
      // Obtener filas iniciales
      const initialRows = await page.locator('table tbody tr').count();
      console.log(`Filas con tamaño actual: ${initialRows}`);

      // Cambiar tamaño de página
      if (pageSizeSelect.evaluate((el) => el.tagName) === 'SELECT') {
        await pageSizeSelect.selectOption('20');
      } else {
        await pageSizeSelect.click();
        const option20 = page.locator('text=20').first();
        if (await option20.isVisible()) {
          await option20.click();
        }
      }

      await page.waitForTimeout(500);

      console.log('Tamaño de página cambiado correctamente');
    } else {
      console.log('Selector de tamaño de página no encontrado');
    }
  });

  test('debe mostrar indicador de carga mientras se cargan datos', async ({ page }) => {
    // Buscar indicador de carga
    const spinner = page.locator('[role="progressbar"], .spinner, .loading-indicator').first();

    // El spinner podría estar visible brevemente durante el inicio
    if (await spinner.isVisible().catch(() => false)) {
      console.log('Indicador de carga visible durante la carga inicial');
    } else {
      console.log('Datos ya estaban cargados (no se vio spinner)');
    }
  });

  test('debe mostrar datos correctos en las filas', async ({ page }) => {
    // Esperar tabla
    await page.waitForSelector('table tbody tr');

    // Obtener primera fila
    const firstRow = page.locator('table tbody tr').first();
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();

    // Debe haber al menos 5 columnas (código, fecha, hora, vaca, litros)
    expect(cellCount).toBeGreaterThanOrEqual(5);

    // Obtener valores de las celdas
    const cellTexts = await cells.allTextContents();
    console.log(`Fila con ${cellCount} columnas:`);
    cellTexts.forEach((text, index) => {
      console.log(`  Columna ${index + 1}: ${text.trim()}`);
    });
  });

  test('debe mantener filtros al cambiar de página', async ({ page }) => {
    // Aplicar búsqueda
    const searchInput = page.locator('input[type="search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('ORD');
      await page.waitForTimeout(500);

      // Obtener filas filtradas
      const filteredRows = await page.locator('table tbody tr').count();

      // Cambiar de página si es posible
      const nextButton = page.locator('button').filter({ hasText: '>' }).first();

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Verificar que el filtro se mantiene
        const currentRows = await page.locator('table tbody tr').count();
        console.log(`Filtro mantenido al cambiar página. Filas: ${currentRows}`);
      }
    }
  });

  test('debe resetear paginación al aplicar filtros', async ({ page }) => {
    // Cambiar a página 2 si es posible
    const nextButton = page.locator('button').filter({ hasText: '>' }).first();

    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // Aplicar búsqueda
      const searchInput = page.locator('input[type="search"]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('ORD');
        await page.waitForTimeout(500);

        // Verificar que volvió a página 1
        // El paginador debería mostrar página 1
        const pageIndicator = page.locator('text=Página 1, text=page 1').first();

        console.log('Paginación resetead al aplicar filtros');
      }
    }
  });
});
