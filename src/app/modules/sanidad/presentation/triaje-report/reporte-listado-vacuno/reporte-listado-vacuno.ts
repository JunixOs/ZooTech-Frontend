import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableComponent } from "@shared/components/data-table/data-table.component";
import { ColumnConfig } from '@shared/models/table-config.model';
import { Triaje } from '@modules/sanidad/domain/models/triaje.model';
import { TriajeFacade } from '@modules/sanidad/applications/facades/triaje.facade';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { BackButtonComponent } from "@shared/components/back-button/back-button";

@Component({
  selector: 'zt-reporte-listado-vacuno',
  imports: [DataTableComponent, PageHeaderComponent, BackButtonComponent],
  templateUrl: 'reporte-listado-vacuno.html',
  styleUrl: './reporte-listado-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoVacuno implements OnInit {
  readonly facade = inject(TriajeFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
}
