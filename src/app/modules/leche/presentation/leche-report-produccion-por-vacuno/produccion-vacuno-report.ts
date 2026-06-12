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
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';
import { ProduccionVacuno } from '../../domain/models/produccion-vacuno.model';

@Component({
  selector: 'zt-produccion-vacuno-report',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe],
  templateUrl: './produccion-vacuno-report.html',
  styleUrls: ['./produccion-vacuno-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduccionVacunoReport implements OnInit {
  private readonly router = inject(Router);
  private readonly repository = inject(LecheRepository);

  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _columnFilters = signal<Record<string, string>>({});
  private readonly _dateRange = signal<DateRange | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly columns = signal<ColumnConfig[]>([
    {
      key: 'codigoVacuno',
      headerKey: 'leche.reportes.produccion-vacuno.codigo',
      filterable: true,
      sortable: true,
    },
    {
      key: 'nombreVacuno',
      headerKey: 'leche.reportes.produccion-vacuno.nombre',
      filterable: true,
      sortable: true,
    },
    {
      key: 'ultimaFecha',
      headerKey: 'leche.reportes.produccion-vacuno.fecha',
      filterable: true,
      sortable: true,
    },
    {
      key: 'litros',
      headerKey: 'leche.reportes.produccion-vacuno.litros',
      filterable: true,
      sortable: true,
      align: 'right',
    },
  ]);

  readonly actionLabel = 'leche.reportes.produccion-vacuno.ver';

  readonly groupedData = computed<ProduccionVacuno[]>(() => {
    const map = new Map<string, ProduccionVacuno>();
    for (const r of this._registros()) {
      const existing = map.get(r.codigoVacuno);
      if (existing) {
        existing.litros += r.litros;
        if (r.fecha > existing.ultimaFecha) {
          existing.ultimaFecha = r.fecha;
        }
      } else {
        map.set(r.codigoVacuno, {
          codigoVacuno: r.codigoVacuno,
          nombreVacuno: r.nombreVacuno,
          ultimaFecha: r.fecha,
          litros: r.litros,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nombreVacuno.localeCompare(b.nombreVacuno),
    );
  });

  readonly filteredData = computed<ProduccionVacuno[]>(() => {
    const data = this.groupedData();
    const filters = this._columnFilters();
    const keys = Object.keys(filters);
    if (keys.length === 0) return data;

    return data.filter((row) =>
      keys.every((key) => {
        const filterVal = filters[key].toLowerCase();
        if (!filterVal) return true;
        const cellVal = String(row[key] ?? '').toLowerCase();
        return cellVal.includes(filterVal);
      }),
    );
  });

  readonly paginatedData = computed<ProduccionVacuno[]>(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return this.filteredData().slice((page - 1) * size, page * size);
  });

  readonly totalItems = computed(() => this.filteredData().length);

  readonly totalLitrosReal = computed(() =>
    this.filteredData().reduce((sum, row) => sum + row.litros, 0),
  );

  readonly dateRangeText = computed(() => {
    const range = this._dateRange();
    if (!range?.start || !range?.end) return '';
    const start = this.toDateStr(range.start);
    const end = this.toDateStr(range.end);
    return `Desde: ${start}  Hasta: ${end}`;
  });

  private readonly daysInRange = computed(() => {
    const range = this._dateRange();
    if (range?.start && range?.end) {
      const diff = range.end.getTime() - range.start.getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 30;
  });

  readonly totalLitrosIdoneo = computed(
    () => this.filteredData().length * this.daysInRange() * 15,
  );

  async ngOnInit(): Promise<void> {
    await this.cargarRegistros();
  }

  async cargarRegistros(filtros?: ConsultaFiltros): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.repository.getAll(filtros));
      this._registros.set(data);
      this.currentPage.set(1);
    } catch (err) {
      this.error.set(
        'No se pudieron cargar los datos. Verifica la conexión con el servidor.',
      );
      console.error('Error al cargar datos de producción por vacuno:', err);
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this._columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onViewVacuno(row: Record<string, unknown>): void {
    const codigo = row['codigoVacuno'] as string;
    this.router.navigate(['/leche/reporte/produccion-por-vacuno', codigo]);
  }

  onDownloadExcel(): void {
    const rows = this.filteredData();
    const headers = ['Código Vacuno', 'Nombre', 'Fecha', 'Litros'];
    const csvContent = this.generateCSV(rows, headers, (r) => [
      r.codigoVacuno,
      r.nombreVacuno,
      r.ultimaFecha,
      String(r.litros),
    ]);
    this.downloadFile(csvContent, 'produccion-por-vacuno.csv', 'text/csv');
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
