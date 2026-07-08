import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { BackButtonComponent } from '@shared/components/back-button/back-button';

import { FecundacionFacade } from '../../application/facades/fecundacion.facade';
import { FecundacionEdit, FecundacionVacunoResumen } from '../../domain/models/fecundacion.model';

@Component({
  selector: 'zt-fecundacion-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, PageHeaderComponent, BackButtonComponent],
  templateUrl: './fecundacion-detail.html',
  styleUrl: './fecundacion-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(FecundacionFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = signal<FecundacionEdit | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly isDeleteModalOpen = signal(false);
  readonly deleteReason = signal('');
  readonly deleteError = signal('');
  readonly deleteSubmitting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.error.set('reproduccion.fecundacion.detail.errors.invalidId');
      return;
    }

    this.loading.set(true);
    this.facade.obtenerParaEditar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.item.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('reproduccion.fecundacion.detail.errors.load');
          this.loading.set(false);
        },
      });
  }

  editar(): void {
    const current = this.item();
    if (!current) return;
    void this.router.navigate(['/reproduccion/fecundacion/editar', current.id]);
  }

  formatDate(value: string): string {
    if (!value) return '-';
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  donorLabel(value: FecundacionVacunoResumen | string): string {
    if (typeof value === 'string') return value || '-';
    return `${value.codigo} - ${value.nombre}`;
  }

  esTipoIA(tipo: string | null | undefined): boolean {
    return this.matchesTipo(tipo, ['IA', 'INSEMINACION', 'INSEMINACION_ARTIFICIAL']);
  }

  esTipoTE(tipo: string | null | undefined): boolean {
    return this.matchesTipo(tipo, ['TE', 'TRANSFERENCIA', 'TRANSFERENCIA_EMBRION', 'TRANSFERENCIA_EMBRIONES']);
  }

  openDeleteModal(): void {
    this.deleteReason.set('');
    this.deleteError.set('');
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.deleteSubmitting()) return;
    this.isDeleteModalOpen.set(false);
    this.deleteError.set('');
  }

  confirmDelete(): void {
    const current = this.item();
    const reason = this.deleteReason().trim();
    if (!current) return;

    if (!reason) {
      this.deleteError.set('reproduccion.fecundacion.detail.errors.reasonRequired');
      return;
    }

    this.deleteSubmitting.set(true);
    this.deleteError.set('');

    this.facade.eliminar(current.id, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteSubmitting.set(false);
          this.isDeleteModalOpen.set(false);
          void this.router.navigate(['/reproduccion/fecundacion'], {
            queryParams: { deleted: current.codigo },
          });
        },
        error: (err) => {
          this.deleteSubmitting.set(false);
          this.deleteError.set(
            err?.error?.error?.message ??
              err?.error?.message ??
              'reproduccion.fecundacion.detail.errors.delete',
          );
        },
      });
  }

  private matchesTipo(value: string | null | undefined, candidates: string[]): boolean {
    const normalized = this.normalizeTipo(value);
    return candidates.some((candidate) => normalized.includes(this.normalizeTipo(candidate)));
  }

  private normalizeTipo(value: string | null | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toUpperCase();
  }
}
