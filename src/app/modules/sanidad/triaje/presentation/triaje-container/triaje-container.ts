import {ChangeDetectionStrategy,Component,inject,signal,ChangeDetectorRef,OnInit} from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import {
  Triaje,
  RegistrarTriajePayload,
  TriajeHistorialItem,
  ActualizarTriajePayload,
} from '../../domain/models/triaje.model';
import { TriajeFacade } from '../../application/triaje.facade';
import { ToastService } from '@core/notifications/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'zt-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, PageHeaderComponent],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer implements  OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly facade = inject(TriajeFacade);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  showNewTriage = signal(false);
  readonly tiposPeso = this.facade.tiposPeso;
  readonly vacunos = this.facade.vacunos;
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

  ngOnInit(): void {
    this.facade.cargarCatalogos();
  }

  openViewTriage(triaje: Triaje): void {
    this.facade.getById(triaje.id).subscribe({
      next: (data) => {
        this.selectedTriaje.set(data);
        this.facade.getHistorialByVacunoId(data.vacunoId).subscribe({
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
    this.facade.create(payload).subscribe({
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
    this.facade.update(triaje.id, payload).subscribe({
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

    this.facade.delete(id, { motivoEliminacion: 'Eliminado desde frontend' }).subscribe({
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
