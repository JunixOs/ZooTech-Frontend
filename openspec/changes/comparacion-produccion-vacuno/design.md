# Design: Comparación de producción por vacuno

## Technical Approach

Client-side grouping of `LecheRegistro[]` from the existing `LecheRepository.getAll()` endpoint to produce a bovine-summarized table view, plus a detail SVG chart per bovine reusing `ComparacionProduccionReport`'s chart computation. Two standalone components, two new routes, zero new backend endpoints.

## Architecture Decisions

### Decision: Client-side grouping over API endpoint

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New API endpoint `GET /produccion-por-vacuno` | Backend change, coupling, deployment coordination | ❌ Rejected |
| `getAll()` + client-side grouping | Zero backend work, follows existing pattern; risk if >5000 records | ✅ **Chosen** |

**Rationale**: The existing report table (`produccion-diaria`) already loads full `LecheRegistro[]` — same data, same repository. Grouping by `codigoVacuno` is O(n) and trivially memoized via `computed()`. If data volume exceeds 5000 records (unlikely for a date-range-filtered query), we add an API endpoint as a perf improvement, not a correctness fix.

### Decision: Reuse existing chart computation verbatim

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New chart component | Duplicate 100+ lines of scale/tick/polyline logic | ❌ Rejected |
| Copy `ComparacionProduccionReport` pattern, rename `estandar` → `prediccion` | 1:1 structural match, trivial diff, familiar to reviewers | ✅ **Chosen** |

**Rationale**: The prediction formula, SVG layout, axis computation, legend, totals, loading/error/empty states are **identical**. The only changes are: (a) `estandar` rename → `prediccion`, (b) prediction line color `#6b21a8` (purple) replaced with `#2563eb` (blue) for visual distinguishability from the original report.

### Decision: Column filtering via `_columnFilters` signal over direct data-table binding

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Delegate filtering to `zt-data-table` | Depends on data-table internals; component owns less logic | ❌ Rejected |
| Filter in parent via `columnFilter` output + `computed()` | Full control, testable, matches existing `comparacion-produccion` stateless pattern | ✅ **Chosen** |

**Rationale**: `zt-data-table` emits `columnFilter` events but does not apply them internally in a documented way. Owning the filter logic in the parent via a `computed()` keeps filtering observable, debuggable, and replaceable.

## Data Flow

```
[zt-date-range-filter]
    │ rangeChange
    ▼
cargarRegistros(filtros) ──→ LecheRepository.getAll(filtros)
    │                           │
    │                           ▼
    │                     LecheRegistro[]
    │                           │
    ▼                           ▼
_registros signal ◄────────────┘
    │
    ▼
groupedData() ──→ groupBy codigoVacuno, sum litros → ProduccionVacuno[]
    │
    ▼
filteredData() ──→ apply _columnFilters[] (case-insensitive text match)
    │
    ▼
paginatedData() ──→ slice(currentPage, pageSize)
    │
    ▼
zt-data-table ◄──── paginatedData, totalItems, columns
    │
    └── rowAction → router.navigate(['produccion-por-vacuno', codigoVacuno])
```

### Detail route flow:

```
router param :codigo ──→ LecheRepository.getAll({ vacunoId, fechaDesde, fechaHasta })
                              │
                              ▼
                         _registros sorted by date
                              │
                              ▼
                         datos() → ChartPoint[] with prediccion
                              │
                              ▼
                         SVG chart (same as ComparacionProduccionReport)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/modules/leche/domain/models/produccion-vacuno.model.ts` | Create | `ProduccionVacuno` (grouped row), `ChartPoint` (chart data point) interfaces with `[key:string]: unknown` for data-table compat |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/produccion-vacuno-report.ts` | Create | Table component: signals, grouping/filtering/pagination computeds, `zt-data-table` binding |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/produccion-vacuno-report.html` | Create | Template: header, filter bar, data-table, totals footer, back button |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/produccion-vacuno-report.scss` | Create | BEM classes matching `produccion-diaria-report.scss` + `::ng-deep` to hide global search |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/detalle-vacuno-report.ts` | Create | Chart component: signals, scale/tick/polyline computeds (same as `ComparacionProduccionReport`), `prediccion` replaces `estandar` |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/detalle-vacuno-report.html` | Create | SVG template matching `comparacion-produccion-report.html`, colors: `#802b4d` real, `#2563eb` prediction |
| `src/app/modules/leche/presentation/leche-report-produccion-vacuno/detalle-vacuno-report.scss` | Create | BEM classes matching `comparacion-produccion-report.scss` |
| `src/app/modules/leche/presentation/leche-report/leche-report.ts` | Modify | Add 2 routes to `LECHE_REPORT_ROUTES` |
| `src/assets/i18n/es.json` | Modify | Add keys under `leche.reportes.produccion-vacuno` |

## Interfaces / Contracts

```typescript
// produccion-vacuno.model.ts
export interface ProduccionVacuno {
  codigoVacuno: string;
  nombreVacuno: string;
  ultimaFecha: string;       // 'DD/MM/YYYY'
  litros: number;
  [key: string]: unknown;    // Data-table index signature
}

export interface ChartPoint {
  fecha: string;             // 'DD/MM/YYYY'
  label: string;
  real: number;
  prediccion: number;
}
```

### Column config

```typescript
columns = signal<ColumnConfig[]>([
  { key: 'codigoVacuno', headerKey: 'leche.reportes.produccion-vacuno.codigo', filterable: true, sortable: true },
  { key: 'nombreVacuno', headerKey: 'leche.reportes.produccion-vacuno.nombre', filterable: true, sortable: true },
  { key: 'ultimaFecha', headerKey: 'leche.reportes.produccion-vacuno.fecha', filterable: true, sortable: true },
  { key: 'litros', headerKey: 'leche.reportes.produccion-vacuno.litros', filterable: true, sortable: true, align: 'right' },
]);
```

## Signal / Computed Design

### ProduccionVacunoReport

| Signal | Type | Default | Derivation |
|--------|------|---------|------------|
| `_registros` | `signal<LecheRegistro[]>` | `[]` | Set by `cargarRegistros()` |
| `loading` | `signal<boolean>` | `false` | Toggled during fetch |
| `error` | `signal<string\|null>` | `null` | Set on catch |
| `currentPage` | `signal<number>` | `1` | Updated by `onPageChange` |
| `pageSize` | `signal<number>` | `10` | Updated by `onPageSizeChange` |
| `_columnFilters` | `signal<Record<string, string>>` | `{}` | Updated by `onColumnFilter` |
| `_dateRange` | `signal<DateRange\|null>` | `null` | Updated by `onRangeChange` |

| Computed | Derivation |
|----------|-----------|
| `groupedData` | Group `_registros` by `codigoVacuno`, sum `litros`, latest `fecha` |
| `filteredData` | Filter `groupedData` by case-insensitive text match per column |
| `paginatedData` | `filteredData().slice((page-1)*size, page*size)` |
| `totalItems` | `filteredData().length` |
| `totalLitrosReal` | Sum of `litros` in `filteredData()` |
| `totalLitrosIdoneo` | `filteredData().length * daysInRange * 15` |

### DetalleVacunoReport

| Signal | Type | Default |
|--------|------|---------|
| `_registros` | `signal<LecheRegistro[]>` | `[]` |
| `loading` | `signal<boolean>` | `false` |
| `error` | `signal<string\|null>` | `null` |
| `codigoVacuno` | `signal<string>` | `''` |
| `svgDims` | constant `{ width: 800, height: 360 }` | — |
| `padding` | constant `{ top: 30, right: 40, bottom: 120, left: 70 }` | — |

Computeds: **Identical** to `ComparacionProduccionReport` — `registros` (sorted), `datos` (ChartPoint[]), `yMax`, `yTicks`, `xLabels`, `scaleX`, `scaleY`, `polylineReal`, `polylinePrediccion`, `areaReal`, `areaPrediccion`, `totalReal`, `totalPrediccion`. Only change: `estandar` → `prediccion`.

## Key Code Patterns

### Grouping (table component)

```typescript
readonly groupedData = computed<ProduccionVacuno[]>(() => {
  const map = new Map<string, ProduccionVacuno>();
  for (const r of this._registros()) {
    const existing = map.get(r.codigoVacuno);
    if (existing) {
      existing.litros += r.litros;
      if (r.fecha > existing.ultimaFecha) existing.ultimaFecha = r.fecha;
    } else {
      map.set(r.codigoVacuno, {
        codigoVacuno: r.codigoVacuno,
        nombreVacuno: r.nombreVacuno,
        ultimaFecha: r.fecha,
        litros: r.litros,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.nombreVacuno.localeCompare(b.nombreVacuno));
});
```

### Prediction (chart component)

```typescript
readonly datos = computed<ChartPoint[]>(() => {
  const r = this.registros();
  if (r.length === 0) return [];
  const avg = r.reduce((s, v) => s + v.litros, 0) / r.length;
  return r.map((reg, i) => ({
    fecha: reg.fecha,
    label: reg.fecha,
    real: reg.litros,
    prediccion: Math.round(
      (avg + Math.sin((i / (r.length - 1 || 1)) * Math.PI * 2) * avg * 0.1) * 10
    ) / 10,
  }));
});
```

## Styling Approach

Both components replicate the BEM class structure from their respective reference reports. Key mapping:

| Context | Reference | New component prefix |
|---------|-----------|---------------------|
| Container | `.comparacion-container` / `.produccionDiaria-container` | `.produccion-vacuno-container` / `.detalle-vacuno-container` |
| Header | `.reporte-header` / `.reporteDiario-header` | `.reporte-header` (same) |
| Filter | `.filter-container` | `.filter-container` (same) |
| Chart card | `.chart-card` | `.chart-card` (same) |
| Totals | `.totales-container` | `.totales-container` (same) |
| Footer | `.footer-reporte` | `.footer-reporte` (same) |
| Back button | `.btn-volver` | `.btn-volver` (same) |

All colors, spacing, shadows, font sizes, breakpoints, and transitions match the EXACT values in the reference SCSS files.

**Table override** (produccion-vacuno-report.scss only):
```scss
:host ::ng-deep zt-data-table {
  zt-search-input, .search-container, .table-search, input[type="search"] {
    display: none !important;
  }
}
```

## Routes

Add to `LECHE_REPORT_ROUTES` in `leche-report.ts`:

```typescript
{
  path: 'produccion-por-vacuno',
  loadComponent: () =>
    import('../leche-report-produccion-vacuno/produccion-vacuno-report')
      .then(m => m.ProduccionVacunoReport),
},
{
  path: 'produccion-por-vacuno/:codigo',
  loadComponent: () =>
    import('../leche-report-produccion-vacuno/detalle-vacuno-report')
      .then(m => m.DetalleVacunoReport),
},
```

## i18n Keys

```json
{
  "leche": {
    "reportes": {
      "produccion-vacuno": {
        "titulo": "Comparación de producción por vacuno",
        "detalleTitulo": "Producción por vacuno",
        "codigo": "Código Vacuno",
        "nombre": "Nombre",
        "fecha": "Fecha",
        "litros": "Litros",
        "totalReal": "Total de litros real",
        "totalIdoneo": "Total de litros idóneo",
        "totalPrediccion": "Total de litros predicción",
        "produccionReal": "Producción real",
        "prediccion": "Predicción",
        "descargar": "Descargar",
        "sinRegistros": "No hay registros de producción para el período seleccionado."
      }
    }
  }
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `groupedData` computed | Mock 6 records for 2 bovines → assert 2 groups with correct sums and latest dates |
| Unit | `filteredData` computed | Feed 5 groups, apply column filter → assert subset |
| Unit | `paginatedData` computed | Feed 25 rows, pageSize=10 → assert page 1 = 10 rows, page 3 = 5 rows |
| Unit | `datos` computed (chart) | Feed 10 sorted registros → assert 10 ChartPoints with valid `prediccion` values |
| Unit | Scale computeds (chart) | Assert `yMax` rounds up to nearest 5, `scaleY` maps correctly |
| Integration | `cargarRegistros` | Spy on `LecheRepository.getAll()`, verify signal updates |
| Build | Template compile | `pnpm build` must pass with no type/ template errors |

## Open Questions

- **Data volume threshold**: If `getAll()` returns paginated results server-side (e.g., max 100), client-side grouping is incomplete. Confirm backend pagination behavior during implementation; add a warning log if response length suggests truncation.
- **Idóneo formula**: `15 L/day` hardcoded. Acceptable for v1; extract to a configurable constant if the business asks for adjustment.
- **Download stubs**: No shared download service exists yet. Each component handles its own stub (`console.log`). Deferred to a future cross-cutting download service.
