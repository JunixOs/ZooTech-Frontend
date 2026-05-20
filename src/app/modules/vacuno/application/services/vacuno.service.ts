import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  VacunoListResponse,
  VacunoFiltros,
  VacunoDetalle,
  RegistrarVacunoRequest,
  RegistrarVacunoResponse,
  EditarVacunoRequest,
} from '../../domain/models/vacuno.model';

@Injectable({ providedIn: 'root' })
export class VacunoService {
  private readonly http = inject(HttpClient);
  private readonly base = '/v1/vacunos';

  // ── GET /v1/vacunos ───────────────────────────────────────────────────────
  listar(filtros: VacunoFiltros = {}): Observable<VacunoListResponse> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.limit) params = params.set('limit', filtros.limit);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.raza) params = params.set('raza', filtros.raza);
    if (filtros.procedencia) params = params.set('procedencia', filtros.procedencia);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<VacunoListResponse>(this.base, { params });
  }

  // ── GET /v1/vacunos/:id ───────────────────────────────────────────────────
  obtenerDetalle(id: number): Observable<VacunoDetalle> {
    return this.http.get<VacunoDetalle>(`${this.base}/${id}`);
  }

  // ── POST /v1/vacunos ──────────────────────────────────────────────────────
  registrar(data: RegistrarVacunoRequest): Observable<RegistrarVacunoResponse> {
    const fd = new FormData();

    // Campos de texto — alineados exactamente con el API Contract
    fd.append('codigo', data.codigo);
    fd.append('nombre', data.nombre);
    fd.append('fechaNacimiento', data.fechaNacimiento);
    fd.append('adquisicionPor', data.adquisicionPor);
    fd.append('raza', data.raza);
    fd.append('color', data.color);
    fd.append('sexo', data.sexo);
    fd.append('codigoPadre', data.codigoPadre);
    fd.append('codigoMadre', data.codigoMadre);
    fd.append('granja', data.granja);
    fd.append('distrito', data.distrito);
    fd.append('departamento', data.departamento);
    fd.append('provincia', data.provincia);
    fd.append('aptoPara', data.aptoPara);
    fd.append('fechaEspecificacion', data.fechaEspecificacion);

    // Campos opcionales — solo se adjuntan si tienen valor
    if (data.precioCompra != null) {
      fd.append('precioCompra', String(data.precioCompra));
    }
    if (data.observaciones?.trim()) {
      fd.append('observaciones', data.observaciones.trim());
    }
    if (data.foto instanceof File) {
      fd.append('foto', data.foto, data.foto.name);
    }

    return this.http.post<RegistrarVacunoResponse>(this.base, fd);
  }

  // ── PATCH /v1/vacunos/:id ─────────────────────────────────────────────────
  editar(id: number, data: EditarVacunoRequest): Observable<Partial<VacunoDetalle>> {
    const fd = new FormData();

    if (data.nombre) fd.append('nombre', data.nombre);
    if (data.precioCompra != null) fd.append('precioCompra', String(data.precioCompra));
    if (data.raza) fd.append('raza', data.raza);
    if (data.color) fd.append('color', data.color);
    if (data.sexo) fd.append('sexo', data.sexo);
    if (data.granja) fd.append('granja', data.granja);
    if (data.distrito) fd.append('distrito', data.distrito);
    if (data.departamento) fd.append('departamento', data.departamento);
    if (data.provincia) fd.append('provincia', data.provincia);
    if (data.aptoPara) fd.append('aptoPara', data.aptoPara);
    if (data.fechaEspecificacion) fd.append('fechaEspecificacion', data.fechaEspecificacion);
    if (data.observaciones?.trim()) fd.append('observaciones', data.observaciones!.trim());
    if (data.foto instanceof File) fd.append('foto', data.foto, data.foto.name);

    return this.http.patch<Partial<VacunoDetalle>>(`${this.base}/${id}`, fd);
  }

  // ── DELETE /v1/vacunos/:id ────────────────────────────────────────────────
  eliminar(id: number, razon: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, {
      body: { razon },
    });
  }
}
