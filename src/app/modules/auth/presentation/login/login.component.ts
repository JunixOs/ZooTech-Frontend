import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'zt-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="login-page">
      <section class="login-card" aria-label="Acceso a Zootech">
        <div class="login-header">
          <div class="logo-icon">ZT</div>
          <h1>Zootech</h1>
          <p>Ingrese con sus credenciales para continuar.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <label class="form-group" for="email">
            <span>Email</span>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="loginData.email"
              required
              email
              autocomplete="username"
              placeholder="admin@zootech.com"
            />
          </label>

          <label class="form-group" for="password">
            <span>Contrasena</span>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="loginData.password"
              required
              autocomplete="current-password"
              placeholder="Zootech2026!"
            />
          </label>

          @if (errorMessage) {
            <p class="error-message">{{ errorMessage }}</p>
          }

          <button type="submit" [disabled]="!loginForm.form.valid || isSubmitting" class="btn-submit">
            @if (isSubmitting) {
              Validando...
            } @else {
              Entrar al sistema
            }
          </button>
        </form>

        <p class="demo-credentials">Demo: admin@zootech.com / Zootech2026!</p>
      </section>
    </main>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background:
          linear-gradient(rgba(255, 255, 255, 0.86), rgba(248, 240, 243, 0.9)),
          url('https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1800&q=80');
        background-size: cover;
        background-position: center;
      }

      .login-card {
        width: min(100%, 420px);
        padding: 32px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 20px 35px rgba(15, 23, 42, 0.14);
      }

      .login-header {
        text-align: center;
        margin-bottom: 28px;
      }

      .logo-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: #802b4d;
        color: #ffffff;
        font-size: 22px;
        font-weight: 800;
      }

      h1 {
        margin: 0 0 8px;
        color: #1e293b;
        font-size: 32px;
      }

      .login-header p,
      .demo-credentials {
        color: #64748b;
        font-size: 14px;
      }

      .form-group {
        display: block;
        margin-bottom: 18px;
      }

      .form-group span {
        display: block;
        margin-bottom: 8px;
        color: #1e293b;
        font-size: 14px;
        font-weight: 700;
      }

      input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #f8fafc;
        color: #0f172a;
        font-size: 15px;
      }

      input:focus {
        outline: 2px solid rgba(128, 43, 77, 0.22);
        border-color: #802b4d;
        background: #ffffff;
      }

      .error-message {
        margin: 0 0 14px;
        color: #be123c;
        font-size: 14px;
        font-weight: 700;
      }

      .btn-submit {
        width: 100%;
        min-height: 46px;
        border: 0;
        border-radius: 6px;
        background: #802b4d;
        color: #ffffff;
        cursor: pointer;
        font-size: 15px;
        font-weight: 800;
      }

      .btn-submit:hover:not(:disabled) {
        background: #641e3a;
      }

      .btn-submit:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }

      .demo-credentials {
        margin-top: 20px;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  loginData = {
    email: 'admin@zootech.com',
    password: 'Zootech2026!',
  };

  isSubmitting = false;
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService
      .login(this.loginData.email, this.loginData.password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        error: () => {
          this.errorMessage = 'Credenciales invalidas. Revise email y contrasena.';
        },
      });
  }
}
