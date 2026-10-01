"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TablaSolicitudesCompra } from "@/components/solicitudes-compra/TablaSolicitudesCompra";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { useSolicitudesCompraCatalogo } from "@/lib/solicitudes-compra/hooks";
import { ETIQUETAS_ESTADO_SC } from "@/lib/solicitudes-compra/presentacion";
import type { EstadoSolicitudCompra } from "@/lib/solicitudes-compra/tipos";

export default function PaginaSolicitudesCompra() {
  const solicitudes = useSolicitudesCompraCatalogo();
  const mapaProveedores = useMapaProveedores();

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoSolicitudCompra | "">("");

  const filtradas = useMemo(() => {
    if (!solicitudes.data) return [];
    const texto = busqueda.trim().toLowerCase();
    return solicitudes.data.filter((solicitud) => {
      if (estado && solicitud.estado !== estado) return false;
      if (!texto) return true;
      const proveedor = mapaProveedores.get(solicitud.proveedorId)?.nombre ?? "";
      return (
        String(solicitud.numero).includes(texto) ||
        solicitud.concepto.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto)
      );
    });
  }, [solicitudes.data, busqueda, estado, mapaProveedores]);

  const hayFiltrosActivos = busqueda.trim() !== "" || estado !== "";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
          <p className="text-sm text-gray-500">Solicitudes de compra a proveedores por proyecto.</p>
        </div>
        <Link
          href="/solicitudes-compra/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-seg-rojo px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-seg-rojo-oscuro"
        >
          <IconoMas className="h-4 w-4" />
          Nueva orden de compra
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <Campo
            etiqueta="Buscar"
            placeholder="Número, concepto o proveedor..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value as EstadoSolicitudCompra | "")}
          >
            <option value="">Todos</option>
            {Object.entries(ETIQUETAS_ESTADO_SC).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {solicitudes.isLoading ? <Cargando etiqueta="Cargando órdenes de compra..." /> : null}
      {solicitudes.isError ? <EstadoError error={solicitudes.error} /> : null}
      {solicitudes.data ? (
        <TablaSolicitudesCompra solicitudes={filtradas} hayFiltrosActivos={hayFiltrosActivos} />
      ) : null}
    </div>
  );
}
