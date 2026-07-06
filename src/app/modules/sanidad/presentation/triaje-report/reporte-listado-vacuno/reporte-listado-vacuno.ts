import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableComponent } from "@shared/components/data-table/data-table.component";
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { TriajeRepository } from '@modules/sanidad/domain/interfaces/triaje-repository.interface';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { TranslatePipe } from '@ngx-translate/core';
import { BackButtonComponent } from "@shared/components/back-button/back-button";

@Component({
  selector: 'zt-reporte-listado-vacuno',
  imports: [DataTableComponent, PageHeaderComponent, TranslatePipe, BackButtonComponent],
  templateUrl: 'reporte-listado-vacuno.html',
  styleUrl: './reporte-listado-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  private readonly repository = inject(TriajeRepository);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  downloading = signal(false);
  showDownloadMenu = signal(false);

  columns: ColumnConfig[] = [
    { key: 'fechaHora', headerKey: 'sanidad.triaje.columns.fecha', filterable: true },
    { key: 'codigo', headerKey: 'sanidad.triaje.columns.codigo', filterable: true },
    { key: 'vacunoNombre', headerKey: 'sanidad.triaje.columns.nombre', filterable: true },
    { key: 'tipoPesoCode', headerKey: 'sanidad.triaje.columns.tipoPeso', filterable: true },
    { key: 'pesoKg', headerKey: 'sanidad.triaje.columns.peso', filterable: true },
  ];

  tableData = computed(() =>
    this.facade.triajes().map((t) => ({
      fechaHora: new Date(t.fechaHora).toLocaleDateString('es-PE'),
      codigo: t.codigo,
      vacunoNombre: t.vacunoNombre,
      tipoPesoCode: t.tipoPesoCode,
      pesoKg: t.pesoKg,
      _raw: t as unknown,
    })),
  );

  ngOnInit(): void {
    this.facade.actualizarFiltros({});
    this.facade.cargarPagina(1);
  }

  onVerTriaje(row: Record<string, unknown>): void {
    const triaje = row['_raw'] as Triaje;
    if (triaje?.vacunoId) {
      this.router.navigate([triaje.vacunoId], { relativeTo: this.route });
    }
  }

  cambiarPagina(pagina: number): void {
    this.facade.cargarPagina(pagina);
  }

  onPageSizeChange(size: number): void {
    this.facade.cambiarLimite(size);
  }

  onSearch(term: string): void {
    this.facade.actualizarBusqueda(term);
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.facade.actualizarFiltros(filters);
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
        link.download = `reporte-triajes-vacuno.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => this.downloading.set(false)
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
      error: () => this.downloading.set(false)
    });
  }
}
