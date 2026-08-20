import type { EstadoCotizacion, Moneda } from "@/lib/cotizaciones/tipos";

export interface PropuestaInversion {
  id: string;
  proyectoId: string;
  costoTotalAproximado: string;
  ahorroMensual: string;
  cantidadMeses: number;
  porcentajeSeg: string;
  honorarios: string;
  moneda: Moneda;
  estado: EstadoCotizacion;
  archivoRuta: string | null;
  archivoMimeType: string | null;
  archivoNombreOriginal: string | null;
}

export interface CrearPropuestaInversionDto {
  proyectoId: string;
  costoTotalAproximado: number;
  ahorroMensual: number;
  cantidadMeses: number;
  porcentajeSeg: number;
  moneda: Moneda;
  archivo?: File;
}

// A diferencia de Cotización (solo PDF), acepta también Word e imagen.
export const TIPOS_ARCHIVO_PROPUESTA_INVERSION_ACEPTADOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
export const TAMANO_MAXIMO_ARCHIVO_PROPUESTA_INVERSION_BYTES = 10 * 1024 * 1024;
