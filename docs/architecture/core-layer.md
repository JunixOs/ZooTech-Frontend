# Core Layer

## Responsabilidad

La capa `core/` contiene servicios **singleton globales** que toda la aplicación necesita. Son servicios con `providedIn: 'root'` que viven durante toda la vida de la app.

**Qué SÍ va aquí:**
- Autenticación y autorización
- Contexto de tenant/finca
- Interceptors HTTP
- Guards de rutas
- Servicios de configuración global

**Qué NO va aquí:**
- Lógica de negocio específica de un módulo
- Componentes UI
- Utilidades puras (van en `shared/utils/`)

## Estructura

```
src/app/core/
├── auth/
│   └── auth.service.ts
└── tenant/
    └── tenant.service.ts
```

## Ejemplo: AuthService

```typescript
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor(private router: Router) {}

  login(credentials: Credentials) {
    // Llamada a API, setear señales
    this.isAuthenticated.set(true);
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}
```

### Puntos clave:
- `providedIn: 'root'` → singleton global, un sola instancia
- **Signals** para estado reactivo
- El Router se inyecta en el constructor
- No tiene imports de módulos

## Ejemplo: HTTP Interceptor

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

Se registra en `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

## Cómo Usar un Servicio de Core

En cualquier componente o servicio:

```typescript
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

@Component({ ... })
export class MiComponente {
  private auth = inject(AuthService);

  isLoggedIn = computed(() => this.auth.isAuthenticated());
}
```

Usa `inject()` fuera del constructor cuando sea posible (Angular 21 lo permite en field initializers).

## Import Rules

- `core/` puede importar de `shared/`
- `core/` NO importa de `modules/`
- `core/` NO importa de `layout/`
