import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CeloFacade } from '../../../application/celo.facade';
import { DetalleCeloPorVacuno } from '../../../domain/models/reporte-celo-vacuno.model';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { BackLinkComponent } from '@shared/components/back-link/back-link.component';
import { ColumnConfig } from '@shared/models/table-config.model';
import { createTableFilterState } from '@shared/utils/table-filter-state';

@Component({
  selector: 'zt-reporte-celo-vacuno-detalle',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PageHeaderComponent,
    BackLinkComponent,
  ],
  templateUrl: './reporte-celo-vacuno-detalle.component.html',
  styleUrl: './reporte-celo-vacuno-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteCeloVacunoDetalleComponent implements OnInit {
  private readonly facade = inject(CeloFacade);
  private readonly route = inject(ActivatedRoute);

  readonly codigoVacuno = signal('');
  readonly nombreVacuno = signal('');

  readonly titleKey = 'reproduccion.celo.reportes.byCattle.title';

  readonly tituloPantalla = computed(() => {
    const codigo = this.codigoVacuno();
    const nombre = this.nombreVacuno();

    if (!codigo && !nombre) {
      return this.titleKey;
    }

    if (!nombre) {
      return codigo;
    }

    return `${codigo} - ${nombre}`.toUpperCase();
  });

  readonly breadcrumbDetalle = computed(() => {
    const codigo = this.codigoVacuno();
    const nombre = this.nombreVacuno();

    if (!codigo && !nombre) {
      return '';
    }

    if (!nombre) {
      return codigo;
    }

    return `${nombre} - ${codigo}`;
  });

  readonly isLoading = this.facade.isLoading;
  readonly error = this.facade.error;

  readonly columnFilters = signal<Record<string, string>>({});

  private readonly tableFilters = createTableFilterState<Record<string, unknown>>(() =>
    this.mappedFilteredData(),
  );
  readonly searchTerm = this.tableFilters.searchTerm;
  readonly currentPage = this.tableFilters.currentPage;
  readonly pageSize = this.tableFilters.pageSize;
  readonly totalItems = this.tableFilters.totalItems;
  readonly paginatedData = this.tableFilters.paginatedData;

  readonly columns: ColumnConfig[] = [
    {
      key: 'codigoRegistro',
      headerKey: 'reproduccion.celo.reportes.byCattle.detail.columns.recordCode',
      sortable: true,
      filterable: true,
      width: '150px',
    },
    {
      key: 'fecha',
      headerKey: 'reproduccion.celo.columns.fecha',
      sortable: true,
      filterable: true,
      width: '130px',
    },
    {
      key: 'hora',
      headerKey: 'reproduccion.celo.columns.hora',
      sortable: true,
      filterable: true,
      width: '120px',
    },
    {
      key: 'vecesEnCelo',
      headerKey: 'reproduccion.celo.columns.vecesEnCelo',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '150px',
    },
    {
      key: 'caracteristicas',
      headerKey: 'reproduccion.celo.columns.caracteristicas',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '160px',
    },
    {
      key: 'crias',
      headerKey: 'reproduccion.celo.columns.crias',
      sortable: true,
      filterable: true,
      align: 'center',
      width: '100px',
    },
  ];

  readonly filteredData = computed(() => {
    let data = this.facade.detalleCeloPorVacuno() as DetalleCeloPorVacuno[];

    const term = this.searchTerm().toLowerCase().trim();
    const colFilters = this.columnFilters();

    if (term) {
      data = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value ?? '').toLowerCase().includes(term),
        ),
      );
    }

    for (const [key, val] of Object.entries(colFilters)) {
      if (!val) continue;

      const colTerm = val.toLowerCase().trim();

      data = data.filter((item) => {
        const value = item[key as keyof DetalleCeloPorVacuno];

        return String(value ?? '')
          .toLowerCase()
          .includes(colTerm);
      });
    }

    return data;
  });

  private readonly mappedFilteredData = computed<Record<string, unknown>[]>(() =>
    this.filteredData().map((item) => ({
      codigoRegistro: item.codigoRegistro,
      fecha: item.fecha,
      hora: item.hora,
      vecesEnCelo: item.vecesEnCelo,
      caracteristicas: item.caracteristicas,
      crias: item.crias,
      observaciones: item.observaciones || '—',
    })),
  );

  ngOnInit(): void {
    this.facade.limpiarDetalleCeloPorVacuno();

    const codigoVacuno = this.route.snapshot.paramMap.get('codigoVacuno') ?? '';
    const nombreVacuno = this.route.snapshot.queryParamMap.get('nombre') ?? '';

    this.codigoVacuno.set(codigoVacuno);
    this.nombreVacuno.set(nombreVacuno);

    if (codigoVacuno) {
      this.facade.cargarDetalleCeloPorVacuno(codigoVacuno);
    }
  }

  onColumnFilter(filters: Record<string, string>): void {
    this.columnFilters.set(filters);
    this.currentPage.set(1);
  }

  onSearch(term: string): void {
    this.tableFilters.onSearch(term);
  }

  onPageChange(page: number): void {
    this.tableFilters.onPageChange(page);
  }

  onPageSizeChange(size: number): void {
    this.tableFilters.onPageSizeChange(size);
  }

  verDetalle(row: any): void {
    console.log('Fila seleccionada:', row);
  }
}
