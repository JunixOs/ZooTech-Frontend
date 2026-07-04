import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { VacunosFacade } from '@modules/vacunos/application/vacunos.facade';
import { Vacuno } from '@modules/vacunos/domain/models/vacuno.model';
import {
  EstadoFecundacion,
  EstadoFecundacionVacuno,
  VacunoHembraFecundacionOption,
} from '../../domain/models/fecundacion.model';
import { EstadoFecundacionApiService } from '../../infrastructure/api/estado-fecundacion.api.service';

@Injectable({ providedIn: 'root' })
export class EstadoFecundacionService {
  private readonly api = inject(EstadoFecundacionApiService);
  private readonly vacunosFacade = inject(VacunosFacade);
  private readonly translate = inject(TranslateService);

  private readonly vacunosHembraState = signal<VacunoHembraFecundacionOption[]>([]);
  private readonly estadoActualState = signal<EstadoFecundacionVacuno | null>(null);
  private readonly loadingState = signal(false);
  private readonly savingState = signal(false);
  private readonly errorState = signal('');
  private readonly saveMessageState = signal('');

  readonly vacunosHembra = this.vacunosHembraState.asReadonly();
  readonly estadoActual = this.estadoActualState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly saveMessage = this.saveMessageState.asReadonly();

  async cargarVacunosHembra(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set('');
    this.saveMessageState.set('');

    try {
      const response = await firstValueFrom(this.vacunosFacade.listarVacunos({ limit: 1000, estado: 'activo' }));
      const hembras = response.items
        .filter((vacuno) => this.esHembra(vacuno))
        .map((vacuno) => this.mapVacunoOption(vacuno));

      this.vacunosHembraState.set(hembras);

      if (hembras.length > 0) {
        await this.consultarEstado(hembras[0].id);
      } else {
        this.estadoActualState.set(null);
        this.errorState.set(this.translate.instant('reproduccion.fecundacion.estado.errors.noFemales'));
      }
    } catch {
      this.estadoActualState.set(null);
      this.errorState.set(this.translate.instant('reproduccion.fecundacion.estado.errors.loadFemales'));
    } finally {
      this.loadingState.set(false);
    }
  }

  buscarVacunosHembra(term: string): VacunoHembraFecundacionOption[] {
    const normalized = term.trim().toLowerCase();
    if (!normalized) {
      return this.vacunosHembraState();
    }

    return this.vacunosHembraState().filter(
      (vacuno) =>
        vacuno.codigoVacuno.toLowerCase().includes(normalized) ||
        vacuno.nombreVacuno.toLowerCase().includes(normalized),
    );
  }

  async consultarEstado(vacunoId: number | string): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set('');
    this.saveMessageState.set('');

    try {
      const estado = await firstValueFrom(this.api.obtenerEstado(vacunoId));
      this.estadoActualState.set(estado);
    } catch {
      this.estadoActualState.set(null);
      this.errorState.set(this.translate.instant('reproduccion.fecundacion.estado.errors.loadState'));
    } finally {
      this.loadingState.set(false);
    }
  }

  async actualizarEstado(estado: EstadoFecundacion): Promise<void> {
    const actual = this.estadoActualState();

    if (!actual?.fecundacionId) {
      this.errorState.set(this.translate.instant('reproduccion.fecundacion.estado.errors.noActiveRecordUpdate'));
      return;
    }

    this.savingState.set(true);
    this.errorState.set('');
    this.saveMessageState.set('');

    try {
      const actualizado = await firstValueFrom(this.api.actualizarEstado(actual.fecundacionId, estado));
      this.estadoActualState.set(actualizado);
      this.saveMessageState.set(this.translate.instant('reproduccion.fecundacion.estado.savedMessage'));
    } catch {
      this.errorState.set(this.translate.instant('reproduccion.fecundacion.estado.errors.saveState'));
    } finally {
      this.savingState.set(false);
    }
  }

  esDisponibleParaNuevaFecundacion(estado: EstadoFecundacion): boolean {
    return estado === 'fallida' || estado === 'sin_estado';
  }

  private esHembra(vacuno: Vacuno): boolean {
    return vacuno.sexo.trim().toLowerCase() === 'hembra';
  }

  private mapVacunoOption(vacuno: Vacuno): VacunoHembraFecundacionOption {
    return {
      id: vacuno.id ?? vacuno.codigo,
      codigoVacuno: vacuno.codigo,
      nombreVacuno: vacuno.nombre,
      raza: vacuno.raza,
    };
  }
}
