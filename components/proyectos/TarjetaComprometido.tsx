"use client";

import { useState } from "react";
import { BarraCostosProyecto } from "@/components/proyectos/BarraCostosProyecto";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { IconoEditar } from "@/components/ui/Iconos";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion, Moneda } from "@/lib/cotizaciones/tipos";
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
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | undefined>(undefined);

  const encabezado = (
    <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Comprometido</h2>
  );

  if (!cotizaciones || !ordenesCompra) {
    return (
      <div className="flex flex-col gap-2">
        {encabezado}
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  const resumen = calcularResumenCostos(proyecto, cotizaciones, ordenesCompra, monedaSeleccionada);

  if (!resumen) {
    return (
      <div className="flex flex-col gap-2">
        {encabezado}
        <p className="text-sm text-gray-400">Sin cotizaciones activas</p>
      </div>
    );
  }

  const {
    moneda,
    monedasDisponibles,
    costoAproximado,
    honorarios,
    costoSeg,
    costoSegEditable,
    gastado,
    margenDeEquipo,
  } = resumen;
  const porcentajeMargen =
    costoAproximado !== null && costoAproximado !== 0
      ? Math.round(((margenDeEquipo ?? 0) / costoAproximado) * 100)
      : 0;

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
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            {moneda}
          </span>
          {monedasDisponibles.length > 1 ? (
            <BotonAccionFila onClick={cambiarMoneda}>Cambiar</BotonAccionFila>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Costo aproximado</p>
        <p className="text-2xl font-bold text-seg-rojo">
          {costoAproximado !== null ? formatearMonto(String(costoAproximado), moneda) : "—"}
        </p>
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
          {costoSegEditable ? <EdicionCostoSeg proyecto={proyecto} valorActual={costoSeg} /> : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Gastado</span>
        <span className="font-medium text-gray-800">{formatearMonto(String(gastado), moneda)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Margen de equipo</span>
        <span className="font-semibold text-gray-900">
          {margenDeEquipo !== null ? `${formatearMonto(String(margenDeEquipo), moneda)} (${porcentajeMargen}%)` : "—"}
        </span>
      </div>

      <BarraCostosProyecto
        moneda={moneda}
        costoCliente={costoAproximado ?? 0}
        costoSeg={costoSeg}
        gastado={gastado}
      />
    </div>
  );
}
