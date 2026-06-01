import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VacunoService } from '../../application/vacuno.service';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route?: string;
}

@Component({
  selector: 'zt-vacuno-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vacuno-reports.html',
  styleUrl: './vacuno-reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoReports {
  private readonly route = inject(ActivatedRoute);
  private readonly vacunoService = inject(VacunoService);
  private readonly defaultRange = this.vacunoService.getDefaultActivityRange();

  readonly showDownloadMessage = signal(
    this.route.snapshot.queryParamMap.get('descarga') === 'exitosa',
  );
  readonly searchTerm = signal('');
  readonly fechaInicio = signal(this.defaultRange.fechaInicio);
  readonly fechaFin = signal(this.defaultRange.fechaFin);
  readonly cards: ReportCard[] = [
    {
      title: 'Reporte de estado de vacunos',
      description: 'Se puede revisar el estado actual de cada vacuno registrado.',
      icon: 'fa-solid fa-table-cells-large',
    },
    {
      title: 'Grafico genealogico por vacuno',
      description: 'Permite visualizar la relacion genealogica de un individuo.',
      icon: 'fa-solid fa-chart-line',
    },
    {
      title: 'Reporte de registro por vacuno',
      description: 'Muestra los datos de registro y trazabilidad por individuo.',
      icon: 'fa-solid fa-table-cells-large',
    },
    {
      title: 'Grafico de vacunos en actividad',
      description: 'Permite consultar la cantidad de vacunos en actividad segun los filtros.',
      icon: 'fa-solid fa-chart-line',
      route: '/vacuno/reportes/vacunos-en-actividad',
    },
  ];

  searchInput = '';
  fechaInicioInput = this.defaultRange.fechaInicio;
  fechaFinInput = this.defaultRange.fechaFin;

  readonly filteredCards = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.cards;
    }

    return this.cards.filter((card) =>
      `${card.title} ${card.description}`.toLowerCase().includes(term),
    );
  });

  readonly reportQueryParams = computed(() => ({
    fechaInicio: this.fechaInicio(),
    fechaFin: this.fechaFin(),
  }));

  applyFilters(): void {
    if (!this.fechaInicioInput || !this.fechaFinInput) {
      return;
    }

    this.searchTerm.set(this.searchInput);
    this.fechaInicio.set(this.fechaInicioInput);
    this.fechaFin.set(this.fechaFinInput);
  }

  dismissMessage(): void {
    this.showDownloadMessage.set(false);
  }
}
