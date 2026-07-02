import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-fecundacion-edit-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './fecundacion-edit-button.html',
  styleUrl: './fecundacion-edit-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FecundacionEditButton {
  @Input({ required: true }) fecundacionId!: number;

  private readonly router = inject(Router);

  editar(): void {
    void this.router.navigate(['/reproduccion/fecundacion/editar', this.fecundacionId]);
  }
}
