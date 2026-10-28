import { peticionBinaria } from "@/lib/http/cliente";

// Descarga el Excel de OPs aprobadas listas para pagar (endpoint solo rol PAGOS).
export function descargarExcelPagos() {
  return peticionBinaria("/exportacion-pagos");
}
