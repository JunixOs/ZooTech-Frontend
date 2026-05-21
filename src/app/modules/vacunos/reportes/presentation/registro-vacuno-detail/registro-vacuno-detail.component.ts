import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunoRegistroDetalle } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-registro-vacuno-detail',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './registro-vacuno-detail.component.html',
  styleUrl: './registro-vacuno-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroVacunoDetailComponent implements OnInit {
  readonly vacunoId = input.required<number>();

  private readonly facade = inject(ReporteVacunoFacade);
  private readonly router = inject(Router);

  readonly registro = this.facade.registroSignal;
  readonly loading = this.facade.loadingSignal;
  readonly error = this.facade.errorSignal;

  ngOnInit(): void {
    void this.facade.cargarRegistro(Number(this.vacunoId()));
  }

  async descargar(formato: 'excel' | 'pdf'): Promise<void> {
    const url = await this.facade.generarArchivo(Number(this.vacunoId()), formato);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes/listado']);
  }

  value(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  }

  procedencia(vacuno: VacunoRegistroDetalle): string {
    return [vacuno.procedencia, vacuno.granja, vacuno.distrito, vacuno.provincia, vacuno.departamento]
      .filter((item) => !!item)
      .join(' - ');
  }
}
