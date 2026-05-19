# Application Layer

## Responsabilidad

La capa `application/` define **QUÉ puede hacer el usuario** — casos de uso y facades que orquestan la lógica de negocio. Es la capa intermedia entre la UI y los datos.

**Qué SÍ va aquí:**
- Facades (un solo punto de entrada por módulo)
- Servicios de casos de uso (una acción = un servicio)
- Orquestación de múltiples repositorios
- Transformación de datos entre domain y presentation

**Qué NO va aquí:**
- Componentes UI
- Lógica de negocio pura (va en `domain/`)
- Implementaciones de repositorios (van en `infrastructure/`)

## ¿Cuándo Crear Esta Capa?

**NO la crees si:**
- El módulo solo lee datos y los muestra
- No hay lógica compleja entre entidades
- Un componente puede llamar al repo directamente

**SÍ créala si:**
- Un caso de uso requiere llamar a múltiples repos
- Hay lógica de orquestación compleja
- Necesitas un facade para simplificar la UI
- Hay validaciones de negocio antes de persistir

## Estructura

```
modules/{modulo}/application/
├── facades/
│   └── {modulo}.facade.ts
└── use-cases/
    ├── create-triaje.use-case.ts
    ├── get-triajes.use-case.ts
    └── update-triaje-status.use-case.ts
```

## Ejemplo: Facade

El facade es un **único punto de entrada** para que la UI no hable directo con los repos:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { inject } from '@angular/core';
import { TriajeRepository } from '../domain/interfaces/triaje-repository.interface';
import { Triaje, EstadoTriaje } from '../domain/models/triaje.model';

@Injectable({ providedIn: 'root' })
export class SanidadFacade {
  private repo = inject(TriajeRepository);

  private triajes = signal<Triaje[]>([]);
  private loading = signal(false);

  // Estado público (readonly)
  readonly triajesSignal = computed(() => this.triajes());
  readonly loadingSignal = computed(() => this.loading());
  readonly triajesCriticos = computed(() =>
    this.triajes().filter(t => t.severidad === 'critico')
  );

  async cargarTriajes() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.repo.getAll());
      this.triajes.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async actualizarEstado(id: string, estado: EstadoTriaje) {
    await firstValueFrom(this.repo.update(id, { estado }));
    // Actualizar signal local
    this.triajes.update(items =>
      items.map(t => t.id === id ? { ...t, estado } : t)
    );
  }
}
```

## Ejemplo: Use Case Individual

Para casos complejos, un use case por acción:

```typescript
import { inject, Injectable } from '@angular/core';
import { TriajeRepository } from '../../domain/interfaces/triaje-repository.interface';
import { CreateTriajeDto } from '../../domain/models/triaje.model';

@Injectable({ providedIn: 'root' })
export class CreateTriajeUseCase {
  private repo = inject(TriajeRepository);

  execute(dto: CreateTriajeDto) {
    return this.repo.create(dto);
  }
}
```

Uso desde un componente:

```typescript
private createTriaje = inject(CreateTriajeUseCase);

async onSubmit(form: TriajeForm) {
  await firstValueFrom(this.createTriaje.execute(form));
}
```

## Facade vs Use Cases Individuales

| Enfoque | Cuándo usar |
|---|---|
| **Facade** | Módulo mediano, pocos casos de uso, estado compartido |
| **Use Cases** | Módulo grande, muchos casos de uso, testing granular |

Puedes usar ambos: facade para lo común, use cases individuales para lo complejo.

## Import Rules

- `application/` importa de `domain/`
- `application/` **NO importa de `presentation/`**
- `application/` puede importar de `infrastructure/` (para interfaces de repos)
