import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { ReportCard } from "./ReportCard/ReportCard";

@Component({
  selector: 'zt-reporte-container',
  imports: [PageHeaderComponent, ReportCard],
  templateUrl: './reporte-container.html',
  styleUrl: './reporte-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
  abrirListadoTriajes = () => console.log('TODO: abrir listado de triajes');
  abrirGraficoTriajes = () => console.log('TODO: abrir gráfico de triajes');

}
