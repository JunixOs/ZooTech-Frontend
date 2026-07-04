import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { LecheRepository, ConsultaFiltros } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'zt-produccion-diaria-report',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe],
  templateUrl: './produccion-diaria-report.html',
  styleUrls: ['./produccion-diaria-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduccionDiariaReport {
  private router = inject(Router);
  private readonly lecheFacade = inject(LecheFacade);
  private readonly lecheRepository = inject(LecheRepository);
  private readonly filtrosActuales = signal<ConsultaFiltros>({});
  

  // Estado de los datos
  registros = signal<ProduccionDiariaRegistro[]>([]);
  loading = signal(false);

  // Estado de la paginación de la tabla
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = computed(() => this.registros().length);

  tableData = computed<Record<string, unknown>[]>(() => {
    // 1. Obtener los datos ya filtrados por fecha
    const sourceData = this.filteredData();

    // 2. Calcular los índices de corte para la página actual
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();

    // 3. Devolver solo el "trozo" (slice) que corresponde a la página
    return sourceData
      .slice(start, end)
      .map((item): Record<string, unknown> => ({ ...item }));
  });

  totalItems = computed(() => this.filteredData().length);

  // Configuración de las columnas para zt-data-table
  columns = signal<ColumnConfig[]>([
    { key: 'codigoRegistro', headerKey: 'Código de registro', filterable: false, sortable: true },
    { key: 'fecha', headerKey: 'Fecha', filterable: false, sortable: true },
    { key: 'hora', headerKey: 'Hora', filterable: false },
    { key: 'nombreVacuno', headerKey: 'Nombre', filterable: false, sortable: true },
    { key: 'codigoVacuno', headerKey: 'Código Vacuno', filterable: false },
    { key: 'litros', headerKey: 'Litros', filterable: false, sortable: true, align: 'right' },
  ]);

  // Totales dinámicos
  totalLitrosReal = computed(() => {
    return this.registros().reduce((acc, curr) => acc + curr.litros, 0);
  });

  totalLitrosIdoneo = computed(() => {
    return this.registros().length * 15; // Simulación: estándar de 15L por registro
  });

  // Manejadores de Eventos
  onRangeChange(range: DateRange): void {
    console.log('Filtro de fechas aplicado:', range);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Volver al inicio al cambiar densidad
  }


  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }

  async onDownload(format: 'excel' | 'pdf'): Promise<void> {
    try {
      const range = this.dateRange();

      const filtros: ConsultaFiltros = {};
      if (range.start) filtros.fechaDesde = new Date(range.start).toISOString().split('T')[0];
      if (range.end) filtros.fechaHasta = new Date(range.end).toISOString().split('T')[0];

      const config = {
        excel: { ext: 'xlsx', call: () => this.lecheRepository.downloadExcel(filtros) },
        pdf: { ext: 'pdf', call: () => this.lecheRepository.downloadPdf(filtros) }
      }[format];

      const blob = await firstValueFrom(config.call());
      const url = window.URL.createObjectURL(blob);

      // Descarga limpia en una sola línea
      Object.assign(document.createElement('a'), {
        href: url,
        download: `produccion-diaria-${Date.now()}.${config.ext}`
      }).click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al descargar formato ${format}:`, err);
    }
  }

}
