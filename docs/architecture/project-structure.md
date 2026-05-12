# Project Structure

## Mapa Completo del Proyecto

```
Zootech-frontend/
├── src/
│   ├── app/
│   │   ├── app.config.ts              ← Configuración global (providers)
│   │   ├── app.routes.ts              ← Definición de rutas
│   │   ├── app.component.ts           ← Root component
│   │   │
│   │   ├── core/                      ← SERVICIOS GLOBALES (singleton)
│   │   │   ├── auth/
│   │   │   │   └── auth.service.ts    ← Autenticación, estado de sesión
│   │   │   └── tenant/
│   │   │       └── tenant.service.ts  ← Multi-tenant, contexto de finca
│   │   │
│   │   ├── layout/                    ← SHELL DE LA APP
│   │   │   ├── shell/
│   │   │   │   ├── shell.ts           ← Componente layout principal
│   │   │   │   ├── shell.html         ← Template: header + sidebar + router-outlet + footer
│   │   │   │   └── shell.scss         ← Estilos del layout
│   │   │   ├── header/
│   │   │   │   ├── header.ts
│   │   │   │   ├── header.html
│   │   │   │   └── header.scss
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.ts         ← Navegación con signal<NavSection[]>
│   │   │   │   ├── sidebar.html
│   │   │   │   ├── sidebar.scss
│   │   │   │   ├── models/
│   │   │   │   │   └── nav-item.model.ts
│   │   │   │   └── components/
│   │   │   │       └── sidebar-nav-item/
│   │   │   └── footer/
│   │   │       ├── footer.ts
│   │   │       ├── footer.html
│   │   │       └── footer.scss
│   │   │
│   │   ├── shared/                    ← REUTILIZABLE EN TODA LA APP
│   │   │   ├── ui/                    ← Componentes UI dumb
│   │   │   │   └── button.component.ts  ← zt-button
│   │   │   ├── directives/            ← Directivas custom
│   │   │   ├── pipes/                 ← Pipes custom
│   │   │   └── utils/                 ← Funciones puras
│   │   │       └── date-formatter.ts
│   │   │
│   │   └── modules/                   ← MÓDULOS DE NEGOCIO
│   │       ├── auth/                  ← Login
│   │       │   └── presentation/
│   │       │       └── login/
│   │       │           ├── login.component.ts
│   │       │           ├── login.html
│   │       │           └── login.scss
│   │       ├── dashboard/             ← Dashboard
│   │       │   └── presentation/
│   │       │       └── dashboard-container/
│   │       ├── sanidad/               ← Salud animal (módulo más avanzado)
│   │       │   ├── domain/
│   │       │   │   └── models/
│   │       │   │       ├── triaje.model.ts
│   │       │   │       └── reporte.model.ts
│   │       │   ├── data/              ← Infraestructura (vacío por ahora)
│   │       │   └── presentation/
│   │       │       ├── triaje-container/
│   │       │       │   ├── triaje-container.ts    ← Smart component
│   │       │       │   ├── triaje-container.html
│   │       │       │   ├── triaje-container.scss
│   │       │       │   ├── triaje-list/           ← Dumb component
│   │       │       │   ├── triaje-form/           ← Dumb component
│   │       │       │   └── triaje-detail/         ← Dumb component
│   │       │       └── reporte-container/
│   │       ├── landing/
│   │       ├── users/
│   │       ├── reports/
│   │       └── settings/
│   │
│   ├── assets/
│   │   └── i18n/
│   │       ├── es.json                ← Traducciones español
│   │       ├── en.json                ← Traducciones inglés
│   │       └── pt.json                ← Traducciones portugués
│   │
│   ├── styles.scss                    ← Estilos globales + Tailwind + tema
│   └── main.ts                        ← Entry point
│
├── angular.json                       ← Configuración de Angular CLI
├── tsconfig.json                      ← TypeScript root config
├── package.json                       ← Dependencias y scripts
└── docs/                              ← Documentación (esto)
```

## Qué Va en Cada Nivel

| Nivel | Responsabilidad | Ejemplo |
|---|---|---|
| `core/` | Servicios singleton que toda la app necesita | AuthService, TenantService, interceptors HTTP, guards |
| `layout/` | Estructura visual de la app (no lógica de negocio) | Shell, Header, Sidebar, Footer |
| `shared/` | Código reutilizable entre módulos | zt-button, pipes de formato, validadores, utilidades |
| `modules/{x}/domain/` | Qué es el negocio (modelos, reglas) | Interfaces, clases con lógica de negocio, enums |
| `modules/{x}/application/` | Qué puede hacer el usuario | Facades, servicios de casos de uso |
| `modules/{x}/infrastructure/` | Cómo se comunica con el exterior | API clients, implementaciones de repos, mappers |
| `modules/{x}/presentation/` | Cómo se ve | Containers (smart), componentes UI (dumb) |

## Reglas de Importación

```
core/        → puede importar solo de shared/
layout/      → puede importar de core/, shared/
shared/      → NO importa de modules/ ni core/ (solo utilidades puras)
modules/     → puede importar de core/, shared/
  domain/    → NO importa de NINGUNA otra capa (es la más pura)
  application/ → importa de domain/
  infrastructure/ → importa de domain/, application/
  presentation/ → importa de domain/, application/
```

**Regla de oro:** las capas internas de un módulo NUNCA importan de otro módulo. La comunicación entre módulos es solo por rutas o servicios de `core/`.
