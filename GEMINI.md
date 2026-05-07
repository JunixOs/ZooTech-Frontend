# Project Overview: Zootech

Zootech is a modern, enterprise-grade management system built with **Angular 21**. It follows **Clean Architecture** principles and utilizes the latest Angular features such as **Standalone Components**, **Signals**, and **Zoneless-ready configuration** (currently using `provideZoneChangeDetection` for stability).

The project is structured into bounded contexts (modules) with a clear separation of concerns across four layers:
- **Domain**: Entities, interfaces, and core business logic.
- **Application**: Use cases, facades, and state management (Services).
- **Infrastructure**: API clients, repositories, and technical implementations.
- **Presentation**: UI components (Smart/Presentational) and views.

## Technology Stack
- **Framework**: Angular 21 (Latest)
- **State Management**: Angular Signals
- **Styling**: SCSS (Vanilla)
- **i18n**: ngx-translate
- **Icons**: lucide-angular
- **Architecture**: Modular Bounded Contexts + Clean Architecture

---

## Directory Structure

```text
src/
├── app/
│   ├── core/                      # Global singletons (Auth, Tenant, HTTP, Config)
│   ├── shared/                    # Reusable UI, Pipes, Directives, Utils
│   ├── layout/                    # Architectural Shell (Header, Sidebar, Footer)
│   └── modules/                   # Feature-based Bounded Contexts
│       ├── auth/                  # Authentication module
│       ├── dashboard/             # Main dashboard module
│       ├── users/                 # User management module
│       ├── reports/               # Analytics and reporting
│       └── settings/              # System configuration
├── assets/
│   ├── i18n/                      # Translation JSON files (es, en, pt)
│   └── static/                    # Static assets
└── styles.scss                    # Global styles and resets
```

---

## Building and Running

### Development Server
Run `npm start` or `ng serve` for a dev server. Navigate to `http://localhost:4200/`.

### Production Build
Run `npm run build` or `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Testing
Run `npm test` or `ng test` to execute unit tests using **Vitest**.

---

## Development Conventions

### 1. Architecture Guidelines
- **No NgModules**: Use standalone components for everything.
- **Strict Layering**: Never import Infrastructure or Presentation logic into the Domain layer.
- **Facades**: Components should communicate with services via Facades or Application services, never directly with Repositories.

### 2. Naming and Formatting
- **Prefix**: All custom components should use the `zt` prefix (e.g., `<zt-button>`).
- **Path Aliases**: Use configured TypeScript aliases to maintain clean imports:
  - `@core/*` -> `src/app/core/*`
  - `@shared/*` -> `src/app/shared/*`
  - `@modules/*` -> `src/app/modules/*`
  - `@env/*` -> `src/environments/*`

### 3. State & Reactivity
- **Signals First**: Prioritize Angular Signals for local and global state management over RxJS where appropriate (UI state, simple data streams).
- **Zoneless Intent**: Keep the application "zoneless-ready" by avoiding reliance on manual change detection triggers.

### 4. Internationalization
- All user-facing text must be translated using `ngx-translate`.
- Add new keys to `src/assets/i18n/{es|en|pt}.json` before using them in templates.
