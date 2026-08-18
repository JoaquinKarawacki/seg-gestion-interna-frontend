export type Moneda = "UYU" | "USD" | "EUR";
export type EstadoCotizacion = "ACTIVA" | "REEMPLAZADA";

export interface Cotizacion {
  id: string;
  proyectoId: string;
  tareaId: string | null;
  proveedorId: string;
  montoTotal: string;
  moneda: Moneda;
  estado: EstadoCotizacion;
  archivoPdfRuta: string | null;
}

export interface CrearCotizacionDto {
  proyectoId: string;
  tareaId?: string;
  proveedorId: string;
  montoTotal: number;
  moneda: Moneda;
  archivo?: File;
}

export const TIPO_ARCHIVO_COTIZACION_ACEPTADO = "application/pdf";
export const TAMANO_MAXIMO_ARCHIVO_COTIZACION_BYTES = 10 * 1024 * 1024;
