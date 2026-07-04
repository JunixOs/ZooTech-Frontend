import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Vacuno } from '../../domain/models/vacuno.model';
import { VacunosApiService } from '../../infrastructure/vacunos.api.service';

@Component({
  selector: 'zt-vacuno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './vacuno-detail.html',
  styleUrl: './vacuno-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vacunosApi = inject(VacunosApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly vacuno = signal<Vacuno | null>(null);
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
    this.vacunosApi.obtenerVacuno(codigo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (vacuno) => {
        this.vacuno.set(vacuno);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('vacunos.detail.errors.noEncontrado'));
        this.loading.set(false);
      },
    });
  }

  formatDate(value: string | undefined): string {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
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

    this.vacunosApi.eliminarVacuno(current.codigo, reason).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.deleteSubmitting.set(false);
        this.isDeleteModalOpen.set(false);
        void this.router.navigate(['/vacunos/listado'], {
          queryParams: { deleted: current.codigo },
        });
      },
      error: (err) => {
        this.deleteSubmitting.set(false);
        this.deleteError.set(this.getDeleteErrorMessage(err));
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
