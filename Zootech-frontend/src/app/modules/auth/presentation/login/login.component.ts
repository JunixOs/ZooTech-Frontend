import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'zt-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="glass-decoration decoration-1"></div>
      <div class="glass-decoration decoration-2"></div>
      
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">ZT</div>
          <h1>Zootech</h1>
          <p>Bienvenido de nuevo. Por favor, ingresa tus datos.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="loginData.email" 
              required 
              email
              placeholder="admin@zootech.com"
            >
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="loginData.password" 
              required
              placeholder="••••••••"
            >
          </div>

          <button type="submit" [disabled]="!loginForm.form.valid" class="btn-submit">
            Entrar al Sistema
          </button>
        </form>

        <div class="login-footer">
          <p>¿Problemas para acceder? <a href="#">Contacta a soporte</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(rgba(255, 241, 242, 0.8), rgba(255, 228, 230, 0.8)), 
                  url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
    }

    .glass-decoration {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      z-index: 0;
    }
    .decoration-1 {
      width: 400px;
      height: 400px;
      background: rgba(219, 39, 119, 0.2);
      top: -100px;
      right: -100px;
    }
    .decoration-2 {
      width: 300px;
      height: 300px;
      background: rgba(139, 92, 246, 0.15);
      bottom: -50px;
      left: -50px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(157, 23, 77, 0.1);
      z-index: 1;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .login-header { text-align: center; margin-bottom: 2.5rem; }
    
    .logo-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #db2777 0%, #8b5cf6 100%);
      color: white;
      font-weight: 800;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      margin: 0 auto 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(219, 39, 119, 0.3);
    }

    .login-header h1 { 
      color: #9d174d; 
      font-size: 2.25rem; 
      margin-bottom: 0.5rem; 
      letter-spacing: -0.025em;
    }
    
    .login-header p { color: #64748b; font-size: 0.95rem; }

    .form-group { margin-bottom: 1.5rem; }
    .form-group label { 
      display: block; 
      margin-bottom: 0.5rem; 
      font-weight: 600; 
      font-size: 0.875rem; 
      color: #1e293b; 
    }

    input {
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: 2px solid #f1f5f9;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s;
      background: #f8fafc;
    }

    input:focus { 
      outline: none; 
      border-color: #fbcfe8; 
      background: white;
      box-shadow: 0 0 0 4px rgba(219, 39, 119, 0.1);
    }

    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 1rem;
    }

    .btn-submit:hover:not(:disabled) { 
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(219, 39, 119, 0.4);
    }

    .btn-submit:active:not(:disabled) { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .login-footer { text-align: center; margin-top: 2rem; }
    .login-footer p { font-size: 0.875rem; color: #64748b; }
    .login-footer a { 
      color: #db2777; 
      text-decoration: none; 
      font-weight: 600;
      transition: color 0.2s;
    }
    .login-footer a:hover { color: #9d174d; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);

  loginData = {
    email: '',
    password: ''
  };

  onSubmit() {
    this.authService.login();
  }
}
