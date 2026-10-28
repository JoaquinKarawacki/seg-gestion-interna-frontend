"use client";

import Link from "next/link";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { tieneDatosBancariosCompletos } from "@/lib/proveedores/presentacion";
import { useMapaSectores } from "@/lib/sectores/hooks";
import { useAuth } from "@/lib/auth/contexto";
import { tieneRol } from "@/lib/auth/roles";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import {
  ETIQUETAS_ESTADO_OP,
  ETIQUETAS_FORMA_PAGO,
  ETIQUETAS_TIPO_OP,
  TONO_ESTADO_OP,
} from "@/lib/ordenes-pago/presentacion";
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
  const { usuario } = useAuth();
  const esPagos = usuario ? tieneRol(usuario, "PAGOS") : false;

  // Para el rol PAGOS: datos de transferencia del proveedor directo en la fila,
  // así arma la tabla de pagos sin entrar a cada OP. Si no es transferencia
  // muestra la forma de pago; si faltan los datos, un aviso con link a Proveedores.
  function contenidoBancario(orden: OrdenPago) {
    if (orden.formaPago !== "TRANSFERENCIA_BANCARIA") {
      return <span className="text-gray-400">{ETIQUETAS_FORMA_PAGO[orden.formaPago]}</span>;
    }
    const proveedor = mapaProveedores.get(orden.proveedorId);
    if (proveedor && tieneDatosBancariosCompletos(proveedor)) {
      return (
        <span className="text-gray-700">
          {proveedor.banco} · {proveedor.numeroCuenta}
        </span>
      );
    }
    return (
      <Link href="/proveedores" className="text-amber-700 hover:underline">
        Faltan datos
      </Link>
    );
  }

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
          {esPagos ? <TablaEncabezadoCelda>Datos bancarios</TablaEncabezadoCelda> : null}
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
            {esPagos ? <TablaCelda>{contenidoBancario(orden)}</TablaCelda> : null}
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
