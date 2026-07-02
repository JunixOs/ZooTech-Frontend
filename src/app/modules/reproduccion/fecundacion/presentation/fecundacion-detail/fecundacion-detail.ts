import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ButtonComponent } from '@shared/ui/button.component';

interface FecundacionDetailItem {
  id: number;
  codigo: string;
  tipo: string;
  vacunoReceptor: string;
  fechaProcedimiento: string;
  responsable: string;
  resultado: string;
  observaciones: string | null;
}

interface ApiResponse<T> { data: T; success: boolean; errorMessage: string | null; }

@Component({
  selector: 'zt-fecundacion-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, PageHeaderComponent, ButtonComponent],
  templateUrl: './fecundacion-detail.html',
  styleUrl: './fecundacion-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = signal<FecundacionDetailItem | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly isDeleteModalOpen = signal(false);
  readonly deleteReason = signal('');
  readonly deleteError = signal('');
  readonly deleteSubmitting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      this.error.set('reproduccion.fecundacion.detail.errors.invalidId');
      return;
    }

    this.loading.set(true);
    this.http.get<ApiResponse<FecundacionDetailItem>>(`${environment.apiUrl}/api/v1/fecundacion/${id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.item.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('reproduccion.fecundacion.detail.errors.notFound');
          this.loading.set(false);
        },
      });
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
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
    if (!current) return;

    this.deleteSubmitting.set(true);
    this.deleteError.set('');

    this.http.delete<void>(`${environment.apiUrl}/api/v1/fecundacion/${current.id}`, {
      body: { razon: this.deleteReason().trim() || null },
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteSubmitting.set(false);
          this.isDeleteModalOpen.set(false);
          void this.router.navigate(['/reproduccion/fecundacion'], {
            queryParams: { deleted: current.codigo },
          });
        },
        error: err => {
          this.deleteSubmitting.set(false);
          this.deleteError.set(err?.error?.error?.message ?? 'reproduccion.fecundacion.status.deleteError');
        },
      });
  }
}
