import type { RolUsuario } from "@/lib/auth/tipos";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  roles: RolUsuario[];
  activo: boolean;
  sectorId: string | null;
  sectoresEncargadoIds: string[];
}

export interface CrearUsuarioDto {
  nombre: string;
  email: string;
  contrasena: string;
  roles: RolUsuario[];
  sectorId?: string;
  sectoresEncargadoIds?: string[];
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  email?: string;
  roles?: RolUsuario[];
  sectorId?: string | null;
  activo?: boolean;
  sectoresEncargadoIds?: string[];
}

export interface CambiarContrasenaPropiaDto {
  contrasenaActual: string;
  contrasenaNueva: string;
}
