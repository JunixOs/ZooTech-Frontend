import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  output,
  OnInit,
  input,
  effect,
  computed,
} from '@angular/core';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
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
export class TriajeList implements OnInit {
  nuevoTriaje = output<void>();
  verTriaje = output<Triaje>();
  recargar = input(0);

  private triajeService = inject(TriajeService);

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalRegistros = signal(0);
  totalPaginas = signal(0);
  paginaActual = signal(1);
  tamano = signal(10);

  // Filtros por columna (vienen del zt-data-table)
  filtros = signal<Record<string, string>>({});

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

  constructor() {
    effect(() => {
      if (this.recargar() > 0) this.loadTriajes();
    });
  }

  ngOnInit(): void {
    this.loadTriajes();
  }

  loadTriajes(): void {
    this.loading.set(true);
    const f = this.filtros();
    this.triajeService
      .getAll(this.paginaActual(), this.tamano(), {
        fecha: f['fechaHora'] || undefined,
        codigo: f['codigo'] || undefined,
        nombre: f['vacunoNombre'] || undefined,
        tipoPeso: f['tipoPesoCode'] || undefined,
        pesoKg: f['pesoKg'] ? Number(f['pesoKg']) : undefined,
      })
      .subscribe({
        next: (response) => {
          this.triajes.set(response.data);
          this.totalRegistros.set(response.totalRegistros);
          this.totalPaginas.set(response.totalPaginas);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los triajes');
          this.loading.set(false);
        },
      });
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
    this.loadTriajes();
  }

  onPageSizeChange(size: number): void {
    this.tamano.set(size);
    this.paginaActual.set(1);
    this.loadTriajes();
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.filtros.set(filters);
    this.paginaActual.set(1);
    this.loadTriajes();
  }

  onSearch(value: string): void {}

  onVerTriaje(row: Record<string, unknown>): void {
    this.verTriaje.emit(row['_raw'] as Triaje);
  }

  openNewTriage(): void {
    this.nuevoTriaje.emit();
  }

  onDateRangeChange(range: DateRange): void {
    console.log('Rango seleccionado (pendiente endpoint):', range);
  }
}
