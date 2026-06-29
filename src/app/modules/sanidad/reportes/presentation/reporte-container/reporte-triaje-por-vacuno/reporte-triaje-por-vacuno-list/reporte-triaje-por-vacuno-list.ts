import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';

@Component({
  selector: 'zt-reporte-triaje-por-vacuno-list',
  imports: [DataTableComponent],
  templateUrl: './reporte-triaje-por-vacuno-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTriajePorVacunoList {
  triajes = input.required<Triaje[]>();
  loading = input.required<boolean>();
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();
  expandedIndex = input<number | null>(null);

  pageChange = output<number>();
  pageSizeChange = output<number>();
  search = output<string>();
  columnFilter = output<Record<string, string>>();
  rowToggle = output<number>();

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      observaciones: t.observaciones ?? '—',
    })),
  );
}
