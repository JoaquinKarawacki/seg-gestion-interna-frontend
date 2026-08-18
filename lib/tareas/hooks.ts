import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarTarea,
  crearTarea,
  eliminarTarea,
  listarTareasDeProyecto,
} from "@/lib/tareas/api";
import type { ActualizarTareaDto, CrearTareaDto } from "@/lib/tareas/tipos";

const CLAVE_TAREAS = "tareas";

export function useTareasDeProyecto(proyectoId: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_TAREAS, "proyecto", proyectoId],
    queryFn: () => listarTareasDeProyecto(proyectoId as string),
    enabled: Boolean(proyectoId),
  });
}

export function useCrearTarea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearTareaDto) => crearTarea(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_TAREAS] }),
  });
}

export function useActualizarTarea(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarTareaDto) => actualizarTarea(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_TAREAS] }),
  });
}

export function useEliminarTarea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarTarea(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_TAREAS] }),
  });
}
