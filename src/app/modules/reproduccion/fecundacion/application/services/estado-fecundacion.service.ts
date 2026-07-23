import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  EstadoFecundacionVacuno,
  FecundacionOption,
  VacunoHembraFecundacionOption,
} from '../../domain/models/fecundacion.model';
import { FecundacionFacade } from '../facades/fecundacion.facade';
import { EstadoFecundacionApiService } from '../../infrastructure/api/estado-fecundacion.api.service';

@Injectable({ providedIn: 'root' })
export class EstadoFecundacionService {
  private readonly api = inject(EstadoFecundacionApiService);
  private readonly fecundacionFacade = inject(FecundacionFacade);

  private readonly vacunosHembraState = signal<VacunoHembraFecundacionOption[]>([]);
  private readonly estadosState = signal<FecundacionOption[]>([]);
  private readonly estadoActualState = signal<EstadoFecundacionVacuno | null>(null);
  private readonly estadosListadoState = signal<EstadoFecundacionVacuno[]>([]);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal('');
  private readonly saveMessageState = signal('');

  readonly vacunosHembra = this.vacunosHembraState.asReadonly();
  readonly estados = this.estadosState.asReadonly();
  readonly estadoActual = this.estadoActualState.asReadonly();
  readonly estadosListado = this.estadosListadoState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly saveMessage = this.saveMessageState.asReadonly();

  async cargarListado(search?: string): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set('');
    try {
      const data = await firstValueFrom(this.api.listarEstados(search));
      this.estadosListadoState.set(data);
    } catch {
      this.estadosListadoState.set([]);
      this.errorState.set('reproduccion.fecundacion.estado.errors.loadList');
    } finally {
      this.loadingState.set(false);
    }
  }

  async cargarOpciones(): Promise<void> {
    try {
      const opciones = await firstValueFrom(this.fecundacionFacade.obtenerOpciones());
      this.estadosState.set(opciones.estados.filter((estado) => !this.esSinEstado(estado.nombre)));
    } catch {
      this.errorState.set('reproduccion.fecundacion.estado.errors.load');
    }
  }

  async cargarInicial(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set('');
    this.saveMessageState.set('');

    try {
      const [vacunos, opciones] = await Promise.all([
        firstValueFrom(this.fecundacionFacade.buscarVacunos('hembra')),
        firstValueFrom(this.fecundacionFacade.obtenerOpciones()),
      ]);

      this.vacunosHembraState.set(vacunos.map((vacuno) => ({
        id: vacuno.id,
        codigoVacuno: vacuno.codigo,
        nombreVacuno: vacuno.nombre,
        raza: '',
      })));
      this.estadosState.set(opciones.estados.filter((estado) => !this.esSinEstado(estado.nombre)));

      const primerVacuno = this.vacunosHembraState()[0];
      if (primerVacuno) {
        await this.consultarEstado(primerVacuno.id);
      } else {
        this.estadoActualState.set(null);
      }
    } catch {
      this.estadoActualState.set(null);
      this.errorState.set('reproduccion.fecundacion.estado.errors.load');
    } finally {
      this.loadingState.set(false);
    }
  }

  async buscarVacunosHembra(term: string): Promise<void> {
    try {
      const vacunos = await firstValueFrom(this.fecundacionFacade.buscarVacunos('hembra', term));
      this.vacunosHembraState.set(vacunos.map((vacuno) => ({
        id: vacuno.id,
        codigoVacuno: vacuno.codigo,
        nombreVacuno: vacuno.nombre,
        raza: '',
      })));
    } catch {
      this.vacunosHembraState.set([]);
      this.errorState.set('reproduccion.fecundacion.estado.errors.search');
    }
  }

  async consultarEstado(vacunoId: number | string): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set('');
    this.saveMessageState.set('');

    try {
      this.estadoActualState.set(await firstValueFrom(this.api.obtenerEstado(vacunoId)));
    } catch {
      this.estadoActualState.set(null);
      this.errorState.set('reproduccion.fecundacion.estado.errors.consult');
    } finally {
      this.loadingState.set(false);
    }
  }

  async actualizarEstado(estado: string): Promise<void> {
    const actual = this.estadoActualState();
    if (!actual?.fecundacionId) {
      this.errorState.set('reproduccion.fecundacion.estado.errors.noActive');
      return;
    }

    this.savingState.set(true);
    this.errorState.set('');
    this.saveMessageState.set('');

    try {
      const actualizado = await firstValueFrom(this.api.actualizarEstado(actual.fecundacionId, estado));
      this.estadoActualState.set(actualizado);
      this.saveMessageState.set('reproduccion.fecundacion.estado.messages.saveSuccess');
    } catch {
      this.errorState.set('reproduccion.fecundacion.estado.errors.save');
    } finally {
      this.savingState.set(false);
    }
  }

  esDisponibleParaNuevaFecundacion(estado: string): boolean {
    const normalized = this.normalize(estado);
    return normalized === 'fallida' || normalized === 'vacia' || this.esSinEstado(estado);
  }

  private esSinEstado(value: string): boolean {
    return this.normalize(value) === 'sin estado' || this.normalize(value) === 'sin_estado';
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
