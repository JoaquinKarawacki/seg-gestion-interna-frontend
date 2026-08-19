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

// Sin prefijo de moneda — para pantallas donde la moneda ya se muestra una
// sola vez aparte (ej. la tarjeta "Comprometido" de Proyecto).
export function formatearNumero(monto: string | number): string {
  const numero = Number(monto);
  return Number.isFinite(numero)
    ? numero.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(monto);
}

export function formatearMonto(montoTotal: string, moneda: Moneda): string {
  return `${moneda} ${formatearNumero(montoTotal)}`;
}
