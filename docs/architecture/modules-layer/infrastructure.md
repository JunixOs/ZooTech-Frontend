# Infrastructure Layer

## Responsabilidad

La capa `infrastructure/` implementa **CÓMO se comunica el módulo con el exterior** — APIs, almacenamiento local, mappers de datos.

**Qué SÍ va aquí:**
- Implementaciones de repositorios (API calls)
- HTTP clients específicos del módulo
- Mappers/transformers de DTO a modelo de dominio
- Servicios de almacenamiento (localStorage, IndexedDB)

**Qué NO va aquí:**
- Lógica de negocio (va en `domain/`)
- Componentes UI (van en `presentation/`)
- Interfaces de repositorio (van en `domain/interfaces/`)

## Estructura

```
modules/{modulo}/infrastructure/
├── api/
│   ├── {modulo}.api.service.ts      ← HTTP calls raw
│   └── {modulo}.api.config.ts       ← URLs, endpoints
├── repositories/
│   └── {entidad}.repository.ts      ← Implementación del repo
└── mappers/
    └── {entidad}.mapper.ts          ← DTO → Domain model
```

## Ejemplo: API Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Triaje, CreateTriajeDto, UpdateTriajeDto } from '../domain/models/triaje.model';

const API_URL = '/api/sanidad/triajes';

@Injectable({ providedIn: 'root' })
export class TriajeApiService {
  private http = inject(HttpClient);

  getAll(): Observable<Triaje[]> {
    return this.http.get<Triaje[]>(API_URL);
  }

  getById(id: string): Observable<Triaje> {
    return this.http.get<Triaje>(`${API_URL}/${id}`);
  }

  create(dto: CreateTriajeDto): Observable<Triaje> {
    return this.http.post<Triaje>(API_URL, dto);
  }

  update(id: string, dto: UpdateTriajeDto): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
```

## Ejemplo: Repositorio

El repositorio implementa la interface definida en `domain/`:

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TriajeRepository } from '../domain/interfaces/triaje-repository.interface';
import { TriajeApiService } from '../api/triaje.api.service';
import { CreateTriajeDto, UpdateTriajeDto } from '../domain/models/triaje.model';

@Injectable({ providedIn: 'root' })
export class TriajeRepositoryImpl implements TriajeRepository {
  private api = inject(TriajeApiService);

  getAll(): Observable<Triaje[]> {
    return this.api.getAll();
  }

  getById(id: string): Observable<Triaje> {
    return this.api.getById(id);
  }

  create(dto: CreateTriajeDto): Observable<Triaje> {
    return this.api.create(dto);
  }

  update(id: string, dto: UpdateTriajeDto): Observable<void> {
    return this.api.update(id, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
```

## Proveedor del Repositorio

Para que la inyección funcione, registra la implementación en `app.config.ts` o en un provider del módulo:

```typescript
import { TriajeRepository } from './modules/sanidad/domain/interfaces/triaje-repository.interface';
import { TriajeRepositoryImpl } from './modules/sanidad/infrastructure/repositories/triaje.repository';

// En app.config.ts providers:
{ provide: TriajeRepository, useClass: TriajeRepositoryImpl }
```

Así la UI y el application layer dependen de la **interface** (domain), no de la implementación.

## Ejemplo: Mapper

```typescript
import { TriajeDTO } from '../api/triaje.dto';
import { Triaje } from '../domain/models/triaje.model';

export function mapTriajeDTOToDomain(dto: TriajeDTO): Triaje {
  return {
    id: dto.id,
    animalId: dto.animal_id,
    fecha: new Date(dto.fecha),
    severidad: dto.severidad,
    sintomas: dto.sintomas,
    diagnostico: dto.diagnostico ?? '',
    estado: dto.estado,
  };
}
```

## Estado Actual

La carpeta `modules/sanidad/data/` (infraestructura) está **vacía**. No hay implementación de API aún. Cuando se conecte al backend, aquí es donde se crean los servicios HTTP.

## Import Rules

- `infrastructure/` importa de `domain/` (interfaces, modelos)
- `infrastructure/` importa de `application/` si necesita DTOs
- `infrastructure/` **NO importa de `presentation/`**
