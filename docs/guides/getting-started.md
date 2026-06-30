# Getting Started

## Prerrequisitos

- **Node.js** >= 20.x
- **npm** >= 11.x (o tu package manager preferido)
- **Git**

## Setup

```bash
# 1. Clonar el repo
git clone <repo-url>
cd Zootech-frontend

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
npm start
```

El servidor arranca en `http://localhost:4200`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Dev server con hot reload en `localhost:4200` |
| `npm run build` | Build de producción → `dist/` |
| `npm run watch` | Build de desarrollo en modo watch |
| `npm test` | Correr tests unitarios con Vitest |
| `npx prettier --write .` | Formatear todo el código |

## Estructura Rápida

```
src/app/
├── core/          ← Servicios globales (auth, tenant)
├── layout/        ← Shell, header, sidebar, footer
├── shared/        ← Componentes reutilizables
└── modules/       ← Módulos de negocio
```

Ver [Project Structure](../architecture/project-structure.md) para el detalle completo.

## Primera Feature

Si te asignaron una feature nueva:

1. Lee [Architecture Overview](../architecture/overview.md) para entender el sistema
2. Lee [Project Structure](../architecture/project-structure.md) para saber dónde va cada archivo
3. Sigue la guía de [Adding Feature](adding-feature.md) paso a paso
4. Si es un módulo nuevo, usa [Adding Module](adding-module.md)

## Convenciones Clave

- **Standalone components** — no hay NgModules
- **OnPush** siempre en todos los componentes
- **Signals** para estado, RxJS solo para streams complejos
- **i18n** — no hay texto hardcodeado, usa el pipe `translate`
- **Path aliases** — `@core/*`, `@shared/*`, `@modules/*`
- **Prefijo `zt-`** para componentes shared nuevos

Ver [Naming Conventions](../conventions/naming.md) y [Git Workflow](../conventions/git-workflow.md).

## Troubleshooting

### Error de compilación

```bash
# Borrar cache y reinstalar
rm -rf node_modules .angular
npm install
```

### Puerto 4200 ocupado

```bash
# Usar otro puerto
ng serve --port 4201
```

### Tests fallan

```bash
# Correr un test específico
ng test --include=src/app/modules/sanidad/**/*.spec.ts
```
