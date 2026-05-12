import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-triaje-list',
  imports: [],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList { 
  nuevoTriaje = output<void>();
  verDetalle = output<string>();

  openNewTriage() {
    this.nuevoTriaje.emit();
  }

  viewDetails(id: string) {
    this.verDetalle.emit(id);
  }
}
