import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'zt-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
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
