"use client";

import { useState } from "react";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useEliminarSector } from "@/lib/sectores/hooks";
import type { Sector } from "@/lib/sectores/tipos";

export function TablaSectores({
  sectores,
  onEditar,
}: {
  sectores: Sector[];
  onEditar: (sector: Sector) => void;
}) {
  const eliminarSector = useEliminarSector();
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  async function manejarEliminar(sector: Sector) {
    if (!window.confirm(`¿Eliminar el sector "${sector.nombre}"?`)) return;
    setErrorEliminar(null);
    try {
      await eliminarSector.mutateAsync(sector.id);
    } catch (error) {
      setErrorEliminar(error);
    }
  }

  if (sectores.length === 0) {
    return <EstadoVacio titulo="No hay sectores registrados" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {errorEliminar ? <EstadoError error={errorEliminar} /> : null}
      <Tabla>
        <thead>
          <TablaFila>
            <TablaEncabezadoCelda>Nombre</TablaEncabezadoCelda>
            <TablaEncabezadoCelda />
          </TablaFila>
        </thead>
        <tbody>
          {sectores.map((sector) => (
            <TablaFila key={sector.id}>
              <TablaCelda className="font-semibold text-gray-900">{sector.nombre}</TablaCelda>
              <TablaCelda>
                <div className="flex justify-end gap-1">
                  <BotonAccionFila onClick={() => onEditar(sector)}>
                    <IconoEditar className="h-3.5 w-3.5" />
                    Editar
                  </BotonAccionFila>
                  <BotonAccionFila
                    onClick={() => manejarEliminar(sector)}
                    disabled={eliminarSector.isPending}
                  >
                    <IconoEliminar className="h-3.5 w-3.5" />
                    Eliminar
                  </BotonAccionFila>
                </div>
              </TablaCelda>
            </TablaFila>
          ))}
        </tbody>
      </Tabla>
    </div>
  );
}
