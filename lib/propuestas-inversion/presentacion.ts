import type { PropuestaInversion } from "@/lib/propuestas-inversion/tipos";

export {
  ETIQUETAS_ESTADO_COTIZACION as ETIQUETAS_ESTADO_PROPUESTA_INVERSION,
  TONO_ESTADO_COTIZACION as TONO_ESTADO_PROPUESTA_INVERSION,
} from "@/lib/cotizaciones/presentacion";

export function encontrarPropuestaActiva(
  propuestas: PropuestaInversion[],
): PropuestaInversion | null {
  return propuestas.find((propuesta) => propuesta.estado === "ACTIVA") ?? null;
}
