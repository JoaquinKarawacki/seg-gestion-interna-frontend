"use client";

import Link from "next/link";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { useMapaSectores } from "@/lib/sectores/hooks";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import { ETIQUETAS_ESTADO_OP, TONO_ESTADO_OP } from "@/lib/ordenes-pago/presentacion";
import { ETIQUETAS_TIPO_OP } from "@/lib/ordenes-pago/presentacion";
import type { OrdenPago } from "@/lib/ordenes-pago/tipos";

export function TablaOrdenesPago({
  ordenes,
  hayFiltrosActivos,
}: {
  ordenes: OrdenPago[];
  hayFiltrosActivos: boolean;
}) {
  const mapaProveedores = useMapaProveedores();
  const mapaSectores = useMapaSectores();

  if (ordenes.length === 0) {
    return (
      <EstadoVacio
        titulo={hayFiltrosActivos ? "No hay órdenes que coincidan" : "No hay órdenes de pago registradas"}
        descripcion={hayFiltrosActivos ? "Probá ajustar los filtros." : undefined}
      />
    );
  }

  return (
    <Tabla>
      <thead>
        <TablaFila>
          <TablaEncabezadoCelda>Número</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Tipo</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Proveedor</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Sector</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Monto</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
        </TablaFila>
      </thead>
      <tbody>
        {ordenes.map((orden) => (
          <TablaFila key={orden.id}>
            <TablaCelda className="font-semibold text-gray-900">
              <Link href={`/ordenes-pago/${orden.id}`} className="hover:text-seg-rojo">
                #{orden.numero}
              </Link>
            </TablaCelda>
            <TablaCelda>{ETIQUETAS_TIPO_OP[orden.tipo]}</TablaCelda>
            <TablaCelda>{mapaProveedores.get(orden.proveedorId)?.nombre ?? "—"}</TablaCelda>
            <TablaCelda>{mapaSectores.get(orden.sectorId)?.nombre ?? "—"}</TablaCelda>
            <TablaCelda>{formatearMonto(orden.monto, orden.moneda)}</TablaCelda>
            <TablaCelda>
              <Insignia tono={TONO_ESTADO_OP[orden.estado]}>{ETIQUETAS_ESTADO_OP[orden.estado]}</Insignia>
            </TablaCelda>
          </TablaFila>
        ))}
      </tbody>
    </Tabla>
  );
}
