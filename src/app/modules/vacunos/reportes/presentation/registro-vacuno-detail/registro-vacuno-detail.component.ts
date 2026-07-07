import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@core/notifications/toast.service';
import { ReporteVacunoFacade } from '../../application/facades/reporte-vacuno.facade';
import { VacunoRegistroDetalle } from '../../domain/models/reporte-vacuno.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-registro-vacuno-detail',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent],
  templateUrl: './registro-vacuno-detail.component.html',
  styleUrl: './registro-vacuno-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroVacunoDetailComponent implements OnInit {
  readonly vacunoId = input.required<number>();

  private readonly facade = inject(ReporteVacunoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly registro = this.facade.registroSignal;
  readonly loading = this.facade.loadingSignal;
  readonly error = this.facade.errorSignal;
  readonly downloadOpen = signal(false);
  readonly listQueryParams = signal<Record<string, string>>({});

  readonly currentBreadcrumb = computed(() => {
    const reg = this.registro();
    const base = this.translate.instant('vacunos.reportes.detail.breadcrumb');
    if (!reg) return base;
    return `${base}/${reg.vacuno.codigo}-${reg.vacuno.nombre}`;
  });

  ngOnInit(): void {
    this.captureListQueryParams();
    void this.facade.cargarRegistro(Number(this.vacunoId()));
  }

  async descargar(formato: 'excel' | 'pdf'): Promise<void> {
    this.downloadOpen.set(false);
    const url = await this.facade.generarArchivo(Number(this.vacunoId()), formato);

    if (!url) return;

    window.open(url, '_blank', 'noopener,noreferrer');
    this.toast.success(this.translate.instant('vacunos.reportes.toast.downloadSuccess'));
  }

  volver(): void {
    void this.router.navigate(['/vacunos/reportes/registro'], {
      queryParams: this.listQueryParams(),
    });
  }

  toggleDownload(): void {
    this.downloadOpen.update((open) => !open);
  }

  value(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '';

    const normalized = value.includes('T') ? value.slice(0, 10) : value;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
    if (!match) return value;

    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  }

  estadoLabel(value: string | null | undefined): string {
    if (!value) return '';

    const key = `vacunos.reportes.status.${value.toLowerCase()}`;
    const translated = this.translate.instant(key);

    return translated === key ? value.toUpperCase() : translated;
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

  private captureListQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const queryParams: Record<string, string> = {};
    const keys = [
      'fechaDesde',
      'fechaHasta',
      'search',
      'codigo',
      'fechaRegistro',
      'nombre',
      'raza',
      'procedencia',
      'estado',
      'estadoRegistro',
      'page',
      'pageSize',
    ];

    keys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        queryParams[key] = value;
      }
    });

    this.listQueryParams.set(queryParams);
  }
}
