import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { VacunoService } from '../../application/vacuno.service';

@Component({
  selector: 'zt-vacunos-container',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './vacunos-container.component.html',
  styleUrl: './vacunos-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunosContainerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly vacunoService = inject(VacunoService);

  readonly vacunos = this.vacunoService.vacunos;
  readonly deletedCodigo = computed(() => this.route.snapshot.queryParamMap.get('deleted'));

  formatDate(value: string): string {
    return this.vacunoService.formatDate(value);
  }
}
