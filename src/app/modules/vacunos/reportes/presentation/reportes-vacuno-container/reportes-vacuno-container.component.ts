import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ReporteVacunoCard } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-reportes-vacuno-container',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './reportes-vacuno-container.component.html',
  styleUrl: './reportes-vacuno-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesVacunoContainerComponent {
  readonly reports: ReporteVacunoCard[] = [
    {
      tituloKey: 'vacunos.reportes.cards.listado.title',
      descripcionKey: 'vacunos.reportes.cards.listado.description',
      icono: '▦',
      route: '/vacunos/reportes/listado',
      disponible: true,
    },
    {
      tituloKey: 'vacunos.reportes.cards.registro.title',
      descripcionKey: 'vacunos.reportes.cards.registro.description',
      icono: '▦',
      route: '/vacunos/reportes/registro',
      disponible: true,
    },
    {
      tituloKey: 'vacunos.reportes.cards.genealogia.title',
      descripcionKey: 'vacunos.reportes.cards.genealogia.description',
      icono: '⌁',
      route: '/vacunos/reportes/genealogia',
      disponible: false,
    },
    {
      tituloKey: 'vacunos.reportes.cards.actividad.title',
      descripcionKey: 'vacunos.reportes.cards.actividad.description',
      icono: '⌁',
      route: '/vacunos/reportes/actividad',
      disponible: false,
    },
  ];
}
