import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
} from '@angular/core';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { DateRange } from '@shared/models/report-config.model';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ButtonComponent } from '@shared/ui/button.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-triaje-list',
  imports: [DataTableComponent, DateRangeFilterComponent, ButtonComponent, TranslatePipe],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList {
  triajes = input.required<Triaje[]>();
  loading = input.required<boolean>();
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  nuevoTriaje = output<void>();
  verTriaje = output<Triaje>();
  pageChange = output<number>();
  pageSizeChange = output<number>();
  search = output<string>();
  columnFilter = output<Record<string, string>>();
  dateRangeChange = output<DateRange>();

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'vacunoNombre', headerKey: 'sanidad.triaje.columns.nombre', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      vacunoNombre: t.vacunoNombre,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      _raw: t as unknown,
    })),
  );

  onVerTriaje(row: Record<string, unknown>): void {
    this.verTriaje.emit(row['_raw'] as Triaje);
  }

  openNewTriage(): void {
    this.nuevoTriaje.emit();
  }
}
