"use client";

import { useState } from "react";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoEditar } from "@/components/ui/Iconos";
import type { Moneda } from "@/lib/cotizaciones/tipos";
import { useActualizarTipoCambio, useTiposCambio } from "@/lib/tipos-cambio/hooks";

const MONEDAS_EDITABLES: Moneda[] = ["USD", "EUR"];

function FilaTipoCambio({ moneda, valorActual }: { moneda: Moneda; valorActual: string }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(valorActual);
  const actualizarTipoCambio = useActualizarTipoCambio(moneda);

  async function guardar() {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) return;
    await actualizarTipoCambio.mutateAsync({ valorEnUyu: numero });
    setEditando(false);
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500">1 {moneda} =</span>
      {editando ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.0001"
            value={valor}
            onChange={(evento) => setValor(evento.target.value)}
            aria-label={`Tipo de cambio ${moneda}`}
            className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-seg-rojo/40 focus:border-seg-rojo"
          />
          <span className="text-gray-500">UYU</span>
          <BotonAccionFila onClick={guardar} disabled={actualizarTipoCambio.isPending}>
            Guardar
          </BotonAccionFila>
          <BotonAccionFila onClick={() => setEditando(false)}>Cancelar</BotonAccionFila>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{Number(valorActual).toLocaleString("es-UY")} UYU</span>
          <BotonAccionFila onClick={() => { setValor(valorActual); setEditando(true); }}>
            <IconoEditar className="h-3.5 w-3.5" />
            Editar
          </BotonAccionFila>
        </div>
      )}
    </div>
  );
}

export function SeccionTiposCambio() {
  const tiposCambio = useTiposCambio();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-500">Tipo de cambio</h2>
      <p className="mb-4 text-xs text-gray-400">
        Se usa para convertir montos entre monedas en la tarjeta &quot;Costos y rentabilidad&quot; de cada
        proyecto. UYU es la moneda base (no tiene tipo de cambio propio).
      </p>
      {tiposCambio.isLoading ? <Cargando etiqueta="Cargando..." /> : null}
      {tiposCambio.isError ? <EstadoError error={tiposCambio.error} /> : null}
      {tiposCambio.data ? (
        <div className="flex flex-col gap-3">
          {MONEDAS_EDITABLES.map((moneda) => (
            <FilaTipoCambio
              key={moneda}
              moneda={moneda}
              valorActual={tiposCambio.data.find((tipoCambio) => tipoCambio.moneda === moneda)?.valorEnUyu ?? "1"}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
