import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro } from '@modules/leche/domain/models/leche.model';

@Injectable({
  providedIn: 'root'
})
export class LecheFacade {
  private readonly repository = inject(LecheRepository);

  // 1. Estado privado (Writeable signals)
  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // 2. Estado público de solo lectura (Computed signals)
  readonly registros = computed(() => this._registros());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  
  // Derivado útil: total de litros acumulados en la lista actual
  readonly totalLitros = computed(() => 
    this._registros().reduce((acc, curr) => acc + curr.litros, 0)
  );

  /**
   * Carga la lista de registros desde el repositorio y actualiza el estado.
   */
  async cargarRegistros(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Convertimos el Observable a Promesa para un manejo imperativo más limpio
      const data = await firstValueFrom(this.repository.getAll());
      this._registros.set(data);
    } catch (err) {
      this._error.set('No se pudieron cargar los registros de producción.');
      console.error('LecheFacade.cargarRegistros:', err);
    } finally {
      this._loading.set(false);
    }
  }

  // Aquí irían métodos como guardarRegistro, eliminarRegistro, etc.
}
