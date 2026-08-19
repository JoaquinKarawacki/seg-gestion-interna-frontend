"use client";

import { useState } from "react";
import { BarraCostosProyecto } from "@/components/proyectos/BarraCostosProyecto";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { IconoEditar } from "@/components/ui/Iconos";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import { useActualizarProyecto, useRecalcularCostoSegProyecto } from "@/lib/proyectos/hooks";
import { calcularResumenCostos } from "@/lib/proyectos/presentacion";
import type { Proyecto } from "@/lib/proyectos/tipos";

function EdicionCostoSeg({ proyecto, valorActual }: { proyecto: Proyecto; valorActual: number }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(String(valorActual));
  const actualizarProyecto = useActualizarProyecto(proyecto.id);
  const recalcularCostoSeg = useRecalcularCostoSegProyecto(proyecto.id);

  async function guardar() {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0) return;
    await actualizarProyecto.mutateAsync({ costoSegManual: numero });
    setEditando(false);
  }

  if (!editando) {
    return (
      <BotonAccionFila onClick={() => { setValor(String(valorActual)); setEditando(true); }}>
        <IconoEditar className="h-3.5 w-3.5" />
        Editar
      </BotonAccionFila>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
        aria-label="Costo SEG"
        className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-seg-rojo/40 focus:border-seg-rojo"
      />
      <BotonAccionFila onClick={guardar} disabled={actualizarProyecto.isPending}>
        Guardar
      </BotonAccionFila>
      <BotonAccionFila onClick={() => setEditando(false)}>Cancelar</BotonAccionFila>
      {proyecto.costoSegManual !== null ? (
        <BotonAccionFila
          onClick={() => recalcularCostoSeg.mutate()}
          disabled={recalcularCostoSeg.isPending}
        >
          Volver a calcular
        </BotonAccionFila>
      ) : null}
    </div>
  );
}

export function TarjetaComprometido({
  proyecto,
  cotizaciones,
  ordenesCompra,
}: {
  proyecto: Proyecto;
  cotizaciones: Cotizacion[] | undefined;
  ordenesCompra: OrdenCompra[] | undefined;
}) {
  if (!cotizaciones || !ordenesCompra) {
    return <p className="text-sm text-gray-400">Cargando...</p>;
  }

  const resumen = calcularResumenCostos(proyecto, cotizaciones, ordenesCompra);

  if (!resumen) {
    return <p className="text-sm text-gray-400">Sin cotizaciones activas</p>;
  }

  const { moneda, costoAproximado, honorarios, costoSeg, gastado, margenDeEquipo, hayOtrasMonedas } = resumen;
  const porcentajeMargen = costoAproximado !== 0 ? Math.round((margenDeEquipo / costoAproximado) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Costo aproximado</p>
        <p className="text-2xl font-bold text-seg-rojo">{formatearMonto(String(costoAproximado), moneda)}</p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Honorarios</span>
        <span className="font-medium text-gray-800">
          {honorarios !== null ? formatearMonto(String(honorarios), moneda) : "—"}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Costo SEG</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{formatearMonto(String(costoSeg), moneda)}</span>
          <EdicionCostoSeg proyecto={proyecto} valorActual={costoSeg} />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Gastado</span>
        <span className="font-medium text-gray-800">{formatearMonto(String(gastado), moneda)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Margen de equipo</span>
        <span className="font-semibold text-gray-900">
          {formatearMonto(String(margenDeEquipo), moneda)} ({porcentajeMargen}%)
        </span>
      </div>

      {hayOtrasMonedas ? (
        <p className="text-xs text-gray-400">
          Hay cotizaciones de tarea u órdenes de compra pagadas en otra moneda, no incluidas en estos totales.
        </p>
      ) : null}

      <BarraCostosProyecto moneda={moneda} costoCliente={costoAproximado} costoSeg={costoSeg} gastado={gastado} />
    </div>
  );
}
