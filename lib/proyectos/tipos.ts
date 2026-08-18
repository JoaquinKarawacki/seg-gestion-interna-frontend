export interface Proyecto {
  id: string;
  nombre: string;
  clienteId: string;
}

export interface CrearProyectoDto {
  nombre: string;
  clienteId: string;
}

export interface ActualizarProyectoDto {
  nombre?: string;
  clienteId?: string;
}
