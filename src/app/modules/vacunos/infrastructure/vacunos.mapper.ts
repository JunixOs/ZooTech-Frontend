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
    };
  }
}
