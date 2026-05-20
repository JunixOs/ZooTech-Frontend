import { ChangeDetectionStrategy, Component, inject, signal, output, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Triaje, TriajeVacunoOption } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '../../../../services/triaje.service';
import { DateRangeFilterComponent } from '@shared/components/date-range-filter/date-range-filter.component';
import { DateRange } from '@shared/models/report-config.model';

@Component({
  selector: 'zt-triaje-list',
  imports: [CommonModule, DateRangeFilterComponent],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList implements OnInit {
  nuevoTriaje = output<void>();
  verTriaje = output<Triaje>();
  recargar = input(0);

  private triajeService = inject(TriajeService);

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  
    constructor() {
  effect(() => {
    if (this.recargar() > 0) {
      this.loadTriajes();
    }
  });
}
  ngOnInit(): void {
    this.loadTriajes();
  }

  
  loadTriajes(): void {
    this.triajeService.getAll().subscribe({
      next: (data) => {
          console.log(data[0]);
        this.triajes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los triajes');
        this.loading.set(false);
      }
    });
  }

  onVerTriaje(triaje: Triaje): void {
  this.verTriaje.emit(triaje);
}
  openNewTriage(): void {
    this.nuevoTriaje.emit();
  }

  onDateRangeChange(range: DateRange): void {
    console.log(range);
  }

}