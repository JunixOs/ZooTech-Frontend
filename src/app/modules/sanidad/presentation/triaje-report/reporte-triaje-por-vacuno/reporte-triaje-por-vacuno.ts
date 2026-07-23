import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { ConsultaFiltros } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';
import { FixedDateRangeComponent } from '@shared/components/fixed-date-range/fixed-date-range';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';

@Component({
  selector: 'zt-reporte-triaje-por-vacuno',
  imports: [
    DataTableComponent,
    PageHeaderComponent,
    DownloadButtonComponent,
    FixedDateRangeComponent,
  ],
  templateUrl: './reporte-triaje-por-vacuno.html',
  styleUrl: './reporte-triaje-por-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTriajePorVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  //private readonly repository = inject(TriajeRepository);
  protected readonly filtroService = inject(ReporteFiltroService);
  readonly #route = inject(ActivatedRoute);

  readonly vacunoId = Number(this.#route.snapshot.paramMap.get('id'));

  readonly titulo = computed(() => {
    const v = this.facade.vacunos().find(v => v.id === this.vacunoId);
    const codigo = v ? v.codigo : `#${this.vacunoId}`;
    return `${codigo}${v ? ` — ${v.nombre}` : ''}`;
  });

  expandedIndex = signal<number | null>(null);
  downloading = signal(false);

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.facade.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      observaciones: t.observaciones ?? '—',
    })),
  );

  ngOnInit(): void {
    if (this.vacunoId) {
      this.facade.cargarPorVacuno(this.vacunoId);
      this.facade.cargarCatalogos();
    }
  }

  toggleRow(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  cambiarPagina(pagina: number): void {
    this.facade.cargarPagina(pagina);
  }

  onPageSizeChange(size: number): void {
    this.facade.cambiarLimite(size);
  }

  onColumnFilter(filters: Record<string, string>): void {
    filters['vacunoId'] = String(this.vacunoId);
    this.facade.actualizarFiltros(filters);
  }

  onDateRangeChange(range: DateRange): void {
    if (!range.start || !range.end) return;
    this.filtroService.actualizarRango(
      this.toDateOnlyString(range.start),
      this.toDateOnlyString(range.end),
    );
    this.facade.cargarPagina(1);
  }

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    this.downloading.set(true);
    this.facade.descargar(formato).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (formato === 'excel') {
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-triajes-vacuno-${this.vacunoId}.xlsx`;
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
/*
  private buildFiltrosDescarga(): ConsultaFiltros {
    const f = this.facade.filtros();
    return {
        vacunoId: String(this.vacunoId),
        fechaDesde: this.filtroService.fechaDesde(),
        fechaHasta: this.filtroService.fechaHasta(),
        codigo: f['codigo'],
        nombre: f['vacunoNombre'],
        tipoPeso: f['tipoPesoCode'],
        pesoKg: f['pesoKg'] ? Number(f['pesoKg']) : undefined,
    };

  }

  private downloadExcel(): void {
    this.downloading.set(true);

    this.repository.downloadExcel(this.buildFiltrosDescarga()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-triajes-vacuno-${this.vacunoId}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        alert('Error al descargar el archivo Excel.');
      },
    });
  }

  private downloadPdf(): void {
    this.downloading.set(true);

    this.repository.downloadPdf(this.buildFiltrosDescarga()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        alert('Error al descargar el archivo PDF.');
      },
    });
  }
*/
  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
    
}
