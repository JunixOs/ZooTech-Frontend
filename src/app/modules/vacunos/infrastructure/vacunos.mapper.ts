import { Vacuno } from '../domain/models/vacuno.model';
import { VacunoItemDto } from './dtos/vacuno-list-response.dto';

export class VacunoMapper {
  static toDomain(dto: VacunoItemDto): Vacuno {
    return {
      id:            dto.id,
      codigo:        dto.codigo,
      fechaRegistro: new Date(dto.fechaRegistro),
      nombre:        dto.nombre,
      raza:          dto.raza,
      procedencia:   dto.procedencia,
      estado:        dto.estado,
      // Campos requeridos por el modelo unificado pero ausentes en el DTO actual:
      fechaNacimiento: dto.fechaRegistro,
      sexo:          'Hembra',      // Valor por defecto para evitar errores de tipo
      distrito:      dto.procedencia // Mapeamos procedencia a distrito para la vista
    };
  }
}
