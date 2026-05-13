# 📘 Guía de Contratos de API — Estándares del Equipo

> **Para:** Todos los sub-equipos de desarrollo  
> **Propósito:** Definir los estándares que debemos seguir al diseñar contratos de API antes de comenzar la implementación.  
> **Obligatorio:** Sí. Todo endpoint debe tener su contrato aprobado antes de escribir código.

---

## ¿Qué es un Contrato de API?

Un contrato de API es un documento que define **qué hace un endpoint, cómo se llama, qué recibe y qué devuelve**, antes de implementarlo. Es el acuerdo entre quien produce la API (backend) y quien la consume (frontend, otro servicio, etc.).

**Regla de oro del equipo:**
> El contrato va primero. El código viene después.

---

## 1. Estándar que usamos: OpenAPI 3.0 (YAML)

Todos los contratos deben estar escritos en **OpenAPI 3.0** usando formato **YAML**.

- Herramienta para escribir y validar: [Swagger Editor](https://editor.swagger.io/)
- Herramienta para documentación visual: [Redocly](https://redocly.com/)
- Herramienta para mock server: [Prism](https://stoplight.io/open-source/prism)

---

## 2. Convenciones de Nomenclatura REST

### Rutas (URLs)

```
✅ Correcto                        ❌ Incorrecto
/vacunos                           /getVacunos
/vacunos/{id}                      /getVacunoById
/vacunos/{id}/fecundaciones        /getFecundacionesDeVacuno
/sanidad/triajes                   /SanidadTriaje
/produccion-leche                  /ProduccionDeLeche
```

**Reglas:**
- Siempre en **minúsculas**
- Usar **guiones medios** `-` si hay más de una palabra: `/produccion-leche`
- Usar **sustantivos**, nunca verbos
- Usar **plural** para colecciones: `/vacunos`, `/fecundaciones`, `/triajes`
- Usar **singular** para recursos únicos dentro del path: `/vacunos/{vacunoId}`

### Métodos HTTP

| Método | Uso | Ejemplo del proyecto |
|--------|-----|----------------------|
| `GET` | Obtener datos (sin efectos secundarios) | `GET /fecundaciones` |
| `POST` | Crear un nuevo recurso | `POST /fecundaciones` |
| `PUT` | Reemplazar un recurso completo | `PUT /fecundaciones/{id}` |
| `PATCH` | Actualizar campos específicos | `PATCH /fecundaciones/{id}` |
| `DELETE` | Eliminar un recurso | `DELETE /fecundaciones/{id}` |

### Parámetros

| Tipo | Cuándo usarlo | Ejemplo |
|------|---------------|---------|
| **Path param** | Identificar un recurso específico | `/vacunos/{vacunoId}` |
| **Query param** | Filtros, paginación, búsqueda | `/fecundaciones?estado=exitosa&page=1` |
| **Body** | Datos para crear o actualizar | `POST /fecundaciones` con JSON |
| **Header** | Autenticación, versión, idioma | `Authorization: Bearer token` |

---

## 3. Módulos del Proyecto y sus Rutas Base

Cada sub-equipo trabaja sobre su módulo. Estas son las rutas base asignadas:

| Módulo | Ruta base | Sub-equipo |
|--------|-----------|------------|
| Vacuno | `/v1/vacunos` | Vacuno |
| Reproducción – Celo | `/v1/vacunos/{id}/celos` | Reproducción |
| Reproducción – Fecundación | `/v1/fecundaciones` | Reproducción |
| Sanidad – Triaje | `/v1/sanidad/triajes` | Sanidad |
| Producción de Leche | `/v1/produccion-leche` | Producción |

---

## 4. Códigos de Respuesta HTTP

Siempre documentar **todos los posibles códigos** que puede devolver un endpoint.

| Código | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| `200 OK` | Éxito general | GET exitoso, PATCH exitoso |
| `201 Created` | Recurso creado | POST exitoso |
| `204 No Content` | Éxito sin cuerpo | DELETE exitoso |
| `400 Bad Request` | Error en los datos enviados | Validación fallida |
| `401 Unauthorized` | No autenticado | Token ausente o inválido |
| `403 Forbidden` | Sin permisos | Usuario autenticado pero sin acceso |
| `404 Not Found` | Recurso no existe | ID no encontrado |
| `409 Conflict` | Conflicto de datos | Vacuno ya tiene fecundación activa |
| `422 Unprocessable Entity` | Datos bien formados pero inválidos | Lógica de negocio fallida |
| `500 Internal Server Error` | Error del servidor | Error no manejado |

---

## 5. Estructura del Cuerpo de Error

Todos los errores deben devolver el **mismo formato**:

```json
{
  "error": {
    "code": "FECUNDACION_NOT_FOUND",
    "message": "La fecundación con ID 15 no existe.",
    "details": []
  }
}
```

**Ejemplo con validación de campos:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": [
      { "field": "fechaFecundacion", "message": "La fecha no puede ser futura." },
      { "field": "vacunoId", "message": "El vacuno no existe." }
    ]
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | string | Código interno del error en `UPPER_SNAKE_CASE` |
| `message` | string | Mensaje legible para el desarrollador |
| `details` | array | Errores campo por campo (solo en validaciones) |

---

## 6. Paginación

Para todos los endpoints que devuelven listas, usar este formato estándar.

### Request
```
GET /fecundaciones?page=1&limit=20&estado=exitosa
```

### Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5
  }
}
```

---

## 7. Estructura Base del Archivo YAML

Todo contrato debe comenzar con esta estructura:

```yaml
openapi: 3.0.0

info:
  title: "ZOO | Nombre del Módulo"
  description: "Descripción breve de qué hace este módulo."
  version: "1.0.0"
  contact:
    name: "Nombre del sub-equipo responsable"
    email: "equipo@zoo.com"

servers:
  - url: "https://api.zoo.com/v1"
    description: "Producción"
  - url: "https://api-staging.zoo.com/v1"
    description: "Staging"
  - url: "http://localhost:3000/v1"
    description: "Local"

tags:
  - name: "Fecundaciones"
    description: "Operaciones de fecundación de vacunos"

paths:
  # Aquí van los endpoints

components:
  schemas:
    # Aquí van los modelos de datos
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

---

## 8. Ejemplos Reales del Proyecto

A continuación se muestran los contratos del módulo **Fecundación** como referencia. Los demás módulos deben seguir el mismo patrón.

### 8.1 Listar Fecundaciones — `GET /fecundaciones`

```yaml
paths:
  /fecundaciones:
    get:
      tags:
        - Fecundaciones
      summary: "Listar fecundaciones"
      description: "Retorna una lista paginada de fecundaciones. Se puede filtrar por estado, vacuno o rango de fechas."
      operationId: "listFecundaciones"
      parameters:
        - name: page
          in: query
          required: false
          description: "Número de página"
          schema:
            type: integer
            default: 1
            example: 1
        - name: limit
          in: query
          required: false
          description: "Cantidad de resultados por página"
          schema:
            type: integer
            default: 20
            example: 20
        - name: estado
          in: query
          required: false
          description: "Filtrar por estado de la fecundación"
          schema:
            type: string
            enum: [exitosa, fallida, pendiente]
            example: "exitosa"
        - name: vacunoId
          in: query
          required: falseexitosa"
                    observaciones: "Sin complicaciones"
                pagination:
                  page: 1
                  limit: 20
                  total: 85
                  totalPages: 5
        '401':
          description: "No autenticado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      security:
        - BearerAuth: []
```

---

### 8.2 Estado de Fecundación del Vacuno — `GET /vacunos/{vacunoId}/fecundacion-estado`

```yaml
  /vacunos/{vacunoId}/fecundacion-estado:
    get:
      tags:
        - Fecundaciones
      summary: "Estado de fecundación del vacuno"
      description: "Retorna el estado actual de fecundación de un vacuno específico."
      operationId: "getFecundacionEstadoByVacuno"
      parameters:
        - name: vacunoId
          in: path
          required: true
          description: "ID único del vacuno"
          schema:
            type: integer
            example: 7
      responses:
        '200':
          description: "Estado obtenido exitosamente"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FecundacionEstado'
              example:
                vacunoId: 7
                tieneProcesoActivo: true
                ultimaFecundacion:
                  id: 1
                  fecha: "2024-03-10"
                  estado: "exitosa"
                  metodo: "inseminacion_artificial"
        '404':
          description: "Vacuno no encontrado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: "VACUNO_NOT_FOUND"
                  message: "El vacuno con ID 7 no existe."
                  details: []
        '401':
          description: "No autenticado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      security:
        - BearerAuth: []
```

---

### 8.3 Registrar Fecundación — `POST /fecundaciones`

```yaml
    post:
      tags:
        - Fecundaciones
      summary: "Registrar una nueva fecundación"
      description: "Registra un proceso de fecundación para un vacuno. No se puede registrar si ya tiene uno activo."
      operationId: "createFecundacion"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateFecundacionRequest'
            example:
              vacunoId: 7
              fechaFecundacion: "2024-03-15"
              metodo: "inseminacion_artificial"
              toroId: null
              observaciones: "Primer intento del ciclo"
      responses:
        '201':
          description: "Fecundación registrada exitosamente"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Fecundacion'
        '400':
          description: "Datos inválidos"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: "VALIDATION_ERROR"
                  message: "Los datos enviados no son válidos."
                  details:
                    - field: "fechaFecundacion"
                      message: "La fecha no puede ser futura."
        '409':
          description: "El vacuno ya tiene un proceso activo"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: "FECUNDACION_ACTIVA_EXISTS"
                  message: "El vacuno ID 7 ya tiene un proceso de fecundación activo."
                  details: []
        '404':
          description: "Vacuno no encontrado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: "No autenticado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      security:
        - BearerAuth: []
```

---

### 8.4 Editar Fecundación — `PATCH /fecundaciones/{fecundacionId}`

```yaml
  /fecundaciones/{fecundacionId}:
    patch:
      tags:
        - Fecundaciones
      summary: "Editar una fecundación"
      description: "Actualiza los campos de una fecundación. Solo se envían los campos a modificar."
      operationId: "updateFecundacion"
      parameters:
        - name: fecundacionId
          in: path
          required: true
          description: "ID único de la fecundación"
          schema:
            type: integer
            example: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateFecundacionRequest'
            example:
              estado: "exitosa"
              observaciones: "Confirmado por veterinario el 20/03/2024"
      responses:
        '200':
          description: "Fecundación actualizada exitosamente"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Fecundacion'
        '404':
          description: "Fecundación no encontrada"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '400':
          description: "Datos inválidos"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: "No autenticado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      security:
        - BearerAuth: []
```

---

### 8.5 Eliminar Fecundación — `DELETE /fecundaciones/{fecundacionId}`

```yaml
    delete:
      tags:
        - Fecundaciones
      summary: "Eliminar una fecundación"
      description: "Elimina permanentemente un registro de fecundación. Esta acción no se puede deshacer."
      operationId: "deleteFecundacion"
      parameters:
        - name: fecundacionId
          in: path
          required: true
          description: "ID único de la fecundación a eliminar"
          schema:
            type: integer
            example: 1
      responses:
        '204':
          description: "Fecundación eliminada exitosamente (sin cuerpo en la respuesta)"
        '404':
          description: "Fecundación no encontrada"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: "FECUNDACION_NOT_FOUND"
                  message: "La fecundación con ID 1 no existe."
                  details: []
        '401':
          description: "No autenticado"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      security:
        - BearerAuth: []
```

---

## 9. Modelos (Schemas) del Módulo Fecundación

```yaml
components:
  schemas:

    Fecundacion:
      type: object
      description: "Representa un proceso de fecundación de un vacuno"
      properties:
        id:
          type: integer
          example: 1
        vacunoId:
          type: integer
          example: 7
        fechaFecundacion:
          type: string
          format: date
          example: "2024-03-15"
        metodo:
          type: string
          enum: [inseminacion_artificial, monta_natural]
          example: "inseminacion_artificial"
        toroId:
          type: integer
          nullable: true
          description: "Solo aplica para monta_natural"
          example: 3
        estado:
          type: string
          enum: [pendiente, exitosa, fallida]
          example: "exitosa"
        observaciones:
          type: string
          nullable: true
          example: "Sin complicaciones"
        creadoEn:
          type: string
          format: date-time
          example: "2024-03-15T08:30:00Z"
        actualizadoEn:
          type: string
          format: date-time
          example: "2024-03-20T10:00:00Z"
      required:
        - id
        - vacunoId
        - fechaFecundacion
        - metodo
        - estado
        - creadoEn

    CreateFecundacionRequest:
      type: object
      properties:
        vacunoId:
          type: integer
          example: 7
        fechaFecundacion:
          type: string
          format: date
          description: "No puede ser fecha futura"
          example: "2024-03-15"
        metodo:
          type: string
          enum: [inseminacion_artificial, monta_natural]
          example: "inseminacion_artificial"
        toroId:
          type: integer
          nullable: true
          description: "Obligatorio si metodo es monta_natural"
          example: null
        observaciones:
          type: string
          nullable: true
          maxLength: 500
          example: "Primer intento del ciclo"
      required:
        - vacunoId
        - fechaFecundacion
        - metodo

    UpdateFecundacionRequest:
      type: object
      description: "Todos los campos son opcionales"
      properties:
        estado:
          type: string
          enum: [pendiente, exitosa, fallida]
          example: "exitosa"
        observaciones:
          type: string
          nullable: true
          maxLength: 500
          example: "Confirmado por veterinario"

    FecundacionEstado:
      type: object
      properties:
        vacunoId:
          type: integer
          example: 7
        tieneProcesoActivo:
          type: boolean
          example: true
        ultimaFecundacion:
          nullable: true
          allOf:
            - $ref: '#/components/schemas/Fecundacion'
      required:
        - vacunoId
        - tieneProcesoActivo

    PaginatedResponse:
      type: object
      properties:
        data:
          type: array
          items: {}
        pagination:
          type: object
          properties:
            page:
              type: integer
              example: 1
            limit:
              type: integer
              example: 20
            total:
              type: integer
              example: 85
            totalPages:
              type: integer
              example: 5
          required:
            - page
            - limit
            - total
            - totalPages

    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              example: "FECUNDACION_NOT_FOUND"
            message:
              type: string
              example: "La fecundación con ID 1 no existe."
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                    example: "vacunoId"
                  message:
                    type: string
                    example: "El vacuno no existe."
          required:
            - code
            - message
            - details
```

---

## 10. Referencia de Rutas por Módulo

Cada sub-equipo replica este patrón para sus propios recursos:

### Módulo Vacuno
```
GET    /vacunos               → Listar vacunos (paginado)
GET    /vacunos/{id}          → Obtener vacuno por ID
POST   /vacunos               → Registrar vacuno
PATCH  /vacunos/{id}          → Editar vacuno
DELETE /vacunos/{id}          → Eliminar vacuno
```

### Módulo Reproducción – Celo
```
GET    /vacunos/{id}/celos    → Listar celos del vacuno
POST   /vacunos/{id}/celos    → Registrar celo
PATCH  /celos/{id}            → Editar celo
DELETE /celos/{id}            → Eliminar celo
```

### Módulo Sanidad – Triaje
```
GET    /sanidad/triajes       → Listar triajes (paginado)
GET    /sanidad/triajes/{id}  → Obtener triaje
POST   /sanidad/triajes       → Registrar triaje
PATCH  /sanidad/triajes/{id}  → Editar triaje
DELETE /sanidad/triajes/{id}  → Eliminar triaje
```

### Módulo Producción de Leche
```
GET    /produccion-leche      → Listar registros (paginado)
GET    /produccion-leche/{id} → Obtener registro
POST   /produccion-leche      → Registrar producción
PATCH  /produccion-leche/{id} → Editar registro
DELETE /produccion-leche/{id} → Eliminar registro
```

---

## 11. Versionado de la API

- La versión va en la **URL**: `/v1/`, `/v2/`
- No romper contratos existentes. Si un cambio es **breaking**, crear una nueva versión.

| Tipo de cambio | ¿Requiere nueva versión? |
|----------------|--------------------------|
| Eliminar un campo de la respuesta | ✅ Sí |
| Cambiar el tipo de un campo | ✅ Sí |
| Cambiar el nombre de un endpoint | ✅ Sí |
| Agregar campo opcional al request | ❌ No |
| Agregar campo nuevo a la respuesta | ❌ No |
| Agregar un nuevo endpoint | ❌ No |

---

## 12. Checklist antes de entregar un contrato

- [ ] El YAML es válido (pegar en [editor.swagger.io](https://editor.swagger.io) sin errores)
- [ ] Todos los endpoints tienen `summary`, `description` y `operationId`
- [ ] Todos los parámetros tienen `description` y `example`
- [ ] Todos los request bodies tienen ejemplos reales
- [ ] Se documentan **todos** los posibles códigos de respuesta (incluyendo 401, 404, 500)
- [ ] Los errores usan el schema `Error` estándar del equipo
- [ ] Los modelos están en `components/schemas` (no inline)
- [ ] Los campos obligatorios están en `required`
- [ ] Los endpoints de lista incluyen paginación con el formato estándar
- [ ] La ruta base corresponde al módulo asignado (ver sección 3)

---

## 13. Flujo de trabajo del equipo

```
1. DISEÑAR     → El sub-equipo define los endpoints de su módulo
       ↓
2. REDACTAR    → Se escribe el contrato en YAML siguiendo esta guía
       ↓
3. REVISAR     → Se comparte el contrato para revisión (PR, Notion, etc.)
       ↓
4. APROBAR     → El tech lead lo aprueba
       ↓
5. MOCK        → Se levanta un mock server con Prism para que el frontend empiece
       ↓
6. IMPLEMENTAR → Backend implementa siguiendo el contrato aprobado
       ↓
7. VALIDAR     → Se verifica que la implementación cumple el contrato
```

**Regla:** No se empieza a implementar sin aprobación del contrato.

---

## Recursos de referencia

| Recurso | Link |
|---------|------|
| Especificación OpenAPI 3.0 | https://spec.openapis.org/oas/v3.0.0 |
| Swagger Editor (online) | https://editor.swagger.io |
| Redocly (documentación visual) | https://redocly.com |
| Prism (mock server) | https://stoplight.io/open-source/prism |
| Postman (pruebas) | https://postman.com |

---

*Guía elaborada para uso interno del equipo. Cualquier excepción o propuesta de cambio al estándar debe discutirse con el tech lead antes de aplicarse.*
          description: "Filtrar por ID de vacuno"
          schema:
            type: integer
            example: 7
      responses:
        '200':
          description: "Lista de fecundaciones obtenida exitosamente"
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/PaginatedResponse'
                  - type: object
                    properties:
                      data:
                        type: array
                        items:
                          $ref: '#/components/schemas/Fecundacion'
              example:
                data:
                  - id: 1
                    vacunoId: 7
                    fechaFecundacion: "2024-03-10"
                    metodo: "inseminacion_artificial"
                    estado: "
