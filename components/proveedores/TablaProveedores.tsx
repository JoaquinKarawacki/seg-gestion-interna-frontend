"use client";

import { useState } from "react";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useEliminarProveedor } from "@/lib/proveedores/hooks";
import { ETIQUETAS_TIPO_CUENTA } from "@/lib/proveedores/presentacion";
import type { Proveedor } from "@/lib/proveedores/tipos";

export function TablaProveedores({
  proveedores,
  puedeEditar,
  onEditar,
}: {
  proveedores: Proveedor[];
  puedeEditar: boolean;
  onEditar: (proveedor: Proveedor) => void;
}) {
  const eliminarProveedor = useEliminarProveedor();
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  async function manejarEliminar(proveedor: Proveedor) {
    if (!window.confirm(`¿Eliminar el proveedor "${proveedor.nombre}"?`)) return;
    setErrorEliminar(null);
    try {
      await eliminarProveedor.mutateAsync(proveedor.id);
    } catch (error) {
      setErrorEliminar(error);
    }
  }

  if (proveedores.length === 0) {
    return <EstadoVacio titulo="No hay proveedores registrados" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {errorEliminar ? <EstadoError error={errorEliminar} /> : null}
      <Tabla>
        <thead>
          <TablaFila>
            <TablaEncabezadoCelda>Nombre</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>RUT</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>Banco</TablaEncabezadoCelda>
            <TablaEncabezadoCelda>Cuenta</TablaEncabezadoCelda>
            {puedeEditar ? <TablaEncabezadoCelda /> : null}
          </TablaFila>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <TablaFila key={proveedor.id}>
              <TablaCelda className="font-semibold text-gray-900">{proveedor.nombre}</TablaCelda>
              <TablaCelda>{proveedor.rut}</TablaCelda>
              <TablaCelda>{proveedor.banco}</TablaCelda>
              <TablaCelda>
                {ETIQUETAS_TIPO_CUENTA[proveedor.tipoCuenta]} · {proveedor.numeroCuenta}
              </TablaCelda>
              {puedeEditar ? (
                <TablaCelda>
                  <div className="flex justify-end gap-1">
                    <BotonAccionFila onClick={() => onEditar(proveedor)}>
                      <IconoEditar className="h-3.5 w-3.5" />
                      Editar
                    </BotonAccionFila>
                    <BotonAccionFila
                      onClick={() => manejarEliminar(proveedor)}
                      disabled={eliminarProveedor.isPending}
                    >
                      <IconoEliminar className="h-3.5 w-3.5" />
                      Eliminar
                    </BotonAccionFila>
                  </div>
                </TablaCelda>
              ) : null}
            </TablaFila>
          ))}
        </tbody>
      </Tabla>
    </div>
  );
}
