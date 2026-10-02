import { useMutation, useQuery } from "@tanstack/react-query";
import {
  descargarArchivoCotizacion,
  listarCotizaciones,
  listarCotizacionesDeProyecto,
  obtenerCotizacion,
} from "@/lib/cotizaciones/api";

const CLAVE_COTIZACIONES = "cotizaciones";

// Búsqueda global (página /cotizaciones) — se filtra client-side.
export function useCotizaciones() {
  return useQuery({
    queryKey: [CLAVE_COTIZACIONES, "busqueda"],
    queryFn: () => listarCotizaciones(),
  });
}

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
