"use client";

import { TablaCelda } from "@/components/ui/Tabla";
import { useTareasDeProyecto } from "@/lib/tareas/hooks";
import { useCotizacionesDeProyecto } from "@/lib/cotizaciones/hooks";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";

export function ResumenFilaProyecto({ proyectoId }: { proyectoId: string }) {
  const tareas = useTareasDeProyecto(proyectoId);
  const cotizaciones = useCotizacionesDeProyecto(proyectoId);

  const activas = cotizaciones.data?.filter((cotizacion) => cotizacion.estado === "ACTIVA") ?? [];
  const monedas = new Set(activas.map((cotizacion) => cotizacion.moneda));

  let textoCotizaciones = "—";
  if (activas.length > 0) {
    const cantidad = `${activas.length} ${activas.length === 1 ? "activa" : "activas"}`;
    if (monedas.size === 1) {
      const moneda = activas[0].moneda;
      const total = activas.reduce((acc, cotizacion) => acc + Number(cotizacion.montoTotal), 0);
      textoCotizaciones = `${cantidad} · ${formatearMonto(String(total), moneda)}`;
    } else {
      textoCotizaciones = cantidad;
    }
  }

  return (
    <>
      <TablaCelda>
        {tareas.data ? (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {tareas.data.length} {tareas.data.length === 1 ? "tarea" : "tareas"}
          </span>
        ) : (
          <span className="text-gray-300">···</span>
        )}
      </TablaCelda>
      <TablaCelda>{cotizaciones.data ? textoCotizaciones : <span className="text-gray-300">···</span>}</TablaCelda>
    </>
  );
}
