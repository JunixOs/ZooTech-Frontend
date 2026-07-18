# Domain Layer

## Responsabilidad

La capa `domain/` define **QUÉ es el negocio** — modelos, interfaces, enums y reglas de negocio puras. No depende de Angular, ni de UI, ni de APIs.

**Qué SÍ va aquí:**
- Interfaces y tipos de datos del dominio
- Enums (estados, categorías, etc.)
- Clases con reglas de negocio puras
- Value objects
- Validadores de dominio

**Qué NO va aquí:**
- Llamadas a HTTP
- Inyección de dependencias de Angular
- Referencias a componentes UI
- Lógica de presentación

## Estructura

```
modules/{modulo}/domain/
├── models/
│   ├── {entidad}.model.ts
│   └── {entidad}.model.ts
├── interfaces/
│   └── {servicio}.interface.ts
└── enums/
    └── {tipo}.enum.ts
```

## Ejemplo: Modelos de Sanidad

```typescript
// modules/sanidad/triaje/domain/models/triaje.model.ts

export interface Triaje {
  id: string;
  animalId: string;
  fecha: Date;
  severidad: Severidad;
  sintomas: string[];
  diagnostico: string;
  estado: EstadoTriaje;
}

export enum Severidad {
  LEVE = 'leve',
  MODERADO = 'moderado',
  GRAVE = 'grave',
  CRITICO = 'critico',
}

export enum EstadoTriaje {
  PENDIENTE = 'pendiente',
  EN_CURSO = 'en_curso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}
```

## Ejemplo: Regla de Negocio Pura

```typescript
// modules/sanidad/triaje/domain/models/triaje-rules.ts

export function requiereAtencionInmediata(triaje: Triaje): boolean {
  return triaje.severidad === Severidad.GRAVE ||
         triaje.severidad === Severidad.CRITICO;
}

export function puedeCerrarTriaje(triaje: Triaje): boolean {
  return triaje.estado === EstadoTriaje.EN_CURSO &&
         triaje.diagnostico.length > 0;
}
```

### Puntos clave:
- Funciones puras — mismo input, siempre mismo output
- Sin efectos secundarios
- Sin imports de Angular
- Testeables unitariamente sin mocks

## Ejemplo: Interface de Repositorio

```typescript
// modules/sanidad/triaje/domain/interfaces/triaje-repository.interface.ts

export interface TriajeRepository {
  getAll(): Observable<Triaje[]>;
  getById(id: string): Observable<Triaje>;
  create(triaje: CreateTriajeDto): Observable<Triaje>;
  update(id: string, triaje: UpdateTriajeDto): Observable<void>;
  delete(id: string): Observable<void>;
}
```

La interface vive en `domain/`, la implementación en `infrastructure/`. Así puedes swappear la implementación (API real, mock, localStorage) sin tocar el dominio.

## Naming

- Archivos: `{entidad}.model.ts`
- Interfaces: `{Entidad}` o `{Entidad}Repository`
- Enums: PascalCase, sin prefijo del módulo
- Funciones de reglas: camelCase descriptivo (`requiereAtencionInmediata`)

## Import Rules

- `domain/` **NO importa de NINGUNA otra capa del módulo**
- `domain/` **NO importa de Angular**
- `domain/` solo importa de sí mismo o librerías externas
