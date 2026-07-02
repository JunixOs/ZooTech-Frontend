import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FecundacionApiService } from '../infrastructure/fecundacion-api.service';
import {
  FecundacionEdit,
  FecundacionOptions,
  FecundacionUpdateResponse,
  FecundacionVacunoOption,
  UpdateFecundacionRequest,
} from '../domain/models/fecundacion.model';

@Injectable({ providedIn: 'root' })
export class FecundacionFacade {
  private readonly api = inject(FecundacionApiService);

  obtenerParaEditar(id: number): Observable<FecundacionEdit> {
    return this.api.obtenerParaEditar(id);
  }

  obtenerOpciones(): Observable<FecundacionOptions> {
    return this.api.obtenerOpciones();
  }

  buscarVacunos(sexo: 'hembra' | 'macho', q = ''): Observable<FecundacionVacunoOption[]> {
    return this.api.buscarVacunos(sexo, q);
  }

  actualizar(id: number, payload: UpdateFecundacionRequest): Observable<FecundacionUpdateResponse> {
    return this.api.actualizar(id, payload);
  }
}
