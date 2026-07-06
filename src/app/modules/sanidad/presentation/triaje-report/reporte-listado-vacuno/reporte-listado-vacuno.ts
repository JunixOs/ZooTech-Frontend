import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableComponent } from "@shared/components/data-table/data-table.component";
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { BackButtonComponent } from "@shared/components/back-button/back-button";
import { DownloadButtonComponent } from "@shared/components/download-button/download-button";
import { TranslatePipe } from '@ngx-translate/core';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';



@Component({
  selector: 'zt-reporte-listado-vacuno',
  imports: [DataTableComponent, PageHeaderComponent, BackButtonComponent, DownloadButtonComponent, TranslatePipe],
  templateUrl: 'reporte-listado-vacuno.html',
  styleUrl: './reporte-listado-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly filtroService = inject(ReporteFiltroService);
  

  readonly downloading = signal(false);

  fechaDesdeDisplay = computed(() => this.formatFechaDisplay(this.filtroService.fechaDesde()));
  fechaHastaDisplay = computed(() => this.formatFechaDisplay(this.filtroService.fechaHasta()));

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
    this.facade.actualizarFiltros({});
    this.facade.cargarPagina(1);
  }

  onVerTriaje(row: Record<string, unknown>): void {
    const triaje = row['_raw'] as Triaje;
    if (triaje?.vacunoId) {
      this.router.navigate([triaje.vacunoId], { relativeTo: this.route });
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

  onSearch(term: string): void {
    this.facade.actualizarBusqueda(term);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.facade.actualizarFiltros(filters);
  }

  onDownloadFormat(format: 'excel' | 'pdf'): void {
    if (this.downloading()) return;
    this.downloading.set(true);

    this.facade.descargar(format).subscribe({
      next: (blob) => {
        const ext = format === 'excel' ? 'xlsx' : 'pdf';
        this.triggerDownload(blob, `reporte-triaje-vacuno-${Date.now()}.${ext}`);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
      },
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}