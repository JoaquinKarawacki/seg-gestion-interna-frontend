"use client";

import clsx from "clsx";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import type { ComprometidoPorProveedor } from "@/lib/cotizaciones/presentacion";
import type { Moneda } from "@/lib/cotizaciones/tipos";

// Rojo más oscuro = mayor monto (secuencial, un solo tono, más marcado = más peso).
// Los proveedores que no entran en los 3 escalones se agrupan en "Otros" (gris neutro)
// en vez de generar más tonos de rojo — la guía de estilos prohíbe colores adicionales.
const CLASES_POR_RANGO = ["bg-seg-rojo-profundo", "bg-seg-rojo-oscuro", "bg-seg-rojo"];
const CLASE_OTROS = "bg-gray-300";

export function BarraComprometido({
  moneda,
  porProveedor,
}: {
  moneda: Moneda;
  porProveedor: ComprometidoPorProveedor[];
}) {
  const mapaProveedores = useMapaProveedores();
  const total = porProveedor.reduce((acc, item) => acc + item.total, 0);

  const principales = porProveedor.slice(0, CLASES_POR_RANGO.length).map((item, indice) => ({
    id: item.proveedorId,
    nombre: mapaProveedores.get(item.proveedorId)?.nombre ?? "—",
    total: item.total,
    clase: CLASES_POR_RANGO[indice],
  }));
  const restoTotal = porProveedor
    .slice(CLASES_POR_RANGO.length)
    .reduce((acc, item) => acc + item.total, 0);

  const segmentos =
    restoTotal > 0
      ? [...principales, { id: "otros", nombre: "Otros proveedores", total: restoTotal, clase: CLASE_OTROS }]
      : principales;

  if (segmentos.length < 2 || total === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex h-5 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
        {segmentos.map((segmento) => (
          <div
            key={segmento.id}
            className={clsx(segmento.clase)}
            style={{ width: `${(segmento.total / total) * 100}%` }}
            title={`${segmento.nombre} · ${formatearMonto(String(segmento.total), moneda)}`}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-1">
        {segmentos.map((segmento) => (
          <li key={segmento.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-gray-600">
              <span className={clsx("h-2.5 w-2.5 rounded-full", segmento.clase)} />
              {segmento.nombre}
            </span>
            <span className="font-medium text-gray-700">
              {formatearMonto(String(segmento.total), moneda)} · {Math.round((segmento.total / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
