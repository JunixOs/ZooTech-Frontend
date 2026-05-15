# Modules Layer — Módulos de Negocio

## Responsabilidad

Cada módulo en `modules/` representa un **bounded context** del negocio: un área con su propia lógica, modelos y UI.

**Módulos existentes:**
- `auth` — Autenticación (login)
- `dashboard` — Panel principal
- `sanidad` — Salud animal (triaje, reportes, medicamentos)
- `landing` — Página de aterrizaje
- `users` — Gestión de usuarios
- `reports` — Reportes
- `settings` — Configuración

## Arquitectura Interna de 4 Capas

Cada módulo representa un bounded context. Si el módulo tiene subfeatures reales, cada feature puede tener sus propias capas:

```
modules/{bounded-context}/{feature}/
├── domain/           ← QUÉ es el negocio (modelos, reglas)
├── application/      ← QUÉ puede hacer el usuario (casos de uso, si aplica)
├── infrastructure/   ← CÓMO se comunica (API, repos, si aplica)
└── presentation/     ← CÓMO se ve (UI)
```

Para módulos simples sin subfeatures, la estructura puede vivir directamente en `modules/{modulo}/`.

### Flujo de Dependencias

```
presentation → application → domain
             → infrastructure → domain
```

- `presentation` importa de `application` y `domain`
- `infrastructure` importa de `domain` y `application`
- `application` importa solo de `domain`
- `domain` **NO importa de nadie** — es la capa más pura

### Ejemplo Real: Sanidad

```
modules/sanidad/
├── triaje/
│   ├── domain/
│   │   └── models/
│   │       └── triaje.model.ts
│   └── presentation/
│       └── triaje-container/
└── reportes/
    ├── domain/
    │   └── models/
    │       └── reporte.model.ts
    └── presentation/
        └── reporte-container/
```

## Cuándo Crear Cada Capa

| Capa | ¿Cuándo crearla? |
|---|---|
| `domain/` | Cuando la feature tiene modelos, tipos, interfaces o reglas de negocio |
| `presentation/` | Cuando la feature tiene UI |
| `application/` | Cuando hay lógica de casos de uso compleja (múltiples repos, orquestación) |
| `infrastructure/` | Cuando hay llamadas a API o datos externos |

**No fuerces capas vacías.** Si un módulo no tiene API aún, no crees `infrastructure/`. Si la lógica es simple, no crees `application/`.

## Reglas de Importación Entre Módulos

- Un módulo **NUNCA importa de otro módulo** directamente
- La comunicación entre módulos es por **rutas** (`router.navigate`)
- Servicios compartidos van en `core/`
- Componentes compartidos van en `shared/`

## Ver Documentos por Capa

- [Domain Layer](modules-layer/domain.md) — Modelos y reglas de negocio
- [Application Layer](modules-layer/application.md) — Facades y casos de uso
- [Infrastructure Layer](modules-layer/infrastructure.md) — API clients y repos
- [Presentation Layer](modules-layer/presentation.md) — Smart containers y dumb components
