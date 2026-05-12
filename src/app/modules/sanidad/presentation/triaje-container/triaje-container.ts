import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { TriajeDetail } from './triaje-detail/triaje-detail';

@Component({
  selector: 'app-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, TriajeDetail],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer { 
  showNewTriage = signal(false);
  selectedTriageId: WritableSignal<string | null> = signal(null);
  
  // Señal para controlar la notificación visual del sistema
  notificationMessage = signal<string | null>(null);

  openNewTriage(): void {
    this.showNewTriage.set(true);
  }

  closeNewTriage(): void {
    this.showNewTriage.set(false);
  }

  openDetails(id: string): void {
    this.selectedTriageId.set(id);
  }

  closeDetails(): void {
    this.selectedTriageId.set(null);
  }

  // Lógica para mostrar la notificación de éxito
  handleDeleteSuccess(): void {
    this.notificationMessage.set('El registro de triaje se ha eliminado con éxito.');
    this.closeDetails(); // Vuelve a la lista principal (módulo vacunos)
    
    // Oculta la notificación temporalmente después de 3 segundos
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }
}
