import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import {
  EstadoRegistroVacuno,
  EstadoVacuno,
  ReporteVacunoListadoFiltros,
} from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-listado-vacuno-container',
  standalone: true,
  imports: [DataTableComponent, FormsModule, TranslatePipe, PageHeaderComponent],
  templateUrl: './listado-vacuno-container.component.html',
  styleUrl: './listado-vacuno-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoVacunoContainerComponent implements OnInit, OnDestroy {
  private readonly facade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private filterDebounceId: ReturnType<typeof setTimeout> | null = null;

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
  readonly estado = signal<EstadoVacuno | ''>('');
  readonly estadoRegistro = signal<EstadoRegistroVacuno | ''>('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly columnFiltersState = computed<Record<string, string>>(() => {
    const filters: Record<string, string> = {};

    if (this.codigo()) filters['codigo'] = this.codigo();
    if (this.fechaRegistro()) filters['fechaRegistro'] = this.fechaRegistro();
    if (this.nombre()) filters['nombre'] = this.nombre();
    if (this.raza()) filters['raza'] = this.raza();
    if (this.procedencia()) filters['procedencia'] = this.procedencia();
    if (this.estado()) filters['estado'] = this.estado();
    if (this.estadoRegistro()) filters['estadoRegistro'] = this.estadoRegistro();

    return filters;
  });

  readonly columns: ColumnConfig[] = [
    {
      key: 'codigo',
      headerKey: 'vacunos.reportes.list.columns.codigo',
      filterable: true,
      align: 'left',
    },
    {
      key: 'fechaRegistro',
      headerKey: 'vacunos.reportes.list.columns.registro',
      filterable: true,
      align: 'center',
    },
    {
      key: 'nombre',
      headerKey: 'vacunos.reportes.list.columns.nombre',
      filterable: true,
      align: 'left',
    },
    {
      key: 'raza',
      headerKey: 'vacunos.reportes.list.columns.raza',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'Jersey', value: 'Jersey' },
        { label: 'Holstein', value: 'Holstein' },
        { label: 'Brown Swiss', value: 'Brown Swiss' },
        { label: 'Angus', value: 'Angus' },
        { label: 'Hereford', value: 'Hereford' },
        { label: 'Simmental', value: 'Simmental' },
        { label: 'Brahman', value: 'Brahman' },
        { label: 'Charolais', value: 'Charolais' },
      ],
      align: 'left',
    },
    {
      key: 'procedencia',
      headerKey: 'vacunos.reportes.list.columns.procedencia',
      filterable: true,
      align: 'left',
    },
    {
      key: 'estado',
      headerKey: 'vacunos.reportes.list.columns.estado',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'vivo', value: 'vivo' },
        { label: 'muerto', value: 'muerto' },
      ],
      type: 'badge',
      align: 'center',
    },
    {
      key: 'estadoRegistro',
      headerKey: 'vacunos.reportes.list.columns.estadoRegistro',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'activo', value: 'activo' },
        { label: 'eliminado', value: 'eliminado' },
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

  ngOnDestroy(): void {
    this.clearPendingFilterSearch();
  }

  async buscar(resetPage = true): Promise<void> {
    if (resetPage) this.page.set(1);
    await this.facade.cargarListado(this.buildFiltros());
    this.persistListStateInUrl();
  }

  async cambiarPagina(nextPage: number): Promise<void> {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) return;
    this.page.set(nextPage);
    await this.facade.cargarListado(this.buildFiltros());
    this.persistListStateInUrl();
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
        if (event.value === '' || this.isEstadoVacuno(event.value)) {
          this.estado.set(event.value);
        }
        break;
      case 'estadoRegistro':
        if (event.value === '' || this.isEstadoRegistroVacuno(event.value)) {
          this.estadoRegistro.set(event.value);
        }
        break;
      default:
        return;
    }

    if (this.shouldDebounceFilter(event.columnKey)) {
      this.scheduleFilterSearch();
      return;
    }

    this.clearPendingFilterSearch();
    await this.buscar(true);
  }

  verDetalle(row: Record<string, unknown>): void {
    const id = Number(row['id']);

    if (!Number.isFinite(id)) {
      return;
    }

    void this.router.navigate(['/vacunos/reportes/registro', id], {
      queryParams: this.currentListQueryParams(),
    });
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
      estadoRegistro: this.estadoRegistro(),
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

  async limpiarFechas(): Promise<void> {
    this.fechaDesde.set(this.toInputDate(this.daysAgo(30)));
    this.fechaHasta.set(this.toInputDate(new Date()));
    await this.buscar(true);
  }

  private applyQueryFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const fechaDesde = params.get('fechaDesde');
    const fechaHasta = params.get('fechaHasta');
    const q = params.get('q');
    const codigo = params.get('codigo');
    const fechaRegistro = params.get('fechaRegistro');
    const nombre = params.get('nombre');
    const raza = params.get('raza');
    const procedencia = params.get('procedencia');
    const estado = params.get('estado');
    const estadoRegistro = params.get('estadoRegistro');
    const page = Number(params.get('page'));
    const limit = Number(params.get('limit'));

    if (this.isDateValue(fechaDesde)) {
      this.fechaDesde.set(fechaDesde);
    }

    if (this.isDateValue(fechaHasta)) {
      this.fechaHasta.set(fechaHasta);
    }

    if (q) {
      this.q.set(q);
    }

    if (codigo) this.codigo.set(codigo);
    if (fechaRegistro) this.fechaRegistro.set(fechaRegistro);
    if (nombre) this.nombre.set(nombre);
    if (raza) this.raza.set(raza);
    if (procedencia) this.procedencia.set(procedencia);
    if (this.isEstadoVacuno(estado)) this.estado.set(estado);
    if (this.isEstadoRegistroVacuno(estadoRegistro)) this.estadoRegistro.set(estadoRegistro);
    if (Number.isFinite(page) && page > 0) this.page.set(page);
    if (Number.isFinite(limit) && limit > 0) this.limit.set(limit);
  }

  private persistListStateInUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.currentListQueryParams(),
      replaceUrl: true,
    });
  }

  private currentListQueryParams(): Record<string, string | number | null> {
    return {
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
      q: this.q().trim() || null,
      codigo: this.codigo().trim() || null,
      fechaRegistro: this.fechaRegistro().trim() || null,
      nombre: this.nombre().trim() || null,
      raza: this.raza().trim() || null,
      procedencia: this.procedencia().trim() || null,
      estado: this.estado() || null,
      estadoRegistro: this.estadoRegistro() || null,
      page: this.page(),
      limit: this.limit(),
    };
  }

  private isDateValue(value: string | null): value is string {
    return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private isEstadoVacuno(value: string | null): value is EstadoVacuno {
    return value === 'vivo' || value === 'muerto';
  }

  private isEstadoRegistroVacuno(value: string | null): value is EstadoRegistroVacuno {
    return value === 'activo' || value === 'eliminado';
  }

  private shouldDebounceFilter(columnKey: string): boolean {
    return ['codigo', 'fechaRegistro', 'nombre', 'procedencia'].includes(columnKey);
  }

  private scheduleFilterSearch(): void {
    this.clearPendingFilterSearch();
    this.filterDebounceId = setTimeout(() => {
      this.filterDebounceId = null;
      void this.buscar(true);
    }, 350);
  }

  private clearPendingFilterSearch(): void {
    if (this.filterDebounceId === null) return;
    clearTimeout(this.filterDebounceId);
    this.filterDebounceId = null;
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
