import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import {
  CalendarDays,
  ChartLine,
  ChevronDown,
  Download,
  LucideAngularModule,
  Reply,
  Search,
  Table2,
  type LucideIconData,
} from 'lucide-angular';
import { VACUNO_REQUIREMENTS_CONFIG } from '../../config/vacuno-requirements.config';
import { Vacuno } from '../../domain/models/vacuno.model';
import { VacunoGenealogiaDto } from '../../infrastructure/vacunos.api.service';
import { VacunoListadoItem } from '../../reportes/domain/models/reporte-vacuno.model';
import { ReporteVacunoFacade } from '../../reportes/application/facades/reporte-vacuno.facade';
import { VacunosFacade } from '../../application/vacunos.facade';

type ReportView = 'reports' | 'activity-chart' | 'genealogy-list' | 'genealogy-tree';
type ReportId = 'listado' | 'genealogico' | 'registro' | 'actividad';
type DownloadFormat = 'xlsx' | 'pdf';

interface VacunoReportCard {
  id: ReportId;
  title: string;
  description: string;
  icon: 'table' | 'chart';
}

interface ActivityPoint {
  date: string;
  count: number;
}

interface ChartPoint extends ActivityPoint {
  x: number;
  y: number;
}

interface GenealogyColumnFilters {
  codigo: string;
  fechaRegistro: string;
  nombre: string;
  raza: string;
  procedencia: string;
  estado: string;
}

interface GenealogyFlatNode {
  node: VacunoGenealogiaDto;
  level: number;
  relation: string;
  key: string;
  parentKey: string | null;
}

const CHART_WIDTH = 900;
const CHART_HEIGHT = 430;
const CHART_PADDING = {
  top: 34,
  right: 36,
  bottom: 92,
  left: 90,
};
const ACTIVITY_REPORT_REQUIREMENTS = VACUNO_REQUIREMENTS_CONFIG.graficoVacunosEnActividad;

@Component({
  selector: 'zt-vacunos-reportes',
  standalone: true,
  imports: [LucideAngularModule, NgTemplateOutlet, PageHeaderComponent],
  templateUrl: './vacunos-reportes.component.html',
  styleUrl: './vacunos-reportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosReportesComponent implements OnInit {
  private readonly facade = inject(VacunosFacade);
  private readonly reporteFacade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly calendarIcon = CalendarDays;
  readonly chartIcon = ChartLine;
  readonly chevronDownIcon = ChevronDown;
  readonly downloadIcon = Download;
  readonly replyIcon = Reply;
  readonly searchIcon = Search;
  readonly tableIcon = Table2;
  readonly chartViewBox = `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`;
  readonly chartAxisLeft = CHART_PADDING.left;
  readonly chartAxisRight = CHART_WIDTH - CHART_PADDING.right;
  readonly chartAxisBottom = CHART_HEIGHT - CHART_PADDING.bottom;
  readonly chartAxisTop = CHART_PADDING.top;

  readonly reports: VacunoReportCard[] = [
    {
      id: 'listado',
      title: 'Reporte de listado de vacunos',
      description:
        'Lista los vacunos registrados, sus datos principales y el estado actual del registro.',
      icon: 'table',
    },
    {
      id: 'genealogico',
      title: 'Grafico genealogico por vacuno',
      description:
        'Muestra la relacion genealogica registrada para el vacuno seleccionado.',
      icon: 'chart',
    },
    {
      id: 'registro',
      title: 'Reporte de registro por vacuno',
      description:
        'Presenta el historial registrado para un vacuno dentro del rango de fechas.',
      icon: 'table',
    },
    {
      id: 'actividad',
      title: 'Grafico de vacunos en actividad',
      description:
        'Este reporte muestra los registros de vacunos en actividad de acuerdo a las fechas establecidas en los filtros.',
      icon: 'chart',
    },
  ];

  readonly view = signal<ReportView>('reports');
  readonly startDate = signal(
    toInputDate(addDays(new Date(), -(ACTIVITY_REPORT_REQUIREMENTS.diasPorDefecto - 1))),
  );
  readonly endDate = signal(toInputDate(new Date()));
  readonly searchTerm = signal('');
  readonly filterError = signal('');
  readonly successMessage = signal('');
  readonly dataError = signal('');
  readonly loading = signal(false);
  readonly downloadOpen = signal(false);
  readonly activePoint = signal<ChartPoint | null>(null);
  readonly activityData = signal<ActivityPoint[]>([]);
  readonly genealogyRows = signal<VacunoListadoItem[]>([]);
  readonly genealogyTotal = signal(0);
  readonly genealogyPage = signal(1);
  readonly genealogyLimit = signal(10);
  readonly genealogyFilters = signal<GenealogyColumnFilters>({
    codigo: '',
    fechaRegistro: '',
    nombre: '',
    raza: '',
    procedencia: '',
    estado: '',
  });
  readonly selectedVacuno = signal<VacunoListadoItem | null>(null);
  readonly selectedGenerationLevel = signal(3);
  readonly genealogyTree = signal<VacunoGenealogiaDto | null>(null);
  readonly generationOptions = [1, 2, 3, 4] as const;

  readonly filteredReports = computed(() => this.reports);

  readonly hasActivityData = computed(() => this.activityData().some((point) => point.count > 0));
  readonly canDownload = computed(() => !this.loading() && this.hasActivityData());
  readonly canDownloadGenealogy = computed(() => !this.loading() && this.genealogyTree() !== null);
  readonly genealogyTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.genealogyTotal() / this.genealogyLimit())),
  );
  readonly genealogyPages = computed(() =>
    Array.from({ length: this.genealogyTotalPages() }, (_, index) => index + 1).slice(0, 5),
  );
  readonly genealogyStartIndex = computed(() =>
    this.genealogyTotal() === 0 ? 0 : (this.genealogyPage() - 1) * this.genealogyLimit() + 1,
  );
  readonly genealogyEndIndex = computed(() =>
    Math.min(this.genealogyTotal(), this.genealogyPage() * this.genealogyLimit()),
  );
  readonly flattenedGenealogy = computed(() => {
    const tree = this.genealogyTree();
    return tree ? flattenGenealogy(tree) : [];
  });

  readonly chartPoints = computed<ChartPoint[]>(() => {
    const data = this.activityData();

    if (data.length === 0) {
      return [];
    }

    const counts = data.map((point) => point.count);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const xSpan = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const ySpan = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const range = Math.max(1, max - min);

    return data.map((point, index) => ({
      ...point,
      x:
        CHART_PADDING.left +
        (data.length === 1 ? xSpan / 2 : (index / (data.length - 1)) * xSpan),
      y: CHART_PADDING.top + ((max - point.count) / range) * ySpan,
    }));
  });

  readonly linePoints = computed(() =>
    this.chartPoints()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );

  readonly yAxisTicks = computed(() => {
    const data = this.activityData();
    const max = Math.max(...data.map((point) => point.count), 1);
    const step = Math.max(1, Math.ceil(max / 6));
    const ticks: number[] = [];

    for (let value = 1; value <= max; value += step) {
      ticks.push(value);
    }

    if (!ticks.includes(max)) {
      ticks.push(max);
    }

    return ticks.map((value) => ({
      value,
      y: this.scaleY(value),
    }));
  });

  readonly xAxisLabels = computed(() => {
    const points = this.chartPoints();
    const each = Math.max(1, Math.ceil(points.length / 12));

    return points.filter(
      (_, index) => index > 0 && (index % each === 0 || index === points.length - 1),
    );
  });

  readonly stats = computed(() => {
    const data = this.activityData();

    if (data.length === 0) {
      return { max: 0, min: 0 };
    }

    const counts = data.map((point) => point.count);
    return {
      max: Math.max(...counts),
      min: Math.min(...counts),
    };
  });

  readonly filterLabel = computed(
    () => `Desde: ${this.formatDisplayDate(this.startDate())}    Hasta: ${this.formatDisplayDate(this.endDate())}`,
  );

  readonly tooltipTransform = computed(() => {
    const point = this.activePoint();

    if (!point) {
      return '';
    }

    const x = Math.min(Math.max(point.x - 120, 20), CHART_WIDTH - 280);
    const y = Math.max(point.y - 74, 12);

    return `translate(${x} ${y})`;
  });

  ngOnInit(): void {
    this.applyRouteFilters();

    if (this.route.snapshot.data['view'] === 'activity-chart') {
      this.view.set('activity-chart');
      this.loadActivityStats();
      return;
    }

    if (this.route.snapshot.data['view'] === 'genealogy-list') {
      this.view.set('genealogy-list');
      this.loadGenealogyList();
      return;
    }
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
    this.clearFeedback();
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
    this.clearFeedback();
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    this.clearFeedback();
  }

  reportIcon(report: VacunoReportCard): LucideIconData {
    return report.icon === 'table' ? this.tableIcon : this.chartIcon;
  }

  onSearch(): void {
    if (!this.validateFilters()) {
      return;
    }

    if (this.view() === 'activity-chart') {
      this.successMessage.set('');
      this.loadActivityStats();
      return;
    }

    if (this.view() === 'genealogy-list') {
      this.genealogyPage.set(1);
      this.loadGenealogyList();
    }
  }

  openReport(report: VacunoReportCard): void {
    if (!this.validateFilters(report.id === 'genealogico')) {
      return;
    }

    if (report.id === 'listado' || report.id === 'registro') {
      void this.router.navigate(['/vacunos/reportes/listado'], {
        queryParams: {
          fechaDesde: this.startDate(),
          fechaHasta: this.endDate(),
          q: this.searchTerm().trim(),
        },
      });
      return;
    }

    if (report.id === 'genealogico') {
      this.successMessage.set('');
      this.dataError.set('');
      this.downloadOpen.set(false);
      this.genealogyPage.set(1);
      this.view.set('genealogy-list');
      this.loadGenealogyList();
      return;
    }

    this.activePoint.set(null);
    this.downloadOpen.set(false);
    this.successMessage.set('');
    this.loadActivityStats();
    this.view.set('activity-chart');
  }

  goBack(): void {
    if (this.view() === 'genealogy-tree') {
      this.view.set('genealogy-list');
      this.genealogyTree.set(null);
      this.selectedVacuno.set(null);
      this.downloadOpen.set(false);
      this.successMessage.set('');
      return;
    }

    this.view.set('reports');
    this.activePoint.set(null);
    this.downloadOpen.set(false);
    void this.router.navigate(['/vacunos/reportes']);
  }

  toggleDownload(): void {
    if (this.view() === 'genealogy-tree') {
      if (!this.canDownloadGenealogy()) {
        this.dataError.set('No hay arbol genealogico disponible para descargar.');
        return;
      }

      this.downloadOpen.update((open) => !open);
      return;
    }

    if (!this.canDownload()) {
      this.dataError.set('No hay datos disponibles para descargar en el rango seleccionado.');
      return;
    }

    this.downloadOpen.update((open) => !open);
  }

  download(format: DownloadFormat): void {
    if (this.view() === 'genealogy-tree') {
      this.downloadGenealogy(format);
      return;
    }

    if (!this.validateFilters()) {
      return;
    }

    if (!this.canDownload()) {
      this.dataError.set('No hay datos disponibles para descargar en el rango seleccionado.');
      return;
    }

    const data = this.activityData();
    const filenameRange = `${this.startDate()}_${this.endDate()}`;
    const blob =
      format === 'xlsx'
        ? this.createXlsxBlob(data)
        : this.createPdfBlob(data);
    const extension = format === 'xlsx' ? 'xlsx' : 'pdf';

    this.triggerDownload(blob, `vacunos-en-actividad-${filenameRange}.${extension}`);
    this.downloadOpen.set(false);
    this.view.set('reports');
    this.successMessage.set('Descarga exitosa');
  }

  onChartMove(event: MouseEvent): void {
    const points = this.chartPoints();

    if (points.length === 0) {
      this.activePoint.set(null);
      return;
    }

    const svg = (event.currentTarget as SVGElement).ownerSVGElement;

    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const cursorX = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const nearest = points.reduce((selected, point) =>
      Math.abs(point.x - cursorX) < Math.abs(selected.x - cursorX) ? point : selected,
    );

    this.activePoint.set(nearest);
  }

  onPointEnter(point: ChartPoint): void {
    this.activePoint.set(point);
  }

  onChartLeave(): void {
    this.activePoint.set(null);
  }

  onGenealogyColumnFilter(key: keyof GenealogyColumnFilters, value: string): void {
    this.genealogyFilters.update((filters) => ({ ...filters, [key]: value }));
    this.genealogyPage.set(1);
    this.loadGenealogyList();
  }

  onGenealogyLimitChange(value: string): void {
    this.genealogyLimit.set(Number(value));
    this.genealogyPage.set(1);
    this.loadGenealogyList();
  }

  changeGenealogyPage(page: number): void {
    if (page < 1 || page > this.genealogyTotalPages() || page === this.genealogyPage()) {
      return;
    }

    this.genealogyPage.set(page);
    this.loadGenealogyList();
  }

  openGenealogy(row: VacunoListadoItem): void {
    this.selectedVacuno.set(row);
    this.genealogyTree.set(null);
    this.downloadOpen.set(false);
    this.successMessage.set('');
    this.view.set('genealogy-tree');
    this.loadGenealogyTree(row.codigo);
  }

  onGenerationLevelChange(value: string): void {
    const level = Math.max(1, Math.min(4, Number(value) || 1));
    this.selectedGenerationLevel.set(level);

    const selected = this.selectedVacuno();
    if (selected) {
      this.loadGenealogyTree(selected.codigo);
    }
  }

  genealogyParents(node: VacunoGenealogiaDto): VacunoGenealogiaDto[] {
    return [node.padre, node.madre].filter((parent): parent is VacunoGenealogiaDto => parent !== null);
  }

  goToVacunoReport(node: VacunoGenealogiaDto): void {
    void this.router.navigate(['/vacunos/reportes/registro', node.id]);
  }

  estadoLabel(value: string): string {
    const normalized = value.toLowerCase();
    return normalized === 'muerto' || normalized === 'inactivo' ? 'MUERTO' : 'VIVO';
  }

  estadoClass(value: string): string {
    return this.estadoLabel(value) === 'MUERTO' ? 'dead' : 'alive';
  }

  formatDisplayDate(value: string): string {
    const normalized = value.includes('T') ? value.slice(0, 10) : value;
    const [year, month, day] = normalized.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private validateFilters(requireKeyword = false): boolean {
    const start = parseInputDate(this.startDate());
    const end = parseInputDate(this.endDate());

    if (!start || !end) {
      this.filterError.set('Debe seleccionar fecha inicio y fecha fin para generar el reporte.');
      return false;
    }

    if (start > end) {
      this.filterError.set('La fecha inicio no puede ser mayor que la fecha fin.');
      return false;
    }

    if (daysBetweenInclusive(start, end) > ACTIVITY_REPORT_REQUIREMENTS.maximoDiasRango) {
      this.filterError.set(
        `El rango de fechas no puede superar ${ACTIVITY_REPORT_REQUIREMENTS.maximoDiasRango} dias.`,
      );
      return false;
    }

    if (requireKeyword && !this.searchTerm().trim()) {
      this.filterError.set('Debe ingresar codigo o nombre del vacuno para generar el reporte genealogico.');
      return false;
    }

    this.filterError.set('');
    return true;
  }

  private loadActivityStats(): void {
    if (!this.validateFilters()) {
      return;
    }

    this.loading.set(true);
    this.dataError.set('');
    this.activePoint.set(null);

    this.facade.getActivityStats(this.startDate(), this.endDate()).subscribe({
      next: (response) => {
        this.activityData.set(
          response.points.map((point) => ({
            date: point.fecha,
            count: point.cantidad,
          })),
        );
        this.loading.set(false);
      },
      error: (error) => {
        this.activityData.set([]);
        this.dataError.set(
          error?.error?.message ?? 'No se pudieron cargar los datos estadísticos del reporte.',
        );
        this.loading.set(false);
      },
    });
  }

  private loadGenealogyList(): void {
    if (!this.validateFilters(true)) {
      return;
    }

    const filters = this.genealogyFilters();
    this.loading.set(true);
    this.dataError.set('');

    this.reporteFacade
      .listar({
        fechaDesde: this.startDate(),
        fechaHasta: this.endDate(),
        q: this.searchTerm().trim(),
        codigo: filters.codigo.trim(),
        fechaRegistro: filters.fechaRegistro.trim(),
        nombre: filters.nombre.trim(),
        raza: filters.raza.trim(),
        procedencia: filters.procedencia.trim(),
        estado: filters.estado.trim(),
        page: this.genealogyPage(),
        limit: this.genealogyLimit(),
        formato: 'json',
      })
      .subscribe({
        next: (response) => {
          this.genealogyRows.set(response.data ?? []);
          this.genealogyTotal.set(response.resumen?.totalVacunos ?? response.data?.length ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loadGenealogyListFallback();
        },
      });
  }

  private loadGenealogyListFallback(): void {
    const filters = this.genealogyFilters();

    this.facade
      .listarVacunos({
        page: 1,
        limit: 100,
        q: this.searchTerm().trim(),
      })
      .subscribe({
        next: (response) => {
          const filtered = response.items
            .map((vacuno, index) => this.toGenealogyListRow(vacuno, index))
            .filter((row) => this.matchesGenealogyDateRange(row))
            .filter((row) => containsNormalized(row.codigo, filters.codigo))
            .filter((row) => containsNormalized(row.fechaRegistro, filters.fechaRegistro))
            .filter((row) => containsNormalized(row.nombre, filters.nombre))
            .filter((row) => containsNormalized(row.raza ?? '', filters.raza))
            .filter((row) => containsNormalized(row.procedencia ?? '', filters.procedencia))
            .filter((row) => !filters.estado || this.estadoLabel(row.estado) === filters.estado.toUpperCase());
          const offset = (this.genealogyPage() - 1) * this.genealogyLimit();

          this.genealogyRows.set(filtered.slice(offset, offset + this.genealogyLimit()));
          this.genealogyTotal.set(filtered.length);
          this.loading.set(false);
        },
        error: (error) => {
          this.genealogyRows.set([]);
          this.genealogyTotal.set(0);
          this.dataError.set(
            error?.error?.message ?? 'No se pudo cargar el listado para el reporte genealogico.',
          );
          this.loading.set(false);
        },
      });
  }

  private toGenealogyListRow(vacuno: Vacuno, index: number): VacunoListadoItem {
    return {
      id: vacuno.id ?? index + 1,
      codigo: vacuno.codigo,
      fechaRegistro:
        vacuno.fechaRegistroFuncion ??
        vacuno.fechaRegistroEspecializacion ??
        (vacuno.fechaRegistro instanceof Date ? toInputDate(vacuno.fechaRegistro) : ''),
      nombre: vacuno.nombre,
      raza: vacuno.raza,
      procedencia:
        vacuno.procedencia ??
        [vacuno.granja, vacuno.distrito, vacuno.provincia, vacuno.departamento]
          .filter(Boolean)
          .join(', '),
      estado: this.estadoLabel(vacuno.estado) === 'MUERTO' ? 'muerto' : 'vivo',
    };
  }

  private matchesGenealogyDateRange(row: VacunoListadoItem): boolean {
    const registro = parseInputDate(row.fechaRegistro);
    const start = parseInputDate(this.startDate());
    const end = parseInputDate(this.endDate());

    if (!registro || !start || !end) {
      return true;
    }

    return registro >= start && registro <= end;
  }

  private loadGenealogyTree(codigo: string): void {
    this.loading.set(true);
    this.dataError.set('');

    this.facade.getGenealogia(codigo, this.selectedGenerationLevel()).subscribe({
      next: (tree) => {
        this.genealogyTree.set(tree);
        this.loading.set(false);
      },
      error: (error) => {
        this.genealogyTree.set(null);
        this.dataError.set(
          error?.error?.message ?? 'No se pudo cargar el arbol genealogico del vacuno seleccionado.',
        );
        this.loading.set(false);
      },
    });
  }

  private downloadGenealogy(format: DownloadFormat): void {
    const tree = this.genealogyTree();

    if (!tree) {
      this.dataError.set('No hay arbol genealogico disponible para descargar.');
      return;
    }

    const filename = `grafico-genealogico-${tree.codigo}-nivel-${this.selectedGenerationLevel()}`;
    const blob =
      format === 'xlsx'
        ? this.createGenealogyXlsxBlob(tree)
        : this.createGenealogyPdfBlob(tree);
    const extension = format === 'xlsx' ? 'xlsx' : 'pdf';

    this.triggerDownload(blob, `${filename}.${extension}`);
    this.downloadOpen.set(false);
    this.successMessage.set('Descarga exitosa');
  }

  private clearFeedback(): void {
    this.filterError.set('');
    this.successMessage.set('');
  }

  private applyRouteFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const fechaDesde = params.get('fechaDesde');
    const fechaHasta = params.get('fechaHasta');
    const q = params.get('q');

    if (isInputDate(fechaDesde)) {
      this.startDate.set(fechaDesde);
    }

    if (isInputDate(fechaHasta)) {
      this.endDate.set(fechaHasta);
    }

    if (q) {
      this.searchTerm.set(q);
    }
  }

  private scaleY(value: number): number {
    const data = this.activityData();
    const counts = data.map((point) => point.count);
    const min = Math.min(...counts, 1);
    const max = Math.max(...counts, 1);
    const range = Math.max(1, max - min);
    const ySpan = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

    return CHART_PADDING.top + ((max - value) / range) * ySpan;
  }

  private createXlsxBlob(data: ActivityPoint[]): Blob {
    const rows: Array<Array<string | number>> = [
      ['Reporte', 'Gráfico de vacunos en actividad'],
      ['Fecha inicio', this.formatDisplayDate(this.startDate())],
      ['Fecha fin', this.formatDisplayDate(this.endDate())],
      [],
      ['Fecha', 'Vacunos en actividad'],
      ...data.map((point) => [this.formatDisplayDate(point.date), point.count]),
      [],
      ['Mayor número de vacunos en actividad', String(this.stats().max)],
      ['Menor número de vacunos en actividad', String(this.stats().min)],
    ];
    const dataStartRow = 6;
    const dataEndRow = dataStartRow + data.length - 1;
    const sheetName = 'Vacunos en actividad';

    const sheetRows = rows
      .map((row, rowIndex) => {
        const cells = row
          .map((cell, columnIndex) => createXlsxCell(cell, columnIndex, rowIndex))
          .join('');

        return `<row r="${rowIndex + 1}">${cells}</row>`;
      })
      .join('');

    const files = [
      {
        name: '[Content_Types].xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' +
          '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>' +
          '</Types>',
      },
      {
        name: '_rels/.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>',
      },
      {
        name: 'xl/workbook.xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          `<sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets>` +
          '</workbook>',
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '</Relationships>',
      },
      {
        name: 'xl/worksheets/sheet1.xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<cols><col min="1" max="1" width="18" customWidth="1"/><col min="2" max="2" width="24" customWidth="1"/></cols>' +
          '<sheetData>' +
          sheetRows +
          '</sheetData><drawing r:id="rId1"/></worksheet>',
      },
      {
        name: 'xl/worksheets/_rels/sheet1.xml.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>' +
          '</Relationships>',
      },
      {
        name: 'xl/drawings/drawing1.xml',
        content: createXlsxDrawingXml(),
      },
      {
        name: 'xl/drawings/_rels/drawing1.xml.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>' +
          '</Relationships>',
      },
      {
        name: 'xl/charts/chart1.xml',
        content: createXlsxLineChartXml(sheetName, dataStartRow, dataEndRow),
      },
    ];

    const zip = createZip(files);
    const zipBuffer = new ArrayBuffer(zip.byteLength);
    new Uint8Array(zipBuffer).set(zip);

    return new Blob([zipBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private createPdfBlob(data: ActivityPoint[]): Blob {
    const pageWidth = 842;
    const pageHeight = 595;
    const chart = {
      x: 58,
      y: 176,
      width: 720,
      height: 300,
      plotX: 96,
      plotY: 218,
      plotWidth: 638,
      plotHeight: 210,
    };
    const maxCount = Math.max(...data.map((point) => point.count), 1);
    const tickStep = Math.max(1, Math.ceil(maxCount / 6));
    const yTicks: number[] = [];

    for (let tick = 0; tick <= maxCount; tick += tickStep) {
      yTicks.push(tick);
    }

    if (!yTicks.includes(maxCount)) {
      yTicks.push(maxCount);
    }

    const points = data.map((point, index) => {
      const x =
        chart.plotX +
        (data.length === 1 ? chart.plotWidth / 2 : (index / (data.length - 1)) * chart.plotWidth);
      const y = chart.plotY + (point.count / maxCount) * chart.plotHeight;

      return { ...point, x, y };
    });
    const labelEvery = Math.max(1, Math.ceil(data.length / 7));
    const tableRows = data.slice(-9);

    const content = [
      'q',
      '0.631 0.173 0.392 rg',
      `0 ${pageHeight - 44} ${pageWidth} 44 re f`,
      'Q',
      pdfText('Reporte de vacunos en actividad', 44, 566, 16, 'F2', '1 1 1'),
      pdfText(
        `Fecha inicio: ${this.formatDisplayDate(this.startDate())}    Fecha fin: ${this.formatDisplayDate(this.endDate())}`,
        44,
        540,
        10,
        'F1',
        '0.976 0.976 0.976',
      ),
      pdfText('Gráfico de actividad', 58, 500, 13, 'F2', '0.12 0.16 0.22'),
      pdfRect(chart.x, chart.y, chart.width, chart.height, '0.972 0.980 0.988', '0.80 0.84 0.89'),
      ...yTicks.flatMap((tick) => {
        const y = chart.plotY + (tick / maxCount) * chart.plotHeight;
        return [
          pdfLine(chart.plotX, y, chart.plotX + chart.plotWidth, y, '0.89 0.92 0.96', 0.6),
          pdfText(String(tick).padStart(2, '0'), chart.plotX - 28, y - 3, 8, 'F1', '0.30 0.36 0.44'),
        ];
      }),
      pdfLine(chart.plotX, chart.plotY, chart.plotX, chart.plotY + chart.plotHeight, '0.45 0.51 0.60', 1.2),
      pdfLine(chart.plotX, chart.plotY, chart.plotX + chart.plotWidth, chart.plotY, '0.45 0.51 0.60', 1.2),
      pdfPolyline(points, '0.047 0.459 0.157', 2),
      ...points.map((point) => pdfCircle(point.x, point.y, 3.2, '0.047 0.459 0.157', '1 1 1')),
      ...points
        .filter((_, index) => index % labelEvery === 0 || index === points.length - 1)
        .flatMap((point) => [
          pdfLine(point.x, chart.plotY, point.x, chart.plotY - 4, '0.45 0.51 0.60', 0.7),
          pdfText(this.formatDisplayDate(point.date), point.x - 18, chart.plotY - 18, 7, 'F1', '0.30 0.36 0.44'),
        ]),
      pdfText('Cantidad', chart.plotX - 38, chart.plotY + chart.plotHeight + 16, 8, 'F1', '0.30 0.36 0.44'),
      pdfText('Fechas', chart.plotX + chart.plotWidth - 20, chart.plotY - 34, 8, 'F1', '0.30 0.36 0.44'),
      pdfRect(58, 106, 190, 46, '1 1 1', '0.75 0.80 0.86'),
      pdfText('Leyenda', 125, 134, 10, 'F2', '0.12 0.16 0.22'),
      pdfText('Cantidad de vacunos en actividad', 72, 116, 8, 'F1', '0.047 0.459 0.157'),
      pdfLine(204, 119, 232, 119, '0.047 0.459 0.157', 4),
      pdfRect(280, 106, 250, 46, '1 1 1', '0.75 0.80 0.86'),
      pdfText(`Mayor número de vacunos en actividad: ${this.stats().max}`, 294, 134, 10, 'F2', '0.631 0.173 0.392'),
      pdfText(`Menor número de vacunos en actividad: ${this.stats().min}`, 294, 116, 10, 'F2', '0.631 0.173 0.392'),
      pdfRect(552, 86, 226, 80, '1 1 1', '0.75 0.80 0.86'),
      pdfText('Ultimos registros', 566, 146, 10, 'F2', '0.12 0.16 0.22'),
      pdfText('Fecha', 566, 128, 8, 'F2', '0.30 0.36 0.44'),
      pdfText('Vacunos', 680, 128, 8, 'F2', '0.30 0.36 0.44'),
      ...tableRows.flatMap((point, index) => {
        const y = 112 - index * 10;
        return [
          pdfText(this.formatDisplayDate(point.date), 566, y, 7, 'F1', '0.12 0.16 0.22'),
          pdfText(String(point.count), 696, y, 7, 'F1', '0.12 0.16 0.22'),
        ];
      }),
      pdfText(`Total de puntos graficados: ${data.length}`, 58, 74, 8, 'F1', '0.30 0.36 0.44'),
      pdfText('ZooTech - Módulo Vacunos', 672, 46, 8, 'F1', '0.30 0.36 0.44'),
    ].join('\n');
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf +=
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
      `startxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  private createGenealogyXlsxBlob(tree: VacunoGenealogiaDto): Blob {
    const rows: Array<Array<string | number>> = [
      ['Reporte', 'Grafico genealogico por vacuno'],
      ['Vacuno', `${tree.codigo} - ${tree.nombre}`],
      ['Nivel de generacion', this.selectedGenerationLevel()],
      ['Fecha inicio', this.formatDisplayDate(this.startDate())],
      ['Fecha fin', this.formatDisplayDate(this.endDate())],
      [],
      ['Nivel', 'Relacion', 'Codigo', 'Nombre', 'Raza', 'Sexo'],
      ...this.flattenedGenealogy().map((item) => [
        item.level,
        item.relation,
        item.node.codigo,
        item.node.nombre,
        item.node.raza,
        item.node.sexo,
      ]),
    ];
    const sheetRows = rows
      .map((row, rowIndex) => {
        const cells = row
          .map((cell, columnIndex) => createXlsxCell(cell, columnIndex, rowIndex))
          .join('');

        return `<row r="${rowIndex + 1}">${cells}</row>`;
      })
      .join('');
    const files = [
      {
        name: '[Content_Types].xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '</Types>',
      },
      {
        name: '_rels/.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>',
      },
      {
        name: 'xl/workbook.xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets><sheet name="Grafico genealogico" sheetId="1" r:id="rId1"/></sheets>' +
          '</workbook>',
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '</Relationships>',
      },
      {
        name: 'xl/worksheets/sheet1.xml',
        content:
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
          '<cols><col min="1" max="6" width="24" customWidth="1"/></cols>' +
          `<sheetData>${sheetRows}</sheetData></worksheet>`,
      },
    ];

    const zip = createZip(files);
    const zipBuffer = new ArrayBuffer(zip.byteLength);
    new Uint8Array(zipBuffer).set(zip);

    return new Blob([zipBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private createGenealogyPdfBlob(tree: VacunoGenealogiaDto): Blob {
    const pageWidth = 842;
    const pageHeight = 595;
    const nodes = this.flattenedGenealogy();
    const levels = new Map<number, GenealogyFlatNode[]>();

    nodes.forEach((item) => {
      const levelNodes = levels.get(item.level) ?? [];
      levelNodes.push(item);
      levels.set(item.level, levelNodes);
    });

    const maxLevel = Math.max(...nodes.map((item) => item.level), 1);
    const plot = { x: 54, y: 112, width: 734, height: 360 };
    const positions = new Map<string, { x: number; y: number }>();

    Array.from(levels.entries()).forEach(([level, levelNodes]) => {
      const rowY =
        plot.y +
        plot.height -
        (maxLevel === 1 ? plot.height / 2 : ((level - 1) / (maxLevel - 1)) * plot.height);

      levelNodes.forEach((item, index) => {
        positions.set(item.key, {
          x: plot.x + ((index + 1) / (levelNodes.length + 1)) * plot.width,
          y: rowY,
        });
      });
    });

    const box = { width: 98, height: 34 };
    const lines = nodes
      .filter((item) => item.parentKey)
      .map((item) => {
        const from = positions.get(item.parentKey as string);
        const to = positions.get(item.key);

        return from && to
          ? pdfLine(from.x, from.y - box.height / 2, to.x, to.y + box.height / 2, '0.82 0.38 0.62', 1.2)
          : '';
      });
    const boxes = nodes.flatMap((item) => {
      const position = positions.get(item.key);

      if (!position) {
        return [];
      }

      return [
        pdfRect(
          position.x - box.width / 2,
          position.y - box.height / 2,
          box.width,
          box.height,
          '1 0.965 0.98',
          '0.82 0.38 0.62',
        ),
        pdfText(item.node.codigo, position.x - 30, position.y + 4, 9, 'F2', '0.28 0.10 0.20'),
        pdfText(truncatePdfText(item.node.nombre, 16), position.x - 35, position.y - 9, 7, 'F1', '0.33 0.38 0.45'),
      ];
    });
    const content = [
      'q',
      '0.631 0.173 0.392 rg',
      `0 ${pageHeight - 44} ${pageWidth} 44 re f`,
      'Q',
      pdfText('Reporte genealogico por vacuno', 44, 566, 16, 'F2', '1 1 1'),
      pdfText(`${tree.codigo} - ${tree.nombre}`, 44, 540, 10, 'F1', '0.976 0.976 0.976'),
      pdfText(
        `Fecha inicio: ${this.formatDisplayDate(this.startDate())}    Fecha fin: ${this.formatDisplayDate(this.endDate())}    Nivel: ${this.selectedGenerationLevel()}`,
        44,
        518,
        9,
        'F1',
        '0.30 0.36 0.44',
      ),
      pdfRect(plot.x, plot.y, plot.width, plot.height, '1 1 1', '0.80 0.84 0.89'),
      pdfText('Mi arbol genealogico', 360, 486, 12, 'F2', '0.631 0.173 0.392'),
      ...lines,
      ...boxes,
      pdfText('Detalle de nodos', 54, 86, 10, 'F2', '0.12 0.16 0.22'),
      ...nodes.slice(0, 8).map((item, index) =>
        pdfText(
          `${item.relation}: ${item.node.codigo} - ${item.node.nombre} / ${item.node.raza}`,
          54,
          68 - index * 10,
          7,
          'F1',
          '0.30 0.36 0.44',
        ),
      ),
      pdfText('ZooTech - Modulo Vacunos', 672, 46, 8, 'F1', '0.30 0.36 0.44'),
    ].join('\n');
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf +=
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
      `startxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
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

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function isInputDate(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function daysBetweenInclusive(start: Date, end: Date): number {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.floor((endUtc - startUtc) / 86_400_000) + 1;
}

function flattenGenealogy(
  node: VacunoGenealogiaDto,
  level = 1,
  relation = 'Vacuno',
  key = 'root',
  parentKey: string | null = null,
): GenealogyFlatNode[] {
  const current: GenealogyFlatNode = { node, level, relation, key, parentKey };
  const parents: GenealogyFlatNode[] = [];

  if (node.padre) {
    parents.push(...flattenGenealogy(node.padre, level + 1, 'Padre', `${key}.padre`, key));
  }

  if (node.madre) {
    parents.push(...flattenGenealogy(node.madre, level + 1, 'Madre', `${key}.madre`, key));
  }

  return [current, ...parents];
}

function containsNormalized(value: string, filter: string): boolean {
  const term = filter.trim().toLowerCase();
  return !term || value.toLowerCase().includes(term);
}

function columnName(index: number): string {
  let name = '';
  let current = index;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }

  return name;
}

function createXlsxCell(value: string | number, columnIndex: number, rowIndex: number): string {
  const ref = `${columnName(columnIndex + 1)}${rowIndex + 1}`;

  if (typeof value === 'number') {
    return `<c r="${ref}"><v>${value}</v></c>`;
  }

  return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
}

function createXlsxDrawingXml(): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
    '<xdr:twoCellAnchor editAs="oneCell">' +
    '<xdr:from><xdr:col>3</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>1</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>' +
    '<xdr:to><xdr:col>12</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>22</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>' +
    '<xdr:graphicFrame macro="">' +
    '<xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Gráfico de vacunos en actividad"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>' +
    '<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>' +
    '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">' +
    '<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/>' +
    '</a:graphicData></a:graphic>' +
    '</xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>'
  );
}

function createXlsxLineChartXml(sheetName: string, dataStartRow: number, dataEndRow: number): string {
  const quotedSheetName = `'${sheetName.replace(/'/g, "''")}'`;
  const categoryRange = `${quotedSheetName}!$A$${dataStartRow}:$A$${dataEndRow}`;
  const valueRange = `${quotedSheetName}!$B$${dataStartRow}:$B$${dataEndRow}`;

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<c:lang val="es-PE"/><c:chart>' +
    '<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="es-PE" sz="1200" b="1"/><a:t>Gráfico de vacunos en actividad</a:t></a:r></a:p></c:rich></c:tx><c:layout/></c:title>' +
    '<c:plotArea><c:layout/><c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>' +
    '<c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:v>Vacunos en actividad</c:v></c:tx>' +
    '<c:spPr><a:ln w="25400"><a:solidFill><a:srgbClr val="0B7A2A"/></a:solidFill></a:ln></c:spPr>' +
    '<c:marker><c:symbol val="circle"/><c:size val="5"/></c:marker>' +
    `<c:cat><c:strRef><c:f>${xmlEscape(categoryRange)}</c:f></c:strRef></c:cat>` +
    `<c:val><c:numRef><c:f>${xmlEscape(valueRange)}</c:f></c:numRef></c:val>` +
    '</c:ser><c:marker val="1"/><c:smooth val="0"/><c:axId val="1001"/><c:axId val="1002"/></c:lineChart>' +
    '<c:catAx><c:axId val="1001"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:tickLblPos val="nextTo"/><c:crossAx val="1002"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/></c:catAx>' +
    '<c:valAx><c:axId val="1002"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorGridlines/><c:numFmt formatCode="0" sourceLinked="0"/><c:tickLblPos val="nextTo"/><c:crossAx val="1001"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>' +
    '</c:plotArea><c:legend><c:legendPos val="b"/><c:layout/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>'
  );
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pdfText(
  value: string,
  x: number,
  y: number,
  size: number,
  font = 'F1',
  color = '0 0 0',
): string {
  return [
    'BT',
    `${color} rg`,
    `/${font} ${formatPdfNumber(size)} Tf`,
    `${formatPdfNumber(x)} ${formatPdfNumber(y)} Td`,
    `(${pdfEscape(value)}) Tj`,
    'ET',
  ].join('\n');
}

function pdfRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string,
  strokeColor: string,
): string {
  return [
    'q',
    `${fillColor} rg`,
    `${formatPdfNumber(x)} ${formatPdfNumber(y)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re f`,
    `${strokeColor} RG`,
    '0.8 w',
    `${formatPdfNumber(x)} ${formatPdfNumber(y)} ${formatPdfNumber(width)} ${formatPdfNumber(height)} re S`,
    'Q',
  ].join('\n');
}

function pdfLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
): string {
  return [
    'q',
    `${color} RG`,
    `${formatPdfNumber(width)} w`,
    `${formatPdfNumber(x1)} ${formatPdfNumber(y1)} m`,
    `${formatPdfNumber(x2)} ${formatPdfNumber(y2)} l`,
    'S',
    'Q',
  ].join('\n');
}

function pdfPolyline(
  points: Array<{ x: number; y: number }>,
  color: string,
  width: number,
): string {
  if (points.length === 0) {
    return '';
  }

  const [first, ...rest] = points;

  return [
    'q',
    `${color} RG`,
    `${formatPdfNumber(width)} w`,
    '1 J 1 j',
    `${formatPdfNumber(first.x)} ${formatPdfNumber(first.y)} m`,
    ...rest.map((point) => `${formatPdfNumber(point.x)} ${formatPdfNumber(point.y)} l`),
    'S',
    'Q',
  ].join('\n');
}

function pdfCircle(
  x: number,
  y: number,
  radius: number,
  fillColor: string,
  strokeColor: string,
): string {
  const c = radius * 0.5522847498;
  const left = x - radius;
  const right = x + radius;
  const top = y + radius;
  const bottom = y - radius;

  return [
    'q',
    `${fillColor} rg`,
    `${strokeColor} RG`,
    '0.8 w',
    `${formatPdfNumber(x)} ${formatPdfNumber(top)} m`,
    `${formatPdfNumber(x + c)} ${formatPdfNumber(top)} ${formatPdfNumber(right)} ${formatPdfNumber(y + c)} ${formatPdfNumber(right)} ${formatPdfNumber(y)} c`,
    `${formatPdfNumber(right)} ${formatPdfNumber(y - c)} ${formatPdfNumber(x + c)} ${formatPdfNumber(bottom)} ${formatPdfNumber(x)} ${formatPdfNumber(bottom)} c`,
    `${formatPdfNumber(x - c)} ${formatPdfNumber(bottom)} ${formatPdfNumber(left)} ${formatPdfNumber(y - c)} ${formatPdfNumber(left)} ${formatPdfNumber(y)} c`,
    `${formatPdfNumber(left)} ${formatPdfNumber(y + c)} ${formatPdfNumber(x - c)} ${formatPdfNumber(top)} ${formatPdfNumber(x)} ${formatPdfNumber(top)} c`,
    'B',
    'Q',
  ].join('\n');
}

function formatPdfNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function truncatePdfText(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function createZip(files: { name: string; content: string }[]): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0x0021, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    localHeader.set(name, 30);
    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0x0021, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + data.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return concatUint8([...localParts, ...centralParts, end]);
}

function concatUint8(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  data.forEach((byte) => {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  });

  return (crc ^ 0xffffffff) >>> 0;
}
