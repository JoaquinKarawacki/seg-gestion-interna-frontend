"use client";

import { useState } from "react";
import { ModalProyecto } from "@/components/proyectos/ModalProyecto";
import { TablaProyectos } from "@/components/proyectos/TablaProyectos";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useProyectos } from "@/lib/proyectos/hooks";
import type { Proyecto } from "@/lib/proyectos/tipos";

export default function PaginaProyectos() {
  const proyectos = useProyectos();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);

  function abrirCrear() {
    setProyectoEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(proyecto: Proyecto) {
    setProyectoEditando(proyecto);
    setModalAbierto(true);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-sm text-gray-500">Trabajos en curso o finalizados para cada cliente.</p>
        </div>
        <Boton tamanio="sm" onClick={abrirCrear}>
          <IconoMas className="h-4 w-4" />
          Nuevo proyecto
        </Boton>
      </div>

      {proyectos.isLoading ? <Cargando etiqueta="Cargando proyectos..." /> : null}
      {proyectos.isError ? <EstadoError error={proyectos.error} /> : null}
      {proyectos.data ? <TablaProyectos proyectos={proyectos.data} onEditar={abrirEditar} /> : null}

      {modalAbierto ? (
        <ModalProyecto proyecto={proyectoEditando} onCerrar={() => setModalAbierto(false)} />
      ) : null}
    </div>
  );
}
