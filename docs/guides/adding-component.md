# Adding a Component

Guía para saber dónde y cómo crear un componente nuevo.

## ¿Smart o Dumb?

Primero decide qué tipo de componente necesitas:

| Pregunta | Sí → Smart | No → Dumb |
|---|---|---|
| ¿Obtiene datos de un servicio/API? | ✅ | |
| ¿Maneja estado local significativo? | ✅ | |
| ¿Navega a otras rutas? | ✅ | |
| ¿Solo recibe datos y muestra? | | ✅ |
| ¿Solo emite eventos al padre? | | ✅ |
| ¿Es reutilizable entre módulos? | | → `shared/ui/` |

## Crear un Smart Component (Container)

**Ubicación:** `modules/{modulo}/presentation/{nombre}-container/`

```bash
mkdir -p src/app/modules/sanidad/medicamentos/presentation/medicamento-container
```

```typescript
// medicamento-container.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MedicamentoList } from './medicamento-list/medicamento-list';

@Component({
  selector: 'zt-medicamento-container',
  imports: [MedicamentoList],
  templateUrl: './medicamento-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicamentoContainer {
  // Lógica de obtención de datos, estado, etc.
}
```

## Crear un Dumb Component

**Ubicación:** Dentro del container o como hijo directo de `presentation/`

```bash
mkdir -p src/app/modules/sanidad/medicamentos/presentation/medicamento-container/medicamento-list
```

```typescript
// medicamento-list.ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Medicamento } from '../../domain/models/medicamento.model';

@Component({
  selector: 'zt-medicamento-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './medicamento-list.html',
})
export class MedicamentoList {
  medicamentos = input.required<Medicamento[]>();
  selected = output<Medicamento>();
}
```

## Crear un Componente Shared (reutilizable entre módulos)

**Ubicación:** `shared/ui/`

```bash
# No uses ng generate — hazlo manual para control total
mkdir -p src/app/shared/ui
```

```typescript
// shared/ui/card.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'zt-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <ng-content />
    </div>
  `,
})
export class CardComponent {}
```

**Recuerda:** prefijo `zt-` para componentes shared.

## Checklist

- [ ] `ChangeDetectionStrategy.OnPush` siempre
- [ ] `standalone: true` (implícito en Angular 21)
- [ ] Signal inputs: `input()`, no `@Input()`
- [ ] Signal outputs: `output()`, no `@Output()`
- [ ] Nueva sintaxis de control flow: `@if`, `@for`, no `*ngIf`, `*ngFor`
- [ ] Traducciones con pipe `translate`, no texto hardcodeado
- [ ] Ruta agregada en `app.routes.ts` (si es container)
