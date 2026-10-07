export interface Proyecto {
  id: string;
  numero: number;
  nombre: string;
  clienteId: string;
  sectorId: string | null;
}

export interface CrearProyectoDto {
  nombre: string;
  clienteId: string;
  sectorId?: string;
}

export interface ActualizarProyectoDto {
  nombre?: string;
  clienteId?: string;
  sectorId?: string;
}
