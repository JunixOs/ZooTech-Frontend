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
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zt-reporte-listado-grafico-vacuno',
  standalone: true,
  imports: [BaseChartDirective, PageHeaderComponent, FormsModule],
  templateUrl: './reporte-listado-grafico-vacuno.html',
  styleUrl: './reporte-listado-grafico-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoGraficoVacuno implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly triajeService = inject(TriajeService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  vacunoId = signal<number>(0);
  vacunos = signal<{id: number, codigo: string, nombre: string}[]>([]);
  loading = signal<boolean>(false);
  historial = signal<TriajeHistorialItem[]>([]);
  showDownloadMenu = signal<boolean>(false);

  pageTitle = computed(() => {
    const v = this.vacunos().find(x => x.id === this.vacunoId());
    return v ? `${v.codigo} - ${v.nombre.toUpperCase()}` : 'Cargando...';
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
            return `Peso registrado: ${context.parsed.y}, ${context.label}`;
          },
          title: () => '',
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Fechas', color: '#6b7280', align: 'end' },
        grid: { display: false },
        ticks: { maxRotation: 90, minRotation: 90 }
      },
      y: {
        title: { display: true, text: 'Peso (Kg)', color: '#8a2542', align: 'end' },
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
    const items = [...this.historial()].reverse();
    return {
      labels: items.map(t => new Date(t.fechaHora).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })),
      datasets: [
        {
          data: items.map(t => t.pesoKg),
          label: 'Peso (Kg)',
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

    const id = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('vacunoId');
    if (id) {
      this.vacunoId.set(Number(id));
      this.route.queryParams.subscribe(params => {
        this.fixedDateRange.set({
          desde: params['desde'],
          hasta: params['hasta']
        });
        this.loadData(params['desde'], params['hasta']);
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

  updateDesde(value: string): void {
    const current = this.fixedDateRange();
    this.updateDates(value, current.hasta || '');
  }

  updateHasta(value: string): void {
    const current = this.fixedDateRange();
    this.updateDates(current.desde || '', value);
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

  toggleDownloadMenu(): void {
    this.showDownloadMenu.update(v => !v);
  }

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    this.showDownloadMenu.set(false);
    if (formato === 'pdf') {
      this.downloadPdf();
    } else {
      this.downloadExcel();
    }
  }

  private downloadExcel(): void {
    this.loading.set(true);
    const { desde, hasta } = this.fixedDateRange();
    this.triajeService.downloadExcel({fechaDesde: desde, fechaHasta: hasta}).subscribe({
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
        alert('Ocurrió un error al descargar el Excel.');
      }
    });
  }

  private downloadPdf(): void {
    if (!this.chart || !this.chart.chart) {
      alert('El gráfico aún no está listo.');
      return;
    }
    this.loading.set(true);
    try {
      const imgData = this.chart.chart.toBase64Image();
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.text(`Reporte de Triajes - Vacuno ${this.vacunoId()}`, 10, 10);
      const margin = 10;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = 100;
      pdf.addImage(imgData, 'PNG', margin, 20, imgWidth, imgHeight);
      pdf.save(`grafico_triaje_vacuno_${this.vacunoId()}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Ocurrió un error al generar el PDF.');
    } finally {
      this.loading.set(false);
    }
  }
}