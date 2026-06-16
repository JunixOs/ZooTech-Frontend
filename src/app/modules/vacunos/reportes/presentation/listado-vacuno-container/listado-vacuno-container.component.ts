import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { ReporteVacunoListadoFiltros } from '../../domain/models/reporte-vacuno.model';
import { VacunosFacade } from '../../../application/vacunos.facade';

@Component({
  selector: 'zt-listado-vacuno-container',
  standalone: true,
  imports: [DataTableComponent, FormsModule, TranslatePipe],
  templateUrl: './listado-vacuno-container.component.html',
  styleUrl: './listado-vacuno-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoVacunoContainerComponent implements OnInit {
  private readonly facade = inject(VacunosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly items = this.facade.vacunos;
  readonly total = this.facade.totalItems;
  readonly loading = this.facade.cargando;
  readonly error = this.facade.error;

  readonly fechaDesde = signal(this.toInputDate(this.daysAgo(30)));
  readonly fechaHasta = signal(this.toInputDate(new Date()));
  readonly q = signal('');
  readonly codigo = signal('');
  readonly fechaRegistro = signal('');
  readonly nombre = signal('');
  readonly raza = signal('');
  readonly procedencia = signal('');
  readonly estado = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);

  readonly columns: ColumnConfig[] = [
    { key: 'codigo', headerKey: 'vacunos.reportes.list.columns.codigo', filterable: true, align: 'left' },
    { key: 'fechaRegistro', headerKey: 'vacunos.reportes.list.columns.registro', filterable: true, align: 'center' },
    { key: 'nombre', headerKey: 'vacunos.reportes.list.columns.nombre', filterable: true, align: 'left' },
    { key: 'raza', headerKey: 'vacunos.reportes.list.columns.raza', filterable: true, align: 'left' },
    { key: 'procedencia', headerKey: 'vacunos.reportes.list.columns.procedencia', filterable: true, align: 'left' },
    {
      key: 'estado',
      headerKey: 'vacunos.reportes.list.columns.estado',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'vacunos.reportes.status.vivo', value: 'vivo' },
        { label: 'vacunos.reportes.status.muerto', value: 'muerto' },
      ],
      type: 'badge',
      align: 'center',
    },
  ];

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));

  ngOnInit(): void {
    this.applyQueryFilters();
    this.buscar();
  }

  buscar(resetPage = true): void {
    if (resetPage) this.page.set(1);
    this.facade.cargarPagina(this.page(), this.buildFiltros());
  }

  cambiarPagina(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) return;
    this.page.set(nextPage);
    this.facade.cargarPagina(this.page(), this.buildFiltros());
  }

  cambiarLimite(value: string | number): void {
    this.limit.set(Number(value));
    this.buscar(true);
  }

  onSearch(term: string): void {
    this.q.set(term);
    this.buscar(true);
  }

  onFilterState(filters: Record<string, string>): void {
    this.codigo.set(filters['codigo'] ?? '');
    this.fechaRegistro.set(filters['fechaRegistro'] ?? '');
    this.nombre.set(filters['nombre'] ?? '');
    this.raza.set(filters['raza'] ?? '');
    this.procedencia.set(filters['procedencia'] ?? '');
    this.estado.set(filters['estado'] ?? '');

    this.buscar(true);
  }

  verDetalle(row: Record<string, unknown>): void {
    const id = Number(row['id']);

    if (!Number.isFinite(id)) {
      return;
    }

    void this.router.navigate(['/vacunos/reportes/registro', id]);
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes']);
  }

  private buildFiltros(): any {
    return {
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
      q: this.q().trim(),
      codigo: this.codigo().trim(),
      fechaRegistro: this.fechaRegistro().trim(),
      nombre: this.nombre().trim(),
      raza: this.raza().trim(),
      procedencia: this.procedencia().trim(),
      page: this.page(),
      limit: this.limit(),
      formato: 'json',
    };
  }

  private applyQueryFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const fechaDesde = params.get('fechaDesde');
    const fechaHasta = params.get('fechaHasta');
    const q = params.get('q');

    if (this.isDateValue(fechaDesde)) {
      this.fechaDesde.set(fechaDesde);
    }

    if (this.isDateValue(fechaHasta)) {
      this.fechaHasta.set(fechaHasta);
    }

    if (q) {
      this.q.set(q);
    }
  }

  private isDateValue(value: string | null): value is string {
    return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
