import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-listado-general',
  imports: [DataTableComponent, PageHeaderComponent, TranslatePipe],
  templateUrl: 'reporte-listado-general.html',
  styleUrl: 'reporte-listado-general.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoGeneral {
  private readonly repository = inject(TriajeRepository);

  loading = signal(false);
  downloading = signal(false);
  showDownloadMenu = signal(false);
  triajes = signal<Triaje[]>([]);
  paginaActual = signal(1);
  tamano = signal(10);
  totalRegistros = signal(0);

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'vacunoNombre', headerKey: 'sanidad.triaje.columns.nombre', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      vacunoNombre: t.vacunoNombre,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      _raw: t as unknown,
    })),
  );

  onVerTriaje(row: Record<string, unknown>): void {}

  onSearch(term: string): void {
    this.paginaActual.set(1);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }
  onPageSizeChange(size: number): void {
    this.tamano.set(size);
    this.paginaActual.set(1);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.paginaActual.set(1);
  }

  toggleDownloadMenu(): void {
    this.showDownloadMenu.update(v => !v);
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
    this.repository.downloadExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-triajes.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
      }
    });
  }

  private downloadPdf(): void {
    this.downloading.set(true);
    this.repository.downloadPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
      }
    });
  }
}
