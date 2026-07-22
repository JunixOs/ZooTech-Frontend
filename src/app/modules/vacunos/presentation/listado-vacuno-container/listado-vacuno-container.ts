import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnConfig } from '@shared/models/table-config.model';
import { ReporteFormato, ReporteVacunoListadoFiltros } from '../../domain/models/reporte-vacuno.model';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunosFacade } from '../../application/facades/vacunos.facade';

type ReportMode = 'listado' | 'registro';

@Component({
  selector: 'zt-listado-vacuno-container',
  standalone: true,
  imports: [DataTableComponent, DateRangeFilterComponent, TranslatePipe, PageHeaderComponent],
  templateUrl: './listado-vacuno-container.html',
  styleUrl: './listado-vacuno-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoVacunoContainer implements OnInit {
  private readonly facade = inject(VacunosFacade);
  private readonly reporteFacade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mode: ReportMode =
    this.route.snapshot.data['reportMode'] === 'registro' ? 'registro' : 'listado';

  readonly items = this.facade.vacunos;
  readonly total = this.facade.totalItems;
  readonly loading = this.facade.cargando;
  readonly error = this.facade.error;
  readonly titleKey =
    this.mode === 'registro' ? 'vacunos.reportes.recordList.title' : 'vacunos.reportes.list.title';
  readonly breadcrumbKey =
    this.mode === 'registro'
      ? 'vacunos.reportes.recordList.breadcrumb'
      : 'vacunos.reportes.list.breadcrumb';
  readonly actionLabel =
    this.mode === 'registro' ? 'vacunos.reportes.recordList.actions.viewRecord' : '';
  readonly actionIcon =
    this.mode === 'registro' ? 'fa-solid fa-file-lines' : 'fa-solid fa-magnifying-glass-plus';
  readonly isListadoMode = this.mode === 'listado';

  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly q = signal('');
  readonly codigo = signal('');
  readonly fechaRegistro = signal('');
  readonly nombre = signal('');
  readonly raza = signal('');
  readonly procedencia = signal('');
  readonly estado = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly downloadOpen = signal(false);
  readonly exporting = signal<Exclude<ReporteFormato, 'json'> | null>(null);
  readonly downloadError = signal('');
  readonly downloadSuccess = signal('');

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
        { label: 'vacunos.status.vivo', value: 'vivo' },
        { label: 'vacunos.status.muerto', value: 'muerto' },
      ],
      type: 'badge',
      translatePrefix: 'vacunos.status',
      align: 'center',
    },
  ];

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));
  readonly canDownload = computed(() => this.isListadoMode && !this.loading() && this.total() > 0);

  ngOnInit(): void {
    this.applyQueryFilters();
    this.buscar();
  }

  buscar(resetPage = true): void {
    if (resetPage) this.page.set(1);
    this.clearDownloadFeedback();
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

  onDateRangeChange(range: DateRange): void {
    this.fechaDesde.set(range.start ? this.toInputDate(range.start) : '');
    this.fechaHasta.set(range.end ? this.toInputDate(range.end) : '');

    if (range.start === null && range.end === null) {
      this.buscar(true);
    }
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
    if (this.mode !== 'registro') {
      return;
    }

    const id = Number(row['id']);

    if (!Number.isFinite(id)) {
      return;
    }

    void this.router.navigate(['/vacunos/reportes/registro', id]);
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes']);
  }

  toggleDownload(): void {
    if (!this.canDownload() || this.exporting()) {
      return;
    }

    this.downloadOpen.update((open) => !open);
  }

  async descargarListado(formato: Exclude<ReporteFormato, 'json'>): Promise<void> {
    if (!this.canDownload() || this.exporting()) {
      return;
    }

    this.exporting.set(formato);
    this.downloadOpen.set(false);
    this.downloadError.set('');
    this.downloadSuccess.set('');

    const url = await this.reporteFacade.generarListadoArchivo(
      {
        ...this.buildFiltros(),
        page: 1,
        pageSize: 100,
      },
      formato,
    );

    this.exporting.set(null);

    if (!url) {
      this.downloadError.set('vacunos.reportes.list.actions.downloadError');
      return;
    }

    this.downloadSuccess.set('vacunos.reportes.list.actions.downloadStarted');
    this.openDownload(url);
  }

  private buildFiltros(): ReporteVacunoListadoFiltros {
    return {
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
      search: this.q().trim(),
      codigo: this.codigo().trim(),
      fechaRegistro: this.fechaRegistro().trim(),
      nombre: this.nombre().trim(),
      raza: this.raza().trim(),
      procedencia: this.procedencia().trim(),
      estado: this.estado().trim(),
      page: this.page(),
      pageSize: this.limit(),
      formato: 'json',
    };
  }

  private clearDownloadFeedback(): void {
    this.downloadError.set('');
    this.downloadSuccess.set('');
    this.downloadOpen.set(false);
  }

  private openDownload(url: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  private applyQueryFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const fechaDesde = params.get('fechaDesde');
    const fechaHasta = params.get('fechaHasta');
    const q = params.get('search') ?? params.get('q');

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

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
