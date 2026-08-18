import type { Moneda } from "@/lib/cotizaciones/tipos";

export type TipoOC = "ARTICULO" | "SERVICIO";
export type FormaPago =
  | "CONTADO_CONTRA_ENTREGA"
  | "TARJETA_CREDITO"
  | "DIFERIDO"
  | "GIRO_RED_COBRANZA"
  | "TRANSFERENCIA_BANCARIA";
export type EstadoOC =
  | "BORRADOR"
  | "PENDIENTE"
  | "EN_CONSULTA"
  | "APROBADO"
  | "RECHAZADO"
  | "PAGO_OBSERVADO"
  | "PAGADO"
  | "ANULADO";

export interface OrdenCompra {
  id: string;
  numero: number;
  tipo: TipoOC;
  fecha: string;
  solicitanteId: string;
  sectorId: string;
  proveedorId: string;
  clienteId: string | null;
  proyectoId: string | null;
  tareaId: string | null;
  cotizacionId: string | null;
  moneda: Moneda;
  monto: string;
  concepto: string;
  formaPago: FormaPago;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones: string | null;
  facturaPdfRuta: string | null;
  estado: EstadoOC;
}

export interface CrearOrdenCompraDto {
  tipo: TipoOC;
  fecha: string;
  sectorId: string;
  proveedorId: string;
  cotizacionId?: string;
  moneda: Moneda;
  monto: number;
  concepto: string;
  formaPago: FormaPago;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones?: string;
  factura?: File;
}

export interface ActualizarOrdenCompraDto {
  tipo?: TipoOC;
  fecha?: string;
  sectorId?: string;
  proveedorId?: string;
  moneda?: Moneda;
  concepto?: string;
  formaPago?: FormaPago;
  pagaIva?: boolean;
  ivaIncluido?: boolean;
  observaciones?: string;
}

export interface FiltrosOrdenCompra {
  proyectoId?: string;
  cotizacionId?: string;
  estado?: EstadoOC;
  sectorId?: string;
  solicitanteId?: string;
  pagina?: number;
  porPagina?: number;
}

export interface HistorialEstadoOC {
  id: string;
  estadoAnterior: EstadoOC;
  estadoNuevo: EstadoOC;
  usuarioId: string;
  motivo: string | null;
  creadoEn: string;
}

export const TIPO_ARCHIVO_FACTURA_ACEPTADO = "application/pdf";
export const TAMANO_MAXIMO_ARCHIVO_FACTURA_BYTES = 10 * 1024 * 1024;
