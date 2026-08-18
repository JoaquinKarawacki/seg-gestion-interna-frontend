export interface Tarea {
  id: string;
  nombre: string;
  proyectoId: string;
}

export interface CrearTareaDto {
  nombre: string;
  proyectoId: string;
}

export interface ActualizarTareaDto {
  nombre: string;
}
