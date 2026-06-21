import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunosFacade } from '../../application/vacunos.facade';
import { DateRange } from '@shared/models/report-config.model';
import { VacunosListComponent } from '../vacunos-list/vacunos-list.component';
import { VacunoEstado } from '../../domain/models/vacuno.model';

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

    // Por defecto últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    this.facade.actualizarFechas(hace30Dias, hoy);
  }

  onSearch(q: string) {
    this.facade.actualizarBusqueda(q);
  }

  onFilterState(filters: Record<string, string>): void {
    // El backend no soporta filtro por estado, todos los registros retornados son activos.
    // this.facade.actualizarEstado((filters['estado'] as VacunoEstado) || null);
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
      void this.router.navigate(['/vacuno/detalle', codigo]);
    }
  }
}
