import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TriajeList } from '@modules/sanidad/triaje/presentation/triaje-container/triaje-list/triaje-list';
import { Triaje } from '@modules/sanidad/triaje/domain/models/triaje.model';

@Component({
  selector: 'zt-reporte-listado-vacuno',
  standalone: true,
  imports: [TriajeList],
  templateUrl: './reporte-listado-vacuno.html',
  styleUrl: './reporte-listado-vacuno.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoVacuno {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  fixedDateRange = signal<{desde?: string, hasta?: string}>({});

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.fixedDateRange.set({
        desde: params['desde'],
        hasta: params['hasta']
      });
    });
  }

  onViewChart(triaje: Triaje): void {
    // Navigate to the chart view for this specific vacuno
    this.router.navigate(['/sanidad/reportes/grafico-triaje', triaje.vacunoId], {
      queryParamsHandling: 'preserve'
    });
  }

  onBack(): void {
    this.router.navigate(['/sanidad/reportes']);
  }
}
