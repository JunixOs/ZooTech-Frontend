# Zootech Frontend

Frontend web de Zootech, sistema de gestión para operaciones ganaderas. Es una SPA construida con **Angular 21** y componentes standalone.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Git

> Usá **npm** para instalar y correr el proyecto. No mezcles package managers en la misma instalación.

## Instalación

```bash
git clone <repo-url>
cd Zootech-frontend
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación queda disponible en:

```txt
http://localhost:4200
```

## Comandos útiles

| Comando | Descripción |
| --- | --- |
| `npm start` | Levanta el servidor local de Angular |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run watch` | Ejecuta build en modo watch para desarrollo |
| `npm test` | Ejecuta tests unitarios con Vitest |
| `npm run e2e` | Ejecuta tests end-to-end con Playwright |
| `npm run e2e:ui` | Abre Playwright en modo UI |
| `npx prettier --write .` | Formatea el proyecto |

## Estructura principal

```txt
src/app/
  core/       Servicios globales, auth, tenant e interceptores
  shared/     Componentes reutilizables, pipes, directivas y utilidades
  layout/     Shell visual de la aplicación
  modules/    Funcionalidades de negocio por bounded context
```

Los módulos de negocio pueden dividirse en estas capas cuando haga falta:

```txt
domain/          Modelos, contratos y reglas de negocio
application/     Facades o casos de uso
infrastructure/  Clientes API y repositorios
presentation/    Componentes y vistas Angular
```

No crees carpetas vacías de arquitectura. Agregá una capa solo cuando tenga código real.

## Convenciones importantes

- No usar `NgModules`; todo debe ser standalone.
- Usar prefijo `zt-` para componentes.
- Usar `ChangeDetectionStrategy.OnPush` en componentes nuevos.
- Usar Angular Signals para estado local o simple; RxJS solo para flujos complejos.
- Usar aliases de paths: `@core/*`, `@shared/*`, `@modules/*`, `@env/*`.
- No hardcodear textos en templates; usar llaves en `src/assets/i18n/{es,en,pt}.json` y el pipe `translate`.
- No hardcodear colores en CSS; usar variables definidas en `src/styles.css`.
- No usar clases utility-first para estilos. Los templates deben usar clases semánticas y el CSS del componente.

## Documentación interna

La documentación extendida está en [`docs/`](docs/):

- [`docs/guides/getting-started.md`](docs/guides/getting-started.md)
- [`docs/architecture/overview.md`](docs/architecture/overview.md)
- [`docs/architecture/project-structure.md`](docs/architecture/project-structure.md)
- [`docs/conventions/i18n.md`](docs/conventions/i18n.md)
- [`docs/patterns/component-patterns.md`](docs/patterns/component-patterns.md)

## Troubleshooting

### Limpiar instalación local

```bash
rm -rf node_modules .angular
npm install
```

En Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, .angular
npm install
```

### Puerto 4200 ocupado

```bash
npx ng serve --port 4201
```
