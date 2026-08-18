export type RolUsuario = "SOLICITANTE" | "ENCARGADO" | "PAGOS" | "ADMIN";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  sectorId: string | null;
}

export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

export interface SesionIniciada {
  token: string;
  usuario: Usuario;
}

export interface PayloadJwt {
  sub: string;
  email: string;
  rol: RolUsuario;
  sectorId: string | null;
  exp?: number;
}
