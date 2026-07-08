import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { BackButtonComponent } from '@shared/components/back-button/back-button';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { FixedDateRangeComponent } from "@shared/components/fixed-date-range/fixed-date-range";
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-reporte-listado-vacuno',
  imports: [DataTableComponent, PageHeaderComponent, BackButtonComponent, FormsModule, FixedDateRangeComponent],
  templateUrl: 'reporte-listado-vacuno.html',
  styleUrl: './reporte-listado-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly filtroService = inject(ReporteFiltroService);

  fechaDesdeDisplay = computed(() => this.formatFechaDisplay(this.filtroService.fechaDesde()));
  fechaHastaDisplay = computed(() => this.formatFechaDisplay(this.filtroService.fechaHasta()));

  actionLabel = computed(() => {
    const type = this.route.snapshot.queryParamMap.get('type');
    return type === 'grafico' ? 'sanidad.table.viewChart' : 'shared.table.view';
  });

  actionIcon = computed(() => {
    const type = this.route.snapshot.queryParamMap.get('type');
    return type === 'grafico' ? 'fa-solid fa-chart-line' : 'fa-solid fa-magnifying-glass-plus';
  });

  get fechaInicio(): string {
    return this.facade.filtros()['fechaInicio'] || '';
  }

  get fechaFin(): string {
    return this.facade.filtros()['fechaFin'] || '';
  }

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'vacunoNombre', headerKey: 'sanidad.triaje.columns.nombre', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.facade.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      vacunoNombre: t.vacunoNombre,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      _raw: t as unknown,
    })),
  );

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const desde = qp.get('desde');
    const hasta = qp.get('hasta');

    const initialFilters: Record<string, string> = {};
    if (desde) initialFilters['fechaInicio'] = desde;
    if (hasta) initialFilters['fechaFin'] = hasta;

    this.facade.actualizarFiltros(initialFilters);
    this.facade.cargarPagina(1);
  }

  onVerTriaje(row: Record<string, unknown>): void {
    const triaje = row['_raw'] as Triaje;
    if (triaje?.vacunoId) {
      const type = this.route.snapshot.queryParamMap.get('type');
      if (type === 'grafico') {
        const filters = this.facade.filtros();
        this.router.navigate(['/sanidad/reportes/graficoListadoVacuno', triaje.vacunoId], {
          queryParams: {
            desde: filters['fechaInicio'] || null,
            hasta: filters['fechaFin'] || null,
          },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate([triaje.vacunoId], { relativeTo: this.route });
      }
    }
  }

  private formatFechaDisplay(iso: string): string {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  }

  cambiarPagina(pagina: number): void {
    this.facade.cargarPagina(pagina);
  }

  onPageSizeChange(size: number): void {
    this.facade.cambiarLimite(size);
  }

  onColumnFilter(filters: Record<string, string>): void {
    const current = this.facade.filtros();
    const newFilters = { ...filters };
    if (current['fechaInicio']) newFilters['fechaInicio'] = current['fechaInicio'];
    if (current['fechaFin']) newFilters['fechaFin'] = current['fechaFin'];
    this.facade.actualizarFiltros(newFilters);
  }

  onStartDateChange(value: string): void {
    const filters = { ...this.facade.filtros() };
    if (value) {
      filters['fechaInicio'] = value;
    } else {
      delete filters['fechaInicio'];
    }
    this.facade.actualizarFiltros(filters);
  }

  onEndDateChange(value: string): void {
    const filters = { ...this.facade.filtros() };
    if (value) {
      filters['fechaFin'] = value;
    } else {
      delete filters['fechaFin'];
    }
    this.facade.actualizarFiltros(filters);
  }
  onDateRangeChange(range: DateRange): void {
    const desde = range.start ? this.toDateOnlyString(range.start) : undefined;
    const hasta = range.end ? this.toDateOnlyString(range.end) : undefined;
      if (desde && hasta) {
        this.filtroService.actualizarRango(desde, hasta);
      }
      const filters = { ...this.facade.filtros() };
      if (desde) {
        filters['fechaInicio'] = desde;
      } else {
        delete filters['fechaInicio'];
      }
      if (hasta) {
        filters['fechaFin'] = hasta;
      } else {
        delete filters['fechaFin'];
      }
      this.facade.actualizarFiltros(filters);
    }
private toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
}
