import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReporteVacunoCard } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-reportes-vacuno-container',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reportes-vacuno-container.component.html',
  styleUrl: './reportes-vacuno-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesVacunoContainerComponent {
  readonly reports: ReporteVacunoCard[] = [
    {
      titulo: 'Reporte de listado de vacunos',
      descripcion: 'Muestra los vacunos registrados por rango de fechas y filtros principales.',
      icono: '▦',
      route: '/vacunos/reportes/listado',
      disponible: true,
    },
    {
      titulo: 'Reporte de registro por vacuno',
      descripcion: 'Permite buscar un vacuno y consultar su reporte individual para descargarlo.',
      icono: '▦',
      route: '/vacunos/reportes/registro',
      disponible: true,
    },
    {
      titulo: 'Gráfico genealógico por vacuno',
      descripcion: 'Muestra la relación genealógica del vacuno hasta cuatro niveles.',
      icono: '⌁',
      route: '/vacunos/reportes/genealogia',
      disponible: false,
    },
    {
      titulo: 'Gráfico de vacunos en actividad',
      descripcion: 'Visualiza la cantidad de vacunos activos por periodo.',
      icono: '⌁',
      route: '/vacunos/reportes/actividad',
      disponible: false,
    },
  ];
}
