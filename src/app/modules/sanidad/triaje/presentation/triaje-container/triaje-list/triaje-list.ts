import { ChangeDetectionStrategy, Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';
import { TriajeService } from '../../../../services/triaje.service';

@Component({
  selector: 'zt-triaje-list',
  imports: [CommonModule],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList implements OnInit {
  nuevoTriaje = output<void>();

  private triajeService = inject(TriajeService);

  triajes = signal<Triaje[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTriajes();
  }

  loadTriajes(): void {
    this.loading.set(true);
    this.triajeService.getAll().subscribe({
      next: (data) => {
        this.triajes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los triajes');
        this.loading.set(false);
      }
    });
  }

  openNewTriage(): void {
    this.nuevoTriaje.emit();
  }
}