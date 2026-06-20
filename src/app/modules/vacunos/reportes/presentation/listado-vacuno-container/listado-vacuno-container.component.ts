import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { ReporteVacunoListadoFiltros } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-listado-vacuno-container',
  standalone: true,
  imports: [DataTableComponent, FormsModule, TranslatePipe, DateRangeFilterComponent],
  templateUrl: './listado-vacuno-container.component.html',
  styleUrl: '../../../presentation/vacunos-list/vacunos-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoVacunoContainerComponent implements OnInit {
  private readonly facade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly items = this.facade.itemsSignal;
  readonly total = this.facade.totalSignal;
  readonly loading = this.facade.loadingSignal;
  readonly error = this.facade.errorSignal;

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
    void this.buscar();
  }

  async buscar(resetPage = true): Promise<void> {
    if (resetPage) this.page.set(1);
    await this.facade.cargarListado(this.buildFiltros());
  }

  async cambiarPagina(nextPage: number): Promise<void> {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) return;
    this.page.set(nextPage);
    await this.facade.cargarListado(this.buildFiltros());
  }

  async cambiarLimite(value: string | number): Promise<void> {
    this.limit.set(Number(value));
    await this.buscar(true);
  }

  async onSearch(term: string): Promise<void> {
    this.q.set(term);
    await this.buscar(true);
  }

  async onFilterState(event: ColumnFilterEvent): Promise<void> {
    switch (event.columnKey) {
      case 'codigo':
        this.codigo.set(event.value);
        break;
      case 'fechaRegistro':
        this.fechaRegistro.set(event.value);
        break;
      case 'nombre':
        this.nombre.set(event.value);
        break;
      case 'raza':
        this.raza.set(event.value);
        break;
      case 'procedencia':
        this.procedencia.set(event.value);
        break;
      case 'estado':
        this.estado.set(event.value);
        break;
      default:
        return;
    }

    await this.buscar(true);
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

  private buildFiltros(): ReporteVacunoListadoFiltros {
    return {
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
      q: this.q().trim(),
      codigo: this.codigo().trim(),
      fechaRegistro: this.fechaRegistro().trim(),
      nombre: this.nombre().trim(),
      raza: this.raza().trim(),
      procedencia: this.procedencia().trim(),
      estado: this.estado(),
      page: this.page(),
      limit: this.limit(),
      formato: 'json',
    };
  }

  onDateRangeChange(range: { start: Date | null, end: Date | null }): void {
    if (range.start) {
      this.fechaDesde.set(this.toInputDate(range.start));
    } else {
      this.fechaDesde.set('');
    }

    if (range.end) {
      this.fechaHasta.set(this.toInputDate(range.end));
    } else {
      this.fechaHasta.set('');
    }

    void this.buscar(true);
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
