import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VacunoService } from '../../application/vacuno.service';

@Component({
  selector: 'zt-vacuno-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vacuno-detail.html',
  styleUrl: './vacuno-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly vacunoService = inject(VacunoService);

  readonly vacuno = computed(() => {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    return codigo ? this.vacunoService.findByCodigo(codigo) : undefined;
  });

  formatDate(value: string | undefined): string {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}
