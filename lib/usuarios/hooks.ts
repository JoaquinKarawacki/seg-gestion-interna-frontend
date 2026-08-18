import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarUsuario,
  cambiarContrasenaPropia,
  crearUsuario,
  darDeBajaUsuario,
  listarUsuarios,
} from "@/lib/usuarios/api";
import type {
  ActualizarUsuarioDto,
  CambiarContrasenaPropiaDto,
  CrearUsuarioDto,
} from "@/lib/usuarios/tipos";

const CLAVE_USUARIOS = "usuarios";

export function useUsuarios() {
  return useQuery({ queryKey: [CLAVE_USUARIOS], queryFn: listarUsuarios });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearUsuarioDto) => crearUsuario(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_USUARIOS] }),
  });
}

export function useActualizarUsuario(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarUsuarioDto) => actualizarUsuario(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_USUARIOS] }),
  });
}

export function useDarDeBajaUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => darDeBajaUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_USUARIOS] }),
  });
}

export function useCambiarContrasenaPropia() {
  return useMutation({
    mutationFn: (dto: CambiarContrasenaPropiaDto) => cambiarContrasenaPropia(dto),
  });
}
