"use client";

import { useState } from "react";
import { RequiereRol } from "@/components/layout/RequiereRol";
import { ModalSector } from "@/components/sectores/ModalSector";
import { TablaSectores } from "@/components/sectores/TablaSectores";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useSectores } from "@/lib/sectores/hooks";
import type { Sector } from "@/lib/sectores/tipos";

export default function PaginaSectores() {
  const sectores = useSectores();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sectorEditando, setSectorEditando] = useState<Sector | null>(null);

  function abrirCrear() {
    setSectorEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(sector: Sector) {
    setSectorEditando(sector);
    setModalAbierto(true);
  }

  return (
    <RequiereRol roles={["ADMIN"]}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sectores</h1>
            <p className="text-sm text-gray-500">Áreas internas a las que pertenecen los usuarios.</p>
          </div>
          <Boton tamanio="sm" onClick={abrirCrear}>
            <IconoMas className="h-4 w-4" />
            Nuevo sector
          </Boton>
        </div>

        {sectores.isLoading ? <Cargando etiqueta="Cargando sectores..." /> : null}
        {sectores.isError ? <EstadoError error={sectores.error} /> : null}
        {sectores.data ? <TablaSectores sectores={sectores.data} onEditar={abrirEditar} /> : null}

        {modalAbierto ? (
          <ModalSector sector={sectorEditando} onCerrar={() => setModalAbierto(false)} />
        ) : null}
      </div>
    </RequiereRol>
  );
}
