import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunosFacade } from '../../application/vacunos.facade';
import { DateRange } from '@shared/models/report-config.model';
import { ColumnFilterEvent } from '@shared/models/table-config.model';
import { VacunosListComponent } from '../vacunos-list/vacunos-list.component';

@Component({
  selector: 'zt-vacunos-container',
  standalone: true,
  imports: [VacunosListComponent, TranslatePipe],
  templateUrl: './vacunos-container.component.html',
  styleUrl: './vacunos-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosContainerComponent implements OnInit {
  facade = inject(VacunosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly deletedCodigo = signal<string | null>(null);
  readonly updatedCodigo = signal<string | null>(null);

  ngOnInit() {
    this.deletedCodigo.set(this.route.snapshot.queryParamMap.get('deleted'));
    this.updatedCodigo.set(this.route.snapshot.queryParamMap.get('updated'));
    this.facade.cargarPagina(1);
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
    const codigo = typeof row['codigo'] === 'string' ? row['codigo'] : null;

    if (codigo) {
      void this.router.navigate(['/vacuno', codigo]);
    }
  }
}
