import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { ReporteVacunoListadoFiltros, VacunoListadoItem } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-listado-vacuno-container',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './listado-vacuno-container.component.html',
  styleUrl: './listado-vacuno-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoVacunoContainerComponent implements OnInit {
  private readonly facade = inject(ReporteVacunoFacade);
  private readonly router = inject(Router);

  readonly items = this.facade.itemsSignal;
  readonly total = this.facade.totalSignal;
  readonly loading = this.facade.loadingSignal;
  readonly error = this.facade.errorSignal;

  readonly fechaDesde = signal(this.toInputDate(this.daysAgo(30)));
  readonly fechaHasta = signal(this.toInputDate(new Date()));
  readonly q = signal('');
  readonly codigo = signal('');
  readonly registro = signal('');
  readonly nombre = signal('');
  readonly raza = signal('');
  readonly procedencia = signal('');
  readonly estado = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
  readonly firstItem = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit() + 1));
  readonly lastItem = computed(() => Math.min(this.page() * this.limit(), this.total()));

  ngOnInit(): void {
    void this.buscar();
  }

  async buscar(resetPage = true): Promise<void> {
    if (resetPage) this.page.set(1);
    await this.facade.cargarListado(this.buildFiltros());
  }

  async cambiarPagina(nextPage: number): Promise<void> {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) return;
    this.page.set(nextPage);
    await this.facade.cargarListado(this.buildFiltros());
  }

  async cambiarLimite(value: string): Promise<void> {
    this.limit.set(Number(value));
    await this.buscar(true);
  }

  verDetalle(vacuno: VacunoListadoItem): void {
    void this.router.navigate(['/vacunos/reportes/registro', vacuno.id]);
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes']);
  }

  estadoLabelKey(value: string | null): string {
    if (!value) return 'vacunos.reportes.status.empty';
    return value.toLowerCase() === 'vivo' ? 'vacunos.reportes.status.vivo' : 'vacunos.reportes.status.muerto';
  }

  private buildFiltros(): ReporteVacunoListadoFiltros {
    const qParts = [this.q(), this.codigo(), this.registro(), this.nombre()].filter((item) => item.trim().length > 0);

    return {
      fechaDesde: this.fechaDesde(),
      fechaHasta: this.fechaHasta(),
      q: qParts.join(' ').trim(),
      raza: this.raza(),
      procedencia: this.procedencia(),
      estado: this.estado(),
      page: this.page(),
      limit: this.limit(),
      formato: 'json',
    };
  }

  private daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
