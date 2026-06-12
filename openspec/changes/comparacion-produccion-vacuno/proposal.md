# Proposal: Comparación de producción por vacuno

## Intent

The `produccion-por-vacuno` card exists in the report list but has no route or component. Users need two views: a table listing all bovines with production totals, and a detail SVG chart per bovine — matching the existing report patterns (daily table, comparison chart).

## Scope

### In Scope
- `ProduccionVacunoReport` — table grouped by bovine with totals footer
- `DetalleVacunoReport` — SVG chart (real vs prediction) per bovine
- Two new routes under `/leche/reporte/produccion-por-vacuno/`
- Domain model `ProduccionVacuno`, `DetalleProduccionVacuno`
- Client-side grouping from existing `LecheRepository.getAll()`
- i18n keys for new translations
- OpenSpec artifacts in this change folder

### Out of Scope
- New backend endpoint for grouped data (handled client-side)
- PDF/Excel download implementation (stub handlers only)
- Backend prediction data — computed client-side (same pattern as comparison report)
- DataTable action column routing (will navigate to detail page)

## Capabilities

### New Capabilities
- `produccion-vacuno-report`: Summarized production by bovine with filtering, sorting, pagination, and totals

### Modified Capabilities
- None — new feature, no existing specs change

## Approach

1. **Models**: Create `produccion-vacuno.model.ts` with `ProduccionVacuno` (grouped row) and `DetalleProduccionVacuno` (chart data point) interfaces. Both include index signature for DataTable compat.
2. **Table component** (`ProduccionVacunoReport`): Inject `LecheRepository`, call `getAll(filtros)`, group results client-side by `codigoVacuno` producing `ProduccionVacuno[]`. Render via existing `<zt-data-table>`. Compute totals (real sum + idóneo estimate). Reuse same BEM classes and layout as `produccion-diaria-report`.
3. **Chart component** (`DetalleVacunoReport`): Inject `LecheRepository`, call `getAll({ vacunoId })` for single bovine. Render SVG chart matching `comparacion-produccion-report` pattern — two lines (real solid, prediction dashed). Legend, totals, axis labels identical style.
4. **Routes**: Add both routes to `LECHE_REPORT_ROUTES` via `loadComponent`. Detail route gets `:codigo` param.
5. **i18n**: Add keys under `leche.reportes.produccion-vacuno.*`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/modules/leche/domain/models/produccion-vacuno.model.ts` | New | Domain interfaces |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/` | New | Folder with 2 components (ts/html/scss) |
| `src/app/modules/leche/presentation/leche-report/leche-report.ts` | Modified | Add 2 routes to LECHE_REPORT_ROUTES |
| `src/assets/i18n/es.json` | Modified | New translation keys |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `getAll()` may paginate server-side, missing some bovines | Medium | Check API behavior first; if paginated, request `getProduccionPorVacuno()` endpoint |
| Client-side grouping performance with large datasets | Low | Benchmark; switch to API grouping if >5000 records |
| SVG chart X-axis over-crowding with many dates | Low | Reuse existing rotation pattern from comparison report |

## Rollback Plan

Revert route additions from `leche-report.ts`, delete the new folder `leche-report-produccion-vacuno/`, and revert i18n changes. Add change folder to archive.

## Dependencies

- None beyond existing `LecheRepository` and `DataTableComponent`.

## Success Criteria

- [ ] `/leche/reporte/produccion-por-vacuno` renders a data-table with grouped bovine rows
- [ ] `/leche/reporte/produccion-por-vacuno/:codigo` renders an SVG chart for a single bovine
- [ ] All existing reports remain functional (no regressions)
- [ ] `pnpm build` passes with no errors
