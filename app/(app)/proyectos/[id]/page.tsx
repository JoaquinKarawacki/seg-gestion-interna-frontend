"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FichaCliente } from "@/components/proyectos/FichaCliente";
import { ProveedoresInvolucrados } from "@/components/proyectos/ProveedoresInvolucrados";
import { ModalTarea } from "@/components/tareas/ModalTarea";
import { TablaTareas } from "@/components/tareas/TablaTareas";
import { ModalCotizacion } from "@/components/cotizaciones/ModalCotizacion";
import { TablaCotizaciones } from "@/components/cotizaciones/TablaCotizaciones";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useProyecto } from "@/lib/proyectos/hooks";
import { useTareasDeProyecto } from "@/lib/tareas/hooks";
import { useCotizacionesDeProyecto } from "@/lib/cotizaciones/hooks";
import type { Tarea } from "@/lib/tareas/tipos";

export default function PaginaDetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const proyecto = useProyecto(id);
  const mapaClientes = useMapaClientes();
  const tareas = useTareasDeProyecto(id);
  const cotizaciones = useCotizacionesDeProyecto(id);

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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div>
        <Link href="/proyectos" className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Proyectos
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{proyecto.data.nombre}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Cliente</h2>
          <FichaCliente cliente={cliente} />
        </div>
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
      </div>

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
