"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useEliminarProyecto } from "@/lib/proyectos/hooks";
import type { Proyecto } from "@/lib/proyectos/tipos";

export function TablaProyectos({
  proyectos,
  onEditar,
}: {
  proyectos: Proyecto[];
  onEditar: (proyecto: Proyecto) => void;
}) {
  const mapaClientes = useMapaClientes();
  const eliminarProyecto = useEliminarProyecto();
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  async function manejarEliminar(proyecto: Proyecto) {
    if (!window.confirm(`¿Eliminar el proyecto "${proyecto.nombre}"?`)) return;
    setErrorEliminar(null);
    try {
      await eliminarProyecto.mutateAsync(proyecto.id);
    } catch (error) {
      setErrorEliminar(error);
    }
  }

  if (proyectos.length === 0) {
    return <EstadoVacio titulo="No hay proyectos registrados" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {errorEliminar ? <EstadoError error={errorEliminar} /> : null}
      <Tabla>
        <thead>
          <TablaFila>
            <TablaEncabezadoCelda>Nombre</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>Cliente</TablaEncabezadoCelda>
            <TablaEncabezadoCelda />
          </TablaFila>
        </thead>
        <tbody>
          {proyectos.map((proyecto) => (
            <TablaFila key={proyecto.id}>
              <TablaCelda className="font-semibold text-gray-900">
                <Link href={`/proyectos/${proyecto.id}`} className="hover:text-seg-rojo">
                  {proyecto.nombre}
                </Link>
              </TablaCelda>
              <TablaCelda>{mapaClientes.get(proyecto.clienteId)?.nombre ?? "—"}</TablaCelda>
              <TablaCelda>
                <div className="flex justify-end gap-1">
                  <BotonAccionFila onClick={() => onEditar(proyecto)}>
                    <IconoEditar className="h-3.5 w-3.5" />
                    Editar
                  </BotonAccionFila>
                  <BotonAccionFila
                    onClick={() => manejarEliminar(proyecto)}
                    disabled={eliminarProyecto.isPending}
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
