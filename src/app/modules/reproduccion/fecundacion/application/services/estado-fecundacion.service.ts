import { Injectable, signal } from '@angular/core';

import {
  EstadoFecundacion,
  EstadoFecundacionVacuno,
} from '../../domain/models/fecundacion.model';

@Injectable({ providedIn: 'root' })
export class EstadoFecundacionService {
  private readonly vacunosEstado = signal<EstadoFecundacionVacuno[]>([
    {
      codigoVacuno: 'VCH-001',
      nombreVacuno: 'Luna',
      raza: 'Holstein',
      estadoReproductivoActual: 'pendiente',
      disponibleNuevaFecundacion: false,
      ultimaActualizacion: '2026-06-14',
      ultimoRegistroActivo: {
        codigoRegistro: 'FEC-2026-014',
        activo: true,
        tipoFecundacion: 'IA',
        vacunoReceptor: 'VCH-001 - Luna',
        toroDonante: 'TOR-009 - Centauro',
        fechaProcedimiento: '2026-06-10',
        responsable: 'Dra. Ana Torres',
        resultadoRegistrado: 'Pendiente de evaluacion',
        observacionesVeterinarias: 'Control ecografico programado.',
      },
    },
    {
      codigoVacuno: 'VCH-004',
      nombreVacuno: 'Nieves',
      raza: 'Brown Swiss',
      estadoReproductivoActual: 'en_gestacion',
      disponibleNuevaFecundacion: false,
      ultimaActualizacion: '2026-05-29',
      ultimoRegistroActivo: {
        codigoRegistro: 'FEC-2026-008',
        activo: true,
        tipoFecundacion: 'MN',
        vacunoReceptor: 'VCH-004 - Nieves',
        toroDonante: 'TOR-003 - Nevado',
        fechaProcedimiento: '2026-05-05',
        responsable: 'Mauricio Vega',
        resultadoRegistrado: 'Confirmada',
        observacionesVeterinarias: 'Gestacion sin alertas registradas.',
      },
    },
    {
      codigoVacuno: 'VCH-009',
      nombreVacuno: 'Mora',
      raza: 'Jersey',
      estadoReproductivoActual: 'fallida',
      disponibleNuevaFecundacion: true,
      ultimaActualizacion: '2026-06-02',
      ultimoRegistroActivo: {
        codigoRegistro: 'FEC-2026-011',
        activo: true,
        tipoFecundacion: 'TE',
        vacunoReceptor: 'VCH-009 - Mora',
        toroDonante: 'DON-021 - Lote embrionario A',
        fechaProcedimiento: '2026-05-20',
        responsable: 'Dra. Carla Rios',
        resultadoRegistrado: 'Fallida',
        observacionesVeterinarias: 'Recomendada nueva evaluacion reproductiva.',
      },
    },
    {
      codigoVacuno: 'VCH-012',
      nombreVacuno: 'Estrella',
      raza: 'Gyr',
      estadoReproductivoActual: 'sin_estado',
      disponibleNuevaFecundacion: true,
      ultimaActualizacion: '2026-04-18',
      ultimoRegistroActivo: null,
    },
  ]);

  listarVacunosHembra(): EstadoFecundacionVacuno[] {
    return this.vacunosEstado();
  }

  buscarVacunosHembra(term: string): EstadoFecundacionVacuno[] {
    const normalized = term.trim().toLowerCase();
    if (!normalized) return this.listarVacunosHembra();

    return this.vacunosEstado().filter(
      (vacuno) =>
        vacuno.codigoVacuno.toLowerCase().includes(normalized) ||
        vacuno.nombreVacuno.toLowerCase().includes(normalized),
    );
  }

  obtenerPorCodigo(codigoVacuno: string): EstadoFecundacionVacuno | null {
    return this.vacunosEstado().find((vacuno) => vacuno.codigoVacuno === codigoVacuno) ?? null;
  }

  actualizarEstado(
    codigoVacuno: string,
    estado: EstadoFecundacion,
  ): EstadoFecundacionVacuno | null {
    let actualizado: EstadoFecundacionVacuno | null = null;

    this.vacunosEstado.update((items) =>
      items.map((item) => {
        if (item.codigoVacuno !== codigoVacuno) return item;

        actualizado = {
          ...item,
          estadoReproductivoActual: estado,
          disponibleNuevaFecundacion: this.esDisponibleParaNuevaFecundacion(estado),
          ultimaActualizacion: this.obtenerFechaActual(),
        };

        return actualizado;
      }),
    );

    return actualizado;
  }

  esDisponibleParaNuevaFecundacion(estado: EstadoFecundacion): boolean {
    return estado === 'fallida' || estado === 'sin_estado';
  }

  private obtenerFechaActual(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
