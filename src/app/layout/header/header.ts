import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'zt-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly authService = inject(AuthService);

  hamburgerClick = output<void>();

  logout(): void {
    this.authService.logout();
  }
}
