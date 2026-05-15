# Adding a Module

Guía para crear un módulo de negocio nuevo desde cero.

## Escenario: Crear módulo "Reproducción"

### Paso 1: Crear la estructura de carpetas

```
src/app/modules/reproduccion/
└── celo/
    ├── domain/
    │   └── models/
    └── presentation/
```

```bash
mkdir -p src/app/modules/reproduccion/celo/{domain/models,presentation/celo-container}
```

### Paso 2: Crear modelos de dominio

```typescript
// modules/reproduccion/celo/domain/models/celo.model.ts
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
// modules/reproduccion/celo/presentation/celo-container/celo-container.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'zt-celo-container',
  imports: [],
  templateUrl: './celo-container.html',
  styleUrl: './celo-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CeloContainer {}
```

### Paso 4: Crear el template

```html
<!-- modules/reproduccion/celo/presentation/celo-container/celo-container.html -->
<p>{{ 'reproduccion.celo.title' | translate }}</p>
```

### Paso 5: Agregar la ruta

```typescript
// app.routes.ts
{
  path: 'reproduccion/celo',
  loadComponent: () => import('@modules/reproduccion/celo/presentation/celo-container/celo-container')
    .then(m => m.CeloContainer)
}
```

### Paso 6: Agregar al sidebar

```typescript
// layout/sidebar/sidebar.ts
{
  icon: 'fa-solid fa-paw',
  label: 'sidebar.reproduccion',
  children: [
    { icon: 'fa-solid fa-plus', label: 'sidebar.celo', router: '/reproduccion/celo' },
  ],
}
```

### Paso 7: Agregar traducciones

```json
// assets/i18n/es.json
{
  "reproduccion": {
    "celo": {
      "title": "Celo"
    }
  },
  "sidebar": {
    "reproduccion": "REPRODUCCIÓN",
    "celo": "Celo"
  }
}
```

### Checklist

- [ ] Carpeta `modules/{bounded-context}/{feature}/` creada solo con capas necesarias
- [ ] Modelos en `domain/models/` si la feature tiene dominio propio
- [ ] Container component en `presentation/` si la feature tiene UI
- [ ] Ruta en `app.routes.ts`
- [ ] Entrada en sidebar
- [ ] Traducciones agregadas
- [ ] Documentación del módulo creada (usar `_template.md`)

## Nota: No fuerces capas vacías

Si el módulo no tiene API aún, no crees `infrastructure/`. Si la lógica es simple, no crees `application/`. Solo crea las capas que necesites.
