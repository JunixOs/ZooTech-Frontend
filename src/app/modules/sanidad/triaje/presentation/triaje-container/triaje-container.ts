import { ChangeDetectionStrategy, Component, inject, signal,ChangeDetectorRef  } from '@angular/core';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeList } from './triaje-list/triaje-list';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { Triaje, RegistrarTriajePayload, TriajeTipoPesoOption } from '../../domain/models/triaje.model';
import { TriajeService } from '@modules/sanidad/services/triaje.service';

@Component({
  selector: 'zt-triaje-container',
  imports: [ModalComponent, TriajeForm, TriajeList, PageHeaderComponent],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly triajeService = inject(TriajeService);
  showNewTriage = signal(false);
   tiposPeso = signal<TriajeTipoPesoOption[]>([]);

  openNewTriage(): void { this.showNewTriage.set(true); }
  closeNewTriage(): void { this.showNewTriage.set(false); }

  showViewTriage = signal(false);
  selectedTriaje = signal<Triaje | null>(null);

    constructor() {
    this.triajeService.getTiposPeso().subscribe(data => this.tiposPeso.set(data));
  }
  openViewTriage(triaje: Triaje): void {
  this.triajeService.getById(triaje.id).subscribe({
    next: (data) => {
      console.log('datos del API:', data);
      this.selectedTriaje.set(data);
      this.showViewTriage.set(true);
      this.cdr.markForCheck();
    },
    error: () => {
      console.error('Error al cargar el triaje');
    }
  });
}

  closeViewTriage(): void {
    this.showViewTriage.set(false);
    this.selectedTriaje.set(null);
  }

  onTriajeEdited(payload: RegistrarTriajePayload): void {
    this.closeViewTriage();
  }

  onTriajeDeleted(id: number): void {
    this.closeViewTriage();
  }
}