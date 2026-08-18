import type { TonoInsignia } from "@/components/ui/Insignia";
import type { EstadoCotizacion, Moneda } from "@/lib/cotizaciones/tipos";

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
