import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LecheRepository } from '@modules/leche/domain/interfaces/leche-repository.interface';
import { LecheRegistro, VacunoSimpleDTO } from '@modules/leche/domain/models/leche.model';

@Injectable({
  providedIn: 'root'
})
export class LecheFacade {
  private readonly repository = inject(LecheRepository);

  // 1. Estado privado (Writeable signals)
  private readonly _registros = signal<LecheRegistro[]>([]);
  private readonly _vacunos = signal<VacunoSimpleDTO[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // 2. Estado público de solo lectura (Computed signals)
  readonly registros = computed(() => this._registros());
  readonly vacunos = computed(() => this._vacunos());
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

  /**
   * Carga la lista de vacunos para el formulario.
   */
  async cargarVacunos(): Promise<void> {
    try {
      const data = await firstValueFrom(this.repository.getVacunos());
      this._vacunos.set(data);
    } catch (err) {
      console.error('LecheFacade.cargarVacunos:', err);
    }
  }

  /**
   * Crea un nuevo registro de ordeño.
   */
  async crearRegistro(data: any): Promise<void> {
    this._loading.set(true);
    try {
      await firstValueFrom(this.repository.save(data));
      await this.cargarRegistros();
    } catch (err) {
      console.error('LecheFacade.crearRegistro:', err);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Carga un registro por ID desde el repositorio.
   */
  async cargarRegistroPorId(id: string): Promise<LecheRegistro> {
    try {
      return await firstValueFrom(this.repository.getById(id));
    } catch (err) {
      console.error('LecheFacade.cargarRegistroPorId:', err);
      throw err;
    }
  }

  /**
   * Elimina un registro por ID.
   */
  async eliminarRegistro(id: string, motivo: string = 'Eliminado por el usuario'): Promise<void> {
    try {
      await firstValueFrom(this.repository.deleteById(id, motivo));
      // Recargar la lista después de eliminar
      await this.cargarRegistros();
    } catch (err) {
      console.error('LecheFacade.eliminarRegistro:', err);
      throw err;
    }
  }

  /**
   * Actualiza un registro por ID.
   */
  async actualizarRegistro(
    id: string,
    data: Partial<LecheRegistro>
  ): Promise<void> {
    try {
      await firstValueFrom(this.repository.updateById(id, data));
      // Recargar la lista después de actualizar
      await this.cargarRegistros();
    } catch (err) {
      console.error('LecheFacade.actualizarRegistro:', err);
      throw err;
    }
  }
}
