# Layout Layer

## Responsabilidad

La capa `layout/` define la **estructura visual de la aplicación**: header, sidebar, footer y el shell que los envuelve. No contiene lógica de negocio.

**Qué SÍ va aquí:**
- Shell component (layout principal con router-outlet)
- Header (logo, usuario, notificaciones)
- Sidebar (navegación principal)
- Footer (info legal, versión)

**Qué NO va aquí:**
- Lógica de negocio
- Llamadas a API
- Estado de la app (excepto UI state como sidebar collapsed)

## Estructura

```
src/app/layout/
├── shell/
│   ├── shell.ts           ← Componente layout principal
│   ├── shell.html
│   └── shell.scss
├── header/
│   ├── header.ts
│   ├── header.html
│   └── header.scss
├── sidebar/
│   ├── sidebar.ts         ← Navegación con signal<NavSection[]>
│   ├── sidebar.html
│   ├── sidebar.scss
│   ├── models/
│   │   └── nav-item.model.ts
│   └── components/
│       └── sidebar-nav-item/
└── footer/
    ├── footer.ts
    ├── footer.html
    └── footer.scss
```

## Shell Component

El Shell es el layout principal que envuelve todas las rutas protegidas:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [Header, Sidebar, Footer, RouterOutlet],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {}
```

```html
<!-- shell.html -->
<div class="app-shell">
  <app-header />
  <div class="app-body">
    <app-sidebar />
    <main class="app-content">
      <router-outlet />
    </main>
  </div>
  <app-footer />
</div>
```

## Sidebar

La navegación se define como un signal de secciones:

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NavSection } from './models/nav-item.model';
import { SidebarNavItem } from './components/sidebar-nav-item/sidebar-nav-item';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarNavItem],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  navSections = signal<NavSection[]>([
    {
      icon: 'fa-solid fa-cow',
      label: 'VACUNOS',
      router: 'vacuno',
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      label: 'SANIDAD',
      children: [
        { icon: 'fa-solid fa-stethoscope', label: 'Triaje', router: '/sanidad/triaje' },
        { icon: 'fa-solid fa-chart-bar', label: 'Reportes', router: '/sanidad/reportes' },
      ],
    },
  ]);
}
```

### Para agregar una nueva sección al sidebar:

1. Abre `sidebar.ts`
2. Agrega un objeto al array de `navSections`
3. Si tiene sub-items, usa `children: []`
4. El `router` debe coincidir con una ruta en `app.routes.ts`

## Agregar un Nuevo Layout

Si necesitas un layout diferente al Shell (ej: layout sin sidebar para reportes):

```typescript
// src/app/layout/minimal-layout/minimal-layout.ts
@Component({
  selector: 'app-minimal-layout',
  imports: [Header, RouterOutlet],
  template: `
    <div class="minimal-layout">
      <app-header />
      <main class="minimal-content">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinimalLayout {}
```

Y en `app.routes.ts`:

```typescript
{
  path: 'reports',
  component: MinimalLayout,
  children: [/* rutas sin sidebar */]
}
```
