import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { email } from '@angular/forms/signals';
import { AuthApiService } from '@modules/auth/infrastructure/auth-api.service';
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
  private authService = inject(AuthApiService);

  loginData = {
    email: '',
    password: '',
  };

  onSubmit() {
    this.authService.login(this.loginData.email, this.loginData.password);
  }
}
