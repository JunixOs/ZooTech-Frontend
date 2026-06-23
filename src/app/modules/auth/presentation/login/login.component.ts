import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-login',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  loading = signal(false);

  loginData = {
    email: '',
    password: '',
  };

  onSubmit() {
    if (this.loading()) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage.set('Usuario o contraseña incorrectos');
        this.loading.set(false);
      },
    });
  }
}
