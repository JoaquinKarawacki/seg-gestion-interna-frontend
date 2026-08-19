import type { Moneda } from "@/lib/cotizaciones/tipos";

export interface TipoCambio {
  moneda: Moneda;
  valorEnUyu: string;
}

export interface ActualizarTipoCambioDto {
  valorEnUyu: number;
}
