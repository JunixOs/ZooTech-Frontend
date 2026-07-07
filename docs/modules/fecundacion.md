# Módulo: Fecundación

## Descripción

Gestiona el registro, edición, consulta, eliminación y estado reproductivo asociado a fecundaciones.

## Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/reproduccion/fecundacion` | `FecundacionContainerComponent` | Listado principal |
| `/reproduccion/fecundacion/registrar` | `FecundacionForm` | Registro |
| `/reproduccion/fecundacion/editar/:id` | `FecundacionForm` | Edición |
| `/reproduccion/fecundacion/detalle/:id` | `FecundacionDetail` | Detalle |
| `/reproduccion/fecundacion/estado` | `EstadoFecundacionComponent` | Consulta y actualización de estado |

## Domain Models

| Archivo | Responsabilidad |
|---|---|
| `src/app/modules/reproduccion/fecundacion/domain/models/fecundacion.model.ts` | Modelos de registro, edición, opciones y estado |

## Estado

| Signal | Tipo | Descripción |
|---|---|---|
| `fecundaciones` | `signal<FecundacionRegistro[]>` | Lista cargada desde el facade |
| `cargando` | `signal<boolean>` | Estado de carga del listado |
| `error` | `signal<string \| null>` | Clave i18n o mensaje de error |
| `estadoActual` | `signal<EstadoFecundacionVacuno \| null>` | Estado reproductivo consultado |

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/fecundaciones` | Listar fecundaciones |
| `POST` | `/api/v1/fecundaciones` | Crear |
| `GET` | `/api/v1/fecundaciones/:id` | Obtener para edición/detalle |
| `PATCH` | `/api/v1/fecundaciones/:id` | Actualizar |
| `DELETE` | `/api/v1/fecundaciones/:id` | Eliminar |
| `GET` | `/api/reproduccion/fecundacion/estado/:vacunoId` | Consultar estado reproductivo |

## Componentes

| Componente | Tipo | Responsabilidad |
|---|---|---|
| `zt-fecundacion-container` | Smart | Orquesta listado y filtros |
| `zt-fecundacion-form` | Smart/Form | Alta y edición |
| `zt-fecundacion-detail` | Smart | Detalle y eliminación |
| `zt-estado-fecundacion` | Smart | Consulta y actualización de estado |

## Notas

- Sigue la estructura `domain`, `application/facades`, `application/services`, `infrastructure/api`, `presentation`.
- Los textos visibles deben resolverse por i18n.
- Presentation no debe importar servicios ni DTOs de `infrastructure`.
