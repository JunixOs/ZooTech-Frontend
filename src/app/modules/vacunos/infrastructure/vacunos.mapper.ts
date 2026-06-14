import { Vacuno, VacunoEstado } from '../domain/models/vacuno.model';
import { VacunoItemDto } from './dtos/vacuno-list-response.dto';

export class VacunoMapper {

  /**
   * Mapea desde el contrato real del backend (VacunoItemResponse)
   * hacia el modelo de dominio del frontend.
   */
  static fromBackendItem(dto: {
    id: number;
    codigo: string;
    nombre: string;
    fechaNacimiento: string;
    razaCode: string;
    sexoCode: string;
    procedencia: string | null;
    estado: string;
  }): Vacuno {
    return {
      id:               dto.id,
      codigo:           dto.codigo,
      nombre:           dto.nombre,
      fechaNacimiento:  dto.fechaNacimiento,
      raza:             dto.razaCode,
      sexo:             dto.sexoCode,
      procedencia:      dto.procedencia ?? undefined,
      estado:           VacunoMapper.normalizarEstado(dto.estado),
      fechaRegistro:    new Date(),
    };
  }

  /** Mapea desde el DTO legado del frontend (si se sigue usando). */
  static toDomain(dto: VacunoItemDto): Vacuno {
    return {
      id:            dto.id,
      codigo:        dto.codigo,
      fechaRegistro: new Date(dto.fechaRegistro),
      nombre:        dto.nombre,
      raza:          dto.raza,
      procedencia:   dto.procedencia,
      estado:        dto.estado,
    };
  }

  /**
   * Regla de Estado: El backend envía "Activo".
   * Lo transformamos al literal estricto 'vivo' del dominio UI.
   */
  private static normalizarEstado(backendEstado: string): VacunoEstado {
    const lower = backendEstado?.toLowerCase().trim();
    if (lower === 'activo' || lower === 'active') return 'vivo';
    if (lower === 'eliminado' || lower === 'deleted') return 'eliminado';
    if (lower === 'muerto' || lower === 'dead') return 'muerto';
    if (lower === 'vendido') return 'vendido';
    if (lower === 'inactivo' || lower === 'inactive') return 'inactivo';
    // Fallback: si ya viene en formato de dominio, lo devolvemos tal cual
    return (lower as VacunoEstado) || 'vivo';
  }
}
