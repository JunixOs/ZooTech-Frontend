import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { ConsultaFiltros } from '@modules/sanidad/domain/models/triaje.model';
import { ReporteTriajePorVacunoList } from './reporte-triaje-por-vacuno-list/reporte-triaje-por-vacuno-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'zt-reporte-triaje-por-vacuno',
  imports: [ReporteTriajePorVacunoList, PageHeaderComponent, DateRangeFilterComponent, TranslatePipe],
  templateUrl: './reporte-triaje-por-vacuno.html',
  styleUrl: './reporte-triaje-por-vacuno.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTriajePorVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  private readonly repository = inject(TriajeRepository);
  readonly #route = inject(ActivatedRoute);
  readonly vacunoId = Number(this.#route.snapshot.paramMap.get('id'));
  readonly titulo = computed(() => {
  const v = this.facade.vacunos().find(v => v.id === this.vacunoId);
  const codigo = v ? v.codigo : '#$(this.vacunoId}';
  return `${codigo}${v ? ` — ${v.nombre}` : ''}`;
});
  expandedIndex = signal<number | null>(null);
  downloading = signal(false);
  showDownloadMenu = signal(false);
  fechaDesde = signal<string | undefined>(undefined);
  fechaHasta = signal<string | undefined>(undefined);

  ngOnInit(): void {
    const vacunoId = Number(this.#route.snapshot.paramMap.get('id'));
    if (vacunoId) {
      this.facade.cargarPorVacuno(vacunoId);
      this.facade.cargarCatalogos();
    }
  }

  toggleRow(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  cambiarPagina(pagina: number): void {
    this.facade.cargarPagina(pagina);
  }
  onPageSizeChange(size: number): void {
    this.facade.cambiarLimite(size);
  }
  onSearch(_term: string): void {
    this.facade.cargarPagina(1);
  }
  onColumnFilter(filters: Record<string, string>): void {
    const vacunoId = this.#route.snapshot.paramMap.get('id');
    if (vacunoId) {
      filters['vacunoId'] = vacunoId;
    }
    this.facade.actualizarFiltros(filters);
  }

  toggleDownloadMenu(): void {
    this.showDownloadMenu.update(v => !v);
  }

  onDateRangeChange(range: DateRange): void {
    this.fechaDesde.set(range.start ? this.toDateOnlyString(range.start) : undefined);
    this.fechaHasta.set(range.end ? this.toDateOnlyString(range.end) : undefined);
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    this.showDownloadMenu.set(false);
    if (formato === 'excel') {
      this.downloadExcel();
    } else {
      this.downloadPdf();
    }
  }

  private downloadExcel(): void {
    this.downloading.set(true);
    const filtros: ConsultaFiltros = { vacunoId: String(this.vacunoId) };
    if (this.fechaDesde()) filtros.fechaDesde = this.fechaDesde();
    if (this.fechaHasta()) filtros.fechaHasta = this.fechaHasta();
    this.repository.downloadExcel(filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-triajes-vacuno-${this.vacunoId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        alert('Error al descargar el archivo Excel.');
      }
    });
  }

  private downloadPdf(): void {
    this.downloading.set(true);
    const filtros: ConsultaFiltros = { vacunoId: String(this.vacunoId) };
    if (this.fechaDesde()) filtros.fechaDesde = this.fechaDesde();
    if (this.fechaHasta()) filtros.fechaHasta = this.fechaHasta();
    this.repository.downloadPdf(filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        alert('Error al descargar el archivo PDF.');
      }
    });
  }
}
