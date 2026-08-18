import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  listarProyectos,
  obtenerProyecto,
} from "@/lib/proyectos/api";
import type { ActualizarProyectoDto, CrearProyectoDto } from "@/lib/proyectos/tipos";

const CLAVE_PROYECTOS = "proyectos";

export function useProyectos() {
  return useQuery({ queryKey: [CLAVE_PROYECTOS], queryFn: listarProyectos });
}

export function useProyecto(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_PROYECTOS, id],
    queryFn: () => obtenerProyecto(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearProyecto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearProyectoDto) => crearProyecto(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROYECTOS] }),
  });
}

export function useActualizarProyecto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarProyectoDto) => actualizarProyecto(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROYECTOS] }),
  });
}

export function useEliminarProyecto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarProyecto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROYECTOS] }),
  });
}
