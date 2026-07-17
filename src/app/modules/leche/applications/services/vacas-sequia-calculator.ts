import {
  ConsultaFiltros,
  LecheRegistro,
  LecheVacunoOption,
  VacasSequiaResponse,
  VacunoSequia,
} from '@modules/leche/domain/models/leche.model';

type VacunoSequiaGroup = {
  vacunoId: string;
  fechas: Date[];
  codigoVacuno: string;
  nombreVacuno: string | null;
};

export class VacasSequiaCalculator {
  private static readonly SEQUIA_DIAS = 7;

  static calculate(
    registros: LecheRegistro[],
    vacunos: LecheVacunoOption[],
    filtros?: ConsultaFiltros,
  ): VacasSequiaResponse {
    const grupos = this.groupByVacuno(registros, vacunos);
    const referencia = this.buildReferenceDate(filtros);
    referencia.setHours(23, 59, 59, 999);

    const response: VacasSequiaResponse = { actuales: [], futuros: [], historicos: [] };

    for (const grupo of grupos.values()) {
      grupo.fechas.sort((a, b) => a.getTime() - b.getTime());

      this.pushHistoricos(response, grupo);

      const ultimaFecha = grupo.fechas[grupo.fechas.length - 1];
      const probableInicio = this.addDays(ultimaFecha, this.SEQUIA_DIAS);
      const itemBase = this.buildBaseItem(grupo);

      if (probableInicio <= referencia) {
        response.actuales.push({
          ...itemBase,
          desde: this.formatDate(probableInicio),
          probablementeHasta: '',
        });
      } else {
        response.futuros.push({
          ...itemBase,
          probablementeDesde: this.formatDate(probableInicio),
          probablementeHasta: '',
        });
      }
    }

    this.sortResponse(response);
    return response;
  }

  private static groupByVacuno(
    registros: LecheRegistro[],
    vacunos: LecheVacunoOption[],
  ): Map<string, VacunoSequiaGroup> {
    const vacunosById = new Map(vacunos.map((vacuno) => [String(vacuno.id), vacuno]));
    const grupos = new Map<string, VacunoSequiaGroup>();

    for (const registro of registros) {
      const fecha = this.parseRegistroFecha(registro);
      if (!fecha) continue;

      const vacunoId = String(registro.vacunoId ?? registro.codigoVacuno);
      const vacuno = vacunosById.get(vacunoId);
      const actual = grupos.get(vacunoId);

      if (actual) {
        actual.fechas.push(fecha);
        continue;
      }

      grupos.set(vacunoId, {
        vacunoId,
        fechas: [fecha],
        codigoVacuno: vacuno?.codigo ?? vacunoId,
        nombreVacuno: vacuno?.nombre ?? registro.nombreVacuno ?? null,
      });
    }

    return grupos;
  }

  private static buildBaseItem(grupo: VacunoSequiaGroup): VacunoSequia {
    return {
      vacunoId: grupo.vacunoId,
      codigoVacuno: grupo.codigoVacuno,
      nombreVacuno: grupo.nombreVacuno,
    };
  }

  private static buildReferenceDate(filtros?: ConsultaFiltros): Date {
    return this.parseFiltroFecha(filtros?.fechaHasta, true) ?? new Date();
  }

  private static sortResponse(response: VacasSequiaResponse): void {
    response.actuales.sort((a, b) => (a.desde ?? '').localeCompare(b.desde ?? ''));
    response.futuros.sort((a, b) =>
      (a.probablementeDesde ?? '').localeCompare(b.probablementeDesde ?? ''),
    );
    response.historicos.sort((a, b) => (a.desde ?? '').localeCompare(b.desde ?? ''));
  }

  private static pushHistoricos(response: VacasSequiaResponse, grupo: VacunoSequiaGroup): void {
    for (let index = 0; index < grupo.fechas.length - 1; index += 1) {
      const fechaActual = grupo.fechas[index];
      const fechaSiguiente = grupo.fechas[index + 1];
      if (this.diffInDays(fechaSiguiente, fechaActual) <= this.SEQUIA_DIAS) continue;

      const desde = this.addDays(fechaActual, this.SEQUIA_DIAS);
      const hasta = this.addDays(fechaSiguiente, -1);
      if (desde > hasta) continue;

      response.historicos.push({
        vacunoId: grupo.vacunoId,
        codigoVacuno: grupo.codigoVacuno,
        nombreVacuno: grupo.nombreVacuno,
        desde: this.formatDate(desde),
        hasta: this.formatDate(hasta),
      });
    }
  }

  private static parseFiltroFecha(value?: string, endOfDay = false): Date | null {
    if (!value) return null;

    const slashParts = value.split('/').map(Number);
    const date =
      slashParts.length === 3
        ? new Date(slashParts[2], slashParts[1] - 1, slashParts[0])
        : new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    if (endOfDay) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);

    return date;
  }

  private static parseRegistroFecha(registro: LecheRegistro): Date | null {
    const raw = registro['fechaHora'];
    if (typeof raw !== 'string' || !raw) return null;

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;

    date.setHours(0, 0, 0, 0);
    return date;
  }

  private static addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private static diffInDays(start: Date, end: Date): number {
    return Math.round((start.getTime() - end.getTime()) / 86_400_000);
  }

  private static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }
}
