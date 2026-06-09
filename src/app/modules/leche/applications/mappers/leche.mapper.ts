import { LecheRegistro, OrdenioDTO } from '@modules/leche/domain/models/leche.model';

export class LecheMapper {
  static toDomain(dto: OrdenioDTO): LecheRegistro {
    const date = new Date(dto.fechaHora);
    const hour = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return {
      id: dto.id,
      codigoRegistro: dto.codigo,
      fecha: `${day}/${month}/${year}`,
      hora: `${hour.toString().padStart(2, '0')}:${minutes}`,
      codigoVacuno: dto.vacunoId.toString(),
      nombreVacuno: `Vacuno ${dto.vacunoId}`,
      litros: dto.litros,
      encargado: dto.encargadoUsuarioId ? `Usuario ${dto.encargadoUsuarioId}` : '',
      observaciones: dto.observaciones || '',
    } as unknown as LecheRegistro;
  }

  static toDTO(domain: Partial<LecheRegistro>): Partial<OrdenioDTO> {
    return {
      codigo: domain.codigoRegistro,
      fechaHora: domain.fecha,
      litros: domain.litros,
    };
  }

  static toDomainList(dtos: OrdenioDTO[]): LecheRegistro[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
