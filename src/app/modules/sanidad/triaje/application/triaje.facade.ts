import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { TriajeService } from '@modules/sanidad/services/triaje.service';
import {
  Triaje,
  RegistrarTriajePayload,
  ActualizarTriajePayload,
  EliminarTriajePayload,
  TriajeTipoPesoOption,
  TriajeVacunoOption,
  TriajeHistorialItem,
} from '@modules/sanidad/triaje/domain/models/triaje.model';

@Injectable({ providedIn: 'root' })
export class TriajeFacade {
  private readonly service = inject(TriajeService);

  readonly tiposPeso = signal<TriajeTipoPesoOption[]>([]);
  readonly vacunos = signal<TriajeVacunoOption[]>([]);

  cargarCatalogos(): void {
    this.service.getTiposPeso().subscribe((data) => this.tiposPeso.set(data));
    this.service.getVacunos().subscribe((data) => this.vacunos.set(data));
  }

  getById(id: number): Observable<Triaje> {
    return this.service.getById(id);
  }

  getHistorialByVacunoId(vacunoId: number): Observable<TriajeHistorialItem[]> {
    return this.service.getHistorialByVacunoId(vacunoId);
  }

  create(payload: RegistrarTriajePayload): Observable<Triaje> {
    return this.service.create(payload);
  }

  update(id: number, payload: ActualizarTriajePayload): Observable<Triaje> {
    return this.service.update(id, payload);
  }

  delete(id: number, payload: EliminarTriajePayload): Observable<void> {
    return this.service.delete(id, payload);
  }
}
