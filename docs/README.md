# Zootech Frontend — Documentación

Sistema de gestión ganadera. Angular 21 standalone SPA.

## Quick Start

| Para... | Ve a |
|---------|------|
| Configurar tu entorno | [Getting Started](guides/getting-started.md) |
| Entender la arquitectura | [Overview](architecture/overview.md) |
| Saber dónde va cada archivo | [Project Structure](architecture/project-structure.md) |
| Agregar una feature nueva | [Adding Feature](guides/adding-feature.md) |
| Crear un módulo nuevo | [Adding Module](guides/adding-module.md) |
| Crear un componente | [Adding Component](guides/adding-component.md) |
| Convenciones de código | [Naming](conventions/naming.md) |
| Git workflow | [Git Workflow](conventions/git-workflow.md) |

## Estructura de la Documentación

```
docs/
├── architecture/        ← Cómo está construido el sistema
│   ├── overview.md                    ← Visión general
│   ├── project-structure.md           ← Mapa del árbol completo
│   ├── core-layer.md                  ← Servicios singleton
│   ├── shared-layer.md                ← Componentes reutilizables
│   ├── layout-layer.md                ← Shell de la app
│   ├── modules-layer.md               ← Módulos de negocio
│   └── modules-layer/
│       ├── domain.md                  ← Modelos y reglas de negocio
│       ├── application.md             ← Facades y casos de uso
│       ├── infrastructure.md          ← API clients y repos
│       └── presentation.md            ← UI containers y componentes
│
├── patterns/            ← Patrones de diseño y código
│   ├── component-patterns.md          ← Smart/dumb, container/presentational
│   ├── state-management.md            ← Signals vs RxJS
│   ├── routing-patterns.md            ← Lazy loading, guards
│   └── styling-patterns.md            ← SCSS + Tailwind
│
├── modules/             ← Documentación por módulo de negocio
│   └── _template.md                   ← Template para nuevos módulos
│
├── guides/              ← Guías paso a paso
│   ├── getting-started.md             ← Setup del proyecto
│   ├── adding-feature.md              ← Cómo agregar features
│   ├── adding-module.md               ← Scaffold de módulo
│   ├── adding-component.md            ← Dónde meter componentes
│   └── testing.md                     ← Tests
│
└── conventions/         ← Reglas y estándares
    ├── naming.md                      ← Naming de archivos, clases, etc.
    ├── typescript.md                  ← TypeScript strict patterns
    ├── git-workflow.md                ← Branches, commits, PRs
    └── i18n.md                        ← Internacionalización
```

## Stack

- **Angular 21** — Standalone components, Signals, OnPush
- **Tailwind CSS v4** — Utility-first styling
- **SCSS** — Preprocesador para estilos de componentes
- **ngx-translate** — i18n (es, en, pt)
- **Vitest** — Unit testing
- **Lucide Angular** — Iconos
