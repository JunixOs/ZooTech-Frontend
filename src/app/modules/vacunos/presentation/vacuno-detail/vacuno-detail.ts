import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VacunoService } from '../../application/vacuno.service';

@Component({
  selector: 'zt-vacuno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vacuno-detail.html',
  styleUrl: './vacuno-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vacunoService = inject(VacunoService);
  readonly isDeleteModalOpen = signal(false);
  readonly deleteReason = signal('');
  readonly deleteError = signal('');

  readonly vacuno = computed(() => {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    return codigo ? this.vacunoService.findByCodigo(codigo) : undefined;
  });

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
    this.isDeleteModalOpen.set(false);
    this.deleteError.set('');
  }

  confirmDelete(): void {
    const currentVacuno = this.vacuno();
    const reason = this.deleteReason().trim();

    if (!currentVacuno) {
      return;
    }

    if (!reason) {
      this.deleteError.set('Ingrese una razon de eliminacion.');
      return;
    }

    const deleted = this.vacunoService.deleteByCodigo(currentVacuno.codigo, reason);

    if (deleted) {
      void this.router.navigate(['/vacunos/listado'], {
        queryParams: { deleted: currentVacuno.codigo },
      });
    }
  }
}
