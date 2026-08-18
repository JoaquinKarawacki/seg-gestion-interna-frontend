"use client";

import type { ReactNode } from "react";
import { useConteoOrdenesCompra } from "@/lib/ordenes-compra/hooks";
import type { FiltrosOrdenCompra } from "@/lib/ordenes-compra/tipos";

type FiltrosConteo = Omit<FiltrosOrdenCompra, "pagina" | "porPagina">;

export function TarjetaConteoOC({
  etiqueta,
  icono,
  filtrosA,
  filtrosB,
}: {
  etiqueta: string;
  icono: ReactNode;
  filtrosA: FiltrosConteo;
  filtrosB?: FiltrosConteo;
}) {
  const a = useConteoOrdenesCompra(filtrosA);
  const b = useConteoOrdenesCompra(filtrosB ?? {}, { enabled: Boolean(filtrosB) });

  const cargando = a.isLoading || (Boolean(filtrosB) && b.isLoading);
  const hayError = a.isError || (Boolean(filtrosB) && b.isError);
  const total = (a.total ?? 0) + (filtrosB ? b.total ?? 0 : 0);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-seg-rojo/10 text-seg-rojo">
        {icono}
      </div>
      <div>
        {cargando ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : hayError ? (
          <p className="text-xs text-seg-rojo">No se pudo cargar</p>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{total}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">{etiqueta}</p>
      </div>
    </div>
  );
}
