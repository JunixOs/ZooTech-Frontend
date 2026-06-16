import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';
import { ChartPoint } from '../../domain/models/leche.model';

function parseFechaHora(fecha: string, hora: string): Date {
  const [d, m, y] = fecha.split('/').map(Number);
  const [h, min] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

@Component({
  selector: 'zt-detalle-vacuno-report',
  standalone: true,
  imports: [DateRangeFilterComponent, TranslatePipe, DecimalPipe],
  templateUrl: './detalle-vacuno-report.html',
  styleUrls: ['./detalle-vacuno-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleVacunoReport implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(LecheRepository);

  // ─── Private state signals ────────────────────────────────────────
  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _dateRange = signal<DateRange | null>(null);

  // ─── Public state signals ─────────────────────────────────────────
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly codigoVacuno = signal<string>('');
  readonly svgDims = { width: 800, height: 360 };
  readonly padding = { top: 30, right: 40, bottom: 120, left: 70 };

  // ─── Chart dimension computeds ────────────────────────────────────
  readonly chartW = computed(() => this.svgDims.width - this.padding.left - this.padding.right);
  readonly chartH = computed(() => this.svgDims.height - this.padding.top - this.padding.bottom);

  // ─── Computed: sorted registries ──────────────────────────────────
  private readonly registros = computed(() =>
    [...this._registros()].sort((a, b) => {
      const da = parseFechaHora(a.fecha, a.hora);
      const db = parseFechaHora(b.fecha, b.hora);
      return da.getTime() - db.getTime();
    }),
  );

  // ─── Computed: vacuno name from first record ──────────────────────
  readonly nombreVacuno = computed(() => {
    const r = this._registros();
    return r.length > 0 ? r[0].nombreVacuno : '';
  });

  // ─── Computed: chart data points with real + prediccion ───────────
  readonly datos = computed<ChartPoint[]>(() => {
    const r = this.registros();
    if (r.length === 0) return [];

    const avg = r.reduce((s, v) => s + v.litros, 0) / r.length;

    return r.map((reg, i) => ({
      fecha: reg.fecha,
      label: reg.fecha,
      real: reg.litros,
      prediccion: Math.round(
        (avg + Math.sin((i / (r.length - 1 || 1)) * Math.PI * 2) * avg * 0.1) * 10,
      ) / 10,
    }));
  });

  // ─── Y-axis ───────────────────────────────────────────────────────
  readonly yMax = computed(() => {
    const max = Math.max(...this.datos().map((d) => d.real), 1);
    return Math.max(Math.ceil(max / 5) * 5, 5);
  });

  readonly yTicks = computed(() => {
    const max = this.yMax();
    const step = Math.max(5, Math.ceil(max / 6 / 5) * 5);
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    return ticks;
  });

  // ─── X-axis labels (vertical rotated, deduplicated by fecha) ────
  readonly xLabels = computed(() => {
    const pts = this.datos();
    if (pts.length === 0) return [];

    const sx = this.scaleX();
    const labels: { x: number; label: string }[] = [];
    let start = 0;

    for (let i = 1; i <= pts.length; i++) {
      if (i === pts.length || pts[i].fecha !== pts[start].fecha) {
        const mid = Math.floor((start + i - 1) / 2);
        labels.push({ x: sx(mid), label: pts[start].label });
        start = i;
      }
    }

    return labels;
  });

  // ─── Scale functions ──────────────────────────────────────────────
  readonly scaleX = computed(() => {
    const n = this.datos().length - 1;
    if (n <= 0) return () => this.padding.left;
    return (i: number) => this.padding.left + (i / n) * this.chartW();
  });

  readonly scaleY = computed(() => {
    const range = this.yMax();
    if (range <= 0) return () => this.padding.top;
    return (v: number) => this.padding.top + this.chartH() - (v / range) * this.chartH();
  });

  // ─── Polyline point strings ───────────────────────────────────────
  readonly polylineReal = computed(() => {
    const sx = this.scaleX();
    const sy = this.scaleY();
    return this.datos().map((p, i) => `${sx(i)},${sy(p.real)}`).join(' ');
  });

  readonly polylinePrediccion = computed(() => {
    const sx = this.scaleX();
    const sy = this.scaleY();
    return this.datos().map((p, i) => `${sx(i)},${sy(p.prediccion)}`).join(' ');
  });

  // ─── Area fill paths ──────────────────────────────────────────────
  readonly areaReal = computed(() => {
    const pts = this.datos();
    if (pts.length === 0) return '';
    const sx = this.scaleX();
    const sy = this.scaleY();
    const bottom = this.padding.top + this.chartH();
    const coords = pts.map((p, i) => `${sx(i)},${sy(p.real)}`);
    return `M${coords[0]} L${coords.slice(1).join(' L')} L${sx(pts.length - 1)},${bottom} L${sx(0)},${bottom} Z`;
  });

  readonly areaPrediccion = computed(() => {
    const pts = this.datos();
    if (pts.length === 0) return '';
    const sx = this.scaleX();
    const sy = this.scaleY();
    const bottom = this.padding.top + this.chartH();
    const coords = pts.map((p, i) => `${sx(i)},${sy(p.prediccion)}`);
    return `M${coords[0]} L${coords.slice(1).join(' L')} L${sx(pts.length - 1)},${bottom} L${sx(0)},${bottom} Z`;
  });

  // ─── Totals ───────────────────────────────────────────────────────
  readonly totalReal = computed(() => this.datos().reduce((s, p) => s + p.real, 0));
  readonly totalPrediccion = computed(() => this.datos().reduce((s, p) => s + p.prediccion, 0));

  // ─── Lifecycle ────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      this.codigoVacuno.set(codigo);
      await this.cargarRegistros();
    }
  }

  // ─── Data loading ────────────────────────────────────────────────
  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const query: ConsultaFiltros = { ...filtros, vacunoId: this.codigoVacuno() };
      const data = await firstValueFrom(this.repository.getAll(query));
      this._registros.set(data);
    } catch (err) {
      this.error.set('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
      console.error('Error al cargar datos de detalle de vacuno:', err);
    } finally {
      this.loading.set(false);
    }
  }

  // ─── Event handlers ───────────────────────────────────────────────
  async onRangeChange(range: DateRange): Promise<void> {
    this._dateRange.set(range);
    const filtros: ConsultaFiltros = {};
    if (range.start) filtros.fechaDesde = this.toDateStr(range.start);
    if (range.end) filtros.fechaHasta = this.toDateStr(range.end);
    await this.cargarRegistros(filtros);
  }

  onDownload(format: 'excel' | 'pdf'): void {
    console.log('Descargando como', format);
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte/produccion-vs-standard-vacuno']);
  }

  // ─── Utilities ────────────────────────────────────────────────────
  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
