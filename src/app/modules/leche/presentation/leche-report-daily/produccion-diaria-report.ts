import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { LecheFacade } from '@modules/leche/applications/facades/leche.facade';
import { TranslatePipe } from '@ngx-translate/core';
import { ReporteLecheService } from '@modules/leche/infraestructure/services/reporte-leche.service';

@Component({
  selector: 'zt-produccion-diaria-report',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe],
  templateUrl: './produccion-diaria-report.html',
  styleUrls: ['./produccion-diaria-report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduccionDiariaReport implements OnInit {
  private router = inject(Router);
  private readonly lecheFacade = inject(LecheFacade);
  private readonly reporteLecheService = inject(ReporteLecheService);

  // Estado de los datos
  registros = this.lecheFacade.registros;
  loading = this.lecheFacade.loading;
  dateRange = signal<DateRange>({ start: null, end: null });

  // Estado de la paginación de la tabla
  currentPage = signal(1);
  pageSize = signal(10);
  filteredData = computed(() => {
    let data = this.registros();
    const range = this.dateRange();

    if (range.start) {
      const start = new Date(range.start);
      data = data.filter((item) => new Date(item.fecha) >= start);
    }

    if (range.end) {
      const end = new Date(range.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter((item) => new Date(item.fecha) <= end);
    }

    return data;
  });

  tableData = computed<Record<string, unknown>[]>(() =>
    this.filteredData().map((item): Record<string, unknown> => ({ ...item })),
  );

  totalItems = computed(() => this.filteredData().length);

  // Configuración de las columnas para zt-data-table
  columns = signal<ColumnConfig[]>([
    { key: 'codigoRegistro', headerKey: 'leche.table.codigo', filterable: true, sortable: true },
    { key: 'fecha', headerKey: 'leche.table.fecha', filterable: true, sortable: true },
    { key: 'hora', headerKey: 'leche.table.hora', filterable: true },
    { key: 'nombreVacuno', headerKey: 'leche.table.vaca', filterable: true, sortable: true },
    { key: 'codigoVacuno', headerKey: 'leche.table.codigo', filterable: true },
    {
      key: 'litros',
      headerKey: 'leche.table.litro',
      filterable: true,
      sortable: true,
      align: 'right',
    },
  ]);

  // Totales dinámicos
  totalLitrosReal = computed(() => {
    return this.filteredData().reduce((acc, curr) => acc + curr.litros, 0);
  });

  totalLitrosIdoneo = computed(() => {
    return this.filteredData().reduce((acc, curr) => acc + Number(curr['litrosIdoneos'] ?? 0), 0);
  });

  ngOnInit(): void {
    this.lecheFacade.cargarRegistros();
  }

  // Manejadores de Eventos
  onRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Volver al inicio al cambiar densidad
  }

  onDownload(): void {
    this.reporteLecheService.getReporteLeche().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }
}
