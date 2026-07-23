import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@core/notifications/toast.service';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunoRegistroDetalle } from '../../domain/models/reporte-vacuno.model';
import { BackButtonComponent } from '@shared/components/back-button/back-button';
import { saveBlob } from '@shared/utils/export-table.util';
import { VacunoDetailFieldComponent } from '../shared/vacuno-detail-field/vacuno-detail-field';
import { VacunoDetailSectionComponent } from '../shared/vacuno-detail-section/vacuno-detail-section';

@Component({
  selector: 'zt-registro-vacuno-detail',
  standalone: true,
  imports: [
    TranslatePipe,
    BackButtonComponent,
    DownloadButtonComponent,
    PageHeaderComponent,
    VacunoDetailFieldComponent,
    VacunoDetailSectionComponent,
  ],
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
  readonly breadcrumbDetail = computed(() => {
    const vacuno = this.registro()?.vacuno;

    if (!vacuno) {
      return `#${this.vacunoId()}`;
    }

    return [vacuno.codigo, vacuno.nombre].filter(Boolean).join(' - ');
  });

  ngOnInit(): void {
    void this.facade.cargarRegistro(Number(this.vacunoId()));
  }

  async descargar(formato: 'excel' | 'pdf'): Promise<void> {
    const report = await this.facade.generarArchivo(Number(this.vacunoId()), formato);

    if (!report) return;

    saveBlob(report.blob, report.fileName);
    this.toast.success(this.translate.instant('vacunos.reportes.toast.downloadSuccess'));
    void this.router.navigate(['/vacunos/reportes']);
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes/listado']);
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
