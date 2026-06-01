# Module Documentation Template

Copia este archivo como `modules/{nombre-modulo}.md` cuando documentes un módulo nuevo.

---

# Módulo: {Nombre}

## Descripción

Qué hace este módulo y qué problema de negocio resuelve.

## Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/{modulo}` | `{Modulo}Container` | Vista principal |
| `/{modulo}/:id` | `{Modulo}Detail` | Detalle |
| `/{modulo}/new` | `{Modulo}Form` | Crear nuevo |

## Domain Models

```typescript
// models/{entidad}.model.ts
interface {Entidad} {
  id: string;
  // ...
}
```

## Estado

| Signal | Tipo | Descripción |
|---|---|---|
| `items` | `signal<{Entidad}[]>` | Lista de elementos |
| `loading` | `signal<boolean>` | Estado de carga |

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/{modulo}` | Listar |
| `GET` | `/api/{modulo}/:id` | Obtener por ID |
| `POST` | `/api/{modulo}` | Crear |
| `PUT` | `/api/{modulo}/:id` | Actualizar |
| `DELETE` | `/api/{modulo}/:id` | Eliminar |

## Componentes

| Componente | Tipo | Responsabilidad |
|---|---|---|
| `{modulo}-container` | Smart | Orquesta hijos, maneja estado |
| `{modulo}-list` | Dumb | Lista de elementos |
| `{modulo}-form` | Dumb | Formulario de creación/edición |
| `{modulo}-detail` | Dumb | Vista de detalle |

## Notas

- Gotchas o consideraciones especiales
- Dependencias con otros módulos
- Reglas de negocio importantes
