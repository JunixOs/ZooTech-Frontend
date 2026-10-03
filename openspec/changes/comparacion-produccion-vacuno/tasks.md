# Tasks: Comparación de producción por vacuno

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Foundation → Components (parallel) → Wiring → Tests → Build |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation + Table component + Tests | PR 1 | Model, i18n, `ProduccionVacunoReport`, its tests, routes |
| 2 | Chart component + Tests | PR 2 | `DetalleVacunoReport`, its tests |
| Or | Single PR with size:exception | PR 1 | ~1000 lines, needs maintainer approval |

## Phase 1: Foundation

- [x] 1.1 Create `domain/models/produccion-vacuno.model.ts` — `ProduccionVacuno` + `ChartPoint` interfaces with `[key: string]: unknown` for DataTable compat
- [x] 1.2 Add `leche.reportes.produccion-vacuno.*` keys to `assets/i18n/es.json` (13 keys)

## Phase 2: Table Component

- [x] 2.1 Create `leche-report-produccion-vacuno/produccion-vacuno-report.ts` — standalone `ProduccionVacunoReport` (OnPush, inject LecheRepository). Signals: `_registros`, `loading`, `error`, `currentPage`, `pageSize`, `_columnFilters`, `_dateRange`. Computeds: `groupedData` (groupBy codigoVacuno, sum litros, latest fecha), `filteredData` (case-insensitive column filter), `paginatedData`, `totalItems`, `totalLitrosReal`, `totalLitrosIdoneo`. Handlers: `cargarRegistros`, `onRangeChange`, `onPageChange`, `onPageSizeChange`, `onColumnFilter`, `onViewVacuno` (navigate), `onDownload` (stub), `goBack`.

- [x] 2.2 Create `produccion-vacuno-report.html` — header + breadcrumb, `.filter-container` with `zt-date-range-filter` + download group (Excel/PDF), `zt-data-table` bound to `paginatedData` with `actionLabel`/`rowAction`, `.footer-reporte` with `.btn-volver` + `.totales-container` (totalLitrosReal, totalLitrosIdoneo).

- [x] 2.3 Create `produccion-vacuno-report.scss` — BEM classes matching `produccion-diaria-report.scss` exactly. Add `::ng-deep` to hide data-table search (`input[type="search"]`).

## Phase 3: Chart Component

- [x] 3.1 Create `detalle-vacuno-report.ts` — standalone `DetalleVacunoReport` (OnPush, inject Router + LecheRepository). Signals mirroring `ComparacionProduccionReport`: `_registros`, `loading`, `error`, `codigoVacuno` (from route param), `svgDims`/`padding` constants. Computeds: `registros` (sorted), `datos` (ChartPoint[] with `prediccion` replacing `estandar`), `yMax`, `yTicks`, `xLabels`, `scaleX`, `scaleY`, `polylineReal`, `polylinePrediccion`, `areaReal`, `areaPrediccion`, `totalReal`, `totalPrediccion`. NgOnInit reads `:codigo` param, calls `cargarRegistros({ vacunoId })`.

- [x] 3.2 Create `detalle-vacuno-report.html` — SVG template matching `comparacion-produccion-report.html`: `gradReal` (`#802b4d`), `gradPrediccion` (`#2563eb`), axes, yTicks grid + labels, xLabels rotated -90°, polylineReal solid `#802b4d`, polylinePrediccion dashed `#2563eb`, circle markers, loading/error/empty states, `.chart-bottom` with legend + totals.

- [x] 3.3 Create `detalle-vacuno-report.scss` — BEM classes matching `comparacion-produccion-report.scss` exactly: `.detalle-vacuno-container`, `.chart-card`, `.chart-legend`, `.real-line` (`#802b4d`), `.dashed-line` (`#2563eb` repeating-gradient), `.chart-totals`, `.btn-volver`.

## Phase 4: Wiring

- [x] 4.1 Add 2 lazy routes to `LECHE_REPORT_ROUTES` in `leche-report.ts`: `produccion-por-vacuno` → `ProduccionVacunoReport`, `produccion-por-vacuno/:codigo` → `DetalleVacunoReport` (both via `loadComponent`).

## Phase 5: Testing

- [ ] 5.1 Unit test `groupedData`: 6 records for 2 bovines → assert 2 rows, correct sums, latest fecha
- [ ] 5.2 Unit test `filteredData` + `paginatedData`: 25 rows, pageSize=10 → assert page slices, column filter reduces subset
- [ ] 5.3 Unit test chart `datos`: 10 sorted records → assert 10 ChartPoints, valid `prediccion` formula
- [ ] 5.4 Unit test scale computeds: `yMax` rounds up to nearest 5, `scaleY` maps correctly

## Phase 6: Build Verification

- [ ] 6.1 Run `pnpm build` — fix any TS or template compile errors
