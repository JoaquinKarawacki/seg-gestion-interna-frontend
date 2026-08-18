"use client";

import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import type { Tarea } from "@/lib/tareas/tipos";

export function ProveedoresInvolucrados({
  cotizaciones,
  tareas,
}: {
  cotizaciones: Cotizacion[];
  tareas: Tarea[];
}) {
  const mapaProveedores = useMapaProveedores();
  const activas = cotizaciones.filter((cotizacion) => cotizacion.estado === "ACTIVA");

  if (activas.length === 0) {
    return <EstadoVacio titulo="Todavía no hay proveedores con cotización activa" />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {activas.map((cotizacion) => {
        const alcance = cotizacion.tareaId
          ? tareas.find((tarea) => tarea.id === cotizacion.tareaId)?.nombre ?? "—"
          : "General del proyecto";

        return (
          <li
            key={cotizacion.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {mapaProveedores.get(cotizacion.proveedorId)?.nombre ?? "—"}
              </p>
              <p className="text-xs text-gray-500">{alcance}</p>
            </div>
            <p className="font-medium text-gray-700">
              {formatearMonto(cotizacion.montoTotal, cotizacion.moneda)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
