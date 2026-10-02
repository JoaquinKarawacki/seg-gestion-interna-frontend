import type { Moneda } from "@/lib/cotizaciones/tipos";
import type { FormaPago } from "@/lib/ordenes-pago/tipos";

export type TipoOrdenCompra = "ARTICULO" | "SERVICIO";
export type EstadoOC =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "ANULADO";

// La "Orden de Compra" (OC) de negocio. En el código/backend es OrdenCompra y
// vive en /ordenes-compra. No confundir con el módulo `ordenes-pago` del front,
// que modela la "Orden de Pago" (OP).
export interface OrdenCompra {
  id: string;
  numero: number;
  tipo: TipoOrdenCompra;
  fecha: string;
  solicitanteId: string;
  sectorId: string;
  proveedorId: string;
  clienteId: string | null;
  proyectoId: string;
  rubroId: string;
  tareaId: string;
  cotizacionId: string;
  moneda: Moneda;
  monto: string;
  concepto: string;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones: string | null;
  archivoPdfRuta: string;
  estado: EstadoOC;
  esPagoUnico: boolean;
  pagoUnicoFormaPago: FormaPago | null;
}

// rubroId y rubroNombre son mutuamente excluyentes: se manda uno u otro.
// rubroNombre es el caso "Otros" (el backend crea/reutiliza el rubro por nombre).
export interface CrearOrdenCompraDto {
  tipo: TipoOrdenCompra;
  sectorId: string;
  proveedorId: string;
  proyectoId: string;
  rubroId?: string;
  rubroNombre?: string;
  moneda: Moneda;
  monto: number;
  concepto: string;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones?: string;
  adjunto?: File;
  // Pago único: al aprobar la OC, el backend genera la OP por el total con esta forma de pago.
  esPagoUnico?: boolean;
  pagoUnicoFormaPago?: FormaPago;
}

export interface FiltrosOrdenCompra {
  proyectoId?: string;
  estado?: EstadoOC;
  sectorId?: string;
  solicitanteId?: string;
  pagina?: number;
  porPagina?: number;
}

export interface HistorialOrdenCompra {
  id: string;
  estadoAnterior: EstadoOC;
  estadoNuevo: EstadoOC;
  usuarioId: string;
  motivo: string | null;
  creadoEn: string;
}

export const TIPO_ARCHIVO_ADJUNTO_ACEPTADO = "application/pdf";
export const TAMANO_MAXIMO_ARCHIVO_ADJUNTO_BYTES = 10 * 1024 * 1024;
