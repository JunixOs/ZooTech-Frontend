# Naming Conventions

## Archivos

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Component | `{nombre}.component.ts` | `login.component.ts` |
| Modelo | `{entidad}.model.ts` | `triaje.model.ts` |
| Servicio | `{nombre}.service.ts` | `auth.service.ts` |
| Facade | `{modulo}.facade.ts` | `sanidad.facade.ts` |
| Use Case | `{accion}.use-case.ts` | `create-triaje.use-case.ts` |
| API Service | `{modulo}.api.service.ts` | `triaje.api.service.ts` |
| Repository | `{entidad}.repository.ts` | `triaje.repository.ts` |
| Interface | `{nombre}.interface.ts` | `triaje-repository.interface.ts` |
| Enum | `{tipo}.enum.ts` | `severidad.enum.ts` |
| Pipe | `{nombre}.pipe.ts` | `animal-status.pipe.ts` |
| Directive | `{nombre}.directive.ts` | `has-permission.directive.ts` |
| Guard | `{nombre}.guard.ts` | `auth.guard.ts` |
| Interceptor | `{nombre}.interceptor.ts` | `auth.interceptor.ts` |
| Mapper | `{entidad}.mapper.ts` | `triaje.mapper.ts` |
| DTO | `{entidad}.dto.ts` | `create-triaje.dto.ts` |

## Clases y Componentes

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Component class | PascalCase | `TriajeContainer`, `LoginComponent` |
| Servicio class | PascalCase + `Service` | `AuthService`, `TriajeApiService` |
| Facade class | PascalCase + `Facade` | `SanidadFacade` |
| Interface | PascalCase | `Triaje`, `TriajeRepository` |
| Enum | PascalCase | `Severidad`, `EstadoTriaje` |

## Selectores de Componentes

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Any component | `zt-` | `zt-triaje-container`, `zt-button`, `zt-card` |

## Variables y Funciones

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Variable | camelCase | `triajeList`, `isLoading` |
| Constante | camelCase o UPPER_SNAKE | `API_URL`, `maxRetries` |
| Función | camelCase | `cargarTriajes()`, `mapToDomain()` |
| Signal | camelCase | `items`, `loading`, `selectedTriaje` |
| Computed | camelCase | `totalItems`, `hasSelection` |

## Templates

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Template | `{nombre}.html` | `triaje-container.html` |
| Styles | `{nombre}.scss` | `triaje-container.scss` |

## i18n Keys

```
{modulo}.{seccion}.{elemento}

Ejemplos:
sanidad.triaje.title
sanidad.triaje.form.nombre
sanidad.medicamentos.new
auth.login.submit
```

## Branch Naming

```
{NOMBRE}_{APELLIDO}/{tipo}/{descripcion-corta}

Ejemplos:
PAUL_TARAZONA/feature/triaje-list
JUAN_RAMOS/fix/auth-redirect
AKEMI_ZAMBRANO/refactor/sanidad-facade
```

Tipos: `feature`, `fix`, `refactor`, `docs`, `chore`

## Commits

```
<tipo>(<scope>): <descripción corta>

tipos: feat, fix, refactor, docs, style, test, chore

Ejemplos:
feat(sanidad): agregar lista de triajes
fix(auth): corregir redirect después de login
docs(readme): actualizar estructura del proyecto
```
