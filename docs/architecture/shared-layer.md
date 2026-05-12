# Shared Layer

## Responsabilidad

La capa `shared/` contiene código **reutilizable entre módulos**. Todo lo que uses en más de un módulo vive aquí.

**Qué SÍ va aquí:**
- Componentes UI dumb (botones, inputs, tablas, modales)
- Pipes de formato (fecha, moneda, etc.)
- Directivas custom (permisos, tooltips, etc.)
- Utilidades puras (formato de fechas, validadores, constantes)

**Qué NO va aquí:**
- Lógica de negocio (va en `modules/{x}/domain/`)
- Servicios con estado de la app (van en `core/`)
- Componentes smart/containers (van en `modules/{x}/presentation/`)

## Estructura

```
src/app/shared/
├── ui/                    ← Componentes UI dumb
│   └── button.component.ts
├── directives/            ← Directivas custom
├── pipes/                 ← Pipes de formato
└── utils/                 ← Funciones puras
    └── date-formatter.ts
```

## Ejemplo: Componente UI Dumb

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'zt-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="'btn btn-' + variant()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit()">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`...`]
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary'>('primary');
  loading = input(false);
  disabled = input(false);
  clicked = output<void>();
}
```

### Convenciones de componentes shared:
- **Prefijo `zt-`** en el selector
- **`input()`** en vez de `@Input()` (signal inputs de Angular 21)
- **`output()`** en vez de `@Output()` (signal outputs de Angular 21)
- **OnPush** siempre
- **Sin estado interno** — reciben datos por inputs, emiten eventos por outputs

## Ejemplo: Utilidad Pura

```typescript
// src/app/shared/utils/date-formatter.ts
export function formatDate(date: Date, locale: string = 'es'): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

export function parseDate(str: string): Date {
  return new Date(str);
}
```

### Convenciones de utils:
- Funciones puras, sin estado
- Export named, no default
- Sin dependencias de Angular
- Testeables unitariamente

## Ejemplo: Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ztAnimalStatus',
  standalone: true
})
export class AnimalStatusPipe implements PipeTransform {
  transform(status: string): string {
    const map: Record<string, string> = {
      'healthy': 'Sano',
      'sick': 'Enfermo',
      'quarantine': 'En cuarentena'
    };
    return map[status] ?? status;
  }
}
```

## Cómo Importar desde Shared

```typescript
import { ButtonComponent } from '@shared/ui/button.component';
import { formatDate } from '@shared/utils/date-formatter';
import { AnimalStatusPipe } from '@shared/pipes/animal-status.pipe';

@Component({
  imports: [ButtonComponent, AnimalStatusPipe],
  // ...
})
```

Usa el alias `@shared/*`, nunca imports relativos profundos.

## Import Rules

- `shared/` **NO importa de `modules/`** (dependencia circular)
- `shared/` **NO importa de `core/`**
- `shared/` solo importa de sí mismo o librerías externas
