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
import { VacunosFacade } from '@modules/vacunos/application/vacunos.facade';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ButtonComponent } from '@shared/ui/button.component';
import { Vacuno } from '../../domain/models/vacuno.model';

@Component({
  selector: 'zt-vacuno-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, PageHeaderComponent, ButtonComponent],
  templateUrl: './vacuno-detail.html',
  styleUrl: './vacuno-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vacunosFacade = inject(VacunosFacade);
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
    this.vacunosFacade
      .obtenerVacuno(codigo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
          this.deleteError.set(
            err?.error?.error?.message ??
              this.translate.instant('vacunos.detail.errors.errorEliminar'),
          );
        },
      });
  }
}
