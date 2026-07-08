import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-back-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  private readonly router = inject(Router);

  /** Ruta a la que navega al hacer clic (por defecto: volver a la lista de reportes) */
  route = input<string>('/sanidad/reportes');

  onBack(): void {
    this.router.navigate([this.route()]);
  }
}