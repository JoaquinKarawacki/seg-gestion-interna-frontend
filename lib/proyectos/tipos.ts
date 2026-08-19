export interface Proyecto {
  id: string;
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
