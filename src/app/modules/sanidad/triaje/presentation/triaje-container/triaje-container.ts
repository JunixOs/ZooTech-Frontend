import {ChangeDetectionStrategy,Component,inject,signal,ChangeDetectorRef} from '@angular/core';
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
  ActualizarTriajePayload,
} from '../../domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import { ToastService } from '@core/notifications/toast.service';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  showNewTriage = signal(false);
  tiposPeso = signal<TriajeTipoPesoOption[]>([]);
  vacunos = signal<TriajeVacunoOption[]>([]);
  historial = signal<TriajeHistorialItem[]>([]);
  recargarLista = signal(0);

  openNewTriage(): void {
    this.showNewTriage.set(true);
  }
  closeNewTriage(): void {
    this.showNewTriage.set(false);
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
        this.toastService.success(this.translate.instant('sanidad.triaje.mensajes.registroExito'));
        this.closeNewTriage();
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.registroError'));
      },
    });
  }

  onTriajeEdited(payload: ActualizarTriajePayload): void {
    const triaje = this.selectedTriaje();
    if (!triaje) return;
    this.triajeService.update(triaje.id, payload).subscribe({
      next: () => {
        this.recargarLista.update((v) => v + 1);
        this.toastService.success(this.translate.instant('sanidad.triaje.mensajes.actualizadoExito'));
        this.closeViewTriage();
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.actualizadoError'));
      },
    });
  }

  onTriajeDeleted(id: number): void {
    const confirmed = confirm(this.translate.instant('sanidad.triaje.mensajes.confirmarEliminar'));
    if (!confirmed) return;

    this.triajeService.delete(id, { motivoEliminacion: 'Eliminado desde frontend' }).subscribe({
      next: () => {
        this.recargarLista.update((v) => v + 1);
        this.closeViewTriage();
        this.toastService.success(this.translate.instant('sanidad.triaje.mensajes.eliminadoExito'));
      },
      error: () => {
        this.toastService.error(this.translate.instant('sanidad.triaje.mensajes.eliminadoError'));
      },
    });
  }
}
