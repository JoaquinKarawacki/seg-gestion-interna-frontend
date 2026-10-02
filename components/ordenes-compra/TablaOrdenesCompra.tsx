"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { useProyectos } from "@/lib/proyectos/hooks";
import { useRubros } from "@/lib/rubros/hooks";
import {
  ETIQUETAS_ESTADO_OC,
  TONO_ESTADO_OC,
  formatearMonto,
} from "@/lib/ordenes-compra/presentacion";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";

export function TablaOrdenesCompra({
  solicitudes,
  hayFiltrosActivos,
}: {
  solicitudes: OrdenCompra[];
  hayFiltrosActivos: boolean;
}) {
  const mapaProveedores = useMapaProveedores();
  const proyectos = useProyectos();
  const rubros = useRubros();

  const mapaProyectos = useMemo(
    () => new Map(proyectos.data?.map((proyecto) => [proyecto.id, proyecto])),
    [proyectos.data],
  );
  const mapaRubros = useMemo(
    () => new Map(rubros.data?.map((rubro) => [rubro.id, rubro])),
    [rubros.data],
  );

  if (solicitudes.length === 0) {
    return (
      <EstadoVacio
        titulo={hayFiltrosActivos ? "No hay órdenes que coincidan" : "No hay órdenes de compra registradas"}
        descripcion={hayFiltrosActivos ? "Probá ajustar los filtros." : undefined}
      />
    );
  }

  return (
    <Tabla>
      <thead>
        <TablaFila>
          <TablaEncabezadoCelda>Número</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Proyecto</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Proveedor</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Rubro</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Monto</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
        </TablaFila>
      </thead>
      <tbody>
        {solicitudes.map((solicitud) => (
          <TablaFila key={solicitud.id}>
            <TablaCelda className="font-semibold text-gray-900">
              <Link href={`/ordenes-compra/${solicitud.id}`} className="hover:text-seg-rojo">
                #{solicitud.numero}
              </Link>
            </TablaCelda>
            <TablaCelda>{mapaProyectos.get(solicitud.proyectoId)?.nombre ?? "—"}</TablaCelda>
            <TablaCelda>{mapaProveedores.get(solicitud.proveedorId)?.nombre ?? "—"}</TablaCelda>
            <TablaCelda>{mapaRubros.get(solicitud.rubroId)?.nombre ?? "—"}</TablaCelda>
            <TablaCelda>{formatearMonto(solicitud.monto, solicitud.moneda)}</TablaCelda>
            <TablaCelda>
              <Insignia tono={TONO_ESTADO_OC[solicitud.estado]}>
                {ETIQUETAS_ESTADO_OC[solicitud.estado]}
              </Insignia>
            </TablaCelda>
          </TablaFila>
        ))}
      </tbody>
    </Tabla>
  );
}
