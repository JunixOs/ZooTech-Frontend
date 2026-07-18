import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ExportColumn, saveBlob } from '@shared/utils/export-table.util';

/**
 * Servicio de infraestructura para exportación de reportes a Excel/PDF.
 *
 * Responsabilidad ÚNICA: delegar la generación de los archivos binarios
 * al backend (endpoint genérico de exportación) y disparar la descarga
 * del blob recibido. No contiene lógica de filtrado ni de negocio.
 */
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/export`;

  constructor(private http: HttpClient) { }

  descargar(
    format: 'excel' | 'pdf',
    title: string,
    columns: ExportColumn[],
    rows: Record<string, unknown>[],
    fileName: string,
  ): Observable<void> {
    return this.http
      .post(`${this.baseUrl}/${format}`, { title, columns, rows }, { responseType: 'blob' })
      .pipe(
        map((blob) => {
          saveBlob(blob, fileName);
        }),
      );
  }
}
