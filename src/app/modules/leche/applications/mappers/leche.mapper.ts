import { LecheRegistro, OrdenioDTO } from '@modules/leche/domain/models/leche.model';
import { formatFecha, formatHora, getTurno } from '../services/leche-date.utils';

export class LecheMapper {
  static toDomain(dto: OrdenioDTO): LecheRegistro {
    const raw = dto.fechaOrdenio ?? dto.fechaHora;
    const date = raw ? new Date(raw) : null;
    const valid = date !== null && !isNaN(date.getTime());

    const fecha = valid
      ? formatFecha(date!)
      : '—';
    const hora = valid
      ? formatHora(date!)
      : '—';
    const codigoVacuno = (dto.vacunoCodigo)?.toString() ?? 'N/A';

    return {
      id: dto.id,
      vacunoId: dto.vacunoId.toString(),
      codigoRegistro: dto.codigo ?? String(dto.id),
      fecha,
      hora,
      fechaHora: raw,
      encargadoUsuarioId: dto.encargadoUsuarioId,
      estadoOrdenioCode: dto.estadoOrdenioCode,
      nombreVacuno: dto.nombreVacuno ?? (dto.vacunoId ? `Vacuno ${dto.vacunoId}` : null),
      vacunoCodigo: codigoVacuno,
      litros: dto.cantidadLitros ?? dto.litros ?? 0,
      turno: valid ? getTurno(date!) : undefined,
      encargado:
        dto.nombreEncargado ??
        (dto.encargadoUsuarioId > 0 ? `Usuario ${dto.encargadoUsuarioId}` : ''),
      observaciones: dto.observaciones ?? '',
    };
  }

  static toDomainList(dtos: OrdenioDTO[]): LecheRegistro[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static toDTO(domain: Partial<LecheRegistro>): Partial<OrdenioDTO> {
    let fechaHora: string | undefined;
    if (domain.fecha) {
      const parts = (domain.fecha as string).split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) fechaHora = d.toISOString();
      }
    }
    return {
      codigo: domain.codigoRegistro as string | undefined,
      fechaHora,
      litros: domain.litros as number | undefined,
    };
  }
}
