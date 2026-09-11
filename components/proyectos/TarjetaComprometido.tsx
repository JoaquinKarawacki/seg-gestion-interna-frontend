"use client";

import { useState } from "react";
import { BarraCostosProyecto } from "@/components/proyectos/BarraCostosProyecto";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { formatearNumero } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion, Moneda } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { calcularDesglosePorTarea, calcularResumenCostos } from "@/lib/proyectos/presentacion";
import { useMapaTiposCambio, useTiposCambio } from "@/lib/tipos-cambio/hooks";
import type { Tarea } from "@/lib/tareas/tipos";

export function TarjetaComprometido({
  cotizaciones,
  ordenesCompra,
  tareas,
}: {
  cotizaciones: Cotizacion[] | undefined;
  ordenesCompra: OrdenCompra[] | undefined;
  tareas: Tarea[] | undefined;
}) {
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | undefined>(undefined);
  const tiposCambio = useTiposCambio();
  const mapaTiposCambio = useMapaTiposCambio();
  const mapaProveedores = useMapaProveedores();
  const tasas = new Map<Moneda, number>(
    Array.from(mapaTiposCambio, ([moneda, tipoCambio]) => [moneda, Number(tipoCambio.valorEnUyu)]),
  );

  const encabezado = <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Costos y ejecución</h2>;

  if (!cotizaciones || !ordenesCompra || !tareas || !tiposCambio.data) {
    return (
      <div className="flex flex-col gap-2">
        {encabezado}
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  const resumen = calcularResumenCostos(cotizaciones, ordenesCompra, tasas, monedaSeleccionada);

  if (!resumen) {
    return (
      <div className="flex flex-col gap-2">
        {encabezado}
        <p className="text-sm text-gray-400">Sin cotizaciones activas</p>
      </div>
    );
  }

  const { moneda, monedasDisponibles, costoSeg, ejecucion } = resumen;
  const desglose = calcularDesglosePorTarea(tareas, cotizaciones, ordenesCompra, tasas, moneda).filter(
    (tarea) => tarea.proveedores.length > 0,
  );

  function cambiarMoneda() {
    const indiceActual = monedasDisponibles.indexOf(moneda);
    const siguiente = monedasDisponibles[(indiceActual + 1) % monedasDisponibles.length];
    setMonedaSeleccionada(siguiente);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        {encabezado}
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">{moneda}</span>
          {monedasDisponibles.length > 1 ? <BotonAccionFila onClick={cambiarMoneda}>Cambiar</BotonAccionFila> : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Costo SEG</span>
        <span className="font-medium text-gray-800">{formatearNumero(costoSeg)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Ejecución</span>
        <span className="font-medium text-gray-800">{formatearNumero(ejecucion)}</span>
      </div>

      <BarraCostosProyecto costoSeg={costoSeg} ejecucion={ejecucion} />

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
        <p className="text-xs uppercase tracking-wide text-gray-400">Desglose por tarea</p>
        {desglose.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay nada cotizado ni pagado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {desglose.map((tarea) => {
              const nombreTarea = tareas.find((item) => item.id === tarea.tareaId)?.nombre ?? "—";
              return (
                <li key={tarea.tareaId} className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-gray-600">{nombreTarea}</p>
                  <ul className="flex flex-col gap-1">
                    {tarea.proveedores.map((proveedor) => (
                      <li
                        key={proveedor.proveedorId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-1.5 text-xs"
                      >
                        <span className="font-medium text-gray-800">
                          {mapaProveedores.get(proveedor.proveedorId)?.nombre ?? "—"}
                        </span>
                        <span className="text-gray-500">
                          Cotizado {formatearNumero(proveedor.cotizado)} · Pagado{" "}
                          {formatearNumero(proveedor.pagado)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
