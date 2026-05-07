import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);

  constructor(private router: Router) {}

  login() {
    // Simulación de login exitoso
    this.isAuthenticated.set(true);
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }
}
