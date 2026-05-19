# TypeScript Conventions

## Strict Mode

El proyecto usa TypeScript en modo estricto. Estas opciones están activadas en `tsconfig.json`:

```json
{
  "strict": true,
  "strictTemplates": true,
  "strictInjectionParameters": true,
  "noImplicitOverride": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

## Reglas

### No `any`

Nunca uses `any`. Si no sabes el tipo, usa `unknown` y haz type narrowing:

```typescript
// ✅
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    // data tiene tipo narrowing
  }
}

// ❌
function process(data: any) { ... }
```

### Interfaces sobre Type Aliases para objetos

```typescript
// ✅
interface Triaje {
  id: string;
  severidad: Severidad;
}

// ❌ (para objetos)
type Triaje = {
  id: string;
  severidad: Severidad;
};
```

Usa `type` para uniones e intersecciones:

```typescript
// ✅
type Estado = 'activo' | 'inactivo' | 'pendiente';
type Resultado = Exito | Error;
```

### Enums para valores del dominio

```typescript
// ✅
enum Severidad {
  LEVE = 'leve',
  MODERADO = 'moderado',
  GRAVE = 'grave',
}
```

### Null safety

No uses `!` (non-null assertion) a menos que sea absolutamente necesario:

```typescript
// ✅ Optional chaining
const nombre = usuario?.nombre;

// ✅ Nullish coalescing
const valor = config?.timeout ?? 3000;

// ❌ Non-null assertion
const nombre = usuario!.nombre;
```

### Import ordering

```typescript
// 1. Angular / librerías externas
import { Component, signal } from '@angular/core';
import { Observable } from 'rxjs';

// 2. Core (con alias)
import { AuthService } from '@core/auth/auth.service';

// 3. Shared (con alias)
import { ButtonComponent } from '@shared/ui/button.component';

// 4. Relative imports (del mismo módulo)
import { Triaje } from '../../domain/models/triaje.model';
```

### Inyección de dependencias

Usa `inject()` en field initializers cuando sea posible:

```typescript
// ✅ Angular 21
@Component({ ... })
export class MiComponente {
  private auth = inject(AuthService);
  private router = inject(Router);
}

// ❌ Constructor injection (solo cuando necesites parámetros)
constructor(
  private auth: AuthService,
  private router: Router,
) {}
```

### Export named, no default

```typescript
// ✅
export interface Triaje { ... }
export enum Severidad { ... }
export function formatDate() { ... }

// ❌
export default class MiClase { ... }
```

### Readonly por defecto

Señales públicas deben ser readonly para que solo el servicio/facade las modifique:

```typescript
// En el facade:
private triajes = signal<Triaje[]>([]);
readonly triajesSignal = computed(() => this.triajes());

// El componente solo puede leer:
triajes = this.facade.triajesSignal;
```

### NoImplicitOverride

Si overrides un método de la clase padre, debes usar `override`:

```typescript
class Base {
  process() { ... }
}

class Derived extends Base {
  override process() { ... }  // obligatorio
}
```

## Gotchas

### Signal mutation

No mutar arrays/objetos dentro de signals — OnPush no detecta cambios:

```typescript
// ✅ Nueva referencia
items.update(current => [...current, newItem]);

// ❌ Mutación directa (OnPush NO lo detecta)
items()[0].name = 'nuevo';
```

### Template types

Angular strict templates significa que el template valida tipos:

```typescript
// Si triaje puede ser null, el template debe manejarlo:
@if (selectedTriaje(); as triaje) {
  <p>{{ triaje.nombre }}</p>  ✅
}

// Sin el as, triaje podría ser null y el template falla
```
