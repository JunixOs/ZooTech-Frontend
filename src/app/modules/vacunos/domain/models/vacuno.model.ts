export interface Vacuno {
  id: number;
  codigo: string;
  fechaRegistro: Date;
  nombre: string;
  raza: string;
  procedencia: string;
  estado: EstadoVacuno;
}

export type EstadoVacuno = 'vivo' | 'muerto';
