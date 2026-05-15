# Adding a Feature

Guía paso a paso para agregar una feature nueva a un módulo existente.

## Escenario: Agregar "Medicamentos" al módulo Sanidad

### Paso 1: Definir los modelos (domain)

```typescript
// modules/sanidad/medicamentos/domain/models/medicamento.model.ts

export interface Medicamento {
  id: string;
  nombre: string;
  principioActivo: string;
  dosis: string;
  via: ViaAdministracion;
  estado: EstadoMedicamento;
}

export enum ViaAdministracion {
  ORAL = 'oral',
  INTRAVENOSA = 'intravenosa',
  INTRAMUSCULAR = 'intramuscular',
  SUBCUTANEA = 'subcutanea',
}

export enum EstadoMedicamento {
  ACTIVO = 'activo',
  SUSPENDIDO = 'suspendido',
  AGOTADO = 'agotado',
}
```

### Paso 2: Crear la infraestructura (si hay API)

```typescript
// modules/sanidad/medicamentos/infrastructure/api/medicamento.api.service.ts

@Injectable({ providedIn: 'root' })
export class MedicamentoApiService {
  private http = inject(HttpClient);

  getAll(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>('/api/sanidad/medicamentos');
  }
}
```

### Paso 3: Actualizar el facade (application)

```typescript
// modules/sanidad/medicamentos/application/facades/medicamentos.facade.ts

// Agregar signals y métodos para medicamentos
private medicamentos = signal<Medicamento[]>([]);
readonly medicamentosSignal = computed(() => this.medicamentos());

async cargarMedicamentos() {
  const data = await firstValueFrom(this.medicamentoApi.getAll());
  this.medicamentos.set(data);
}
```

### Paso 4: Crear componentes (presentation)

```
modules/sanidad/medicamentos/presentation/medicamento-container/
├── medicamento-container.ts      ← Smart component
├── medicamento-container.html
├── medicamento-container.scss
├── medicamento-list/             ← Dumb: lista
├── medicamento-form/             ← Dumb: formulario
└── medicamento-detail/           ← Dumb: detalle
```

### Paso 5: Agregar la ruta

```typescript
// app.routes.ts
{
  path: 'sanidad/medicamentos',
  loadComponent: () => import('@modules/sanidad/medicamentos/presentation/medicamento-container/medicamento-container')
    .then(m => m.MedicamentoContainer)
}
```

### Paso 6: Agregar al sidebar

```typescript
// layout/sidebar/sidebar.ts
{ icon: 'fa-solid fa-pills', label: 'Medicamentos', router: '/sanidad/medicamentos' }
```

### Paso 7: Agregar traducciones

```json
// assets/i18n/es.json
{
  "medicamentos": {
    "title": "Medicamentos",
    "new": "Nuevo medicamento",
    "nombre": "Nombre",
    "principioActivo": "Principio activo"
  }
}
```

### Checklist

- [ ] Modelos en `domain/models/`
- [ ] API service en `infrastructure/api/` (si aplica)
- [ ] Facade actualizado en `application/facades/`
- [ ] Container + dumb components en `presentation/`
- [ ] Ruta en `app.routes.ts`
- [ ] Entrada en sidebar
- [ ] Traducciones en `i18n/*.json`
- [ ] Tests escritos
