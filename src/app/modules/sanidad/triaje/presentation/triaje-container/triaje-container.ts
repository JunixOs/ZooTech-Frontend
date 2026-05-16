import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";

@Component({
  selector: 'zt-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, PageHeaderComponent],
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