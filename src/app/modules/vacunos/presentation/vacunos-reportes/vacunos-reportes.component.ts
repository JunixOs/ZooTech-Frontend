import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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

type ReportView = 'reports' | 'activity-chart';
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

const CHART_WIDTH = 900;
const CHART_HEIGHT = 430;
const CHART_PADDING = {
  top: 34,
  right: 36,
  bottom: 92,
  left: 90,
};

const ACTIVITY_COUNTS = [
  1, 2, 2, 3, 4, 6, 11, 9, 7, 5, 13, 12, 14, 13, 16, 14, 18, 15, 17, 16, 19, 18,
  15, 17, 14, 16, 15, 13, 14, 13,
];

@Component({
  selector: 'zt-vacunos-reportes',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './vacunos-reportes.component.html',
  styleUrl: './vacunos-reportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosReportesComponent {
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
  readonly startDate = signal(toInputDate(addDays(new Date(), -29)));
  readonly endDate = signal(toInputDate(new Date()));
  readonly searchTerm = signal('');
  readonly filterError = signal('');
  readonly successMessage = signal('');
  readonly downloadOpen = signal(false);
  readonly activePoint = signal<ChartPoint | null>(null);

  private readonly allActivityData = signal<ActivityPoint[]>(buildActivityData());

  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) {
      return this.reports;
    }

    return this.reports.filter((report) =>
      `${report.title} ${report.description}`.toLowerCase().includes(term),
    );
  });

  readonly activityData = computed(() => {
    const start = parseInputDate(this.startDate());
    const end = parseInputDate(this.endDate());

    if (!start || !end || start > end) {
      return [];
    }

    return this.allActivityData().filter((point) => {
      const date = parseInputDate(point.date);
      return !!date && date >= start && date <= end;
    });
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
  }

  reportIcon(report: VacunoReportCard): LucideIconData {
    return report.icon === 'table' ? this.tableIcon : this.chartIcon;
  }

  onSearch(): void {
    if (this.validateFilters()) {
      this.successMessage.set('');
    }
  }

  openReport(report: VacunoReportCard): void {
    if (!this.validateFilters()) {
      return;
    }

    if (report.id !== 'actividad') {
      this.successMessage.set('El reporte seleccionado se mostrara con los filtros establecidos.');
      return;
    }

    this.activePoint.set(null);
    this.downloadOpen.set(false);
    this.successMessage.set('');
    this.view.set('activity-chart');
  }

  goBack(): void {
    this.view.set('reports');
    this.downloadOpen.set(false);
    this.activePoint.set(null);
  }

  toggleDownload(): void {
    this.downloadOpen.update((open) => !open);
  }

  download(format: DownloadFormat): void {
    if (!this.validateFilters()) {
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

  formatDisplayDate(value: string): string {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private validateFilters(): boolean {
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

    this.filterError.set('');
    return true;
  }

  private clearFeedback(): void {
    this.filterError.set('');
    this.successMessage.set('');
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
    const rows = [
      ['Reporte', 'Grafico de vacunos en actividad'],
      ['Fecha inicio', this.formatDisplayDate(this.startDate())],
      ['Fecha fin', this.formatDisplayDate(this.endDate())],
      [],
      ['Fecha', 'Vacunos en actividad'],
      ...data.map((point) => [this.formatDisplayDate(point.date), String(point.count)]),
      [],
      ['Mayor numero de vacunos en actividad', String(this.stats().max)],
      ['Menor numero de vacunos en actividad', String(this.stats().min)],
    ];

    const sheetRows = rows
      .map((row, rowIndex) => {
        const cells = row
          .map((cell, columnIndex) => {
            const ref = `${columnName(columnIndex + 1)}${rowIndex + 1}`;
            return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(cell)}</t></is></c>`;
          })
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
          '<sheets><sheet name="Vacunos en actividad" sheetId="1" r:id="rId1"/></sheets>' +
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
          '<sheetData>' +
          sheetRows +
          '</sheetData></worksheet>',
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
    const lines = [
      'Grafico de vacunos en actividad',
      `Fecha inicio: ${this.formatDisplayDate(this.startDate())}`,
      `Fecha fin: ${this.formatDisplayDate(this.endDate())}`,
      '',
      'Fecha                 Vacunos en actividad',
      ...data.map(
        (point) => `${this.formatDisplayDate(point.date).padEnd(22, ' ')}${point.count}`,
      ),
      '',
      `Mayor numero de vacunos en actividad: ${this.stats().max}`,
      `Menor numero de vacunos en actividad: ${this.stats().min}`,
    ];
    const content = [
      'BT',
      '/F1 12 Tf',
      '50 790 Td',
      '14 TL',
      ...lines.slice(0, 45).map((line) => `(${pdfEscape(line)}) Tj T*`),
      'ET',
    ].join('\n');
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
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

    return new Blob([pdf], { type: 'application/octet-stream' });
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

function buildActivityData(): ActivityPoint[] {
  const start = addDays(new Date(), -(ACTIVITY_COUNTS.length - 1));

  return ACTIVITY_COUNTS.map((count, index) => ({
    date: toInputDate(addDays(start, index)),
    count,
  }));
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

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
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
