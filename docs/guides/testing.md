# Testing

## Setup

El proyecto usa **Vitest** a través de Angular CLI. No hay archivo de configuración separado — el builder lo maneja.

```bash
# Correr todos los tests
npm test

# Correr en modo watch
npm test -- --watch

# Correr un archivo específico
npm test -- --include=src/app/modules/sanidad/**/*.spec.ts
```

## Estructura de Tests

Los archivos de test van **junto al componente** que prueban:

```
modules/sanidad/presentation/triaje-container/
├── triaje-container.ts
├── triaje-container.html
├── triaje-container.scss
└── triaje-container.spec.ts    ← Test del componente
```

## Ejemplo: Test de Componente

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { TriajeList } from './triaje-list/triaje-list';

describe('TriajeList', () => {
  const mockTriajes = [
    { id: '1', animalId: 'A001', severidad: 'leve', estado: 'pendiente' },
    { id: '2', animalId: 'A002', severidad: 'critico', estado: 'en_curso' },
  ];

  it('renders triaje items', async () => {
    await render(TriajeList, {
      componentInputs: {
        triajes: mockTriajes,
      },
    });

    expect(screen.getByText('A001')).toBeTruthy();
    expect(screen.getByText('A002')).toBeTruthy();
  });

  it('shows empty state when no triajes', async () => {
    await render(TriajeList, {
      componentInputs: {
        triajes: [],
      },
    });

    expect(screen.getByText('No hay triajes registrados')).toBeTruthy();
  });
});
```

## Ejemplo: Test de Utilidad

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@shared/utils/date-formatter';

describe('date-formatter', () => {
  it('formats date in Spanish locale', () => {
    const date = new Date('2026-05-12');
    const result = formatDate(date, 'es');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
```

## Ejemplo: Test de Servicio

```typescript
import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '@core/auth/auth.service';

describe('AuthService', () => {
  it('starts not authenticated', () => {
    const service = new AuthService({ navigate: vi.fn() } as any);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('sets authenticated on login', () => {
    const service = new AuthService({ navigate: vi.fn() } as any);
    service.login();
    expect(service.isAuthenticated()).toBe(true);
  });
});
```

## Qué Testear

| Tipo | Qué testear |
|---|---|---|
| **Componente dumb** | Inputs se renderizan, outputs se emiten, estados vacíos |
| **Componente smart** | Interacción con facade, navegación, manejo de errores |
| **Servicio/Facade** | Lógica de estado, llamadas a API (mockeadas) |
| **Utilidad** | Input/output de funciones puras, edge cases |
| **Pipe** | Transformaciones, casos null/undefined |

## Qué NO Testear

- Templates HTML (eso lo cubren los tests de componente)
- Código de Angular framework
- Librerías externas
- Estilos CSS/SCSS

## Mocks

Para mockear servicios en tests de componentes:

```typescript
await render(MiComponente, {
  providers: [
    { provide: SanidadFacade, useValue: mockFacade },
  ],
});
```
