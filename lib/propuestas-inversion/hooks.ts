import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearPropuestaInversion,
  descargarArchivoPropuestaInversion,
  listarPropuestasDeProyecto,
  obtenerPropuestaInversion,
} from "@/lib/propuestas-inversion/api";
import type { CrearPropuestaInversionDto } from "@/lib/propuestas-inversion/tipos";

const CLAVE_PROPUESTAS_INVERSION = "propuestas-inversion";

export function usePropuestasInversionDeProyecto(proyectoId: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_PROPUESTAS_INVERSION, "proyecto", proyectoId],
    queryFn: () => listarPropuestasDeProyecto(proyectoId as string),
    enabled: Boolean(proyectoId),
  });
}

export function usePropuestaInversion(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_PROPUESTAS_INVERSION, id],
    queryFn: () => obtenerPropuestaInversion(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearPropuestaInversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearPropuestaInversionDto) => crearPropuestaInversion(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROPUESTAS_INVERSION] }),
  });
}

export function useDescargarPropuestaInversion() {
  return useMutation({
    mutationFn: async (propuesta: { id: string; nombreSugerido: string }) => {
      const { blob, nombreArchivo } = await descargarArchivoPropuestaInversion(propuesta.id);
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? propuesta.nombreSugerido;
      window.document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
