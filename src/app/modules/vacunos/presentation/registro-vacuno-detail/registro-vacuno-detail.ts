import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@core/notifications/toast.service';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunoRegistroDetalle } from '../../domain/models/reporte-vacuno.model';

@Component({
  selector: 'zt-registro-vacuno-detail',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './registro-vacuno-detail.html',
  styleUrl: './registro-vacuno-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroVacunoDetail implements OnInit {
  readonly vacunoId = input.required<number>();

  private readonly facade = inject(ReporteVacunoFacade);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly registro = this.facade.registroSignal;
  readonly loading = this.facade.loadingSignal;
  readonly error = this.facade.errorSignal;
  readonly downloadOpen = signal(false);

  ngOnInit(): void {
    void this.facade.cargarRegistro(Number(this.vacunoId()));
  }

  async descargar(formato: 'excel' | 'pdf'): Promise<void> {
    this.downloadOpen.set(false);
    const url = await this.facade.generarArchivo(Number(this.vacunoId()), formato);

    if (!url) return;

    window.open(url, '_blank', 'noopener,noreferrer');
    this.toast.success(this.translate.instant('vacunos.reportes.toast.downloadSuccess'));
    void this.router.navigate(['/vacunos/reportes']);
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes/listado']);
  }

  toggleDownload(): void {
    this.downloadOpen.update((open) => !open);
  }

  value(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  }

  procedencia(vacuno: VacunoRegistroDetalle): string {
    return [
      vacuno.procedencia,
      vacuno.granja,
      vacuno.distrito,
      vacuno.provincia,
      vacuno.departamento,
    ]
      .filter((item) => !!item)
      .join(' - ');
  }
}
