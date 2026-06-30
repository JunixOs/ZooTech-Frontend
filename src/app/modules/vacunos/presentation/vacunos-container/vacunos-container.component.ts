import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunosFacade } from '../../application/vacunos.facade';
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
  readonly fechaDesde = signal(this.toInputDate(this.daysAgo(30)));
  readonly fechaHasta = signal(this.toInputDate(new Date()));

  ngOnInit() {
    this.deletedCodigo.set(this.route.snapshot.queryParamMap.get('deleted'));
    this.updatedCodigo.set(this.route.snapshot.queryParamMap.get('updated'));
    this.applyQueryFilters();
    this.buscarPorFechas(false);
  }

  onSearch(q: string) {
    this.facade.actualizarBusqueda(q);
  }

  onFilterState(event: ColumnFilterEvent): void {
    if (event.columnKey === 'estado') {
      this.facade.actualizarEstado(event.value || null);
    }
  }

  onFechaDesdeChange(value: string): void {
    this.fechaDesde.set(value);
  }

  onFechaHastaChange(value: string): void {
    this.fechaHasta.set(value);
  }

  buscarPorFechas(updateUrl = true): void {
    this.facade.actualizarFechas(
      this.parseInputDate(this.fechaDesde()),
      this.parseInputDate(this.fechaHasta()),
    );

    if (updateUrl) {
      this.persistListStateInUrl();
    }
  }

  limpiarFechas(): void {
    this.fechaDesde.set(this.toInputDate(this.daysAgo(30)));
    this.fechaHasta.set(this.toInputDate(new Date()));
    this.buscarPorFechas();
  }

  onPageChange(page: number) {
    this.facade.cargarPagina(page);
  }

  onPageSizeChange(size: number) {
    this.facade.cambiarLimite(size);
  }

  onViewAction(row: Record<string, unknown>) {
    const id = Number(row['id']);
    const codigo = typeof row['codigo'] === 'string' ? row['codigo'] : null;

    if (Number.isFinite(id) && id > 0) {
      void this.router.navigate(['/vacuno/detalle', id], {
        queryParams: this.currentListQueryParams(),
      });
      return;
    }

    if (codigo) {
      void this.router.navigate(['/vacuno/detalle', codigo], {
        queryParams: this.currentListQueryParams(),
      });
    }
  }

  onEditAction(row: Record<string, unknown>): void {
    const codigo = typeof row['codigo'] === 'string' ? row['codigo'] : null;

    if (!codigo) {
      return;
    }

    void this.router.navigate(['/vacunos/editar', codigo], {
      queryParams: this.currentListQueryParams(),
    });
  }

  private applyQueryFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const fechaDesde = params.get('fechaDesde');
    const fechaHasta = params.get('fechaHasta');

    if (this.isInputDate(fechaDesde)) {
      this.fechaDesde.set(fechaDesde);
    }

    if (this.isInputDate(fechaHasta)) {
      this.fechaHasta.set(fechaHasta);
    }
  }

  private persistListStateInUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.currentListQueryParams(),
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private currentListQueryParams(): Record<string, string> {
    return {
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
    };
  }

  private daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private parseInputDate(value: string): Date | null {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  private isInputDate(value: string | null): value is string {
    return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
