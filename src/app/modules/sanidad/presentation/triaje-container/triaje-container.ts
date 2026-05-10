import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';

@Component({
  selector: 'app-triaje-container',
  imports: [ModalComponent, TriajeForm],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer { 
 showNewTriage = signal(false);

  openNewTriage(): void {
    this.showNewTriage.set(true);
  }

  closeNewTriage(): void {
    this.showNewTriage.set(false);
  }
}
