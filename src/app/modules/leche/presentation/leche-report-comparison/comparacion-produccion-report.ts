import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { TranslatePipe } from '@ngx-translate/core';
import { LecheRepository, ConsultaFiltros } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';
import { toDateStr, parseFechaHora } from '../leche-report/leche-report.utils';

interface ChartPoint {
  fecha: string;
  label: string;
  real: number;
  estandar: number;
}

@Component({
  selector: 'zt-comparacion-produccion-report',
  standalone: true,
  imports: [DateRangeFilterComponent, TranslatePipe, DecimalPipe],
  templateUrl: './comparacion-produccion-report.html',
  styleUrls: ['./comparacion-produccion-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparacionProduccionReport implements OnInit {
  private readonly router = inject(Router);
  private readonly repository = inject(LecheRepository);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _registros = signal<LecheRegistro[]>([]);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly svgDims = { width: 800, height: 360 };
  readonly padding = { top: 30, right: 40, bottom: 120, left: 70 };

  readonly chartW = computed(() => this.svgDims.width - this.padding.left - this.padding.right);
  readonly chartH = computed(() => this.svgDims.height - this.padding.top - this.padding.bottom);

  private readonly registros = computed(() =>
    [...this._registros()].sort((a, b) => {
      const da = parseFechaHora(a.fecha, a.hora);
      const db = parseFechaHora(b.fecha, b.hora);
      return da.getTime() - db.getTime();
    }),
  );

  readonly datos = computed<ChartPoint[]>(() => {
    const r = this.registros();
    if (r.length === 0) return [];

    const avg = r.reduce((s, v) => s + v.litros, 0) / r.length;

    return r.map((reg, i) => ({
      fecha: reg.fecha,
      label: reg.fecha,
      real: reg.litros,
      estandar: Math.round(
        (avg + Math.sin((i / (r.length - 1 || 1)) * Math.PI * 2) * avg * 0.1) * 10,
      ) / 10,
    }));
  });

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

  readonly polylineReal = computed(() => {
    const sx = this.scaleX();
    const sy = this.scaleY();
    return this.datos().map((p, i) => `${sx(i)},${sy(p.real)}`).join(' ');
  });

  readonly polylineEstandar = computed(() => {
    const sx = this.scaleX();
    const sy = this.scaleY();
    return this.datos().map((p, i) => `${sx(i)},${sy(p.estandar)}`).join(' ');
  });

  readonly areaReal = computed(() => {
    const pts = this.datos();
    if (pts.length === 0) return '';
    const sx = this.scaleX();
    const sy = this.scaleY();
    const bottom = this.padding.top + this.chartH();
    const coords = pts.map((p, i) => `${sx(i)},${sy(p.real)}`);
    return `M${coords[0]} L${coords.slice(1).join(' L')} L${sx(pts.length - 1)},${bottom} L${sx(0)},${bottom} Z`;
  });

  readonly areaEstandar = computed(() => {
    const pts = this.datos();
    if (pts.length === 0) return '';
    const sx = this.scaleX();
    const sy = this.scaleY();
    const bottom = this.padding.top + this.chartH();
    const coords = pts.map((p, i) => `${sx(i)},${sy(p.estandar)}`);
    return `M${coords[0]} L${coords.slice(1).join(' L')} L${sx(pts.length - 1)},${bottom} L${sx(0)},${bottom} Z`;
  });

  readonly totalReal = computed(() => this.datos().reduce((s, p) => s + p.real, 0));
  readonly totalEstandar = computed(() => this.datos().reduce((s, p) => s + p.estandar, 0));

  async ngOnInit(): Promise<void> {
    await this.cargarRegistros();
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.repository.getAll(filtros).pipe(takeUntilDestroyed(this.destroyRef)),
      );
      this._registros.set(data);
    } catch (err) {
      this.error.set('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
      console.error('Error al cargar datos de producción:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRangeChange(range: DateRange): Promise<void> {
    const filtros: ConsultaFiltros = {};
    if (range.start) filtros.fechaDesde = toDateStr(range.start);
    if (range.end) filtros.fechaHasta = toDateStr(range.end);
    await this.cargarRegistros(Object.keys(filtros).length > 0 ? filtros : undefined);
  }

  onDownload(format: 'excel' | 'pdf'): void {
    console.log('Descargando como', format);
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }

}
