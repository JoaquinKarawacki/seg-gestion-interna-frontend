import type { Moneda } from "@/lib/cotizaciones/tipos";

export type TipoOC = "ARTICULO" | "SERVICIO";
export type FormaPago =
  | "CONTADO_CONTRA_ENTREGA"
  | "TARJETA_CREDITO"
  | "DIFERIDO"
  | "GIRO_RED_COBRANZA"
  | "TRANSFERENCIA_BANCARIA";
export type EstadoOP =
  | "BORRADOR"
  | "PENDIENTE"
  | "EN_CONSULTA"
  | "APROBADO"
  | "RECHAZADO"
  | "PAGO_OBSERVADO"
  | "PAGADO"
  | "ANULADO";

export interface OrdenPago {
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
  estado: EstadoOP;
}

export interface CrearOrdenPagoDto {
  tipo: TipoOC;
  fecha: string;
  sectorId: string;
  proveedorId: string;
  cotizacionId?: string;
  // Fase 2: cuando la OP se genera desde una Orden de Compra aprobada. El backend
  // deriva la cotización (y con ella proyecto/cliente/tarea) de esta OC.
  ordenCompraId?: string;
  moneda: Moneda;
  monto: number;
  concepto: string;
  formaPago: FormaPago;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones?: string;
  factura?: File;
  // Confirmación explícita para permitir que el monto supere el de la OC vinculada
  // (el backend bloquea con MONTO_EXCEDE_COTIZACION si no viene).
  confirmarExcesoMonto?: boolean;
}

export interface ActualizarOrdenPagoDto {
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

export interface FiltrosOrdenPago {
  proyectoId?: string;
  cotizacionId?: string;
  estado?: EstadoOP;
  sectorId?: string;
  solicitanteId?: string;
  pagina?: number;
  porPagina?: number;
}

export interface HistorialEstadoOP {
  id: string;
  estadoAnterior: EstadoOP;
  estadoNuevo: EstadoOP;
  usuarioId: string;
  motivo: string | null;
  creadoEn: string;
}

export const TIPO_ARCHIVO_FACTURA_ACEPTADO = "application/pdf";
export const TAMANO_MAXIMO_ARCHIVO_FACTURA_BYTES = 10 * 1024 * 1024;
