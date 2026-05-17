import { ChangeDetectionStrategy, Component, inject, signal,ChangeDetectorRef  } from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { Triaje, RegistrarTriajePayload } from '../../domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';

@Component({
  selector: 'zt-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, PageHeaderComponent],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer {
  // --- Modo nuevo (existente) ---
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly triajeService = inject(TriajeService);
  showNewTriage = signal(false);

  openNewTriage(): void { this.showNewTriage.set(true); }
  closeNewTriage(): void { this.showNewTriage.set(false); }

  // --- Modo ver (NUEVO) ---
  showViewTriage = signal(false);
  selectedTriaje = signal<Triaje | null>(null);

  openViewTriage(triaje: Triaje): void {
  this.triajeService.getById(triaje.id).subscribe({
    next: (data) => {
      console.log('datos del API:', data);
      this.selectedTriaje.set(data);
      this.showViewTriage.set(true);
      this.cdr.markForCheck();
    },
    error: () => {
      // maneja el error como prefieras
      console.error('Error al cargar el triaje');
    }
  });
}

  closeViewTriage(): void {
    this.showViewTriage.set(false);
    this.selectedTriaje.set(null);
  }

  onTriajeEdited(payload: RegistrarTriajePayload): void {
    // llamar al servicio de actualización aquí
    this.closeViewTriage();
  }

  onTriajeDeleted(id: number): void {
    // llamar al servicio de eliminación aquí
    this.closeViewTriage();
  }
}