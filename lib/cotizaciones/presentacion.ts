import type { TonoInsignia } from "@/components/ui/Insignia";
import type { Cotizacion, EstadoCotizacion, Moneda } from "@/lib/cotizaciones/tipos";

export const MONEDAS: Moneda[] = ["UYU", "USD", "EUR"];

export const ETIQUETAS_ESTADO_COTIZACION: Record<EstadoCotizacion, string> = {
  ACTIVA: "Activa",
  REEMPLAZADA: "Reemplazada",
};

export const TONO_ESTADO_COTIZACION: Record<EstadoCotizacion, TonoInsignia> = {
  ACTIVA: "negro",
  REEMPLAZADA: "apagado",
};

export function formatearMonto(montoTotal: string, moneda: Moneda): string {
  const numero = Number(montoTotal);
  const formateado = Number.isFinite(numero)
    ? numero.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : montoTotal;
  return `${moneda} ${formateado}`;
}

export interface ComprometidoPorProveedor {
  proveedorId: string;
  total: number;
}

export interface ComprometidoPorMoneda {
  moneda: Moneda;
  total: number;
  porProveedor: ComprometidoPorProveedor[];
}

export function calcularComprometido(cotizaciones: Cotizacion[]): ComprometidoPorMoneda[] {
  const porMoneda = new Map<Moneda, Map<string, number>>();

  for (const cotizacion of cotizaciones) {
    if (cotizacion.estado !== "ACTIVA") continue;
    const totalesPorProveedor = porMoneda.get(cotizacion.moneda) ?? new Map<string, number>();
    totalesPorProveedor.set(
      cotizacion.proveedorId,
      (totalesPorProveedor.get(cotizacion.proveedorId) ?? 0) + Number(cotizacion.montoTotal),
    );
    porMoneda.set(cotizacion.moneda, totalesPorProveedor);
  }

  return Array.from(porMoneda, ([moneda, totalesPorProveedor]) => {
    const porProveedor = Array.from(totalesPorProveedor, ([proveedorId, total]) => ({ proveedorId, total })).sort(
      (a, b) => b.total - a.total,
    );
    const total = porProveedor.reduce((acc, item) => acc + item.total, 0);
    return { moneda, total, porProveedor };
  });
}
