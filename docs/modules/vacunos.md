# Módulo: Vacunos

## Descripción

Gestiona el registro, edición, consulta, eliminación lógica y reportes frontend de vacunos.

## Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/vacunos/listado` | `VacunosContainerComponent` | Listado principal de vacunos |
| `/vacunos/registrar` | `VacunoFormComponent` | Registro de vacuno |
| `/vacunos/editar/:codigo` | `VacunoFormComponent` | Edición de vacuno |
| `/vacunos/detalle/:codigo` | `VacunoDetail` | Detalle de vacuno |
| `/vacunos/reportes` | `VacunosReportesComponent` | Selector de reportes |
| `/vacunos/reportes/listado` | `ListadoVacunoContainerComponent` | Reporte de listado |

## Domain Models

| Archivo | Responsabilidad |
|---|---|
| `src/app/modules/vacunos/domain/models/vacuno.model.ts` | Modelo de dominio, filtros, opciones y estructuras de reportes |

## Estado

| Signal | Tipo | Descripción |
|---|---|---|
| `vacunos` | `signal<Vacuno[]>` | Lista cargada desde el facade |
| `cargando` | `signal<boolean>` | Estado de carga |
| `error` | `signal<string \| null>` | Clave i18n o mensaje de error |
| `paginaActual` | `signal<number>` | Página actual |

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/vacunos` | Listar vacunos |
| `GET` | `/api/v1/vacunos/:id` | Obtener detalle |
| `POST` | `/api/v1/vacunos` | Crear |
| `PATCH` | `/api/v1/vacunos/:id` | Actualizar |
| `DELETE` | `/api/v1/vacunos/:id` | Eliminar |
| `GET` | `/api/v1/vacunos/:id/genealogia` | Árbol genealógico |

## Componentes

| Componente | Tipo | Responsabilidad |
|---|---|---|
| `zt-vacunos-container` | Smart | Orquesta listado, filtros y navegación |
| `zt-vacuno-form` | Smart/Form | Alta y edición de vacuno |
| `zt-vacuno-detail` | Smart | Detalle y eliminación |
| `zt-vacunos-reportes` | Smart | Reportes y árbol genealógico |

## Notas

- Sigue la estructura `domain`, `application/facades`, `infrastructure/api`, `infrastructure/mappers`, `presentation`.
- Presentation no debe importar DTOs desde `infrastructure`.
- Los textos visibles deben resolverse por i18n.
