export interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  email: string | null;
  telefono: string | null;
}

export interface CrearClienteDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
}

export interface ActualizarClienteDto {
  nombre?: string;
  rut?: string;
  email?: string;
  telefono?: string;
}
