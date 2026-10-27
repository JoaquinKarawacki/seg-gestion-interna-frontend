import type { RolUsuario, Usuario } from "./tipos";

export function tieneRol(usuario: Usuario, rol: RolUsuario): boolean {
  return (usuario.roles ?? []).includes(rol);
}

export function tieneAlgunRol(usuario: Usuario, roles: RolUsuario[]): boolean {
  return roles.some((rol) => (usuario.roles ?? []).includes(rol));
}
