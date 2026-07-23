import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunosFacade } from '../../application/facades/vacunos.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { VacunosList } from './vacunos-list/vacunos-list';
import { ExportService } from '@shared/services/export.service';
import { createServerTableState } from '@shared/utils/server-table-state';

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
  private readonly tableState = createServerTableState(({ search, page, pageSize, fechaInicio, fechaFin, columnFilters }) =>
    this.facade.cargarListado({
      search,
      page,
      pageSize,
      fechaInicio,
      fechaFin,
      estado: columnFilters['estado'],
    }),
  );
  readonly vacunos = this.tableState.data;
  readonly cargando = this.tableState.isLoading;
  readonly paginaActual = this.tableState.currentPage;
  readonly limitePorPagina = this.tableState.pageSize;
  readonly totalItems = this.tableState.totalItems;

  ngOnInit() {
    this.deletedCodigo.set(this.route.snapshot.queryParamMap.get('deleted'));
    this.updatedCodigo.set(this.route.snapshot.queryParamMap.get('updated'));

    this.tableState.init();
  }

  onSearch(q: string) {
    this.tableState.onSearch(q);
  }

  onFilterState(event: ColumnFilterEvent): void {
    if (event.columnKey === 'estado') {
      this.tableState.onColumnFilter({ estado: String(event.value || '') });
    }
  }

  onDateRangeChange(range: DateRange) {
    this.tableState.onDateRangeChange({
      fechaInicio: this.formatDateParam(range.start),
      fechaFin: this.formatDateParam(range.end),
    });
  }

  onPageChange(page: number) {
    this.tableState.onPageChange(page);
  }

  onPageSizeChange(size: number) {
    this.tableState.onPageSizeChange(size);
  }

  onViewAction(row: Record<string, unknown>) {
    const codigo = typeof row['codigo'] === 'string' ? row['codigo'] : null;

    if (codigo) {
      void this.router.navigate(['/vacunos/detalle', codigo]);
    }
  }

  onDownload(formato: 'excel' | 'pdf'): void {
    const dataToExport = this.vacunos().map((v) => ({
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

  private formatDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
