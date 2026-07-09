import { computed, Signal, WritableSignal, signal } from '@angular/core';
import { DateRange } from '@shared/models/report-config.model';
import { LecheRegistro, ReporteOrdeniosPdfFiltros } from '../../domain/models/leche.model';

export function toDateStr(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const fechaCache = new Map<string, Date>();

export function parseFechaHora(fecha: string, hora: string): Date {
  const key = `${fecha}|${hora}`;
  const cached = fechaCache.get(key);
  if (cached) return cached;
  const [d, m, y] = fecha.split('/').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const date = new Date(y, m - 1, d, h, min);
  if (fechaCache.size > 5000) fechaCache.clear();
  fechaCache.set(key, date);
  return date;
}

export function generateCSV<T>(
  data: T[],
  headers: string[],
  extractor: (item: T) => string[],
): string {
  const sep = ';';
  const lines = [headers.join(sep)];
  for (const item of data) {
    lines.push(extractor(item).join(sep));
  }
  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Abre un blob (PDF) en una nueva pestaña usando globalThis */
export function openPdfBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  globalThis.open(url, '_blank');
}

/** Construye filtros para reportes PDF a partir del rango de fechas y overrides opcionales */
export function buildPdfFilters(
  range: DateRange | null,
  overrides?: Partial<ReporteOrdeniosPdfFiltros>,
): ReporteOrdeniosPdfFiltros | undefined {
  const filtros: ReporteOrdeniosPdfFiltros = { ...overrides };
  if (range?.start) filtros.fechaDesde = toDateStr(range.start);
  if (range?.end) filtros.fechaHasta = toDateStr(range.end);
  return Object.keys(filtros).length > 0 ? filtros : undefined;
}

/** Convierte un rango de fechas a un texto legible */
export function dateRangeText(
  range: DateRange | null,
  fromLabel = 'Desde',
  toLabel = 'Hasta',
): string {
  if (!range?.start || !range?.end) return '';
  return `${fromLabel}: ${toDateStr(range.start)}  ${toLabel}: ${toDateStr(range.end)}`;
}

/** Calcula el número de días en un rango de fechas */
export function daysInRange(range: DateRange | null, defaultDays = 30): number {
  if (range?.start && range?.end) {
    const diff = range.end.getTime() - range.start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  return defaultDays;
}

// ─── Fábrica de estado de tabla (filtrado + paginación) ─────────────

export interface TableState {
  columnFilters: WritableSignal<Record<string, string>>;
  currentPage: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  filteredData: Signal<Record<string, unknown>[]>;
  paginatedData: Signal<Record<string, unknown>[]>;
  totalItems: Signal<number>;
}

export function createTableState<T extends Record<string, unknown>>(data: Signal<T[]>): TableState {
  const columnFilters = signal<Record<string, string>>({});
  const currentPage = signal(1);
  const pageSize = signal(10);

  const filteredData = computed(() => {
    const all = data();
    const filters = columnFilters();
    const keys = Object.keys(filters);
    if (keys.length === 0) return all as unknown as Record<string, unknown>[];
    return (all as unknown as Record<string, unknown>[]).filter((row) =>
      keys.every((key) => {
        const filterVal = filters[key].toLowerCase();
        if (!filterVal) return true;
        return String(row[key] ?? '')
          .toLowerCase()
          .includes(filterVal);
      }),
    );
  });

  const paginatedData = computed(() => {
    const page = currentPage();
    const size = pageSize();
    return filteredData().slice((page - 1) * size, page * size);
  });

  const totalItems = computed(() => filteredData().length);

  return { columnFilters, currentPage, pageSize, filteredData, paginatedData, totalItems };
}

// ─── Fábrica de estado de gráfico SVG ───────────────────────────────

export interface ChartDims {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

const defaultChartDims: ChartDims = {
  width: 800,
  height: 360,
  padding: { top: 30, right: 40, bottom: 120, left: 70 },
};

export interface ChartPoint {
  real: number;
  second: number;
}

export interface ChartState {
  chartW: Signal<number>;
  chartH: Signal<number>;
  yMax: Signal<number>;
  yTicks: Signal<number[]>;
  xLabels: Signal<{ x: number; label: string }[]>;
  scaleX: Signal<(i: number) => number>;
  scaleY: Signal<(v: number) => number>;
  polylineReal: Signal<string>;
  polylineSecond: Signal<string>;
  areaReal: Signal<string>;
  areaSecond: Signal<string>;
  totalReal: Signal<number>;
  totalSecond: Signal<number>;
}

export function createChartState(
  data: Signal<ChartPoint[]>,
  xLabelExtractor: (pt: ChartPoint, index: number) => string,
  dims?: Partial<{ width: number; height: number; padding: Partial<ChartDims['padding']> }>,
): ChartState {
  const w = dims?.width ?? defaultChartDims.width;
  const h = dims?.height ?? defaultChartDims.height;
  const p = {
    ...defaultChartDims.padding,
    ...(dims?.padding ?? {}),
  };

  const chartW = computed(() => w - p.left - p.right);
  const chartH = computed(() => h - p.top - p.bottom);

  const yMax = computed(() => {
    const max = Math.max(...data().map((d) => d.real), 1);
    return Math.max(Math.ceil(max / 5) * 5, 5);
  });

  const yTicks = computed(() => {
    const max = yMax();
    const step = Math.max(5, Math.ceil(max / 6 / 5) * 5);
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    return ticks;
  });

  const scaleX = computed(() => {
    const n = data().length - 1;
    if (n <= 0) return () => p.left;
    return (i: number) => p.left + (i / n) * chartW();
  });

  const scaleY = computed(() => {
    const range = yMax();
    if (range <= 0) return () => p.top;
    return (v: number) => p.top + chartH() - (v / range) * chartH();
  });

  const xLabels = computed(() => {
    const pts = data();
    if (pts.length === 0) return [];

    const sx = scaleX();
    const labels: { x: number; label: string }[] = [];

    const labelsMap = new Map<string, { startIdx: number; endIdx: number }>();
    for (let i = 0; i < pts.length; i++) {
      const lbl = xLabelExtractor(pts[i], i);
      const entry = labelsMap.get(lbl);
      if (entry) {
        entry.endIdx = i;
      } else {
        labelsMap.set(lbl, { startIdx: i, endIdx: i });
      }
    }

    for (const [label, { startIdx, endIdx }] of labelsMap) {
      const mid = Math.floor((startIdx + endIdx) / 2);
      labels.push({ x: sx(mid), label });
    }

    return labels;
  });

  const polylineReal = computed(() => {
    const sx = scaleX();
    const sy = scaleY();
    return data()
      .map((p, i) => `${sx(i)},${sy(p.real)}`)
      .join(' ');
  });

  const polylineSecond = computed(() => {
    const sx = scaleX();
    const sy = scaleY();
    return data()
      .map((p, i) => `${sx(i)},${sy(p.second)}`)
      .join(' ');
  });

  const areaReal = computed(() => {
    const pts = data();
    if (pts.length === 0) return '';
    const sx = scaleX();
    const sy = scaleY();
    const bottom = p.top + chartH();
    const coords = pts.map((pt, i) => `${sx(i)},${sy(pt.real)}`);
    return `M${coords[0]} L${coords.slice(1).join(' L')} L${sx(pts.length - 1)},${bottom} L${sx(0)},${bottom} Z`;
  });

  const areaSecond = computed(() => {
    const pts = data();
    if (pts.length === 0) return '';
    const sx = scaleX();
    const sy = scaleY();
    const bottom = p.top + chartH();
    const coords = pts.map((pt, i) => `${sx(i)},${sy(pt.second)}`);
    return `M${coords[0]} L${coords.slice(1).join(' L')} L${sx(pts.length - 1)},${bottom} L${sx(0)},${bottom} Z`;
  });

  const totalReal = computed(() => data().reduce((s, p) => s + p.real, 0));
  const totalSecond = computed(() => data().reduce((s, p) => s + p.second, 0));

  return {
    chartW,
    chartH,
    yMax,
    yTicks,
    xLabels,
    scaleX,
    scaleY,
    polylineReal,
    polylineSecond,
    areaReal,
    areaSecond,
    totalReal,
    totalSecond,
  };
}

/** Convierte registros de leche ordenados en puntos de gráfico */
export function toChartPoints(
  sortedRegistros: LecheRegistro[],
  secondKey: 'estandar' | 'prediccion',
): { real: number; second: number }[] {
  if (sortedRegistros.length === 0) return [];
  const avg = sortedRegistros.reduce((s, v) => s + v.litros, 0) / sortedRegistros.length;
  const n = sortedRegistros.length;

  return sortedRegistros.map((reg, i) => ({
    real: reg.litros,
    second: Math.round((avg + Math.sin((i / (n - 1 || 1)) * Math.PI * 2) * avg * 0.1) * 10) / 10,
  }));
}
