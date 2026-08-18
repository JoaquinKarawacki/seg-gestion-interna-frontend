import type { Usuario } from "./tipos";

const CLAVE_TOKEN = "seg_gi_token";
const CLAVE_USUARIO = "seg_gi_usuario";

export function guardarSesion(token: string, usuario: Usuario): void {
  window.localStorage.setItem(CLAVE_TOKEN, token);
  window.localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerUsuarioGuardado(): Usuario | null {
  if (typeof window === "undefined") return null;

  const crudo = window.localStorage.getItem(CLAVE_USUARIO);
  if (!crudo) return null;

  try {
    return JSON.parse(crudo) as Usuario;
  } catch {
    return null;
  }
}

export function borrarSesion(): void {
  window.localStorage.removeItem(CLAVE_TOKEN);
  window.localStorage.removeItem(CLAVE_USUARIO);
}
