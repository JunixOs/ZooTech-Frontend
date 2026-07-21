import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FecundacionFacade } from '../../application/facades/fecundacion.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { FecundacionList } from './fecundacion-list/fecundacion-list';
import { ExportService } from '@shared/services/export.service';

@Component({
  selector: 'zt-fecundacion-container',
  standalone: true,
  imports: [FecundacionList],
  templateUrl: './fecundacion-container.html',
  styleUrl: './fecundacion-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionContainer implements OnInit {
  facade = inject(FecundacionFacade);
  private readonly router = inject(Router);
  private readonly exportService = inject(ExportService);

  ngOnInit() {
    // Inicializar con fechas predeterminadas (últimos 30 días a hoy)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    this.facade.actualizarFechasRango(hace30Dias, hoy);
  }

  onSearch(q: string) {
    this.facade.actualizarBusqueda(q);
  }

  onFilterResultado(event: ColumnFilterEvent): void {
    if (event.columnKey === 'codigoResultado') {
      this.facade.actualizarResultado(event.value || null);
    }
  }

  onDateRangeChange(range: DateRange) {
    this.facade.actualizarFechasRango(range.start, range.end);
  }

  onPageChange(page: number) {
    this.facade.cargarPagina(page);
  }

  onPageSizeChange(size: number) {
    this.facade.cambiarLimite(size);
  }

  onViewAction(row: Record<string, unknown>) {
    const id = row['id'];
    if (id) {
      void this.router.navigate(['/reproduccion/fecundacion/detalle', id]);
    }
  }

  onDownload(formato: 'excel' | 'pdf'): void {
    const dataToExport = this.facade.fecundaciones().map((f) => ({
      codigoFecundacion: f.codigoFecundacion,
      fechaProcedimientoFormatted: f.fechaProcedimiento ? new Date(f.fechaProcedimiento).toLocaleDateString('es-PE') : '—',
      nombreVacunoReceptor: f.nombreVacunoReceptor,
      tipoFecundacion: f.tipoFecundacion,
      nombreDonante: f.nombreDonante || '—',
      responsable: f.responsable || '—',
      codigoResultado: f.codigoResultado,
    }));

    const exportColumns = [
      { header: 'Código Fecundación', key: 'codigoFecundacion' },
      { header: 'Fecha de Procedimiento', key: 'fechaProcedimientoFormatted' },
      { header: 'Vacuno Receptor', key: 'nombreVacunoReceptor' },
      { header: 'Tipo', key: 'tipoFecundacion' },
      { header: 'Macho / Donante', key: 'nombreDonante' },
      { header: 'Responsable', key: 'responsable' },
      { header: 'Estado', key: 'codigoResultado' },
    ];

    this.exportService
      .descargar(
        formato,
        'Reporte de Listado de Fecundaciones',
        exportColumns,
        dataToExport,
        `reporte-fecundaciones.${formato === 'excel' ? 'xlsx' : 'pdf'}`,
      )
      .subscribe();
  }
}
