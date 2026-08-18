import type { RolUsuario } from "@/lib/auth/tipos";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  sectorId: string | null;
}

export interface CrearUsuarioDto {
  nombre: string;
  email: string;
  contrasena: string;
  rol: RolUsuario;
  sectorId?: string;
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  email?: string;
  rol?: RolUsuario;
  sectorId?: string;
  activo?: boolean;
}

export interface CambiarContrasenaPropiaDto {
  contrasenaActual: string;
  contrasenaNueva: string;
}
