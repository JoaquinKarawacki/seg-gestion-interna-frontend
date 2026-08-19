export type Moneda = "UYU" | "USD" | "EUR";
export type EstadoCotizacion = "ACTIVA" | "REEMPLAZADA";

export interface Cotizacion {
  id: string;
  proyectoId: string;
  tareaId: string | null;
  proveedorId: string;
  montoTotal: string;
  honorarios: string | null;
  moneda: Moneda;
  estado: EstadoCotizacion;
  archivoPdfRuta: string | null;
}

export interface CrearCotizacionDto {
  proyectoId: string;
  tareaId?: string;
  proveedorId: string;
  montoTotal: number;
  // Solo tiene sentido cuando `tareaId` no viene (cotización general del
  // proyecto) — el backend rechaza el request si se manda junto a tareaId.
  honorarios?: number;
  moneda: Moneda;
  archivo?: File;
}

export const TIPO_ARCHIVO_COTIZACION_ACEPTADO = "application/pdf";
export const TAMANO_MAXIMO_ARCHIVO_COTIZACION_BYTES = 10 * 1024 * 1024;
