import { TriajeRegistro, TriajeDTO } from '@modules/sanidad/domain/models/triaje.model';

export class TriajeMapper {
  static toDomain(dto: TriajeDTO): TriajeRegistro {
    const vacunoNombre = dto.vacunoNombre ?? dto.nombreVacuno ?? null;

    return {
      id: dto.id,
      codigo: dto.codigo ?? String(dto.id),
      fechaHora: dto.fechaHora,
      vacunoId: dto.vacunoId,
      codigoVacuno: dto.vacunoId.toString(),
      vacunoNombre,
      tipoPesoCode: dto.tipoPesoCode,
      pesoKg: dto.pesoKg,
      observaciones: dto.observaciones ?? null,
      estadoRegistroCode: dto.estadoRegistroCode ?? dto.estadoTriajeCode,
      estadoTriajeCode: dto.estadoTriajeCode,
      encargadoUsuarioId: dto.encargadoUsuarioId ?? null,
      nombreEncargado: dto.nombreEncargado ?? null,
      createdAt: dto.createdAt,
    };
  }

  static toDomainList(dtos: TriajeDTO[]): TriajeRegistro[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static toDTO(domain: Partial<TriajeRegistro>): Partial<TriajeDTO> {
    return {
      codigo: domain.codigo,
      fechaHora: domain.fechaHora,
      vacunoId: domain.vacunoId,
      tipoPesoCode: domain.tipoPesoCode,
      pesoKg: domain.pesoKg,
      observaciones: domain.observaciones,
      estadoTriajeCode: domain.estadoTriajeCode ?? domain.estadoRegistroCode,
      encargadoUsuarioId: domain.encargadoUsuarioId,
    };
  }
}
