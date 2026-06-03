import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/api/api.config';
import { map, Observable } from 'rxjs';
import { Vacuno } from '../domain/models/vacuno.model';

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface VacunoOptionsResponse {
  adquisicionOptions: string[];
  razaOptions: string[];
  sexoOptions: Vacuno['sexo'][];
  aptoParaOptions: string[];
  ubigeoOptions?: UbigeoOption[];
}

export interface UbigeoOption {
  codigo: string;
  nombre: string;
  hijos: UbigeoOption[];
}

export interface RegistrarVacunoPayload {
  vacuno: Vacuno;
  foto?: File | null;
}

interface BackendPagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class VacunosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  search(params: {
    search?: string;
    page: number;
    pageSize: number;
  }): Observable<PagedResponse<Vacuno>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('limit', params.pageSize);

    if (params.search?.trim()) {
      httpParams = httpParams.set('q', params.search.trim());
    }

    return this.http
      .get<BackendPagedResponse<Vacuno>>(`${this.apiBaseUrl}/vacunos`, {
        params: httpParams,
      })
      .pipe(
        map((response) => ({
          items: response.data.map((vacuno) => this.normalizeVacuno(vacuno)),
          page: response.pagination.page,
          pageSize: response.pagination.limit,
          totalItems: response.pagination.total,
          totalPages: response.pagination.totalPages,
        })),
      );
  }

  getByCodigo(codigo: string): Observable<Vacuno> {
    return this.http
      .get<Vacuno>(`${this.apiBaseUrl}/vacunos/codigo/${codigo}`)
      .pipe(map((vacuno) => this.normalizeVacuno(vacuno)));
  }

  getOptions(): Observable<VacunoOptionsResponse> {
    return this.http.get<VacunoOptionsResponse>(`${this.apiBaseUrl}/vacunos/options`);
  }

  update(codigo: string, payload: RegistrarVacunoPayload): Observable<Vacuno> {
    const formData = this.toFormData(payload, false);

    return this.http
      .put<Vacuno>(`${this.apiBaseUrl}/vacunos/${codigo}`, formData)
      .pipe(map((vacuno) => this.normalizeVacuno(vacuno)));
  }

  delete(codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/vacunos/${codigo}`);
  }

  create(payload: RegistrarVacunoPayload): Observable<Vacuno> {
    const formData = this.toFormData(payload, true);

    return this.http
      .post<Vacuno>(`${this.apiBaseUrl}/vacunos`, formData)
      .pipe(map((vacuno) => this.normalizeVacuno(vacuno)));
  }

  private toFormData(payload: RegistrarVacunoPayload, includeImmutableFields: boolean): FormData {
    const formData = new FormData();
    const vacuno = payload.vacuno;

    if (includeImmutableFields) {
      formData.append('codigo', vacuno.codigo.toUpperCase());
      formData.append('fechaNacimiento', vacuno.fechaNacimiento);
      formData.append('codigoPadre', vacuno.codigoPadre.toUpperCase());
      formData.append('codigoMadre', vacuno.codigoMadre.toUpperCase());
    }

    formData.append('nombre', vacuno.nombre);
    formData.append('adquisicionPor', vacuno.adquisicionPor);

    if (vacuno.adquisicionPor.toLowerCase() === 'compra' && vacuno.precioCompra != null) {
      formData.append('precioCompra', String(vacuno.precioCompra));
    }

    formData.append('raza', vacuno.raza);
    formData.append('color', vacuno.color);
    formData.append('sexo', vacuno.sexo);
    formData.append('granja', vacuno.granja);
    formData.append('distrito', vacuno.distrito);
    this.appendIfPresent(formData, 'codigoDistrito', vacuno.codigoDistrito);
    formData.append('departamento', vacuno.departamento);
    this.appendIfPresent(formData, 'codigoDepartamento', vacuno.codigoDepartamento);
    formData.append('provincia', vacuno.provincia);
    this.appendIfPresent(formData, 'codigoProvincia', vacuno.codigoProvincia);
    formData.append('aptoPara', vacuno.aptoPara);
    formData.append('fechaEspecificacion', vacuno.fechaRegistroFuncion ?? vacuno.fechaEspecificacion ?? '');

    if (vacuno.observaciones.trim()) {
      formData.append('observaciones', vacuno.observaciones.trim());
    }

    if (payload.foto) {
      formData.append('foto', payload.foto, payload.foto.name);
    }

    return formData;
  }

  private normalizeVacuno(vacuno: Vacuno): Vacuno {
    const fechaFuncion =
      vacuno.fechaRegistroFuncion ?? vacuno.fechaRegistroEspecializacion ?? vacuno.fechaEspecificacion ?? '';

    return {
      id: vacuno.id,
      codigo: vacuno.codigo,
      nombre: vacuno.nombre,
      fechaNacimiento: vacuno.fechaNacimiento,
      adquisicionPor: vacuno.adquisicionPor ?? 'monta',
      precioCompra: vacuno.precioCompra,
      raza: vacuno.raza,
      color: vacuno.color ?? '',
      sexo: vacuno.sexo,
      codigoPadre: vacuno.codigoPadre ?? '',
      codigoMadre: vacuno.codigoMadre ?? '',
      granja: vacuno.granja ?? '',
      distrito: vacuno.distrito ?? '',
      codigoDistrito: vacuno.codigoDistrito,
      departamento: vacuno.departamento ?? '',
      codigoDepartamento: vacuno.codigoDepartamento,
      provincia: vacuno.provincia ?? '',
      codigoProvincia: vacuno.codigoProvincia,
      aptoPara: vacuno.aptoPara ?? '',
      fechaEspecificacion: vacuno.fechaEspecificacion,
      fechaRegistroEspecializacion: vacuno.fechaRegistroEspecializacion,
      fechaRegistroFuncion: fechaFuncion,
      observaciones: vacuno.observaciones ?? '',
      fotoUrl: vacuno.fotoUrl ?? null,
      estado: vacuno.estado ?? 'vivo',
    };
  }

  private appendIfPresent(formData: FormData, key: string, value: string | undefined): void {
    if (value?.trim()) {
      formData.append(key, value.trim());
    }
  }
}
