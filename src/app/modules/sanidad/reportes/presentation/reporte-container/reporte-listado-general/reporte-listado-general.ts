import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';

@Component({
  selector: 'zt-reporte-listado-general',
  imports: [DataTableComponent],
  templateUrl: 'reporte-listado-general.html',
  styleUrl: './reporte-listado-general.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoGeneral {
  loading = signal(false);
  triajes = signal<Triaje[]>([]);
  paginaActual = signal(1);
  tamano = signal(10);
  totalRegistros = signal(0);

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

  onVerTriaje(row: Record<string, unknown>): void {}

  onSearch(term: string): void {
    this.paginaActual.set(1);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }
  onPageSizeChange(size: number): void {
    this.tamano.set(size);
    this.paginaActual.set(1);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.paginaActual.set(1);
  }
}
