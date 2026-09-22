import type { RolUsuario } from "@/lib/auth/tipos";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  sectorId: string | null;
  sectoresEncargadoIds: string[];
}

export interface CrearUsuarioDto {
  nombre: string;
  email: string;
  contrasena: string;
  rol: RolUsuario;
  sectorId?: string;
  sectoresEncargadoIds?: string[];
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  email?: string;
  rol?: RolUsuario;
  sectorId?: string | null;
  activo?: boolean;
  sectoresEncargadoIds?: string[];
}

export interface CambiarContrasenaPropiaDto {
  contrasenaActual: string;
  contrasenaNueva: string;
}
