# State Management

## Signals Primero

Angular Signals es la forma **preferida** de manejar estado en este proyecto.

### Signal de Estado Simple

```typescript
// Estado local del componente
items = signal<Item[]>([]);
selected = signal<Item | null>(null);
loading = signal(false);
```

### Computed (derivado)

```typescript
// Se recalcula automáticamente cuando cambia la señal fuente
total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));
hasItems = computed(() => this.items().length > 0);
selectedName = computed(() => this.selected()?.name ?? 'Ninguno');
```

### Actualizar Signals

```typescript
// Setear valor completo
items.set(newItems);

// Actualizar basado en valor anterior
items.update(current => [...current, newItem]);

// Mutar (solo para objetos — crea nueva referencia internamente)
user.mutate(u => u.name = 'Nuevo nombre');
```

## Cuándo Usar RxJS

RxJS **solo** para streams complejos que Signals no pueden manejar fácilmente:

### ✅ Usar RxJS cuando:

```typescript
// Debounce de búsqueda
search$ = new Subject<string>().pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.api.search(query))
);

// Combinar múltiples streams
combined$ = combineLatest([users$, roles$]).pipe(
  map(([users, roles]) => /* ... */)
);

// Retry con backoff
data$ = this.api.getData().pipe(
  retry({ count: 3, delay: 1000 })
);
```

### ❌ NO usar RxJS cuando:

```typescript
// Estado simple → usa signal
// ✅
count = signal(0);

// ❌
count$ = new BehaviorSubject(0);

// Valor derivado → usa computed
// ✅
total = computed(() => this.items().length);

// ❌
total$ = this.items$.pipe(map(items => items.length));
```

## Patrón Facade con Signals

```typescript
@Injectable({ providedIn: 'root' })
export class SanidadFacade {
  private repo = inject(TriajeRepository);

  // Estado privado
  private triajes = signal<Triaje[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  // Estado público (readonly)
  readonly triajesSignal = computed(() => this.triajes());
  readonly loadingSignal = computed(() => this.loading());
  readonly errorSignal = computed(() => this.error());

  // Selectors derivados
  readonly triajesCriticos = computed(() =>
    this.triajes().filter(t => t.severidad === 'critico')
  );

  async cargar() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.repo.getAll());
      this.triajes.set(data);
    } catch (e) {
      this.error.set('Error al cargar triajes');
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Uso en componente:

```typescript
@Component({ ... })
export class TriajeContainer {
  private facade = inject(SanidadFacade);

  // Exponer directamente — el componente no maneja estado
  triajes = this.facade.triajesSignal;
  loading = this.facade.loadingSignal;
  error = this.facade.errorSignal;
}
```

## Efectos

Usa `effect` solo para sincronizar con APIs externas (no para lógica de negocio):

```typescript
// ✅ OK: log para debugging
effect(() => {
  console.log('Triajes cambiaron:', this.triajes());
});

// ✅ OK: actualizar título del documento
effect(() => {
  this.title.setTitle(`Zootech - ${this.selected()?.name}`);
});

// ❌ NO: usar effect para derivar estado (usa computed)
effect(() => {
  this.total.set(this.items().length); // usa computed!
});
```

## Resumen: Qué Usar Cuándo

| Caso | Herramienta |
|---|---|
| Estado simple | `signal()` |
| Valor derivado | `computed()` |
| Efecto secundario | `effect()` |
| Debounce/throttle | RxJS `Subject` + pipes |
| Combinar streams | RxJS `combineLatest`, `merge` |
| HTTP requests | RxJS `HttpClient` (obligatorio) |
| Event stream complejo | RxJS |
