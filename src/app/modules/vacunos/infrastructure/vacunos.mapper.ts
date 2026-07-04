import { Vacuno, VacunoEstado } from '../domain/models/vacuno.model';
import { VacunoItemDto } from './dtos/vacuno-list-response.dto';
import { VacunoGenealogiaDto } from './dtos/vacunos.dtos';

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
    fechaRegistro?: string;
    createdAt?: string;
  }): Vacuno {
    const rawDate = dto.fechaRegistro || dto.createdAt;
    return {
      id:               dto.id,
      codigo:           dto.codigo,
      nombre:           dto.nombre,
      fechaNacimiento:  dto.fechaNacimiento,
      raza:             dto.razaCode,
      sexo:             dto.sexoCode,
      procedencia:      dto.procedencia ?? undefined,
      estado:           VacunoMapper.normalizarEstado(dto.estado),
      fechaRegistro:    rawDate ? new Date(rawDate) : undefined,
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
      sexo:          dto.sexo,
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

  /**
   * Transforma el arreglo plano del backend en un árbol recursivo.
   */
  static buildGenealogyTree(flatArray: any[], rootIdOrCodigo: number | string): VacunoGenealogiaDto | null {
    if (!flatArray || !Array.isArray(flatArray)) return null;

    const map = new Map<number, VacunoGenealogiaDto>();

    // Inicializamos todos los nodos en el mapa con padre/madre nulos
    for (const item of flatArray) {
      map.set(item.id, {
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        raza: item.razaCode || item.raza || '',
        procedencia: item.procedencia || '',
        sexo: item.sexoCode || item.sexo || '',
        nivel: item.nivel || 1,
        padre: null,
        madre: null,
      });
    }

    // Enlazamos las referencias
    for (const item of flatArray) {
      const node = map.get(item.id);
      if (node) {
        if (item.padreId) node.padre = map.get(item.padreId) || null;
        if (item.madreId) node.madre = map.get(item.madreId) || null;
      }
    }

    // Retornamos la raíz (buscamos por ID numérico o código)
    const numericId = Number(rootIdOrCodigo);
    let root: VacunoGenealogiaDto | null | undefined = map.get(numericId);
    if (!root) {
      root = Array.from(map.values()).find(v => v.codigo === String(rootIdOrCodigo));
    }

    return root || null;
  }
}
