# Producción por vacuno — Specification

## Purpose

Provide two new report views under `/leche/reporte/produccion-por-vacuno/`: a grouped table showing total milk production per bovine (summed within a date range), and a detail SVG chart comparing real vs predicted production for a single bovine. Both views follow the existing patterns established by `ProduccionDiariaReport` (table) and `ComparacionProduccionReport` (SVG chart).

## Requirements

### Requirement: Bovine production table

The system **MUST** display a paginated, sortable, column-filterable table with one row per bovine, showing the total liters produced within the selected date range.

#### Scenario: Happy path — table renders grouped data

- GIVEN `LecheRepository.getAll()` returns 6 records for 2 distinct bovines ("V-001" with 3 records, "V-002" with 3 records)
- WHEN `ngOnInit` completes
- THEN `groupedData()` returns 2 `ProduccionVacuno` rows
- AND each row's `litros` is the sum of that bovine's records
- AND `ultimaFecha` is the latest formatted date for that bovine

#### Scenario: Column filter reduces rows

- GIVEN `groupedData()` has 5 bovines with codes V-001 through V-005
- WHEN user types "V-001" in the `codigoVacuno` column filter
- THEN `filteredData()` returns only rows matching "V-001"
- AND `totalItems()` reflects the filtered count

#### Scenario: Pagination slices filtered data

- GIVEN `filteredData()` has 25 rows and `pageSize` is 10
- WHEN component initializes
- THEN `paginatedData()` returns rows 0–9
- WHEN user clicks page 3
- THEN `paginatedData()` returns rows 20–24

#### Scenario: API error

- GIVEN API throws error
- WHEN `cargarRegistros()` catches error
- THEN `error()` signal is set
- AND `.chart-error` or data-table error state displays

### Requirement: Detail chart per bovine

The system **MUST** render an SVG line chart for `/leche/reporte/produccion-por-vacuno/:codigo` showing real vs predicted daily production for one bovine.

#### Scenario: Happy path — chart renders for a bovine

- GIVEN route param `codigo = "V-001"`
- WHEN `ngOnInit` calls `repository.getAll({ vacunoId: "V-001" })`
- AND API returns 10 `LecheRegistro` records for V-001
- THEN `datos()` returns 10 `ChartPoint` entries
- AND `polylineReal` and `polylinePrediccion` contain valid SVG point strings
- AND legend and totals are rendered in `.chart-bottom`

#### Scenario: No data for bovine

- GIVEN route param `codigo = "V-099"`
- WHEN API returns empty array
- THEN `.chart-empty` is shown with message
- AND `.chart-bottom` section is hidden

### Requirement: Date range filtering

Both components **MUST** reload data when the date range filter changes.

#### Scenario: Apply date filter

- GIVEN initial load returns all-time data
- WHEN user selects a date range
- THEN `repository.getAll()` is called with `fechaDesde` / `fechaHasta`
- AND `_registros` updates with filtered data

### Requirement: Navigation

The table row action **MUST** navigate to the detail page. The back button **MUST** return to the reports index.

#### Scenario: Navigate to detail

- GIVEN table row for bovine "V-001"
- WHEN user clicks the view action
- THEN router navigates to `/leche/reporte/produccion-por-vacuno/V-001`

### Requirement: Download stubs

Both components **SHOULD** provide Excel and PDF download stub buttons.

#### Scenario: Download click

- WHEN user clicks "Excel" or "PDF"
- THEN a console log records the format
- AND no error is thrown

### Requirement: Style consistency

All CSS **MUST** match the existing report component patterns (BEM classes, responsive layout, color variables).

#### Scenario: Visual comparison

- GIVEN `.produccion-vacuno-container` renders
- THEN header, filter bar, footer, and totals card classes match those in `produccion-diaria-report.scss` and `comparacion-produccion-report.scss`
- AND the data-table global search is hidden via `::ng-deep`

## Domain Models

```typescript
export interface ProduccionVacuno {
  codigoVacuno: string;
  nombreVacuno: string;
  ultimaFecha: string;   // 'DD/MM/YYYY'
  litros: number;
  [key: string]: unknown;
}

export interface ChartPoint {
  fecha: string;
  label: string;
  real: number;
  prediccion: number;
}
```

## Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-1 | `/leche/reporte/produccion-por-vacuno` renders a `zt-data-table` with 4 columns |
| AC-2 | Table groups multiple records per bovine into one row |
| AC-3 | Column filtering reduces visible rows without API reload |
| AC-4 | Pagination navigates page slices correctly |
| AC-5 | Footer shows `totalLitrosReal` and `totalLitrosIdoneo` |
| AC-6 | Row action navigates to detail route |
| AC-7 | Detail route renders SVG chart with two lines and legend |
| AC-8 | Chart handles loading, empty, and error states |
| AC-9 | Date range filter reloads data for both views |
| AC-10 | Download buttons exist and do not error |
| AC-11 | "Volver a reportes" works from both views |
| AC-12 | CSS matches existing report patterns (no visual regressions) |
| AC-13 | `pnpm build` succeeds |
| AC-14 | Existing report routes continue to work |
