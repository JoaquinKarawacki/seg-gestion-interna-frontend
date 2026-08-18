import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { formatearAccion } from "@/lib/auditoria/presentacion";
import type { RegistroAuditoria } from "@/lib/auditoria/tipos";

export function TablaAuditoria({
  registros,
  hayFiltrosActivos,
}: {
  registros: RegistroAuditoria[];
  hayFiltrosActivos: boolean;
}) {
  if (registros.length === 0) {
    return (
      <EstadoVacio
        titulo={hayFiltrosActivos ? "No hay registros que coincidan" : "No hay registros de auditoría"}
        descripcion={hayFiltrosActivos ? "Probá ajustar los filtros." : undefined}
      />
    );
  }

  return (
    <Tabla>
      <thead>
        <TablaFila>
          <TablaEncabezadoCelda>Fecha</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Usuario</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Acción</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Entidad</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Descripción</TablaEncabezadoCelda>
        </TablaFila>
      </thead>
      <tbody>
        {registros.map((registro) => (
          <TablaFila key={registro.id}>
            <TablaCelda className="whitespace-nowrap">
              {new Date(registro.creadoEn).toLocaleString("es-UY")}
            </TablaCelda>
            <TablaCelda>{registro.usuarioEmail}</TablaCelda>
            <TablaCelda className="font-medium text-gray-900">{formatearAccion(registro.accion)}</TablaCelda>
            <TablaCelda>{registro.entidad ?? "—"}</TablaCelda>
            <TablaCelda>{registro.descripcion}</TablaCelda>
          </TablaFila>
        ))}
      </tbody>
    </Tabla>
  );
}
