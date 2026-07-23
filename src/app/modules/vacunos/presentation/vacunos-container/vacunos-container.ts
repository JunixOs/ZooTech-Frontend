import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunosFacade } from '../../application/facades/vacunos.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { VacunosList } from './vacunos-list/vacunos-list';
import { VacunoEstado } from '../../domain/models/vacuno.model';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { ToastService } from '@core/notifications/toast.service';
import { saveBlob } from '@shared/utils/export-table.util';

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
  private readonly reporteFacade = inject(ReporteVacunoFacade);
  private readonly toast = inject(ToastService);

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

  async onDownload(formato: 'excel' | 'pdf'): Promise<void> {
    const report = await this.reporteFacade.generarListadoArchivo(
      { ...this.facade.filtrosActuales(), page: 1, pageSize: 100 },
      formato,
    );

    if (!report) {
      this.toast.error('No se pudo generar el reporte de vacunos.');
      return;
    }

    saveBlob(report.blob, report.fileName);
    this.toast.success('La descarga del reporte se inició correctamente.');
  }
}
