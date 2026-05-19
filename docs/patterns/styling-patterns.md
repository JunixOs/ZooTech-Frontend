# Styling Patterns

## Tailwind CSS v4 + SCSS

El proyecto usa **Tailwind CSS v4** como base y **SCSS** para estilos específicos de componentes.

### Configuración

Tailwind v4 se importa en `styles.scss`:

```scss
@use "tailwindcss";
```

No se usa la vieja sintaxis `@tailwind base/components/utilities`.

### Tema: Colores Custom

El tema usa **Rose & Mauve** como colores principales, definidos como CSS custom properties:

```scss
// styles.scss
:root {
  --color-primary: var(--rose-600);
  --color-primary-hover: var(--rose-700);
  --color-secondary: var(--mauve-600);
  --color-bg: var(--gray-50);
  --color-surface: white;
  --color-text: var(--gray-900);
  --color-text-muted: var(--gray-500);
}
```

Uso en templates:

```html
<!-- Con Tailwind -->
<button class="bg-rose-600 hover:bg-rose-700 text-white">
  Guardar
</button>

<!-- Con CSS custom property -->
<button class="bg-[var(--color-primary)]">
  Guardar
</button>
```

## Estilos de Componente

Cada componente tiene su archivo `.scss`:

```
triaje-container/
├── triaje-container.ts
├── triaje-container.html
└── triaje-container.scss   ← Estilos scoped al componente
```

### Convenciones

```scss
// triaje-container.scss

// ✅ Usa Tailwind en el HTML siempre que puedas
// ✅ Usa SCSS solo cuando Tailwind no alcanza

.triaje-list {
  @apply flex flex-col gap-2;

  &__item {
    @apply p-3 rounded-lg border border-gray-200;

    &:hover {
      @apply border-rose-300 bg-rose-50;
    }

    &--selected {
      @apply border-rose-500 bg-rose-100;
    }
  }
}
```

### View Encapsulation

Angular usa `Emulated` por defecto — los estilos de un componente **no afectan** a otros componentes. Si necesitas estilos globales, ponlos en `styles.scss`.

## Patrones Comunes

### Card

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <h3 class="text-lg font-semibold text-gray-900">Título</h3>
  <p class="text-sm text-gray-500 mt-1">Descripción</p>
</div>
```

### Status Badge

```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-green-100 text-green-800">
  Sano
</span>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-red-100 text-red-800">
  Enfermo
</span>
```

### Form Input

```html
<label class="block">
  <span class="text-sm font-medium text-gray-700">Nombre</span>
  <input
    type="text"
    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm
      focus:border-rose-500 focus:ring-rose-500" />
</label>
```

### Empty State

```html
<div class="flex flex-col items-center justify-center py-12 text-center">
  <i class="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
  <p class="text-gray-500">No hay elementos para mostrar</p>
</div>
```

## Iconos

El proyecto usa **Lucide Angular** para iconos SVG y **Font Awesome** (clases `fa-solid`) en el sidebar.

```typescript
// Lucide (recomendado para templates)
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular';

// Font Awesome (actualmente en sidebar)
<span class="fa-solid fa-cow"></span>
```

## Responsive

Tailwind usa mobile-first:

```html
<!-- 1 columna en mobile, 3 en desktop -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
