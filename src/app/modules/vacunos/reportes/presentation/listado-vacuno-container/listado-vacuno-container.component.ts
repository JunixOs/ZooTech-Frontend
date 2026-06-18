import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@core/notifications/toast.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig, ColumnFilterEvent } from '@shared/models/table-config.model';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { ReporteFormato, ReporteVacunoListadoFiltros } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-listado-vacuno-container',
  standalone: true,
  imports: [DataTableComponent, FormsModule, TranslatePipe],
  templateUrl: './listado-vacuno-container.component.html',
  styleUrl: './listado-vacuno-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoVacunoContainerComponent implements OnInit {
  private readonly facade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly items = this.facade.itemsSignal;
  readonly total = this.facade.totalSignal;
  readonly loading = this.facade.loadingSignal;
  readonly downloading = this.facade.downloadingSignal;
  readonly error = this.facade.errorSignal;
  readonly downloadError = this.facade.downloadErrorSignal;
  readonly downloadOpen = signal(false);

  readonly fechaDesde = signal(this.toInputDate(this.daysAgo(29)));
  readonly fechaHasta = signal(this.toInputDate(new Date()));
  readonly q = signal('');
  readonly raza = signal('');
  readonly sexo = signal('');
  readonly tipoAdquisicion = signal('');
  readonly granja = signal('');
  readonly estado = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);

  readonly columns: ColumnConfig[] = [
    { key: 'codigo', headerKey: 'vacunos.reportes.list.columns.codigo', align: 'left' },
    { key: 'nombre', headerKey: 'vacunos.reportes.list.columns.nombre', align: 'left' },
    { key: 'fechaNacimiento', headerKey: 'vacunos.reportes.list.columns.fechaNacimiento', align: 'center' },
    { key: 'tipoAdquisicion', headerKey: 'vacunos.reportes.list.columns.tipoAdquisicion', filterable: true, align: 'left' },
    { key: 'raza', headerKey: 'vacunos.reportes.list.columns.raza', filterable: true, align: 'left' },
    { key: 'color', headerKey: 'vacunos.reportes.list.columns.color', align: 'left' },
    { key: 'sexo', headerKey: 'vacunos.reportes.list.columns.sexo', filterable: true, align: 'left' },
    { key: 'granja', headerKey: 'vacunos.reportes.list.columns.granja', filterable: true, align: 'left' },
    {
      key: 'estado',
      headerKey: 'vacunos.reportes.list.columns.estado',
      filterable: true,
      filterType: 'toggle',
      filterOptions: [
        { label: 'Vivo', value: 'vivo' },
        { label: 'Muerto', value: 'muerto' },
      ],
      type: 'badge',
      align: 'center',
    },
    { key: 'fechaRegistro', headerKey: 'vacunos.reportes.list.columns.fechaRegistro', align: 'center' },
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
      case 'tipoAdquisicion':
        this.tipoAdquisicion.set(event.value);
        break;
      case 'raza':
        this.raza.set(event.value);
        break;
      case 'sexo':
        this.sexo.set(event.value);
        break;
      case 'granja':
        this.granja.set(event.value);
        break;
      case 'estado':
        this.estado.set(event.value);
        break;
      default:
        return;
    }

    await this.buscar(true);
  }

  async descargar(formato: Exclude<ReporteFormato, 'json'>): Promise<void> {
    this.downloadOpen.set(false);
    const blob = await this.facade.descargarListado(formato, this.buildFiltros());

    if (!blob) {
      return;
    }

    this.triggerDownload(blob, `reporte-listado-vacunos.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
    this.toast.success(this.translate.instant('vacunos.reportes.toast.downloadSuccess'));
    void this.router.navigate(['/vacunos/reportes']);
  }

  toggleDownloadMenu(): void {
    if (this.downloading()) {
      return;
    }

    this.downloadOpen.update((open) => !open);
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
      FechaInicio: this.fechaDesde(),
      FechaFin: this.fechaHasta(),
      Keyword: this.q().trim(),
      RazaCode: this.raza().trim(),
      SexoCode: this.sexo().trim(),
      TipoAdquisicionCode: this.tipoAdquisicion().trim(),
      GranjaId: this.granja().trim(),
      EstadoCode: this.estado(),
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

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
