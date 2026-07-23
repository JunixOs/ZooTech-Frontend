import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunosFacade } from '../../application/facades/vacunos.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { VacunosList } from './vacunos-list/vacunos-list';
import { VacunoEstado } from '../../domain/models/vacuno.model';
import { ExportService } from '@shared/services/export.service';

@Component({
  selector: 'zt-vacunos-container',
  standalone: true,
  imports: [VacunosList, TranslatePipe],
  templateUrl: './vacunos-container.html',
  styleUrl: './vacunos-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosContainer implements OnInit {
  facade = inject(VacunosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exportService = inject(ExportService);

  readonly deletedCodigo = signal<string | null>(null);
  readonly updatedCodigo = signal<string | null>(null);
  readonly cancelledCodigo = signal<string | null>(null);

  ngOnInit() {
    this.deletedCodigo.set(this.route.snapshot.queryParamMap.get('deleted'));
    this.updatedCodigo.set(this.route.snapshot.queryParamMap.get('updated'));
    this.cancelledCodigo.set(this.route.snapshot.queryParamMap.get('cancelled'));

    this.facade.cargarPagina(1);
  }

  onSearch(q: string) {
    this.facade.actualizarBusqueda(q);
  }

  onFilterState(event: ColumnFilterEvent): void {
    if (event.columnKey === 'estado') {
      this.facade.actualizarEstado((event.value as VacunoEstado) || null);
    }
  }

  onDateRangeChange(range: DateRange) {
    this.facade.actualizarFechas(range.start, range.end);
  }

  onPageChange(page: number) {
    this.facade.cargarPagina(page);
  }

  onPageSizeChange(size: number) {
    this.facade.cambiarLimite(size);
  }

  onViewAction(row: Record<string, unknown>) {
    const codigo = typeof row['codigo'] === 'string' ? row['codigo'] : null;

    if (codigo) {
      void this.router.navigate(['/vacuno/detalle', codigo]);
    }
  }

  onDownload(formato: 'excel' | 'pdf'): void {
    const dataToExport = this.facade.vacunos().map((v) => ({
      codigo: v.codigo,
      fechaRegistroFormatted: v.fechaRegistro ? new Date(v.fechaRegistro).toLocaleDateString('es-PE') : '—',
      nombre: v.nombre,
      raza: v.raza,
      procedencia: v.procedencia || '—',
      estado: v.estado === 'vivo' || v.estado === 'Vivo' || v.estado === 'activo' ? 'Vivo' : 'Muerto',
    }));

    const exportColumns = [
      { header: 'Código', key: 'codigo' },
      { header: 'Fecha Registro', key: 'fechaRegistroFormatted' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Raza', key: 'raza' },
      { header: 'Procedencia', key: 'procedencia' },
      { header: 'Estado', key: 'estado' },
    ];

    this.exportService
      .descargar(
        formato,
        'Reporte de Listado de Vacunos',
        exportColumns,
        dataToExport,
        `reporte-vacunos.${formato === 'excel' ? 'xlsx' : 'pdf'}`,
      )
      .subscribe();
  }
}
