import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ColumnConfig } from '@shared/models/table-config.model';
import { EstadoFecundacionService } from '../../application/services/estado-fecundacion.service';

@Component({
  selector: 'zt-estado-fecundacion-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DataTableComponent, PageHeaderComponent],
  templateUrl: './estado-fecundacion-list.html',
  styleUrl: './estado-fecundacion-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoFecundacionList implements OnInit {
  private readonly estadoService = inject(EstadoFecundacionService);
  private readonly router = inject(Router);

  readonly items = this.estadoService.estadosListado;
  readonly loading = this.estadoService.loading;
  readonly error = this.estadoService.error;

  readonly columns: ColumnConfig[] = [
    { key: 'codigoVacuno', headerKey: 'reproduccion.fecundacion.estado.columns.codigo', filterable: false, align: 'left' },
    { key: 'nombreVacuno', headerKey: 'reproduccion.fecundacion.estado.columns.nombre', filterable: false, align: 'left' },
    { key: 'raza', headerKey: 'reproduccion.fecundacion.estado.columns.raza', filterable: false, align: 'left' },
    {
      key: 'estadoReproductivoActual',
      headerKey: 'reproduccion.fecundacion.estado.columns.estado',
      filterable: false,
      type: 'badge',
      translatePrefix: 'reproduccion.fecundacion.estado.status',
      align: 'center',
    },
    {
      key: 'disponibleNuevaFecundacion',
      headerKey: 'reproduccion.fecundacion.estado.columns.disponibilidad',
      filterable: false,
      type: 'badge',
      translatePrefix: 'reproduccion.fecundacion.estado.availability',
      align: 'center',
    },
  ];

  ngOnInit(): void {
    void this.estadoService.cargarListado();
  }

  onSearch(term: string): void {
    void this.estadoService.cargarListado(term);
  }

  onRowAction(row: Record<string, unknown>): void {
    const id = row['vacunoId'];
    if (id !== undefined && id !== null) {
      void this.router.navigate(['/reproduccion/fecundacion/estado', id]);
    }
  }
}
