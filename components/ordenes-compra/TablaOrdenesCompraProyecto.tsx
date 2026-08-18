"use client";

import Link from "next/link";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import { ETIQUETAS_ESTADO_OC, TONO_ESTADO_OC } from "@/lib/ordenes-compra/presentacion";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import type { Tarea } from "@/lib/tareas/tipos";

export function TablaOrdenesCompraProyecto({
  ordenes,
  tareas,
}: {
  ordenes: OrdenCompra[];
  tareas: Tarea[];
}) {
  const mapaProveedores = useMapaProveedores();

  const grupos = [{ id: null as string | null, nombre: "General del proyecto" }, ...tareas]
    .map((grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      ordenes: ordenes.filter((orden) => orden.tareaId === grupo.id),
    }))
    .filter((grupo) => grupo.ordenes.length > 0);

  if (grupos.length === 0) {
    return <EstadoVacio titulo="Todavía no hay órdenes de compra en este proyecto" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {grupos.map((grupo) => (
        <div key={grupo.id ?? "general"} className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-gray-700">{grupo.nombre}</h3>
          <Tabla>
            <thead>
              <TablaFila>
                <TablaEncabezadoCelda>Número</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Proveedor</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Monto</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
              </TablaFila>
            </thead>
            <tbody>
              {grupo.ordenes.map((orden) => (
                <TablaFila key={orden.id}>
                  <TablaCelda className="font-semibold text-gray-900">
                    <Link href={`/ordenes-compra/${orden.id}`} className="hover:text-seg-rojo">
                      #{orden.numero}
                    </Link>
                  </TablaCelda>
                  <TablaCelda>{mapaProveedores.get(orden.proveedorId)?.nombre ?? "—"}</TablaCelda>
                  <TablaCelda>{formatearMonto(orden.monto, orden.moneda)}</TablaCelda>
                  <TablaCelda>
                    <Insignia tono={TONO_ESTADO_OC[orden.estado]}>{ETIQUETAS_ESTADO_OC[orden.estado]}</Insignia>
                  </TablaCelda>
                </TablaFila>
              ))}
            </tbody>
          </Tabla>
        </div>
      ))}
    </div>
  );
}
