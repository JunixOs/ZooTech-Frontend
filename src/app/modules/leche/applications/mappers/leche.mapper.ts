import { LecheRegistro, OrdenioDTO } from '@modules/leche/domain/models/leche.model';

export class LecheMapper {
  static toDomain(dto: OrdenioDTO): LecheRegistro {
    const raw = dto.fechaOrdenio ?? dto.fechaHora;
    const date = raw ? new Date(raw) : null;
    const valid = date !== null && !isNaN(date.getTime());

    const fecha = valid
      ? date!.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: 'numeric' })
      : '—';
    const hora = valid
      ? date!.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';
    const codigoVacuno = (dto.vacunoCodigo ?? dto.codigoVacuno)?.toString() ?? 'N/A';

    return {
      id: dto.id,
      vacunoId: dto.vacunoId.toString(),
      codigoRegistro: dto.codigo ?? String(dto.id),
      fecha,
      hora,
      fechaHora: raw,
      encargadoUsuarioId: dto.encargadoUsuarioId,
      estadoOrdenioCode: dto.estadoOrdenioCode,
      nombreVacuno: dto.nombreVacuno,
      vacunoCodigo: codigoVacuno,
      codigoVacuno,
      litros: dto.cantidadLitros ?? dto.litros ?? 0,
      turno: valid && date!.getHours() < 12 ? 'manana' : 'tarde',
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
