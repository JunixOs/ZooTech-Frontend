# Presentation Layer

## Responsabilidad

La capa `presentation/` define **CÓMO se ve** la aplicación. Contiene componentes Angular que renderizan UI y manejan interacciones del usuario.

**Qué SÍ va aquí:**
- Smart components (containers) — obtienen datos, manejan estado local
- Dumb components (presentacionales) — reciben inputs, emiten outputs
- Templates HTML
- Estilos SCSS específicos del componente

**Qué NO va aquí:**
- Lógica de negocio pura (va en `domain/`)
- Llamadas directas a API (van en `infrastructure/`)
- Reglas de negocio complejas (van en `application/`)

## Patrón Container / Presentational

```
presentation/
├── {modulo}-container/          ← SMART component
│   ├── {modulo}-container.ts    ← Obtiene datos, maneja estado
│   ├── {modulo}-container.html  ← Orquesta dumb components
│   ├── {modulo}-container.scss
│   ├── {modulo}-list/           ← DUMB component
│   ├── {modulo}-form/           ← DUMB component
│   └── {modulo}-detail/         ← DUMB component
```

## Smart Component (Container)

**Responsabilidades:**
- Obtener datos (vía facade o servicio)
- Manejar estado local (loading, error, selección)
- Reaccionar a eventos de dumb components
- Navegar entre rutas

```typescript
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriajeList } from './triaje-list/triaje-list';
import { TriajeForm } from './triaje-form/triaje-form';
import { TriajeDetail } from './triaje-detail/triaje-detail';
import { SanidadFacade } from '../../application/facades/sanidad.facade';
import { Triaje } from '../../domain/models/triaje.model';

@Component({
  selector: 'app-triaje-container',
  imports: [CommonModule, TriajeList, TriajeForm, TriajeDetail],
  templateUrl: './triaje-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer implements OnInit {
  private facade = inject(SanidadFacade);

  // Estado local
  selectedTriaje = signal<Triaje | null>(null);
  showForm = signal(false);

  // Datos del facade
  triajes = this.facade.triajesSignal;
  loading = this.facade.loadingSignal;

  async ngOnInit() {
    await this.facade.cargarTriajes();
  }

  onSelect(triaje: Triaje) {
    this.selectedTriaje.set(triaje);
  }

  onCreate() {
    this.showForm.set(true);
  }

  async onSave(dto: CreateTriajeDto) {
    // llamar facade
    this.showForm.set(false);
  }

  onCancel() {
    this.showForm.set(false);
  }
}
```

```html
<!-- triaje-container.html -->
@if (loading()) {
  <p>Cargando...</p>
} @else {
  <app-triaje-list
    [triajes]="triajes()"
    (selected)="onSelect($event)"
    (create)="onCreate()" />

  @if (showForm()) {
    <app-triaje-form
      (save)="onSave($event)"
      (cancel)="onCancel()" />
  }

  @if (selectedTriaje(); as triaje) {
    <app-triaje-detail [triaje]="triaje" />
  }
}
```

## Dumb Component (Presentacional)

**Responsabilidades:**
- Recibir datos por `input()`
- Emitir eventos por `output()`
- No tener estado propio (excepto UI state local)
- No llamar a servicios o APIs

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Triaje } from '../../domain/models/triaje.model';

@Component({
  selector: 'app-triaje-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './triaje-list.html',
})
export class TriajeList {
  triajes = input.required<Triaje[]>();
  selected = output<Triaje>();
  create = output<void>();

  onSelect(triaje: Triaje) {
    this.selected.emit(triaje);
  }

  onCreate() {
    this.create.emit();
  }
}
```

```html
<!-- triaje-list.html -->
<div class="triaje-list">
  <div class="list-header">
    <h2>Triage</h2>
    <button (click)="onCreate()">Nuevo</button>
  </div>

  @for (triaje of triajes(); track triaje.id) {
    <div class="triaje-item" (click)="onSelect(triaje)">
      <span>{{ triaje.animalId }}</span>
      <span>{{ triaje.severidad }}</span>
      <span>{{ triaje.estado }}</span>
    </div>
  } @empty {
    <p>No hay triajes registrados</p>
  }
</div>
```

## Cuándo Crear un Nuevo Componente

| Situación | Qué crear |
|---|---|
| Nueva página/vista | Container en `presentation/` |
| Lista de entidades | Dumb component `{entidad}-list` |
| Formulario de creación/edición | Dumb component `{entidad}-form` |
| Vista de detalle | Dumb component `{entidad}-detail` |
| Elemento UI reutilizable entre módulos | Componente en `shared/ui/` |

## Import Rules

- `presentation/` importa de `domain/` (modelos)
- `presentation/` importa de `application/` (facades, use cases)
- `presentation/` importa de `shared/` (componentes UI)
- `presentation/` importa de `core/` (servicios globales)
- `presentation/` **NO importa de `infrastructure/`** directamente
