"use client";

import { useState } from "react";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useEliminarTarea } from "@/lib/tareas/hooks";
import type { Tarea } from "@/lib/tareas/tipos";

export function TablaTareas({
  tareas,
  onEditar,
}: {
  tareas: Tarea[];
  onEditar: (tarea: Tarea) => void;
}) {
  const eliminarTarea = useEliminarTarea();
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  async function manejarEliminar(tarea: Tarea) {
    if (!window.confirm(`¿Eliminar la tarea "${tarea.nombre}"?`)) return;
    setErrorEliminar(null);
    try {
      await eliminarTarea.mutateAsync(tarea.id);
    } catch (error) {
      setErrorEliminar(error);
    }
  }

  if (tareas.length === 0) {
    return <EstadoVacio titulo="Este proyecto todavía no tiene tareas" />;
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
          {tareas.map((tarea) => (
            <TablaFila key={tarea.id}>
              <TablaCelda className="font-semibold text-gray-900">{tarea.nombre}</TablaCelda>
              <TablaCelda>
                <div className="flex justify-end gap-1">
                  <BotonAccionFila onClick={() => onEditar(tarea)}>
                    <IconoEditar className="h-3.5 w-3.5" />
                    Editar
                  </BotonAccionFila>
                  <BotonAccionFila
                    onClick={() => manejarEliminar(tarea)}
                    disabled={eliminarTarea.isPending}
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
