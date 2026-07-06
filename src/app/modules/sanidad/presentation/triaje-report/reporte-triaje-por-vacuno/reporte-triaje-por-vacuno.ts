import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { ReporteTriajePorVacunoList } from './reporte-triaje-por-vacuno-list/reporte-triaje-por-vacuno-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';
import { DateRange } from '@shared/models/report-config.model';
@Component({
  selector: 'zt-reporte-triaje-por-vacuno',
  imports: [ReporteTriajePorVacunoList, PageHeaderComponent, DateRangeFilterComponent, DownloadButtonComponent],
  templateUrl: './reporte-triaje-por-vacuno.html',
  styleUrl: './reporte-triaje-por-vacuno.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteTriajePorVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  readonly #route = inject(ActivatedRoute);
  readonly vacunoId = Number(this.#route.snapshot.paramMap.get('id'));
  readonly titulo = computed(() => {
  const v = this.facade.vacunos().find(v => v.id === this.vacunoId);
  const codigo = v ? v.codigo : `#${this.vacunoId}`;
  return `${codigo}${v ? ` — ${v.nombre}` : ''}`;
});
  expandedIndex = signal<number | null>(null);
  downloading = signal(false);

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

  onDateRangeChange(range: DateRange): void {
    const filters: Record<string, string> = {};
    if (range.start) filters['fechaInicio'] = this.toDateOnlyString(range.start);
    if (range.end) filters['fechaFin'] = this.toDateOnlyString(range.end);
    filters['vacunoId'] = String(this.vacunoId);
    this.facade.actualizarFiltros(filters);
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDownloadFormat(formato: 'excel' | 'pdf'): void {
    this.downloading.set(true);
    this.facade.descargar(formato).subscribe({
      next: (blob) => {
        if (formato === 'excel') {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-triajes-vacuno-${this.vacunoId}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          window.URL.revokeObjectURL(url);
        }
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        alert('Error al descargar el archivo.');
      }
    });
  }
}
