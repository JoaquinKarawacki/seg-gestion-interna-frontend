export interface Sector {
  id: string;
  nombre: string;
}

export interface CrearSectorDto {
  nombre: string;
}

export interface ActualizarSectorDto {
  nombre?: string;
}
