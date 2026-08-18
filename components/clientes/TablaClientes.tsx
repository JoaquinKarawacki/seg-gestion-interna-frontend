"use client";

import { useState } from "react";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useEliminarCliente } from "@/lib/clientes/hooks";
import type { Cliente } from "@/lib/clientes/tipos";

export function TablaClientes({
  clientes,
  onEditar,
}: {
  clientes: Cliente[];
  onEditar: (cliente: Cliente) => void;
}) {
  const eliminarCliente = useEliminarCliente();
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  async function manejarEliminar(cliente: Cliente) {
    if (!window.confirm(`¿Eliminar el cliente "${cliente.nombre}"?`)) return;
    setErrorEliminar(null);
    try {
      await eliminarCliente.mutateAsync(cliente.id);
    } catch (error) {
      setErrorEliminar(error);
    }
  }

  if (clientes.length === 0) {
    return <EstadoVacio titulo="No hay clientes registrados" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {errorEliminar ? <EstadoError error={errorEliminar} /> : null}
      <Tabla>
        <thead>
          <TablaFila>
            <TablaEncabezadoCelda>Nombre</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>RUT</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>Email</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>Teléfono</TablaEncabezadoCelda>
            <TablaEncabezadoCelda />
          </TablaFila>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <TablaFila key={cliente.id}>
              <TablaCelda className="font-semibold text-gray-900">{cliente.nombre}</TablaCelda>
              <TablaCelda>{cliente.rut}</TablaCelda>
              <TablaCelda>{cliente.email ?? "—"}</TablaCelda>
              <TablaCelda>{cliente.telefono ?? "—"}</TablaCelda>
              <TablaCelda>
                <div className="flex justify-end gap-1">
                  <BotonAccionFila onClick={() => onEditar(cliente)}>
                    <IconoEditar className="h-3.5 w-3.5" />
                    Editar
                  </BotonAccionFila>
                  <BotonAccionFila
                    onClick={() => manejarEliminar(cliente)}
                    disabled={eliminarCliente.isPending}
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
