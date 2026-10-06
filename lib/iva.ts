// IVA general de Uruguay. Fijo porque hoy no hay ningún lado del sistema que
// permita cargar una tasa distinta (ni en Cotizacion ni en OrdenPago).
export const TASA_IVA_URUGUAY = 0.22;

// A partir de un monto neto (sin IVA) devuelve el monto con IVA incluido.
export function calcularMontoConIva(montoNeto: number): number {
  return montoNeto * (1 + TASA_IVA_URUGUAY);
}
