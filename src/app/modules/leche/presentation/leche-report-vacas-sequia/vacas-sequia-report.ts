import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LecheRepository,
  ConsultaFiltros,
} from '@modules/leche/domain/interfaces/leche-repository.interface';
import { VacunoSequia } from '@modules/leche/domain/models/leche.model';

function createTableState(data: ReturnType<typeof signal<VacunoSequia[]>>) {
  const columnFilters = signal<Record<string, string>>({});
  const currentPage = signal(1);
  const pageSize = signal(10);

  const filteredData = computed(() => {
    const all = data();
    const filters = columnFilters();
    const keys = Object.keys(filters);
    if (keys.length === 0) return all;
    return all.filter((row) =>
      keys.every((key) => {
        const filterVal = filters[key].toLowerCase();
        if (!filterVal) return true;
        return String(row[key] ?? '').toLowerCase().includes(filterVal);
      }),
    );
  });

  const paginatedData = computed(() => {
    const page = currentPage();
    const size = pageSize();
    return filteredData().slice((page - 1) * size, page * size);
  });

  const totalItems = computed(() => filteredData().length);

  return { columnFilters, currentPage, pageSize, filteredData, paginatedData, totalItems };
}

@Component({
  selector: 'zt-vacas-sequia-report',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe],
  templateUrl: './vacas-sequia-report.html',
  styleUrls: ['./vacas-sequia-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacasSequiaReport implements OnInit {
  private readonly router = inject(Router);
  private readonly repository = inject(LecheRepository);

  private readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly vacasActualesData = signal<VacunoSequia[]>([]);
  readonly vacasFuturasData = signal<VacunoSequia[]>([]);
  readonly vacasHistoricasData = signal<VacunoSequia[]>([]);

  readonly actuales = createTableState(this.vacasActualesData);
  readonly futuros = createTableState(this.vacasFuturasData);
  readonly historicos = createTableState(this.vacasHistoricasData);

  readonly columnsActuales = signal<ColumnConfig[]>([
    { key: 'codigoVacuno', headerKey: 'leche.reportes.vacas-sequia.codigo', filterable: true, sortable: true },
    { key: 'nombreVacuno', headerKey: 'leche.reportes.vacas-sequia.nombre', filterable: true, sortable: true },
    { key: 'desde', headerKey: 'leche.reportes.vacas-sequia.desde', filterable: true, sortable: true },
    { key: 'probablementeHasta', headerKey: 'leche.reportes.vacas-sequia.probablementeHasta', filterable: true, sortable: true },
  ]);

  readonly columnsFuturos = signal<ColumnConfig[]>([
    { key: 'codigoVacuno', headerKey: 'leche.reportes.vacas-sequia.codigo', filterable: true, sortable: true },
    { key: 'nombreVacuno', headerKey: 'leche.reportes.vacas-sequia.nombre', filterable: true, sortable: true },
    { key: 'probablementeDesde', headerKey: 'leche.reportes.vacas-sequia.probablementeDesde', filterable: true, sortable: true },
    { key: 'probablementeHasta', headerKey: 'leche.reportes.vacas-sequia.probablementeHasta', filterable: true, sortable: true },
  ]);

  readonly columnsHistoricos = signal<ColumnConfig[]>([
    { key: 'codigoVacuno', headerKey: 'leche.reportes.vacas-sequia.codigo', filterable: true, sortable: true },
    { key: 'nombreVacuno', headerKey: 'leche.reportes.vacas-sequia.nombre', filterable: true, sortable: true },
    { key: 'desde', headerKey: 'leche.reportes.vacas-sequia.desde', filterable: true, sortable: true },
    { key: 'hasta', headerKey: 'leche.reportes.vacas-sequia.hasta', filterable: true, sortable: true },
  ]);

  readonly actionLabel = 'leche.reportes.vacas-sequia.ver';

  readonly dateRangeText = computed(() => {
    const range = this._dateRange();
    if (!range?.start || !range?.end) return '';
    return `Desde: ${this.toDateStr(range.start)}  Hasta: ${this.toDateStr(range.end)}`;
  });

  async ngOnInit(): Promise<void> {
    await this.cargarRegistros();
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.repository.getVacasEnSequia(filtros));
      this.vacasActualesData.set(response.actuales);
      this.vacasFuturasData.set(response.futuros);
      this.vacasHistoricasData.set(response.historicos);
      this.actuales.currentPage.set(1);
      this.futuros.currentPage.set(1);
      this.historicos.currentPage.set(1);
    } catch (err) {
      this.error.set('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
      console.error('Error al cargar datos de vacas en sequía:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRangeChange(range: DateRange): Promise<void> {
    this._dateRange.set(range);
    const filtros: ConsultaFiltros = {};
    if (range.start) filtros.fechaDesde = this.toDateStr(range.start);
    if (range.end) filtros.fechaHasta = this.toDateStr(range.end);
    await this.cargarRegistros(
      Object.keys(filtros).length > 0 ? filtros : undefined,
    );
  }

  onPageChange(table: 'actuales' | 'futuros' | 'historicos', page: number): void {
    this[table].currentPage.set(page);
  }

  onPageSizeChange(table: 'actuales' | 'futuros' | 'historicos', size: number): void {
    const state = this[table];
    state.pageSize.set(size);
    state.currentPage.set(1);
  }

  onColumnFilter(table: 'actuales' | 'futuros' | 'historicos', filters: Record<string, string>): void {
    const state = this[table];
    state.columnFilters.set(filters);
    state.currentPage.set(1);
  }

  onViewVacuno(row: Record<string, unknown>): void {
    const codigo = row['codigoVacuno'] as string;
    this.router.navigate(['/leche/reporte/produccion-por-vacuno', codigo]);
  }

  onDownloadExcel(): void {
    const allData = [
      ...this.vacasActualesData(),
      ...this.vacasFuturasData(),
      ...this.vacasHistoricasData(),
    ];
    const headers = ['Código Vacuno', 'Nombre', 'Desde', 'Probablemente Desde', 'Probablemente Hasta', 'Hasta'];
    const csvContent = this.generateCSV(allData, headers, (r) => [
      r.codigoVacuno,
      r.nombreVacuno,
      r.desde || '',
      r.probablementeDesde || '',
      r.probablementeHasta || '',
      r.hasta || '',
    ]);
    this.downloadFile(csvContent, 'vacas-sequia.csv', 'text/csv');
  }

  onDownloadPdf(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }

  private generateCSV<T>(
    data: T[],
    headers: string[],
    extractor: (item: T) => string[],
  ): string {
    const sep = ';';
    const lines = [headers.join(sep)];
    for (const item of data) {
      lines.push(extractor(item).join(sep));
    }
    return lines.join('\n');
  }

  private downloadFile(
    content: string,
    filename: string,
    mimeType: string,
  ): void {
    const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private toDateStr(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
