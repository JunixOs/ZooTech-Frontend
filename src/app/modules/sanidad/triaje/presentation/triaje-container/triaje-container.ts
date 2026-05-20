import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import {
  Triaje,
  RegistrarTriajePayload,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  TriajeHistorialItem,
} from '../../domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';

@Component({
  selector: 'zt-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, PageHeaderComponent],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly triajeService = inject(TriajeService);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  showNewTriage = signal(false);
  tiposPeso = signal<TriajeTipoPesoOption[]>([]);
  vacunos = signal<TriajeVacunoOption[]>([]);
  historial = signal<TriajeHistorialItem[]>([]);
  recargarLista = signal(0);

  openNewTriage(): void {
    this.historial.set([]);
    this.showNewTriage.set(true);
  }
  closeNewTriage(): void {
    this.showNewTriage.set(false);
  }

  onVacunoSelected(vacunoId: number): void {
    this.triajeService.getHistorialByVacunoId(vacunoId).subscribe({
      next: (historial) => {
        this.historial.set(historial);
        this.cdr.markForCheck();
      },
      error: () => console.error('Error al cargar historial')
    });
  }

  showViewTriage = signal(false);
  selectedTriaje = signal<Triaje | null>(null);

  constructor() {
    this.triajeService.getTiposPeso().subscribe((data) => this.tiposPeso.set(data));
    this.triajeService.getVacunos().subscribe((data) => this.vacunos.set(data)); // nuevo
  }
  openViewTriage(triaje: Triaje): void {
    this.triajeService.getById(triaje.id).subscribe({
      next: (data) => {
        this.selectedTriaje.set(data);
        this.triajeService.getHistorialByVacunoId(data.vacunoId).subscribe({
          next: (historial) => {
            this.historial.set(historial);
            this.showViewTriage.set(true);
            this.cdr.markForCheck();
          },
        });
      },
      error: () => console.error('Error al cargar el triaje'),
    });
  }

  closeViewTriage(): void {
    this.showViewTriage.set(false);
    this.selectedTriaje.set(null);
    this.historial.set([]);
  }
  onTriajeSaved(payload: RegistrarTriajePayload): void {
    this.triajeService.create(payload).subscribe({
      next: () => {
        this.recargarLista.update((v) => v + 1);
        this.successMessage.set('Registro de Triaje Exitoso');
        this.errorMessage.set(null);
        this.closeNewTriage();
        setTimeout(() => {
          this.successMessage.set(null);
        }, 3000);
      },
      error: () => {
        this.errorMessage.set('Error al crear el triaje');
        this.successMessage.set(null);

        setTimeout(() => {
          this.errorMessage.set(null);
        }, 3000);
      },
    });
  }

  onTriajeEdited(payload: RegistrarTriajePayload): void {
    const triaje = this.selectedTriaje();
    if (!triaje) {
      return;
    }
    this.triajeService.update(triaje.id, payload).subscribe({
      next: () => {
        this.recargarLista.update((v) => v + 1);
        this.successMessage.set('Triaje actualizado exitosamente');
        this.errorMessage.set(null);
        this.closeViewTriage();
        setTimeout(() => {
          this.successMessage.set(null);
        }, 3000);
      },
      error: () => {
        this.errorMessage.set('Error al actualizar el triaje');
        this.successMessage.set(null);
        setTimeout(() => {
          this.errorMessage.set(null);
        }, 3000);
      },
    });
  }
  onTriajeDeleted(id: number): void {
    const confirmed = confirm('¿Seguro que deseas eliminar este triaje?');

    if (!confirmed) {
      return;
    }

    this.triajeService
      .delete(id, {
        motivoEliminacion: 'Eliminado desde frontend',
      })
      .subscribe({
        next: () => {
          this.recargarLista.update((v) => v + 1);
          this.closeViewTriage();
          this.successMessage.set('Triaje eliminado correctamente');

          setTimeout(() => {
            this.successMessage.set(null);
          }, 3000);
        },
        error: () => {
          this.errorMessage.set('No se pudo eliminar el triaje');

          setTimeout(() => {
            this.errorMessage.set(null);
          }, 3000);
        },
      });
  }
}
