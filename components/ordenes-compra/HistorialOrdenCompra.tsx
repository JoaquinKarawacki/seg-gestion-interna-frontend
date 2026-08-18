"use client";

import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useAuth } from "@/lib/auth/contexto";
import { useMapaUsuarios } from "@/lib/usuarios/hooks";
import { ETIQUETAS_ESTADO_OC } from "@/lib/ordenes-compra/presentacion";
import type { HistorialEstadoOC } from "@/lib/ordenes-compra/tipos";

export function HistorialOrdenCompra({ historial }: { historial: HistorialEstadoOC[] }) {
  const { usuario } = useAuth();
  const mapaUsuarios = useMapaUsuarios();

  if (historial.length === 0) {
    return <EstadoVacio titulo="Todavía no hay cambios de estado" />;
  }

  function nombreUsuario(usuarioId: string): string {
    if (usuarioId === usuario?.id) return "Vos";
    return mapaUsuarios.get(usuarioId)?.nombre ?? "—";
  }

  return (
    <Tabla>
      <thead>
        <TablaFila>
          <TablaEncabezadoCelda>Cambio</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Usuario</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Motivo</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Fecha</TablaEncabezadoCelda>
        </TablaFila>
      </thead>
      <tbody>
        {historial.map((entrada) => (
          <TablaFila key={entrada.id}>
            <TablaCelda className="font-medium text-gray-900">
              {ETIQUETAS_ESTADO_OC[entrada.estadoAnterior]} → {ETIQUETAS_ESTADO_OC[entrada.estadoNuevo]}
            </TablaCelda>
            <TablaCelda>{nombreUsuario(entrada.usuarioId)}</TablaCelda>
            <TablaCelda>{entrada.motivo ?? "—"}</TablaCelda>
            <TablaCelda>{new Date(entrada.creadoEn).toLocaleString("es-UY")}</TablaCelda>
          </TablaFila>
        ))}
      </tbody>
    </Tabla>
  );
}
