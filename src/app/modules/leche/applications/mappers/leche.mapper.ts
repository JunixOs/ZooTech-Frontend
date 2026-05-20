import { LecheRegistro, OrdenioDTO } from '@modules/leche/domain/models/leche.model';

export class LecheMapper {
  static toDomain(dto: OrdenioDTO): LecheRegistro {
    const date = new Date(dto.fechaHora);
    const hour = date.getHours();
    
    return {
      codigoRegistro: dto.codigo,
      fecha: dto.fechaHora,
      codigoVacuno: dto.vacunoId.toString(),
      nombreVacuno: `Vacuno ${dto.vacunoId}`, // El nombre real vendría de un join o carga adicional
      litros: dto.litros,
      turno: hour < 12 ? 'manana' : 'tarde'
    };
  }

  static toDTO(domain: Partial<LecheRegistro>): Partial<OrdenioDTO> {
    return {
      codigo: domain.codigoRegistro,
      fechaHora: domain.fecha,
      litros: domain.litros,
      // Los IDs se manejarían según la lógica de negocio o el estado actual
    };
  }

  static toDomainList(dtos: OrdenioDTO[]): LecheRegistro[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
