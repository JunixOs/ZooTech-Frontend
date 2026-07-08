import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthFacade } from '@modules/auth/application/auth.facade';
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
  readonly authFacade = inject(AuthFacade);

  loginData = {
    email: '',
    password: '',
  };

  onSubmit() {
    this.authFacade.inicioSesionUsuario(this.loginData.email, this.loginData.password);
  }
}
