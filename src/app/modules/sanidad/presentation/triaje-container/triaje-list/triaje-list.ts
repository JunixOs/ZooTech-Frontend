import { ChangeDetectionStrategy, Component } from '@angular/core';
import { output } from '@angular/core';

@Component({
  selector: 'app-triaje-list',
  imports: [],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList { 
  nuevoTriaje = output<void>();
  openNewTriage() {
  this.nuevoTriaje.emit();
}
}
