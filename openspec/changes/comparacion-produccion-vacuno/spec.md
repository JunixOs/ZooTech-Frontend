# Comparación de producción por vacuno — Specification

## Purpose

Provide two new report views under `/leche/reporte/produccion-por-vacuno/`: a grouped table showing total milk production per bovine (summed within a date range), and a detail SVG chart comparing real vs predicted production for a single bovine. Both views follow the existing patterns established by `ProduccionDiariaReport` (table) and `ComparacionProduccionReport` (SVG chart).

## Functional Requirements

### FR-1: Bovine production table

The system **MUST** display a paginated, sortable, column-filterable table with one row per bovine, showing the total liters produced within the selected date range.

| ID | Description | Verification |
|----|-------------|-------------|
| FR-1.1 | Group raw `LecheRegistro[]` by `codigoVacuno`, summing `litros` and using the latest `fecha` as `ultimaFecha` | `groupedData()` computed returns unique `codigoVacuno` rows |
| FR-1.2 | Support column filtering on `codigoVacuno`, `nombreVacuno`, `ultimaFecha`, `litros` via `ColumnFilterEvent` | Filtered output emits subset of grouped rows |
| FR-1.3 | Paginate filtered results with configurable page size (default 10) | Paginated data never exceeds `pageSize` per page |
| FR-1.4 | Show total sum of real liters (`totalLitrosReal`) and estimated ideal liters (`totalLitrosIdoneo` = unique bovines × days in range × 15) | Footer totals update reactively |
| FR-1.5 | Hide the data-table's global search (`zt-search-input`, `.search-container`, `input[type="search"]`) | `::ng-deep` CSS suppresses search |

#### Scenario: Happy path — table renders grouped data

- GIVEN `LecheRepository.getAll()` returns 6 records for 2 distinct bovines ("V-001" with 3 records, "V-002" with 3 records)
- WHEN `ngOnInit` completes
- THEN `groupedData()` returns 2 `ProduccionVacuno` rows
- AND each row's `litros` is the sum of that bovine's records
- AND `ultimaFecha` is the latest formatted date for that bovine

#### Scenario: Column filter reduces rows

- GIVEN `groupedData()` has 5 bovines with codes V-001 through V-005
- WHEN user types "V-00" in the `codigoVacuno` column filter
- THEN `onColumnFilter([{ columnKey: 'codigoVacuno', value: 'V-00' }])` is called
- AND `filteredData()` returns all 5 rows
- WHEN user types "V-001"
- THEN `filteredData()` returns only the V-001 row

#### Scenario: Pagination slices filtered data

- GIVEN `filteredData()` has 25 rows and `pageSize` is 10
- WHEN component initializes
- THEN `paginatedData()` returns rows 0–9
- WHEN user clicks page 3
- THEN `paginatedData()` returns rows 20–24

### FR-2: Detail chart per bovine

The system **MUST** render an SVG line chart for `/leche/reporte/produccion-por-vacuno/:codigo` showing real vs predicted daily production for one bovine.

| ID | Description | Verification |
|----|-------------|-------------|
| FR-2.1 | Load registros filtered by `vacunoId` from route param, sorted by date ascending | `datos()` sorted, values as `ChartPoint[]` |
| FR-2.2 | Compute `prediccion` per point using a sine-wave variation around the mean (same as `estandar` in `ComparacionProduccionReport`) | `prediccion` = `round((avg + sin(i/(n-1)*2π)*avg*0.1) * 10) / 10` |
| FR-2.3 | Render SVG with Y-axis ticks, rotated X-axis date labels, real line (solid), prediction line (dashed), and under-area fills | SVG polyline points, circle markers match report pattern |
| FR-2.4 | Show legend ("Producción real" / "Predicción") and totals footer | `chart-bottom` renders with `totalReal` and `totalPrediccion` |
| FR-2.5 | Handle loading, error, and empty states matching `comparacion-produccion-report` classes | `.chart-loading`, `.chart-error`, `.chart-empty` render conditionally |

#### Scenario: Happy path — chart renders for a bovine

- GIVEN route param `codigo = "V-001"`
- WHEN `ngOnInit` calls `repository.getAll({ vacunoId: "V-001", ...dateRange })`
- AND API returns 10 `LecheRegistro` records for V-001
- THEN `datos()` returns 10 `ChartPoint` entries with real and prediccion values
- AND `polylineReal` and `polylinePrediccion` contain valid SVG point strings
- AND legend and totals are rendered

#### Scenario: No data for bovine

- GIVEN route param `codigo = "V-099"`
- WHEN API returns empty array
- THEN `.chart-empty` is shown with appropriate message
- AND no chart-bottom section renders

#### Scenario: API error

- GIVEN API throws network error
- WHEN `cargarRegistros()` catches the error
- THEN `error()` signal is set with user-facing message
- AND `.chart-error` is displayed with error icon

### FR-3: Date range filtering

Both components **MUST** support a shared date range filter that reloads data when changed.

| ID | Description | Verification |
|----|-------------|-------------|
| FR-3.1 | `zt-date-range-filter` emits `DateRange`; component converts to `ConsultaFiltros.fechaDesde` / `fechaHasta` (YYYY-MM-DD) | API call uses ISO-formatted date strings |
| FR-3.2 | Reload calls clear existing `_registros` before setting new data | Signal updates flush stale rows |

#### Scenario: Apply date filter

- GIVEN initial load returns all-time data
- WHEN user selects range 2026-01-01 to 2026-01-31
- THEN `onRangeChange({ start: Date('2026-01-01'), end: Date('2026-01-31') })` fires
- AND `repository.getAll({ fechaDesde: '2026-01-01', fechaHasta: '2026-01-31' })` is called
- AND `_registros` updates with filtered data

### FR-4: Navigation

The system **MUST** support the following navigation flows.

| ID | Description | Verification |
|----|-------------|-------------|
| FR-4.1 | Row action (view) navigates to `/leche/reporte/produccion-por-vacuno/{codigoVacuno}` | `router.navigate()` with bovine code |
| FR-4.2 | "Volver a reportes" button navigates back to `/leche/reporte` | `router.navigate(['/leche/reporte'])` |

### FR-5: Download stubs

Both components **MUST** provide download buttons (Excel/PDF) that are stub handlers.

| ID | Description | Verification |
|----|-------------|-------------|
| FR-5.1 | Clicking Excel or PDF logs to console with format | `console.log('Descargando como', format)` |

## Non-Functional Requirements

### NFR-1: Styling consistency

All CSS **MUST** follow the exact BEM-like class naming and layout patterns from `produccion-diaria-report.scss` and `comparacion-produccion-report.scss`.

| ID | Rule |
|----|------|
| NFR-1.1 | Table container uses `.produccion-vacuno-container` with same `display: flex; flex-direction: column; gap: 1rem` |
| NFR-1.2 | Header uses `.reporte-header` with same responsive layout (column → row at 640px) |
| NFR-1.3 | Filter bar uses `.filter-container` with the same `background`, `border-radius`, `box-shadow` |
| NFR-1.4 | Download buttons use `.btn-download` with `var(--color-primary)` background |
| NFR-1.5 | Totals footer uses `.totales-container` with `min-width: 250px`, right-aligned text |
| NFR-1.6 | Chart card uses `.chart-card` with same padding, border, background |
| NFR-1.7 | Legend uses `.chart-legend` / `.legend-item` / `.legend-line` classes; real line = `#802b4d`, prediction line = `#6b21a8` dashed |
| NFR-1.8 | Back button uses `.btn-volver` with same hover transition |
| NFR-1.9 | Table global search hidden via `::ng-deep zt-data-table { zt-search-input, .search-container, input[type="search"] { display: none !important; } }` |

### NFR-2: Performance

| ID | Rule |
|----|------|
| NFR-2.1 | Client-side grouping **SHOULD NOT** be used if `LecheRegistro[]` exceeds 5,000 records; recommend API-level grouping |
| NFR-2.2 | All data transformations use Angular `computed()` (memoized, lazy evaluation) |
| NFR-2.3 | `ChangeDetectionStrategy.OnPush` **MUST** be set on both components |

### NFR-3: Code architecture

| ID | Rule |
|----|------|
| NFR-3.1 | Components **MUST NOT** directly instantiate `LecheRepository` — inject via DI |
| NFR-3.2 | No new backend endpoints — all grouping and prediction computed client-side |
| NFR-3.3 | Models include `[key: string]: unknown` index signature for data-table generic compatibility |

## UI/UX Specifications

### Table view (`/leche/reporte/produccion-por-vacuno`)

```
┌────────────────────────────────────────────────────────┐
│  Page Title (uppercase, text-xl, font-700)             │
│  Breadcrumb: Producción de leche › Reportes            │
├────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ [zt-date-range-filter]        [Excel] [PDF]    │   │
│  └─────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  zt-data-table                                   │   │
│  │  ┌──────┬──────┬──────┬──────┐                  │   │
│  │  │Código│Nombre│Fecha │Litros│                  │   │
│  │  ├──────┼──────┼──────┼──────┤                  │   │
│  │  │V-001 │Lola  │01/01 │ 25.5 │                  │   │
│  │  │V-002 │Mimi  │03/01 │ 18.0 │                  │   │
│  │  └──────┴──────┴──────┴──────┘                  │   │
│  │  Pagination: < [1] 2 3 ... 10 >                 │   │
│  └─────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────┤
│  [← Volver a reportes]                                 │
│                          Total real: 43.5 L            │
│                          Total idóneo: 900 L           │
└────────────────────────────────────────────────────────┘
```

- Row click (action button "view") navigates to detail page
- Footer shows two totals: real sum and idóneo estimate
- Totals container right-aligned, bordered card

### Detail chart view (`/leche/reporte/produccion-por-vacuno/:codigo`)

```
┌────────────────────────────────────────────────────────┐
│  Page Title: [nombreVacuno] (uppercase)                │
│  Breadcrumb: Producción › Reportes › Por vacuno › Lola│
├────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ [zt-date-range-filter]        [Excel] [PDF]    │   │
│  └─────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  ┌───SVG chart (800×360)──────────────┐        │   │
│  │  │  Litros (L)  ▲                     │        │   │
│  │  │  30 ─ ─ ─ ─ ┤───·──·──·───·───    │        │   │
│  │  │  20 ─ ─ ─ ─ ┤───·──·──·───·───    │        │   │
│  │  │  10 ─ ─ ─ ─ ┤                     │        │   │
│  │  │   0 ─ ─ ─ ─ ┼──┬──┬──┬──┬──┬──►   │        │   │
│  │  │              01  02  03  04  05  Fecha     │   │
│  │  └────────────────────────────────────┘        │   │
│  └─────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────┤
│  ● Producción real  -- ● Predicción                    │
│                          Total real: 152.3 L           │
│                          Total predicción: 148.7 L     │
├────────────────────────────────────────────────────────┤
│  [← Volver a reportes]                                 │
└────────────────────────────────────────────────────────┘
```

- SVG chart matches `comparacion-produccion-report.html` structure exactly
- Real line: solid `#802b4d`, circle markers. Prediction line: dashed `#6b21a8`, circle markers
- Y-axis ticks computed with 5-step rounding; X-axis labels rotated -90°
- Gradient fills under each line
- Legend below chart, totals in right-aligned card

## Data Specifications

### Domain models (`produccion-vacuno.model.ts`)

```typescript
export interface ProduccionVacuno {
  codigoVacuno: string;       // Unique bovine identifier
  nombreVacuno: string;       // Bovine display name
  ultimaFecha: string;        // Last milking date in range ('DD/MM/YYYY')
  litros: number;             // Total liters in selected range
  [key: string]: unknown;     // Index signature for data-table
}

export interface ChartPoint {
  fecha: string;              // Date label ('DD/MM/YYYY')
  label: string;              // Display label (same as fecha)
  real: number;               // Actual recorded production
  prediccion: number;         // Estimated production (computed client-side)
}
```

### API contract

| Aspect | Detail |
|--------|--------|
| Repository | `LecheRepository.getAll(filtros?: ConsultaFiltros): Observable<LecheRegistro[]>` |
| Table data | Group records by `codigoVacuno`. Sum `litros`. Latest `fecha` = `ultimaFecha`. |
| Chart data | Filter by `vacunoId`. Sort by date ascending. Compute `prediccion` per point. |
| Prediccion formula | `avg = mean(litros)`; `prediccion = round((avg + sin(i/(n-1)*2π)*avg*0.1) * 10) / 10` (same as `estandar` in `ComparacionProduccionReport`) |
| Date format | API returns `fecha` as `'DD/MM/YYYY'`. Filter params use ISO `'YYYY-MM-DD'`. |

### Column configuration

```typescript
columns = signal<ColumnConfig[]>([
  { key: 'codigoVacuno', headerKey: 'leche.reportes.produccion-vacuno.codigo', filterable: true, sortable: true },
  { key: 'nombreVacuno', headerKey: 'leche.reportes.produccion-vacuno.nombre', filterable: true, sortable: true },
  { key: 'ultimaFecha', headerKey: 'leche.reportes.produccion-vacuno.fecha', filterable: true, sortable: true },
  { key: 'litros', headerKey: 'leche.reportes.produccion-vacuno.litros', filterable: true, sortable: true, align: 'right' },
]);
```

## Component Specifications

### ProduccionVacunoReport

| Property | Type | Description |
|----------|------|-------------|
| Selector | `zt-produccion-vacuno-report` | |
| Route | `/leche/reporte/produccion-por-vacuno` | |
| Change detection | `OnPush` | |

**Inputs/Outputs**: None (standalone page component)

**Signal state**:

| Signal | Type | Default | Description |
|--------|------|---------|-------------|
| `_registros` (private) | `signal<LecheRegistro[]>` | `[]` | Raw API data |
| `loading` | `signal<boolean>` | `false` | Loading indicator |
| `error` | `signal<string\|null>` | `null` | Error message |
| `currentPage` | `signal<number>` | `1` | Current pagination page |
| `pageSize` | `signal<number>` | `10` | Rows per page |
| `columns` | `signal<ColumnConfig[]>` | 4-column config | Data-table column defs |
| `columnFilters` (private) | `signal<ColumnFilterEvent[]>` | `[]` | Active column filters |

**Computed values**:

| Computed | Derivation |
|----------|-----------|
| `groupedData` | Group `_registros` by `codigoVacuno`, sum `litros`, max `fecha` |
| `filteredData` | Apply `columnFilters` to `groupedData` (per-column case-insensitive text match) |
| `paginatedData` | Slice `filteredData` by `(currentPage - 1) * pageSize` to `currentPage * pageSize` |
| `totalItems` | `filteredData().length` |
| `totalLitrosReal` | Sum of `litros` across `filteredData()` |
| `totalLitrosIdoneo` | `uniqueBovines * daysInRange * 15` |

**Event handlers**:

| Method | Trigger | Behavior |
|--------|---------|----------|
| `ngOnInit()` | Component init | Calls `cargarRegistros()` |
| `cargarRegistros(filtros?)` | Init / date change | Fetches from `repository.getAll()`, sets `_registros` |
| `onRangeChange(range)` | Date range change | Converts to `ConsultaFiltros`, calls `cargarRegistros()` |
| `onPageChange(page)` | Paginator click | Sets `currentPage` |
| `onPageSizeChange(size)` | Page size dropdown | Sets `pageSize`, resets `currentPage` to 1 |
| `onColumnFilter(filters)` | Column filter input | Stores `columnFilters` array |
| `onViewVacuno(row)` | Row action click | Navigates to `produccion-por-vacuno/{codigoVacuno}` |
| `onDownload(format)` | Download button | Stub — logs to console |
| `goBack()` | Back button | Navigates to `/leche/reporte` |

### DetalleVacunoReport

| Property | Type | Description |
|----------|------|-------------|
| Selector | `zt-detalle-vacuno-report` | |
| Route | `/leche/reporte/produccion-por-vacuno/:codigo` | |
| Change detection | `OnPush` | |

**Signal state**:

| Signal | Type | Default | Description |
|--------|------|---------|-------------|
| `_registros` (private) | `signal<LecheRegistro[]>` | `[]` | Raw API data |
| `loading` | `signal<boolean>` | `false` | Loading indicator |
| `error` | `signal<string\|null>` | `null` | Error message |
| `codigoVacuno` | `signal<string>` | `''` | From route param |
| `nombreVacuno` | `signal<string>` | `''` | From first registro |
| `svgDims` | `{ width: 800, height: 360 }` | Constant | SVG viewport |
| `padding` | `{ top: 30, right: 40, bottom: 120, left: 70 }` | Constant | SVG padding |

**Computed values**: Identical scale/tick/polyline computation as `ComparacionProduccionReport` but with `prediccion` replacing `estandar`.

| Computed | Derivation |
|----------|-----------|
| `registros` (private) | `_registros` sorted ascending by parsed date+time |
| `datos` | `ChartPoint[]` with `real` and `prediccion` |
| `yMax` | Ceiling of max real value, rounded up to nearest 5 |
| `yTicks` | 0 to `yMax` in 5-unit steps |
| `xLabels` | Centered labels per unique date |
| `scaleX` | Linear scale from padding to padding+chartW |
| `scaleY` | Linear scale from padding to padding+chartH |
| `polylineReal` | SVG point string for real line |
| `polylinePrediccion` | SVG point string for prediction line |
| `areaReal` | SVG path for real under-fill |
| `areaPrediccion` | SVG path for prediction under-fill |
| `totalReal` | Sum of `real` values |
| `totalPrediccion` | Sum of `prediccion` values |

**Event handlers**:

| Method | Trigger | Behavior |
|--------|---------|----------|
| `ngOnInit()` | Component init | Reads `codigo` from route params, calls `cargarRegistros()` |
| `cargarRegistros(filtros?)` | Init / date change | Fetches with `vacunoId`, sets `_registros` and `nombreVacuno` |
| `onRangeChange(range)` | Date range change | Converts to `ConsultaFiltros`, calls `cargarRegistros()` |
| `onDownload(format)` | Download button | Stub — logs to console |
| `goBack()` | Back button | Navigates to `/leche/reporte/produccion-por-vacuno` |

## Route Changes

Add to `LECHE_REPORT_ROUTES` in `leche-report.ts`:

```typescript
{
  path: 'produccion-por-vacuno',
  loadComponent: () =>
    import('../leche-report-produccion-vacuno/produccion-vacuno-report')
      .then((m) => m.ProduccionVacunoReport),
},
{
  path: 'produccion-por-vacuno/:codigo',
  loadComponent: () =>
    import('../leche-report-produccion-vacuno/detalle-vacuno-report')
      .then((m) => m.DetalleVacunoReport),
},
```

## i18n Keys

Add under `leche.reportes.produccion-vacuno`:

| Key | Spanish value |
|-----|---------------|
| `codigo` | Código Vacuno |
| `nombre` | Nombre |
| `fecha` | Fecha |
| `litros` | Litros |
| `totalReal` | Total de litros real |
| `totalIdoneo` | Total de litros idóneo |
| `totalPrediccion` | Total de litros predicción |
| `produccionReal` | Producción real |
| `prediccion` | Predicción |
| `titulo` | Comparación de producción por vacuno |
| `detalleTitulo` | Producción por vacuno |

## Acceptance Criteria

| # | Criterion | Type |
|---|-----------|------|
| AC-1 | `/leche/reporte/produccion-por-vacuno` renders a `zt-data-table` with 4 columns (Código Vacuno, Nombre, Fecha, Litros) | E2E |
| AC-2 | Table rows correctly group multiple `LecheRegistro` entries for the same bovine into one row | Integration |
| AC-3 | Column filters reduce the visible rows without reloading API data | Integration |
| AC-4 | Pagination works: navigating pages shows correct slices of filtered data | Integration |
| AC-5 | Footer shows both `totalLitrosReal` and `totalLitrosIdoneo` with correct values | Integration |
| AC-6 | Clicking a row's action button navigates to `/leche/reporte/produccion-por-vacuno/{codigo}` | E2E |
| AC-7 | `/leche/reporte/produccion-por-vacuno/:codigo` renders an SVG chart with two lines and legend | E2E |
| AC-8 | Chart shows loading, error, and empty states correctly | Visual/Integration |
| AC-9 | Changing the date range on either view reloads data from the API | Integration |
| AC-10 | Download buttons (Excel/PDF) exist and do not throw errors | Visual |
| AC-11 | "Volver a reportes" navigates to `/leche/reporte` from both views | E2E |
| AC-12 | CSS matches existing report patterns (responsive header, filter bar, totals card, chart card) | Visual |
| AC-13 | `pnpm build` succeeds with no TypeScript or template errors | Build |
| AC-14 | Existing `/leche/reporte/produccion-diaria` and `/leche/reporte/produccion-vs-standard` continue to work | E2E |

## Open Questions

1. **Data volume**: If `getAll()` returns paginated results client-side (e.g., max 100 records per call), grouping may be incomplete. Should we confirm backend behavior before implementation or add a risk handler?
2. **idóneo estimate formula**: The current estimate (`uniqueBovines × daysInRange × 15`) uses a hardcoded 15 L/day. Should this be a configurable parameter or derived from historical averages?
3. **Download format**: Stub for now — should PDF/Excel use a shared download service pattern, or is each report component expected to handle its own download logic?
