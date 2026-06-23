import { LecheRegistro, OrdenioDTO } from '@modules/leche/domain/models/leche.model';

export class LecheMapper {
  static toDomain(dto: OrdenioDTO): LecheRegistro {
    // Backend may use fechaOrdenio or fechaHora depending on the endpoint
    const raw = dto.fechaOrdenio ?? (dto as unknown as Record<string, string>)['fechaHora'];
    const date = raw ? new Date(raw) : null;
    const valid = date !== null && !isNaN(date.getTime());

    const fecha = valid
      ? date!.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';
    const hora = valid
      ? date!.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';

    const litros = dto.cantidadLitros ?? (dto as unknown as Record<string, number>)['litros'] ?? 0;
    const codigoRegistro = String((dto as unknown as Record<string, unknown>)['codigo'] ?? dto.id);

    return {
      id: dto.id,
      codigoRegistro,
      fecha,
      hora,
      codigoVacuno: dto.vacunoId.toString(),
      nombreVacuno: dto.vacunoNombre ?? `Vacuno ${dto.vacunoNombre}`,
      litros,
      turno: valid && date!.getHours() < 12 ? 'manana' : 'tarde',
      encargado:
        dto.encargadoNombre ?? (dto.encargadoUsuarioId ? `Usuario ${dto.encargadoUsuarioId}` : ''),
      observaciones: dto.observaciones || '',
    } as unknown as LecheRegistro;
  }

  static toDomainList(dtos: OrdenioDTO[]): LecheRegistro[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
