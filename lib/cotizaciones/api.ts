import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { Cotizacion, CotizacionBusqueda } from "@/lib/cotizaciones/tipos";

// Búsqueda global de cotizaciones. Acotada por porPagina para poder filtrar
// client-side (patrón catálogo) — Fase 1 no necesita paginar de verdad acá.
export async function listarCotizaciones(porPagina = 200) {
  const { datos } = await peticion<RespuestaLista<CotizacionBusqueda>>(
    `/cotizaciones?porPagina=${porPagina}`,
  );
  return datos;
}

export async function listarCotizacionesDeProyecto(proyectoId: string) {
  const { datos } = await peticion<RespuestaLista<Cotizacion>>(
    `/proyectos/${proyectoId}/cotizaciones`,
  );
  return datos;
}

export async function obtenerCotizacion(id: string) {
  const { datos } = await peticion<RespuestaExitosa<Cotizacion>>(`/cotizaciones/${id}`);
  return datos;
}

export function descargarArchivoCotizacion(id: string) {
  return peticionBinaria(`/cotizaciones/${id}/archivo`);
}
