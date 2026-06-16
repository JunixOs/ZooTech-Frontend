import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { DateRange } from '@shared/models/report-config.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-list',
  imports: [DataTableComponent, TranslatePipe],
  templateUrl: './reporte-list.html',
  styleUrl: './reporte-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesList implements OnInit {
  private readonly triajeService = inject(TriajeService);

  readonly dateRange = input<DateRange>();
  readonly recargar = input(0);

  readonly verTriaje = output<Triaje>();
  readonly volver = output<void>();

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalRegistros = signal(0);
  totalPaginas = signal(0);
  paginaActual = signal(1);
  tamano = signal(10);
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
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      codigo: t.codigo,
      vacunoNombre: t.vacunoNombre,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: `${t.pesoKg} kg`,
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
    this.error.set(null);
    const f = this.filtros();
    const range = this.dateRange();
    this.triajeService
      .getAll(this.paginaActual(), this.tamano(), {
        fecha: f['fechaHora'] || undefined,
        codigo: f['codigo'] || undefined,
        nombre: f['vacunoNombre'] || undefined,
        tipoPeso: f['tipoPesoCode'] || undefined,
        pesoKg: f['pesoKg'] ? Number(f['pesoKg']) : undefined,
        fechaInicio: range?.start ? this.toISODate(range.start) : undefined,
        fechaFin: range?.end ? this.toISODate(range.end) : undefined,
      })
      .subscribe({
        next: (response) => {
          this.triajes.set(response.data);
          this.totalRegistros.set(response.totalRegistros);
          this.totalPaginas.set(response.totalPaginas);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar listado de triajes:', err);
          this.error.set('Error al cargar los triajes');
          this.loading.set(false);
        },
      });
  }

  private toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  onVerTriaje(row: Record<string, unknown>): void {
    this.verTriaje.emit(row['_raw'] as Triaje);
  }
}
