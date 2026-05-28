import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { ProduccionDiariaRegistro } from '../../domain/models/produccion-diaria.model';
import { TranslatePipe } from '@ngx-translate/core';


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

  // Estado de los datos
  registros = signal<ProduccionDiariaRegistro[]>([]);
  loading = signal(false);

  // Estado de la paginación de la tabla
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = computed(() => this.registros().length);

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

  onDownload(): void {
    console.log('Descargando reporte...');
  }

  goBack(): void {
    this.router.navigate(['/leche/reporte']);
  }
}