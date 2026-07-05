import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FecundacionFacade } from '../../application/fecundacion.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { FecundacionListComponent } from '../fecundacion-list/fecundacion-list.component';

@Component({
  selector: 'zt-fecundacion-container',
  standalone: true,
  imports: [FecundacionListComponent],
  templateUrl: './fecundacion-container.component.html',
  styleUrl: './fecundacion-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionContainerComponent implements OnInit {
  facade = inject(FecundacionFacade);
  private readonly router = inject(Router);

  ngOnInit() {
    // Inicializar con fechas predeterminadas (últimos 30 días a hoy)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    this.facade.actualizarFechasRango(hace30Dias, hoy);
  }

  onSearch(q: string) {
    this.facade.actualizarBusqueda(q);
  }

  onFilterResultado(event: ColumnFilterEvent): void {
    if (event.columnKey === 'codigoResultado') {
      this.facade.actualizarResultado(event.value || null);
    }
  }

  onDateRangeChange(range: DateRange) {
    this.facade.actualizarFechasRango(range.start, range.end);
  }

  onPageChange(page: number) {
    this.facade.cargarPagina(page);
  }

  onPageSizeChange(size: number) {
    this.facade.cambiarLimite(size);
  }

  onViewAction(row: Record<string, unknown>) {
    const id = row['id'];
    if (id) {
      void this.router.navigate(['/reproduccion/fecundacion/detalle', id]);
    }
  }
}
