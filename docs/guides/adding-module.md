# Adding a Module

Guía para crear un módulo de negocio nuevo desde cero.

## Escenario: Crear módulo "Reproducción"

### Paso 1: Crear la estructura de carpetas

```
src/app/modules/reproduccion/
├── domain/
│   └── models/
├── application/
│   └── facades/
├── infrastructure/
│   └── api/
└── presentation/
```

```bash
mkdir -p src/app/modules/reproduccion/{domain/models,application/facades,infrastructure/api,presentation}
```

### Paso 2: Crear modelos de dominio

```typescript
// modules/reproduccion/domain/models/celo.model.ts
export interface Celo {
  id: string;
  animalId: string;
  fechaInicio: Date;
  tipo: TipoCelo;
  // ...
}

export enum TipoCelo {
  NATURAL = 'natural',
  INDUCIDO = 'inducido',
}
```

### Paso 3: Crear el container component

```typescript
// modules/reproduccion/presentation/celo-container/celo-container.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-celo-container',
  imports: [],
  templateUrl: './celo-container.html',
  styleUrl: './celo-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CeloContainer {}
```

### Paso 4: Crear el template

```html
<!-- modules/reproduccion/presentation/celo-container/celo-container.html -->
<p>celo-container works!</p>
```

### Paso 5: Agregar la ruta

```typescript
// app.routes.ts
{
  path: 'reproduccion/celo',
  loadComponent: () => import('./modules/reproduccion/presentation/celo-container/celo-container')
    .then(m => m.CeloContainer)
}
```

### Paso 6: Agregar al sidebar

```typescript
// layout/sidebar/sidebar.ts
{
  icon: 'fa-solid fa-paw',
  label: 'REPRODUCCIÓN',
  children: [
    { icon: 'fa-solid fa-plus', label: 'Celo', router: '/reproduccion/celo' },
    { icon: 'fa-solid fa-list', label: 'Fecundación', router: '/reproduccion/fecundacion' },
  ],
}
```

### Paso 7: Agregar traducciones

```json
// assets/i18n/es.json
{
  "reproduccion": {
    "title": "Reproducción",
    "celo": {
      "title": "Celo"
    }
  }
}
```

### Checklist

- [ ] Carpeta `modules/{modulo}/` creada con las 4 capas
- [ ] Modelos en `domain/models/`
- [ ] Container component en `presentation/`
- [ ] Ruta en `app.routes.ts`
- [ ] Entrada en sidebar
- [ ] Traducciones agregadas
- [ ] Documentación del módulo creada (usar `_template.md`)

## Nota: No fuerces capas vacías

Si el módulo no tiene API aún, no crees `infrastructure/`. Si la lógica es simple, no crees `application/`. Solo crea las capas que necesites.
