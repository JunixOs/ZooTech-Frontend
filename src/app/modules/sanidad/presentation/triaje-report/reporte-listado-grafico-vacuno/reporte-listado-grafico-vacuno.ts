import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  ViewChild,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TriajeService } from '@modules/sanidad/infrastructure/services/triaje.service';
import { TriajeHistorialItem } from '@modules/sanidad/domain/models/triaje.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, TooltipItem } from 'chart.js';
import jsPDF from 'jspdf';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { FormsModule } from '@angular/forms';
import { FixedDateRangeComponent } from "@shared/components/fixed-date-range/fixed-date-range";
import { DownloadButtonComponent } from "@shared/components/download-button/download-button";
import { DateRange } from '@shared/models/report-config.model';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-listado-grafico-vacuno',
  standalone: true,
  imports: [BaseChartDirective, PageHeaderComponent, FormsModule, FixedDateRangeComponent, DownloadButtonComponent, TranslatePipe],
  templateUrl: './reporte-listado-grafico-vacuno.html',
  styleUrl: './reporte-listado-grafico-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoGraficoVacuno implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly triajeService = inject(TriajeService);
  private readonly translate = inject(TranslateService);
  protected readonly filtroService = inject(ReporteFiltroService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  vacunoId = signal<number>(0);
  vacunos = signal<{id: number, codigo: string, nombre: string}[]>([]);
  loading = signal<boolean>(false);
  historial = signal<TriajeHistorialItem[]>([]);

  pageTitle = computed(() => {
    const v = this.vacunos().find(x => x.id === this.vacunoId());
    return v ? `${v.codigo} - ${v.nombre.toUpperCase()}` : this.translate.instant('sanidad.reportes.charts.loadingTitle');
  });

  chartType: 'line' = 'line';

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#e6f2e6',
        titleColor: '#6b7280',
        bodyColor: '#6b7280',
        borderColor: '#cce1cc',
        borderWidth: 1,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return this.translate.instant('sanidad.reportes.charts.tooltipWeight', {
              weight: context.parsed.y,
              date: context.label,
            });
          },
          title: () => '',
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: this.translate.instant('sanidad.reportes.charts.dates'), color: '#6b7280', align: 'end' },
        grid: { display: false },
        ticks: { maxRotation: 90, minRotation: 90 }
      },
      y: {
        title: { display: true, text: this.translate.instant('sanidad.reportes.charts.weight'), color: '#8a2542', align: 'end' },
        beginAtZero: true,
        border: { color: '#8a2542' },
        grid: { display: false }
      }
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 4, hoverRadius: 6 }
    }
  };

  chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const items = [...this.historial()];
    return {
      labels: items.map(t => new Date(t.fechaHora).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })),
      datasets: [
        {
          data: items.map(t => t.pesoKg),
          label: this.translate.instant('sanidad.reportes.charts.weight'),
          fill: false,
          tension: 0,
          borderColor: '#006400',
          backgroundColor: '#006400',
          pointBackgroundColor: '#006400',
        },
      ],
    };
  });

  fixedDateRange = signal<{desde?: string, hasta?: string}>({});

  ngOnInit(): void {
    this.triajeService.getVacunos().subscribe({
      next: v => this.vacunos.set(v),
      error: err => console.error('Error al cargar vacunos:', err)
    });

    // Listen to path parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') ?? params.get('vacunoId');
      if (id) {
        this.vacunoId.set(Number(id));
        this.loadCurrentData();
      }
    });

    // Listen to query parameters
    this.route.queryParams.subscribe(params => {
      this.fixedDateRange.set({
        desde: params['desde'],
        hasta: params['hasta']
      });
      this.loadCurrentData();
    });
  }

  private loadCurrentData(): void {
    const id = this.vacunoId();
    if (id > 0) {
      const { desde, hasta } = this.fixedDateRange();
      this.loadData(desde, hasta);
    }
  }

  onVacunoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      this.router.navigate(['/sanidad/reportes/graficoListadoVacuno', select.value], {
        queryParamsHandling: 'preserve'
      });
    }
  }

  loadData(desde?: string, hasta?: string): void {
    this.loading.set(true);
    this.triajeService.getHistorialByVacunoId(this.vacunoId(), desde, hasta).subscribe({
      next: (data: TriajeHistorialItem[]) => {
        this.historial.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onDateRangeChange(range: DateRange): void {
    const desde = range.start ? this.toDateOnlyString(range.start) : '';
    const hasta = range.end ? this.toDateOnlyString(range.end) : '';
    this.updateDates(desde, hasta);
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateDates(desde: string, hasta: string): void {
    const queryParams: any = {
      desde: desde || null,
      hasta: hasta || null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  onBack(): void {
    this.router.navigate(['/sanidad/reportes/listadoVacuno'], {
      queryParamsHandling: 'preserve'
    });
  }

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    if (formato === 'pdf') {
      this.downloadPdf();
    } else {
      this.downloadExcel();
    }
  }

  private downloadExcel(): void {
    this.loading.set(true);
    const { desde, hasta } = this.fixedDateRange();
    this.triajeService.downloadExcel({
      fechaDesde: desde,
      fechaHasta: hasta,
      vacunoId: String(this.vacunoId()),
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historial_triaje_vacuno_${this.vacunoId()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert(this.translate.instant('sanidad.reportes.charts.excelDownloadError'));
      }
    });
  }

  private downloadPdf(): void {
    if (!this.chart || !this.chart.chart) {
      alert(this.translate.instant('sanidad.reportes.charts.pdfNotReady'));
      return;
    }
    this.loading.set(true);
    try {
      const imgData = this.chart.chart.toBase64Image();
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.text(this.translate.instant('sanidad.reportes.charts.pdfVacunoTitle', { vacunoId: this.vacunoId() }), 10, 10);
      const margin = 10;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = 100;
      pdf.addImage(imgData, 'PNG', margin, 20, imgWidth, imgHeight);
      pdf.save(`grafico_triaje_vacuno_${this.vacunoId()}.pdf`);
    } catch (e) {
      console.error(e);
      alert(this.translate.instant('sanidad.reportes.charts.pdfGenerateError'));
    } finally {
      this.loading.set(false);
    }
  }
}
