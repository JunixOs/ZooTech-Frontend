import { inject, Injectable, signal } from "@angular/core";
import { AuthApiService } from "../infrastructure/auth-api.service";
import { AuthService } from "@core/auth/auth.service";

@Injectable({
    providedIn: 'root',
})
export class AuthFacade {
    private readonly api = inject(AuthApiService);
    private readonly coreAuthService = inject(AuthService);

    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);

    inicioSesionUsuario(correo: string, password: string): void {
        let accessToken = '';
        this.isLoading.set(true);
        this.error.set(null);
        this.api.login(correo , password).subscribe({
            next: (data) => {
                accessToken = data;
                this.isLoading.set(false);
            },
            error: (err: Error) => {
                this.error.set(err.message);
                this.isLoading.set(false);
            },
        });

        if(accessToken?.trim()){
            this.coreAuthService.saveToken(accessToken);
        } else {
            this.error.set('Ocurrio un error al autenticar');
        }
    }
}