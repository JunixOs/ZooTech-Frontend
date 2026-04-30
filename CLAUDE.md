# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `Zootech-frontend/`:

```bash
npm install          # Install dependencies
npm start            # Dev server at http://localhost:4200
npm run build        # Production build to /dist
npm run watch        # Watch mode (development config)
npm test             # Run Vitest unit tests
```

Generate a new component (Angular CLI):
```bash
ng generate component modules/<bounded-context>/presentation/<name>
```

## Architecture

**Zootech** is an Angular 21 enterprise management system using Clean Architecture with Bounded Contexts. All components are Standalone (no NgModules). State is managed via Angular Signals — no RxJS-based stores.

### Layer structure

```
src/app/
├── core/         # Root-scoped singletons — AuthService, TenantService, guards, interceptors, i18n
├── shared/       # Feature-agnostic reusables — UI components, pipes, directives, utils
├── layout/       # Shell, Header, Sidebar, Footer (the app chrome)
└── modules/      # Bounded contexts: auth, dashboard, users, reports, settings, landing
    └── <context>/
        ├── domain/          # Entities, business rules
        ├── application/     # Facades, use cases
        ├── infrastructure/  # API clients, repositories
        └── presentation/    # Angular components
```

### Bootstrap & routing chain

`main.ts` bootstraps `AppComponent` with `appConfig` (defined in `app.config.ts`), which provides the router, HttpClient with interceptors, zone change detection with event coalescing, and ngx-translate with the HTTP loader.

`app.routes.ts` has two top-level route groups:
- Default `''` → `LoginComponent` (lazy-loaded)
- `''` with `ShellComponent` as parent → child routes `/dashboard`, `/users`, `/reports`, `/settings`

`AuthService.login()` sets the `isAuthenticated` signal and navigates to `/dashboard`.

### Key conventions

- **Component prefix**: `zt-` (enforced in `angular.json`)
- **Path aliases**: `@core/*`, `@shared/*`, `@modules/*`, `@env/*` — always use these over relative paths
- **Styling**: Vanilla SCSS only; CSS variables for the Rose & Mauve glassmorphism theme are defined in `:root` inside `src/styles.scss`
- **i18n**: All user-visible strings must use `ngx-translate`. Translation keys live in `src/assets/i18n/{es,en,pt}.json`; Spanish (`es`) is the fallback language
- **Signals-first**: prefer `signal()` / `computed()` / `effect()` over RxJS for new state

### TypeScript

Strict mode is enabled (`strict`, `noImplicitOverride`, `noImplicitReturns`, `strictTemplates`). Target is ES2022. Prettier formats with 100-char print width and single quotes.
