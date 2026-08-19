"use client";

import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import type { Moneda } from "@/lib/cotizaciones/tipos";

// Comparación de magnitudes (no de categorías) — mismo criterio secuencial de
// un solo tono que ya usaba BarraComprometido: más oscuro = más monto.
const FILAS = [
  { clave: "costoCliente", etiqueta: "Costo cliente", clase: "bg-seg-rojo-profundo" },
  { clave: "costoSeg", etiqueta: "Costo SEG", clase: "bg-seg-rojo-oscuro" },
  { clave: "gastado", etiqueta: "Gastado", clase: "bg-seg-rojo" },
] as const;

export function BarraCostosProyecto({
  moneda,
  costoCliente,
  costoSeg,
  gastado,
}: {
  moneda: Moneda;
  costoCliente: number;
  costoSeg: number;
  gastado: number;
}) {
  const valores = { costoCliente, costoSeg, gastado };
  const maximo = Math.max(costoCliente, costoSeg, gastado, 1);

  return (
    <ul className="flex flex-col gap-2">
      {FILAS.map((fila) => {
        const valor = valores[fila.clave];
        return (
          <li key={fila.clave} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{fila.etiqueta}</span>
              <span className="font-medium text-gray-700">{formatearMonto(String(valor), moneda)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${fila.clase}`}
                style={{ width: `${Math.max((valor / maximo) * 100, valor > 0 ? 2 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
