import { Component, ChangeDetectionStrategy, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';

type VacunoDetail = {
  id: number;
  nombre: string;
  codigo: string;
  raza: string;
  edad: number;
  fechaNacimiento: string;
  estado: 'activo' | 'inactivo';
  ultimaProduccion: string;
  promedioDiario: number;
  produccionTotal: number;
  historial: Array<{
    fecha: string;
    hora: string;
    litros: number;
    observaciones?: string;
  }>;
};

@Component({
  selector: 'zt-leche-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './leche-detail.html',
  styleUrl: './leche-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheDetail {
  selectedVacunoId = input<number | null>(null);
  data = input.required<LecheRegistro[]>();
  // Mock data - en producción vendría de un servicio
  vacunos = signal<VacunoDetail[]>([
    {
      id: 1,
      nombre: 'Vaca Lola',
      codigo: 'V001',
      raza: 'Holstein',
      edad: 5,
      fechaNacimiento: '2018-06-15',
      estado: 'activo',
      ultimaProduccion: '2023-10-03',
      promedioDiario: 15.5,
      produccionTotal: 4650,
      historial: [
        { fecha: '2023-10-01', hora: '10:00', litros: 15, observaciones: 'Normal' },
        { fecha: '2023-10-02', hora: '10:15', litros: 16, observaciones: 'Buen estado' },
        { fecha: '2023-10-03', hora: '09:45', litros: 15.5, observaciones: 'Producción normal' },
      ],
    },
    {
      id: 2,
      nombre: 'Vaca Pinta',
      codigo: 'V002',
      raza: 'Jersey',
      edad: 3,
      fechaNacimiento: '2020-08-20',
      estado: 'activo',
      ultimaProduccion: '2023-10-03',
      promedioDiario: 12,
      produccionTotal: 3600,
      historial: [
        { fecha: '2023-10-01', hora: '11:00', litros: 12, observaciones: '' },
        { fecha: '2023-10-02', hora: '11:10', litros: 12.5, observaciones: 'Ligera mejora' },
        { fecha: '2023-10-03', hora: '10:50', litros: 12, observaciones: '' },
      ],
    },
  ]);

  selectedVacuno = computed(() => {
    const id = this.selectedVacunoId();
    return id ? this.vacunos().find((v) => v.id === id) : null;
  });

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/leche/registro']);
  }

  selectVacuno(vacunoId: number): void {
    console.log('Selecting vacuno:', vacunoId);
  }
}
