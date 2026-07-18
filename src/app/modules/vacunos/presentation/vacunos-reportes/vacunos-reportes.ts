import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CalendarDays,
  ChartLine,
  ChevronDown,
  Download,
  FileText,
  LucideAngularModule,
  Reply,
  Search,
  Table2,
  type LucideIconData,
} from 'lucide-angular';
import { switchMap } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { TranslatePipe } from '@ngx-translate/core';
import { VACUNO_REQUIREMENTS_CONFIG } from '../../config/vacuno-requirements.config';
import { VacunoGenealogiaDto } from '../../infrastructure/dtos/vacunos.dtos';
import { VacunoListadoItem } from '../../domain/models/reporte-vacuno.model';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunosFacade } from '../../application/facades/vacunos.facade';

type ReportView = 'reports' | 'activity-chart' | 'genealogy-list' | 'genealogy-tree';
type ReportId = 'listado' | 'genealogico' | 'registro' | 'actividad';
type DownloadFormat = 'xlsx' | 'pdf';

interface VacunoReportCard {
  id: ReportId;
  title: string;
  description: string;
  icon: 'table' | 'chart' | 'record';
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
  imports: [LucideAngularModule, NgTemplateOutlet, PageHeaderComponent, TranslatePipe],
  templateUrl: './vacunos-reportes.html',
  styleUrl: './vacunos-reportes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosReportes implements OnInit {
  private readonly facade = inject(VacunosFacade);
  private readonly reporteFacade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private suggestionRequestId = 0;

  readonly calendarIcon = CalendarDays;
  readonly chartIcon = ChartLine;
  readonly chevronDownIcon = ChevronDown;
  readonly downloadIcon = Download;
  readonly recordIcon = FileText;
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
      icon: 'record',
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
  readonly searchSuggestions = signal<VacunoListadoItem[]>([]);
  readonly suggestionsOpen = signal(false);
  readonly suggestionsLoading = signal(false);
  readonly searchFocused = signal(false);
  readonly loading = signal(false);
  readonly exportingPdf = signal(false);
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
  readonly selectedSearchVacuno = signal<VacunoListadoItem | null>(null);
  
  readonly visibleGenealogyTree = computed(() => {
    const fullTree = this.genealogyTree();
    const maxLevel = this.selectedGenerationLevel();

    if (!fullTree) return null;

    const filterTree = (node: VacunoGenealogiaDto | null): VacunoGenealogiaDto | null => {
      if (!node || node.nivel > maxLevel) return null;
      
      return {
        ...node,
        padre: filterTree(node.padre),
        madre: filterTree(node.madre),
      };
    };

    return filterTree(fullTree);
  });

  readonly availableGenerationOptions = computed(() => {
    const tree = this.genealogyTree();
    if (!tree) return [1, 2, 3, 4];

    const getMaxLevel = (node: VacunoGenealogiaDto | null): number => {
      if (!node) return 0;
      return Math.max(
        node.nivel,
        getMaxLevel(node.padre),
        getMaxLevel(node.madre)
      );
    };

    const maxLevel = Math.min(4, Math.max(1, getMaxLevel(tree)));
    return Array.from({ length: maxLevel }, (_, i) => i + 1);
  });

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
    this.selectedSearchVacuno.set(null);
    this.clearFeedback();

    if (this.view() === 'reports') {
      this.loadSearchSuggestions(value);
    }
  }

  onSearchFocus(): void {
    this.searchFocused.set(true);

    if (this.searchSuggestions().length > 0 || this.suggestionsLoading()) {
      this.suggestionsOpen.set(true);
    }
  }

  closeSuggestions(): void {
    this.searchFocused.set(false);
    this.suggestionsOpen.set(false);
  }

  selectSuggestion(suggestion: VacunoListadoItem): void {
    this.selectedSearchVacuno.set(suggestion);
    this.searchTerm.set(suggestion.codigo);
    this.searchSuggestions.set([suggestion]);
    this.suggestionsOpen.set(false);
    this.filterError.set('');
  }

  reportIcon(report: VacunoReportCard): LucideIconData {
    if (report.icon === 'record') {
      return this.recordIcon;
    }

    return report.icon === 'table' ? this.tableIcon : this.chartIcon;
  }

  onSearch(): void {
    if (this.view() === 'genealogy-list') {
      this.genealogyPage.set(1);
      this.openGenealogyReport();
      return;
    }

    if (!this.validateFilters()) {
      return;
    }

    if (this.view() === 'activity-chart') {
      this.successMessage.set('');
      this.loadActivityStats();
      return;
    }

    if (this.view() === 'genealogy-list') {
      const term = this.searchTerm().trim();
      if (term) {
        // Búsqueda directa por código ignorando la lista paginada
        this.loadGenealogyTree(term);
      } else {
        this.genealogyPage.set(1);
        this.loadGenealogyList();
      }
    }
  }

  openReport(report: VacunoReportCard): void {
    if (report.id === 'genealogico') {
      this.openGenealogyReport();
      return;
    }

    if (!this.validateFilters()) {
      return;
    }

    if (report.id === 'listado') {
      void this.router.navigate(['/vacunos/reportes/listado'], {
        queryParams: {
          fechaDesde: this.startDate(),
          fechaHasta: this.endDate(),
          search: this.searchTerm().trim(),
        },
      });
      return;
    }

    if (report.id === 'registro') {
      void this.router.navigate(['/vacunos/reportes/registro'], {
        queryParams: {
          fechaDesde: this.startDate(),
          fechaHasta: this.endDate(),
          search: this.searchTerm().trim(),
        },
      });
      return;
    }

    this.activePoint.set(null);
    this.downloadOpen.set(false);
    this.successMessage.set('');
    this.loadActivityStats();
    this.view.set('activity-chart');
  }

  private openGenealogyReport(): void {
    const term = this.searchTerm().trim();

    if (!term) {
      this.filterError.set('Debe ingresar o seleccionar un vacuno vivo para generar el reporte genealogico.');
      this.suggestionsOpen.set(false);
      return;
    }

    const selected = this.selectedSearchVacuno();
    if (selected && this.matchesSearchSelection(selected, term)) {
      this.showGenealogyCandidate(selected);
      return;
    }

    this.loading.set(true);
    this.filterError.set('');
    this.dataError.set('');
    this.successMessage.set('');
    this.downloadOpen.set(false);

    this.reporteFacade
      .listar({
        search: term,
        estado: 'vivo',
        formato: 'json',
        page: 1,
        pageSize: 8,
      })
      .subscribe({
        next: (response) => {
          const rows = (response.data ?? []).map((row) => this.normalizeGenealogyRow(row));
          const exact = rows.find((row) => row.codigo.toLowerCase() === term.toLowerCase());
          const candidate = exact ?? (rows.length === 1 ? rows[0] : null);

          this.loading.set(false);

          if (!candidate) {
            this.searchSuggestions.set(rows.slice(0, 6));
            this.suggestionsOpen.set(rows.length > 0);
            this.filterError.set(
              rows.length > 1
                ? 'Seleccione un vacuno vivo de las sugerencias para generar el reporte genealogico.'
                : 'No se encontro un vacuno vivo con ese codigo o nombre.',
            );
            return;
          }

          this.showGenealogyCandidate(candidate);
        },
        error: (error) => {
          this.loading.set(false);
          this.genealogyRows.set([]);
          this.genealogyTotal.set(0);
          this.filterError.set(
            error?.error?.message ?? 'No se pudo buscar el vacuno para el reporte genealogico.',
          );
        },
      });
  }

  private showGenealogyCandidate(candidate: VacunoListadoItem): void {
    const normalized = this.normalizeGenealogyRow(candidate);

    if (this.estadoLabel(normalized.estado) !== 'VIVO') {
      this.filterError.set('Solo se puede generar el reporte genealogico para vacunos vivos.');
      return;
    }

    this.selectedSearchVacuno.set(normalized);
    this.selectedVacuno.set(null);
    this.searchTerm.set(normalized.codigo);
    this.searchSuggestions.set([normalized]);
    this.suggestionsOpen.set(false);
    this.genealogyFilters.set({
      codigo: '',
      fechaRegistro: '',
      nombre: '',
      raza: '',
      procedencia: '',
      estado: '',
    });
    this.genealogyPage.set(1);
    this.genealogyRows.set([normalized]);
    this.genealogyTotal.set(1);
    this.genealogyTree.set(null);
    this.filterError.set('');
    this.dataError.set('');
    this.downloadOpen.set(false);
    this.view.set('genealogy-list');
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

  async download(format: DownloadFormat): Promise<void> {
    if (this.view() === 'genealogy-tree') {
      await this.downloadGenealogy(format);
      return;
    }

    if (!this.validateFilters()) {
      return;
    }

    if (!this.canDownload()) {
      this.dataError.set('No hay datos disponibles para descargar en el rango seleccionado.');
      return;
    }

    if (format === 'pdf') {
      await this.exportarAPDF();
    } else {
      console.log(`Descarga de reporte general en formato ${format} pendiente de implementación en backend`);
    }

    this.downloadOpen.set(false);
  }

  private async downloadGenealogy(format: DownloadFormat): Promise<void> {
    this.downloadOpen.set(false);
    // Ceder el hilo para que Angular ejecute Change Detection y destruya el dropdown del DOM
    await Promise.resolve();

    if (format === 'pdf') {
      await this.exportarAPDF();
    } else {
      // Excel se delega al backend
      const tree = this.genealogyTree();
      if (tree) {
        this.facade.exportarArbolExcel(tree.id, this.selectedGenerationLevel()).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'reporte-genealogia.xlsx';
            anchor.click();
            URL.revokeObjectURL(url);
          },
          error: () => {
            this.dataError.set('Error al generar el archivo Excel.');
          },
        });
      }
    }
  }

  private async exportarAPDF(): Promise<void> {
    const elemento = document.getElementById('reporte-genealogia-pdf');

    if (!elemento) {
      this.dataError.set('No se encontró el contenedor del reporte para exportar.');
      return;
    }

    const treeContainer = elemento.querySelector('.genealogy-tree');

    this.exportingPdf.set(true);
    this.dataError.set('');

    // Activar modo exportación: muestra detalles inline, oculta tooltips
    treeContainer?.classList.add('exporting');

    try {
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 landscape dimensions in mm
      const pdfWidth = 297;
      const pdfHeight = 210;
      const margin = 10;

      const usableWidth = pdfWidth - margin * 2;
      const usableHeight = pdfHeight - margin * 2;

      // Calculate ratio to fit image within the usable area
      const ratio = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const offsetX = margin + (usableWidth - scaledWidth) / 2;
      const offsetY = margin + (usableHeight - scaledHeight) / 2;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, scaledWidth, scaledHeight);
      
      const tree = this.genealogyTree();
      const filename = tree ? `Genealogia_${tree.id}.pdf` : 'Genealogia.pdf';
      pdf.save(filename);

      this.successMessage.set('Reporte PDF descargado exitosamente.');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.dataError.set('Ocurrió un error al generar el archivo PDF.');
    } finally {
      treeContainer?.classList.remove('exporting');
      this.exportingPdf.set(false);
    }
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
    if (this.estadoLabel(row.estado) !== 'VIVO') {
      this.dataError.set('Solo se puede generar el reporte genealogico para vacunos vivos.');
      return;
    }

    this.selectedSearchVacuno.set(row);
    this.selectedVacuno.set(row);
    this.view.set('genealogy-tree');
    this.loadGenealogyTree(row.codigo);
  }

  onGenerationLevelChange(value: string): void {
    const level = Math.max(1, Math.min(4, Number(value) || 1));
    this.selectedGenerationLevel.set(level);
  }

  genealogyParents(node: VacunoGenealogiaDto): VacunoGenealogiaDto[] {
    return [node.padre, node.madre].filter((parent): parent is VacunoGenealogiaDto => parent !== null);
  }

  goToVacunoReport(node: VacunoGenealogiaDto | null | undefined): void {
    if (!node?.id) return;
    void this.router.navigate(['/vacunos/reportes/registro', node.id]);
  }

  estadoLabel(value: string): string {
    const normalized = value.toLowerCase();
    return normalized === 'muerto' || normalized === 'inactivo' ? 'MUERTO' : 'VIVO';
  }

  estadoLabelKey(value: string): string {
    const normalized = value.toLowerCase();
    return normalized === 'muerto' || normalized === 'inactivo'
      ? 'vacunos.status.muerto'
      : 'vacunos.status.vivo';
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

  private loadSearchSuggestions(value: string): void {
    const term = value.trim();
    const requestId = ++this.suggestionRequestId;

    if (term.length < 2) {
      this.searchSuggestions.set([]);
      this.suggestionsOpen.set(false);
      this.suggestionsLoading.set(false);
      return;
    }

    this.suggestionsLoading.set(true);
    this.suggestionsOpen.set(this.searchFocused());

    this.reporteFacade
      .listar({
        search: term,
        estado: 'vivo',
        formato: 'json',
        page: 1,
        pageSize: 6,
      })
      .subscribe({
        next: (response) => {
          if (requestId !== this.suggestionRequestId) {
            return;
          }

          this.searchSuggestions.set(
            (response.data ?? []).map((row) => this.normalizeGenealogyRow(row)),
          );
          this.suggestionsLoading.set(false);
          this.suggestionsOpen.set(this.searchFocused());
        },
        error: () => {
          if (requestId !== this.suggestionRequestId) {
            return;
          }

          this.searchSuggestions.set([]);
          this.suggestionsLoading.set(false);
          this.suggestionsOpen.set(false);
        },
      });
  }

  private normalizeGenealogyRow(row: VacunoListadoItem): VacunoListadoItem {
    return {
      ...row,
      estado: this.estadoLabel(row.estado) === 'MUERTO' ? 'muerto' : 'vivo',
    };
  }

  private matchesSearchSelection(row: VacunoListadoItem, term: string): boolean {
    const normalized = term.trim().toLowerCase();
    return (
      row.codigo.toLowerCase() === normalized ||
      row.nombre.toLowerCase() === normalized
    );
  }

  private applySelectedGenealogyRow(): void {
    const selected = this.selectedSearchVacuno();

    if (!selected || this.estadoLabel(selected.estado) !== 'VIVO') {
      this.genealogyRows.set([]);
      this.genealogyTotal.set(0);
      return;
    }

    const filtered = this.filterGenealogyRows([selected]);
    this.genealogyRows.set(filtered);
    this.genealogyTotal.set(filtered.length);
  }

  private filterGenealogyRows(rows: VacunoListadoItem[]): VacunoListadoItem[] {
    const filters = this.genealogyFilters();

    return rows.filter((row) => {
      if (!this.containsValue(row.codigo, filters.codigo)) return false;
      if (!this.containsValue(row.fechaRegistro, filters.fechaRegistro)) return false;
      if (!this.containsValue(row.nombre, filters.nombre)) return false;
      if (!this.containsValue(row.raza, filters.raza)) return false;
      if (!this.containsValue(row.procedencia, filters.procedencia)) return false;
      if (filters.estado && this.estadoLabel(row.estado).toLowerCase() !== filters.estado.toLowerCase()) {
        return false;
      }

      return this.estadoLabel(row.estado) === 'VIVO';
    });
  }

  private containsValue(value: string | null | undefined, filter: string): boolean {
    return !filter.trim() || (value ?? '').toLowerCase().includes(filter.trim().toLowerCase());
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
    if (!this.searchTerm().trim()) {
      this.filterError.set('Debe ingresar o seleccionar un vacuno vivo para generar el reporte genealogico.');
      return;
    }

    if (this.selectedSearchVacuno()) {
      this.applySelectedGenealogyRow();
      return;
    }

    this.loading.set(true);
    this.dataError.set('');

    this.reporteFacade
      .listar({
        page: this.genealogyPage(),
        pageSize: this.genealogyLimit(),
        search: this.searchTerm().trim(),
        estado: 'vivo',
        formato: 'json',
      })
      .subscribe({
        next: (response) => {
          const rows = (response.data ?? []).map((row) => this.normalizeGenealogyRow(row));
          const term = this.searchTerm().trim().toLowerCase();
          const exact = rows.find((row) => row.codigo.toLowerCase() === term);
          const candidates = exact ? [exact] : rows.length === 1 ? rows : [];
          const filtered = this.filterGenealogyRows(candidates);

          this.genealogyRows.set(filtered);
          this.genealogyTotal.set(filtered.length);

          if (filtered.length === 0) {
            this.dataError.set(
              rows.length > 1
                ? 'Seleccione un vacuno vivo de las sugerencias para generar el reporte genealogico.'
                : 'No se encontro un vacuno vivo con ese codigo o nombre.',
            );
          }

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

  private loadGenealogyTree(codigo: string): void {
    this.loading.set(true);
    this.dataError.set('');

    this.facade.obtenerVacuno(codigo).pipe(
      switchMap((vacuno) => {
        // Actualizamos el vacuno seleccionado para la vista del árbol si no estaba seteado
        if (!this.selectedVacuno() || this.selectedVacuno()?.codigo !== vacuno.codigo) {
          this.selectedVacuno.set({
            id: vacuno.id!,
            codigo: vacuno.codigo,
            fechaRegistro: vacuno.fechaRegistro ? (vacuno.fechaRegistro instanceof Date ? vacuno.fechaRegistro.toISOString() : String(vacuno.fechaRegistro)) : '',
            nombre: vacuno.nombre,
            raza: vacuno.raza,
            procedencia: vacuno.distrito || '',
            estado: vacuno.estado === 'muerto' ? 'muerto' : 'vivo'
          });
          this.view.set('genealogy-tree');
        }

        // Extraemos el ID numérico y llamamos al endpoint oficial del árbol pidiendo el máximo (4 niveles) siempre
        return this.facade.getGenealogia(vacuno.id!, 4);
      })
    ).subscribe({
      next: (tree) => {
        this.genealogyTree.set(tree);
        
        // Calculate max level to avoid out-of-range selection
        const getMaxLevel = (node: VacunoGenealogiaDto | null): number => {
          if (!node) return 0;
          return Math.max(node.nivel, getMaxLevel(node.padre), getMaxLevel(node.madre));
        };
        const maxLevel = tree ? Math.min(4, Math.max(1, getMaxLevel(tree))) : 4;
        
        if (this.selectedGenerationLevel() > maxLevel) {
          this.selectedGenerationLevel.set(maxLevel);
        }
        
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
