import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearCotizacion,
  descargarArchivoCotizacion,
  listarCotizacionesDeProyecto,
  obtenerCotizacion,
} from "@/lib/cotizaciones/api";
import type { CrearCotizacionDto } from "@/lib/cotizaciones/tipos";

const CLAVE_COTIZACIONES = "cotizaciones";

export function useCotizacionesDeProyecto(proyectoId: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_COTIZACIONES, "proyecto", proyectoId],
    queryFn: () => listarCotizacionesDeProyecto(proyectoId as string),
    enabled: Boolean(proyectoId),
  });
}

export function useCotizacion(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_COTIZACIONES, id],
    queryFn: () => obtenerCotizacion(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearCotizacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearCotizacionDto) => crearCotizacion(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_COTIZACIONES] }),
  });
}

export function useDescargarCotizacion() {
  return useMutation({
    mutationFn: async (cotizacion: { id: string; nombreSugerido: string }) => {
      const { blob, nombreArchivo } = await descargarArchivoCotizacion(cotizacion.id);
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? cotizacion.nombreSugerido;
      window.document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
