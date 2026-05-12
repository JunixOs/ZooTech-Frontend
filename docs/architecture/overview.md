# Architecture Overview

## Visión General

Zootech es un SPA (Single Page Application) para gestión ganadera. Permite administrar vacunos, producción de leche, sanidad, reproducción y más.

## Stack Técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21.2 | Framework principal |
| TypeScript | 5.9 | Lenguaje (strict mode) |
| Tailwind CSS | 4.2 | Utility-first CSS |
| SCSS | — | Estilos de componentes |
| ngx-translate | 17.0 | Internacionalización |
| Vitest | 4.0 | Unit testing |
| Lucide Angular | 1.0 | Iconos |
| RxJS | 7.8 | Streams reactivos complejos |

## Arquitectura

Angular 21 **sin NgModules**. Todo es `standalone: true`.

```
src/app/
├── core/          ← Servicios singleton globales (auth, tenant)
├── layout/        ← Shell: header, sidebar, footer
├── shared/        ← Componentes, pipes, directivas reutilizables
└── modules/       ← Módulos de negocio con 4 capas internas
    ├── domain/         ← Modelos, interfaces, reglas de negocio
    ├── application/    ← Facades, casos de uso
    ├── infrastructure/ ← API clients, repos
    └── presentation/   ← Smart containers + dumb components
```

## Decisiones Arquitectónicas Clave

### 1. Standalone Components (sin NgModules)

Angular 21 permite componentes standalone. No hay `NgModule` en todo el proyecto. Cada componente declara sus imports directamente.

```typescript
@Component({
  standalone: true,  // implícito en Angular 21
  imports: [CommonModule, RouterOutlet],
  // ...
})
```

### 2. OnPush como Default

Todos los componentes usan `ChangeDetectionStrategy.OnPush`. Esto obliga a usar Signals e inmutabilidad, mejorando performance.

### 3. Signals Primero

El estado se maneja con Angular Signals. RxJS solo para streams complejos (debounce, combineLatest, etc.).

```typescript
// Estado simple → Signal
items = signal<Item[]>([]);

// Stream complejo → RxJS
search$ = new Subject<string>().pipe(debounceTime(300));
```

### 4. Lazy Loading con loadComponent

Todas las rutas usan `loadComponent` para carga diferida. No hay `loadChildren` con módulos.

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./modules/dashboard/presentation/...')
    .then(m => m.DashboardContainerComponent)
}
```

### 5. Path Aliases

Nunca imports relativos profundos. Usa los alias configurados:

| Alias | Apunta a |
|---|---|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@modules/*` | `src/app/modules/*` |
| `@env/*` | `src/environments/*` |

### 6. i18n Obligatorio

No hay texto hardcodeado en templates. Todo pasa por el pipe `translate` con keys en `assets/i18n/{es,en,pt}.json`.

## Entry Point

```
src/main.ts
  → bootstrapApplication(App, appConfig)
    → app.config.ts (providers globales)
    → app.routes.ts (rutas)
```

## Módulos Existentes

| Módulo | Estado | Rutas |
|---|---|---|
| `auth` | Login funcional (simulado) | `/` |
| `dashboard` | Skeleton | `/dashboard` |
| `sanidad` | En desarrollo | `/sanidad/triaje`, `/sanidad/reportes` |
| `landing` | Skeleton | — |
| `users` | Skeleton | — |
| `reports` | Skeleton | — |
| `settings` | Skeleton | — |
