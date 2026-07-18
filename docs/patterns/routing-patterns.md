# Routing Patterns

## Lazy Loading con loadComponent

Todas las rutas usan `loadComponent` para carga diferida. No se carga código hasta que el usuario navega a la ruta.

```typescript
// app.routes.ts
export const routes: Routes = [
  // Ruta pública (sin layout)
  {
    path: '',
    loadComponent: () => import('@modules/auth/presentation/login/login.component')
      .then(m => m.LoginComponent),
    pathMatch: 'full'
  },

  // Rutas con layout (Shell)
  {
    path: '',
    component: Shell,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@modules/dashboard/presentation/dashboard-container/dashboard-container.component')
          .then(m => m.DashboardContainerComponent)
      },
      {
        path: 'sanidad/triaje',
        loadComponent: () => import('@modules/sanidad/triaje/presentation/triaje-container/triaje-container')
          .then(m => m.TriajeContainer)
      },
    ]
  },

  // Wildcard — redirige a login
  { path: '**', redirectTo: '' }
];
```

## Agregar una Nueva Ruta

1. Crea el componente en `modules/{bounded-context}/{feature}/presentation/{container}/`
2. Abre `app.routes.ts`
3. Agrega la ruta dentro del bloque `children` del Shell
4. Actualiza el sidebar si necesita navegación

```typescript
{
  path: 'reproduccion/celo',
  loadComponent: () => import('@modules/reproduccion/celo/presentation/celo-container/celo-container')
    .then(m => m.CeloContainer)
}
```

## Rutas con Parámetros

```typescript
{
  path: 'sanidad/triaje/:id',
  loadComponent: () => import('@modules/sanidad/triaje/presentation/triaje-detail/triaje-detail')
    .then(m => m.TriajeDetail)
}
```

Leer el parámetro en el componente:

```typescript
import { input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({ ... })
export class TriajeDetail {
  private route = inject(ActivatedRoute);

  // Opción 1: signal input con withComponentInputBinding
  id = input.required<string>();

  // Opción 2: desde ActivatedRoute
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
  }
}
```

## Navegación Programática

```typescript
private router = inject(Router);

// Navegar a ruta
this.router.navigate(['/dashboard']);

// Navegar con parámetros
this.router.navigate(['/sanidad/triaje', triajeId]);

// Navegar relativo al actual
this.router.navigate(['../'], { relativeTo: this.route });

// Reemplazar URL (sin historial)
this.router.navigate(['/login'], { replaceUrl: true });
```

## Guards

Guards se definen como funciones (functional guards):

```typescript
// core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/');
};
```

Uso en rutas:

```typescript
{
  path: '',
  component: Shell,
  canActivate: [authGuard],
  children: [/* rutas protegidas */]
}
```

## Rutas Actuales

| Ruta | Componente | Estado |
|---|---|---|
| `/` | LoginComponent | Funcional (simulado) |
| `/dashboard` | DashboardContainer | Skeleton |
| `/sanidad/triaje` | TriajeContainer | Skeleton |
| `/sanidad/reportes` | ReporteContainer | Skeleton |

Rutas definidas en sidebar pero **sin ruta en app.routes.ts**:
- `/sanidad/incidentes`
- `/sanidad/medicamentos`
- `/sanidad/baja`
- `/sanidad/calendario`
