"use client";

import { useState } from "react";
import Link from "next/link";
import { TablaOrdenesCompra } from "@/components/ordenes-compra/TablaOrdenesCompra";
import { Boton } from "@/components/ui/Boton";
import { Select } from "@/components/ui/Select";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useAuth } from "@/lib/auth/contexto";
import { useSectores } from "@/lib/sectores/hooks";
import { useOrdenesCompraPaginadas } from "@/lib/ordenes-compra/hooks";
import { ETIQUETAS_ESTADO_OC } from "@/lib/ordenes-compra/presentacion";
import type { EstadoOC } from "@/lib/ordenes-compra/tipos";

type FiltroRapido = "todas" | "mis-borradores" | "pendientes-aprobacion" | "para-pagar";

const POR_PAGINA = 50;

export default function PaginaOrdenesCompra() {
  const { usuario } = useAuth();
  const sectores = useSectores();

  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("todas");
  const [estado, setEstado] = useState<EstadoOC | "">("");
  const [sectorId, setSectorId] = useState("");
  const [paginasCargadas, setPaginasCargadas] = useState(1);

  const soloMias = filtroRapido === "mis-borradores";

  const ordenesCompra = useOrdenesCompraPaginadas(
    {
      estado: estado || undefined,
      sectorId: sectorId || undefined,
      solicitanteId: soloMias ? usuario?.id : undefined,
    },
    paginasCargadas,
    POR_PAGINA,
  );

  function aplicarFiltroRapido(filtro: FiltroRapido) {
    setFiltroRapido(filtro);
    setPaginasCargadas(1);
    if (filtro === "todas") {
      setEstado("");
      setSectorId("");
    } else if (filtro === "mis-borradores") {
      setEstado("BORRADOR");
      setSectorId("");
    } else if (filtro === "pendientes-aprobacion") {
      setEstado("PENDIENTE");
      setSectorId(usuario?.sectorId ?? "");
    } else if (filtro === "para-pagar") {
      setEstado("APROBADO");
      setSectorId("");
    }
  }

  function cambiarEstado(valor: string) {
    setFiltroRapido("todas");
    setEstado(valor as EstadoOC | "");
    setPaginasCargadas(1);
  }

  function cambiarSector(valor: string) {
    setFiltroRapido("todas");
    setSectorId(valor);
    setPaginasCargadas(1);
  }

  const hayFiltrosActivos = filtroRapido !== "todas" || estado !== "" || sectorId !== "";
  const hayMasPaginas = ordenesCompra.registros.length < ordenesCompra.total;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
          <p className="text-sm text-gray-500">Solicitudes de pago a proveedores.</p>
        </div>
        <Link
          href="/ordenes-compra/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-seg-rojo px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-seg-rojo-oscuro"
        >
          <IconoMas className="h-4 w-4" />
          Nueva orden de compra
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Boton
          tamanio="sm"
          variante={filtroRapido === "todas" ? "rojo" : "outline"}
          onClick={() => aplicarFiltroRapido("todas")}
        >
          Todas
        </Boton>
        <Boton
          tamanio="sm"
          variante={filtroRapido === "mis-borradores" ? "rojo" : "outline"}
          onClick={() => aplicarFiltroRapido("mis-borradores")}
        >
          Mis borradores
        </Boton>
        {usuario?.rol === "ENCARGADO" ? (
          <Boton
            tamanio="sm"
            variante={filtroRapido === "pendientes-aprobacion" ? "rojo" : "outline"}
            onClick={() => aplicarFiltroRapido("pendientes-aprobacion")}
          >
            Pendientes de mi aprobación
          </Boton>
        ) : null}
        {usuario?.rol === "PAGOS" ? (
          <Boton
            tamanio="sm"
            variante={filtroRapido === "para-pagar" ? "rojo" : "outline"}
            onClick={() => aplicarFiltroRapido("para-pagar")}
          >
            Para pagar
          </Boton>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-[180px]">
          <Select etiqueta="Estado" value={estado} onChange={(evento) => cambiarEstado(evento.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ETIQUETAS_ESTADO_OC).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[180px]">
          <Select
            etiqueta="Sector"
            value={sectorId}
            onChange={(evento) => cambiarSector(evento.target.value)}
          >
            <option value="">Todos</option>
            {sectores.data?.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {ordenesCompra.isLoading ? <Cargando etiqueta="Cargando órdenes de compra..." /> : null}
      {ordenesCompra.isError ? <EstadoError error={ordenesCompra.error} /> : null}
      {!ordenesCompra.isLoading && !ordenesCompra.isError ? (
        <>
          <TablaOrdenesCompra ordenes={ordenesCompra.registros} hayFiltrosActivos={hayFiltrosActivos} />
          <p className="text-xs text-gray-400">
            Mostrando {ordenesCompra.registros.length} de {ordenesCompra.total}
          </p>
          {hayMasPaginas ? (
            <Boton
              tamanio="sm"
              variante="outline"
              className="self-start"
              disabled={ordenesCompra.isFetchingMas}
              onClick={() => setPaginasCargadas((actual) => actual + 1)}
            >
              {ordenesCompra.isFetchingMas ? "Cargando..." : "Cargar más"}
            </Boton>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
