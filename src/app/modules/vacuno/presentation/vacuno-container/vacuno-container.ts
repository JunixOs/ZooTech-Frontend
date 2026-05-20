import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { VacunoService } from '../../application/services/vacuno.service';
import { VacunoListItem, VacunoFiltros, VacunoDetalle } from '../../domain/models/vacuno.model';
import { VacunoListComponent } from '../vacuno-list/vacuno-list';
import { VacunoFormComponent } from '../vacuno-form/vacuno-form';
import { VacunoDetailComponent } from '../vacuno-detail/vacuno-detail';

export type Vista = 'list' | 'form' | 'detail';

@Component({
  selector: 'app-vacuno-container',
  standalone: true,
  imports: [CommonModule, VacunoListComponent, VacunoFormComponent, VacunoDetailComponent],
  templateUrl: './vacuno-container.html',
  styleUrl: './vacuno-container.scss',
})
export class VacunoContainerComponent implements OnInit {
  private readonly svc = inject(VacunoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly vista = signal<Vista>('list');
  readonly modoEdicion = signal(false);
  readonly vacunos = signal<VacunoListItem[]>([]);
  readonly vacunoSeleccionado = signal<VacunoDetalle | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal({ page: 1, limit: 10, total: 0, totalPages: 1 });
  readonly filtrosActivos = signal<VacunoFiltros>({ page: 1, limit: 10 });

  // Título dinámico para el breadcrumb del shell
  get tituloVista(): string {
    if (this.vista() === 'form') return this.modoEdicion() ? 'Editar Vacuno' : 'Agregar Vacuno';
    if (this.vista() === 'detail') return 'Detalle Vacuno';
    return 'Vacunos';
  }

  ngOnInit(): void { this.cargarLista(); }

  irALista(): void {
    this.modoEdicion.set(false);
    this.vacunoSeleccionado.set(null);
    this.vista.set('list');
    this.cargarLista();
  }

  irAFormNuevo(): void {
    this.modoEdicion.set(false);
    this.vacunoSeleccionado.set(null);
    this.vista.set('form');
  }

  irAEditar(v: VacunoDetalle): void {
    this.modoEdicion.set(true);
    this.vacunoSeleccionado.set(v);
    this.vista.set('form');
  }

  irADetalle(id: number): void {
    this.cargando.set(true);
    this.svc.obtenerDetalle(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (d) => { this.vacunoSeleccionado.set(d); this.vista.set('detail'); this.cargando.set(false); },
      error: (e) => { this.error.set(e?.error?.error?.message ?? 'Error al cargar.'); this.cargando.set(false); },
    });
  }

  cargarLista(filtros?: VacunoFiltros): void {
    const f = filtros ?? this.filtrosActivos();
    this.filtrosActivos.set(f);
    this.cargando.set(true);
    this.error.set(null);
    this.svc.listar(f).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.vacunos.set(res.data); this.pagination.set(res.pagination); this.cargando.set(false); },
      error: (e) => { this.error.set(e?.error?.error?.message ?? 'Error al cargar lista.'); this.cargando.set(false); },
    });
  }
}
