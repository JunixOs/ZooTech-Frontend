# Component Patterns

## Container / Presentational

El patrón más importante del proyecto. Separa **lógica** de **renderizado**.

### Container (Smart)

```typescript
@Component({
  selector: 'app-vacuno-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoContainer {
  private facade = inject(VacunoFacade);

  vacunos = this.facade.vacunosSignal;
  loading = this.facade.loadingSignal;

  // Maneja eventos de children
  onSelect(vacuno: Vacuno) { ... }
  onDelete(id: string) { ... }
}
```

### Presentational (Dumb)

```typescript
@Component({
  selector: 'app-vacuno-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacunoList {
  vacunos = input.required<Vacuno[]>();
  selected = output<Vacuno>();
  deleted = output<string>();
}
```

### Reglas

| Container | Presentational |
|---|---|
| Obtiene datos | Recibe datos por `input()` |
| Maneja estado | Sin estado (o solo UI state) |
| Inyecta servicios | No inyecta servicios de negocio |
| Navega | Emite eventos por `output()` |
| Puede tener children | No tiene children complejos |

## Signal Inputs / Outputs (Angular 21)

Usa la nueva API de signals, no los decorators antiguos:

```typescript
// ✅ Angular 21
variant = input<'primary' | 'secondary'>('primary');
clicked = output<void>();

// ❌ Antiguo
@Input() variant: 'primary' | 'secondary' = 'primary';
@Output() clicked = new EventEmitter<void>();
```

### Input con transformación

```typescript
count = input(0, { transform: numberAttribute });
disabled = input(false, { transform: booleanAttribute });
```

### Input requerido

```typescript
data = input.required<Data[]>();
```

## OnPush Siempre

Todos los componentes usan `OnPush`:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

Esto significa:
- Angular solo detecta cambios cuando cambia una referencia de input
- Signals disparan detección automáticamente
- Si mutas un objeto/array, OnPush NO lo detecta — usa `signal.set()` con nueva referencia

## Control Flow Syntax (Angular 21)

Usa la nueva sintaxis de control flow, no `*ngIf` / `*ngFor`:

```html
<!-- ✅ Nuevo -->
@if (loading()) {
  <p>Cargando...</p>
} @else {
  <app-list [items]="items()" />
}

@for (item of items(); track item.id) {
  <app-item [item]="item" />
} @empty {
  <p>Sin elementos</p>
}

@switch (status()) {
  @case ('active') { <span>Activo</span> }
  @case ('inactive') { <span>Inactivo</span> }
  @default { <span>Desconocido</span> }
}

<!-- ❌ Antiguo -->
<div *ngIf="loading">Cargando...</div>
<div *ngFor="let item of items">{{ item.name }}</div>
```

## Component Naming

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Container | `{modulo}-container` | `triaje-container` |
| Lista | `{entidad}-list` | `triaje-list` |
| Formulario | `{entidad}-form` | `triaje-form` |
| Detalle | `{entidad}-detail` | `triaje-detail` |
| Shared UI | `zt-{componente}` | `zt-button`, `zt-input` |
