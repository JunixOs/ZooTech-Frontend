import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';
import { BackButtonComponent } from '@shared/components/back-button/back-button';
import { FixedDateRangeComponent } from "@shared/components/fixed-date-range/fixed-date-range";
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-reporte-listado-general',
  imports: [DataTableComponent, PageHeaderComponent, DownloadButtonComponent, BackButtonComponent, FixedDateRangeComponent],
  templateUrl: 'reporte-listado-general.html',
  styleUrl: 'reporte-listado-general.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoGeneral implements OnInit {
  readonly facade = inject(TriajeFacade);
  protected readonly filtroService = inject(ReporteFiltroService);
  private readonly route = inject(ActivatedRoute);

  downloading = signal(false);

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

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    this.downloading.set(true);
    this.facade.descargar(formato).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (formato === 'excel') {
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-triajes.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          window.open(url, '_blank');
        }
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        alert('Error al descargar el archivo.');
      }
    });
  }

  onDateRangeChange(range: DateRange): void {
    if (!range.start || !range.end) return;
    this.filtroService.actualizarRango(
      this.toDateOnlyString(range.start),
      this.toDateOnlyString(range.end),
    );
    const filters = { ...this.facade.filtros() };
    filters['fechaInicio'] = this.toDateOnlyString(range.start);
    filters['fechaFin'] = this.toDateOnlyString(range.end);
    this.facade.actualizarFiltros(filters);
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
