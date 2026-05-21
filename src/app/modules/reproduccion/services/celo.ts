import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Celo {
  codigoRegistro: string;
  fecha: string;
  hora: string;
  codigoVacuno: string;
  nombreVacuno: string;
  vecesEnCelo: number;
}

export interface EditarCeloRequest {
  id: number;
  observaciones: string;
  caracteristicaCodes: string[];
}

export interface CrearCeloRequest {
  vacunoId: number;
  fechaHora: string;
  encargadoUsuarioId: number;
  observaciones?: string;
  caracteristicaCodes?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CeloService {

  private apiUrl = 'http://localhost:16000/api/v1/celo';

  private _celos = signal<Celo[]>([]);
  readonly celos = this._celos.asReadonly();

  private _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  constructor(private http: HttpClient) { }

  obtenerCelos(): Observable<Celo[]> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<Celo[]>(this.apiUrl).pipe(
      tap({
        next: (data) => {
          this._celos.set(data);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Error al cargar el listado de celos');
          this._loading.set(false);
        }
      })
    );
  }

  crearCelo(
    request: CrearCeloRequest
  ): Observable<any> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<any>(
      `${this.apiUrl}/registrar`,
      request
    ).pipe(
      tap({
        next: () => {
          this.obtenerCelos().subscribe();
        },
        error: (err) => {
          this._error.set(err.message || 'Error al registrar el celo');
          this._loading.set(false);
        }
      })
    );
  }

  editarCelo(
    request: EditarCeloRequest
  ): Observable<any> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.put<any>(
      `${this.apiUrl}/editar`,
      request
    ).pipe(
      tap({
        next: () => {
          this.obtenerCelos().subscribe();
        },
        error: (err) => {
          this._error.set(err.message || 'Error al editar el celo');
          this._loading.set(false);
        }
      })
    );
  }
}

