"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { FichaCliente } from "@/components/proyectos/FichaCliente";
import { TarjetaComprometido } from "@/components/proyectos/TarjetaComprometido";
import { ProveedoresInvolucrados } from "@/components/proyectos/ProveedoresInvolucrados";
import { ModalTarea } from "@/components/tareas/ModalTarea";
import { TablaTareas } from "@/components/tareas/TablaTareas";
import { ModalCotizacion } from "@/components/cotizaciones/ModalCotizacion";
import { TablaCotizaciones } from "@/components/cotizaciones/TablaCotizaciones";
import { TablaOrdenesCompraProyecto } from "@/components/ordenes-compra/TablaOrdenesCompraProyecto";
import { Boton, BotonLink } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useProyecto } from "@/lib/proyectos/hooks";
import { useTareasDeProyecto } from "@/lib/tareas/hooks";
import { useCotizacionesDeProyecto } from "@/lib/cotizaciones/hooks";
import { useOrdenesCompraDeProyecto } from "@/lib/ordenes-compra/hooks";
import type { Tarea } from "@/lib/tareas/tipos";

const TABS = ["resumen", "tareas", "cotizaciones", "ordenes-compra"] as const;
type Tab = (typeof TABS)[number];
const ETIQUETAS_TAB: Record<Tab, string> = {
  resumen: "Resumen",
  tareas: "Tareas",
  cotizaciones: "Cotizaciones",
  "ordenes-compra": "Órdenes de Compra",
};

export default function PaginaDetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const proyecto = useProyecto(id);
  const mapaClientes = useMapaClientes();
  const tareas = useTareasDeProyecto(id);
  const cotizaciones = useCotizacionesDeProyecto(id);
  const ordenesCompra = useOrdenesCompraDeProyecto(id);

  const [tab, setTab] = useState<Tab>("resumen");
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  const [modalCotizacionAbierto, setModalCotizacionAbierto] = useState(false);
  const [tareaIdParaCotizacion, setTareaIdParaCotizacion] = useState<string | null>(null);

  function abrirCrearTarea() {
    setTareaEditando(null);
    setModalTareaAbierto(true);
  }

  function abrirEditarTarea(tarea: Tarea) {
    setTareaEditando(tarea);
    setModalTareaAbierto(true);
  }

  function abrirNuevaCotizacion(tareaId: string | null) {
    setTareaIdParaCotizacion(tareaId);
    setModalCotizacionAbierto(true);
  }

  if (proyecto.isLoading) return <Cargando etiqueta="Cargando proyecto..." />;
  if (proyecto.isError) return <EstadoError error={proyecto.error} />;
  if (!proyecto.data) return null;

  const cliente = mapaClientes.get(proyecto.data.clienteId);
  const proveedoresActivos = cotizaciones.data
    ? new Set(
        cotizaciones.data
          .filter((cotizacion) => cotizacion.estado === "ACTIVA")
          .map((cotizacion) => cotizacion.proveedorId),
      ).size
    : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href="/proyectos" className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Proyectos
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{proyecto.data.nombre}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Cliente</h2>
          <FichaCliente cliente={cliente} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <TarjetaComprometido proyecto={proyecto.data} cotizaciones={cotizaciones.data} ordenesCompra={ordenesCompra.data} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Proveedores activos</h2>
          {proveedoresActivos === null ? (
            <Cargando etiqueta="Cargando..." />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{proveedoresActivos}</p>
          )}
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-100">
        {TABS.map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => setTab(valor)}
            className={clsx(
              "border-b-2 pb-2.5 text-sm font-semibold transition-colors",
              tab === valor ? "border-seg-rojo text-seg-rojo" : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {ETIQUETAS_TAB[valor]}
          </button>
        ))}
      </div>

      {tab === "resumen" ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
            Proveedores involucrados
          </h2>
          {cotizaciones.isLoading ? <Cargando etiqueta="Cargando..." /> : null}
          {cotizaciones.isError ? <EstadoError error={cotizaciones.error} /> : null}
          {cotizaciones.data && tareas.data ? (
            <ProveedoresInvolucrados cotizaciones={cotizaciones.data} tareas={tareas.data} />
          ) : null}
        </div>
      ) : null}

      {tab === "tareas" ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Tareas</h2>
            <Boton tamanio="sm" onClick={abrirCrearTarea}>
              <IconoMas className="h-4 w-4" />
              Nueva tarea
            </Boton>
          </div>
          {tareas.isLoading ? <Cargando etiqueta="Cargando tareas..." /> : null}
          {tareas.isError ? <EstadoError error={tareas.error} /> : null}
          {tareas.data ? <TablaTareas tareas={tareas.data} onEditar={abrirEditarTarea} /> : null}
        </div>
      ) : null}

      {tab === "cotizaciones" ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Cotizaciones</h2>
            <Boton tamanio="sm" onClick={() => abrirNuevaCotizacion(null)}>
              <IconoMas className="h-4 w-4" />
              Nueva cotización
            </Boton>
          </div>
          {cotizaciones.isLoading ? <Cargando etiqueta="Cargando cotizaciones..." /> : null}
          {cotizaciones.isError ? <EstadoError error={cotizaciones.error} /> : null}
          {cotizaciones.data && tareas.data ? (
            <TablaCotizaciones
              cotizaciones={cotizaciones.data}
              tareas={tareas.data}
              onNuevaCotizacion={abrirNuevaCotizacion}
            />
          ) : null}
        </div>
      ) : null}

      {tab === "ordenes-compra" ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Órdenes de Compra</h2>
            <BotonLink tamanio="sm" href="/ordenes-compra/nueva">
              <IconoMas className="h-4 w-4" />
              Nueva orden de compra
            </BotonLink>
          </div>
          {ordenesCompra.isLoading ? <Cargando etiqueta="Cargando órdenes de compra..." /> : null}
          {ordenesCompra.isError ? <EstadoError error={ordenesCompra.error} /> : null}
          {ordenesCompra.data && tareas.data ? (
            <TablaOrdenesCompraProyecto ordenes={ordenesCompra.data} tareas={tareas.data} />
          ) : null}
        </div>
      ) : null}

      {modalTareaAbierto ? (
        <ModalTarea
          proyectoId={proyecto.data.id}
          tarea={tareaEditando}
          onCerrar={() => setModalTareaAbierto(false)}
        />
      ) : null}

      {modalCotizacionAbierto ? (
        <ModalCotizacion
          proyectoId={proyecto.data.id}
          tareas={tareas.data ?? []}
          tareaIdInicial={tareaIdParaCotizacion}
          onCerrar={() => setModalCotizacionAbierto(false)}
        />
      ) : null}
    </div>
  );
}
