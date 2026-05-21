import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { VacunosFacade } from '../../application/vacunos.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { VacunosListComponent } from '../vacunos-list/vacunos-list.component';

@Component({
  selector: 'zt-vacunos-container',
  standalone: true,
  imports: [VacunosListComponent],
  templateUrl: './vacunos-container.component.html',
  styleUrl: './vacunos-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosContainerComponent implements OnInit {
  facade = inject(VacunosFacade);

  ngOnInit() {
    // Por defecto últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    this.facade.actualizarFechas(hace30Dias, hoy);
  }

  onSearch(q: string) {
    this.facade.actualizarBusqueda(q);
  }

  onFilterState(event: ColumnFilterEvent) {
    if (event.columnKey === 'estado') {
      this.facade.actualizarEstado(event.value || null);
    }
  }

  onDateRangeChange(range: DateRange) {
    this.facade.actualizarFechas(range.start, range.end);
  }

  onPageChange(page: number) {
    this.facade.cargarPagina(page);
  }

  onPageSizeChange(size: number) {
    this.facade.cambiarLimite(size);
  }

  onViewAction(row: Record<string, unknown>) {
    console.log('Ver detalle del vacuno:', row);
    // TODO: Navegar al detalle usando router.navigate
  }
}
