import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { VacunosFacade } from '@modules/vacunos/application/facades/vacunos.facade';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ButtonComponent } from '@shared/ui/button.component';

import { Vacuno } from '../../domain/models/vacuno.model';
import { EstadoFecundacionApiService } from '../../../reproduccion/fecundacion/infrastructure/services/estado-fecundacion.service';
import { VacunoDetailFieldComponent } from '../shared/vacuno-detail-field/vacuno-detail-field';
import { VacunoDetailSectionComponent } from '../shared/vacuno-detail-section/vacuno-detail-section';

@Component({
  selector: 'zt-vacuno-detail',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    PageHeaderComponent,
    ButtonComponent,
    VacunoDetailFieldComponent,
    VacunoDetailSectionComponent,
  ],
  templateUrl: './vacuno-detail.html',
  styleUrl: './vacuno-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vacunosFacade = inject(VacunosFacade);
  private readonly apiService = inject(EstadoFecundacionApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly vacuno = signal<Vacuno | null>(null);
  readonly estadoReproductivo = signal<any>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly isDeleteModalOpen = signal(false);
  readonly deleteReason = signal('');
  readonly deleteError = signal('');
  readonly deleteSubmitting = signal(false);

  ngOnInit(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo');

    if (!codigo) {
      this.error.set(this.translate.instant('vacunos.detail.errors.codigoInvalido'));
      return;
    }

    this.loading.set(true);
    this.vacunosFacade
      .obtenerVacuno(codigo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vacuno) => {
          this.vacuno.set(vacuno);
          this.loading.set(false);
          if (vacuno.sexo === 'HEMBRA' && vacuno.id !== undefined) {
            this.cargarEstadoReproductivo(vacuno.id);
          }
        },
        error: () => {
          this.error.set(this.translate.instant('vacunos.detail.errors.noEncontrado'));
          this.loading.set(false);
        },
      });
  }

  cargarEstadoReproductivo(id: number | string): void {
    this.apiService.obtenerEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (estado: any) => {
          this.estadoReproductivo.set(estado);
        },
        error: () => {
          this.estadoReproductivo.set(null);
        }
      });
  }

  formatDate(value: string | Date | undefined): string {
    if (!value) return '';
    // Si viene como objeto Date
    if (value instanceof Date) {
      const d = value;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${d.getFullYear()}`;
    }
    // Si viene como ISO completo "2026-07-05T16:05:22..."
    const str = String(value);
    if (str.includes('T')) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}/${date.getFullYear()}`;
      }
    }
    // Si viene como "yyyy-MM-dd"
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
  }

  openDeleteModal(): void {
    this.deleteReason.set('');
    this.deleteError.set('');
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.deleteSubmitting()) {
      return;
    }

    this.isDeleteModalOpen.set(false);
    this.deleteError.set('');
    this.deleteReason.set('');
  }

  confirmDelete(): void {
    const current = this.vacuno();
    const reason = this.deleteReason().trim();

    if (!current) {
      return;
    }

    if (!reason) {
      this.deleteError.set(this.translate.instant('vacunos.detail.errors.razonRequerida'));
      return;
    }

    this.deleteSubmitting.set(true);
    this.deleteError.set('');

    this.vacunosFacade
      .eliminarVacuno(current.codigo, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteSubmitting.set(false);
          this.isDeleteModalOpen.set(false);
          void this.router.navigate(['/vacunos/listado'], {
            queryParams: { deleted: current.codigo },
          });
        },
        error: (err) => {
          this.deleteSubmitting.set(false);
          if (err?.status === 409 || err?.status === 422) {
            this.deleteError.set('No se puede eliminar el vacuno porque cuenta con registros asociados activos (triajes, ordeños, incidentes).');
          } else {
            this.deleteError.set(
              err?.error?.error?.message ??
                err?.error?.message ??
                this.translate.instant('vacunos.detail.errors.errorEliminar'),
            );
          }
        },
      });
  }

  private getDeleteErrorMessage(err: unknown): string {
    const status = this.getErrorStatus(err);

    switch (status) {
      case 400:
        return this.translate.instant('vacunos.detail.errors.errorEliminar400');
      case 404:
        return this.translate.instant('vacunos.detail.errors.errorEliminar404');
      case 409:
        return this.translate.instant('vacunos.detail.errors.errorEliminar409');
      case 500:
        return this.translate.instant('vacunos.detail.errors.errorEliminar500');
      default:
        return err instanceof Error && err.message
          ? err.message
          : this.translate.instant('vacunos.detail.errors.errorEliminar');
    }
  }

  private getErrorStatus(err: unknown): number | null {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = Number((err as { status?: unknown }).status);
      return Number.isFinite(status) ? status : null;
    }

    return null;
  }
}
