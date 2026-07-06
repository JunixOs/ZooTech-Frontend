import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje, ConsultaFiltros } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/infrastructure/services/triaje.service';
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
  private readonly triajeService = inject(TriajeService);
  protected readonly filtroService = inject(ReporteFiltroService);

  loading = signal(false);
  downloading = signal(false);
  triajes = signal<Triaje[]>([]);
  paginaActual = signal(1);
  tamano = signal(10);
  totalRegistros = signal(0);
  columnFilters = signal<Record<string, string>>({});

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'vacunoNombre', headerKey: 'sanidad.triaje.columns.nombre', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      vacunoNombre: t.vacunoNombre,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      _raw: t as unknown,
    })),
  );

  constructor() {
    effect(() => {
      this.filtroService.fechaDesde();
      this.filtroService.fechaHasta();
      this.paginaActual.set(1);
      this.cargarDatos();
    });
  }

  ngOnInit(): void {}

  private cargarDatos(): void {
    this.loading.set(true);
    const cf = this.columnFilters();
    const filtros: ConsultaFiltros = {
      page: this.paginaActual(),
      pageSize: this.tamano(),
      fechaDesde: this.filtroService.fechaDesde(),
      fechaHasta: this.filtroService.fechaHasta(),
      fecha: this.parseEsPeDateToIso(cf['fechaHora']),
      codigo: cf['codigo'] || undefined,
      vacunoNombre: cf['vacunoNombre'] || undefined,
      tipoPeso: cf['tipoPesoCode'] || undefined,
      pesoKg: cf['pesoKg'] ? Number(cf['pesoKg']) : undefined,
    };

    this.triajeService.getAll(filtros).subscribe({
      next: (result) => {
        this.triajes.set(result.items);
        this.totalRegistros.set(result.totalItems);
        this.paginaActual.set(result.paginaActual);
        this.tamano.set(result.limitePorPagina);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private parseEsPeDateToIso(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const partes = value.split('/');
    if (partes.length !== 3) return undefined;
    const [dia, mes, anio] = partes;
    if (!dia || !mes || !anio) return undefined;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
    this.cargarDatos();
  }

  onPageSizeChange(size: number): void {
    this.tamano.set(size);
    this.paginaActual.set(1);
    this.cargarDatos();
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.paginaActual.set(1);
    this.cargarDatos();
  }

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    this.downloading.set(true);
    const filtros: ConsultaFiltros = {
      fechaDesde: this.filtroService.fechaDesde(),
      fechaHasta: this.filtroService.fechaHasta(),
    };
    const obs = formato === 'excel'
      ? this.triajeService.downloadExcel(filtros)
      : this.triajeService.downloadPdf(filtros);
    obs.subscribe({
      next: (blob) => {
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
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}