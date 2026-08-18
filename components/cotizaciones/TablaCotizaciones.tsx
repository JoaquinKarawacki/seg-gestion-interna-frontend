"use client";

import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoMas } from "@/components/ui/Iconos";
import { ErrorApi } from "@/lib/http/cliente";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { useDescargarCotizacion } from "@/lib/cotizaciones/hooks";
import {
  ETIQUETAS_ESTADO_COTIZACION,
  TONO_ESTADO_COTIZACION,
  formatearMonto,
} from "@/lib/cotizaciones/presentacion";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import type { Tarea } from "@/lib/tareas/tipos";

function BotonDescargarPdf({ cotizacion }: { cotizacion: Cotizacion }) {
  const descargar = useDescargarCotizacion();

  if (!cotizacion.archivoPdfRuta) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-col items-start gap-1">
      <BotonAccionFila
        onClick={() =>
          descargar.mutate({ id: cotizacion.id, nombreSugerido: `cotizacion-${cotizacion.id}.pdf` })
        }
        disabled={descargar.isPending}
      >
        Descargar PDF
      </BotonAccionFila>
      {descargar.error ? (
        <p className="text-xs text-seg-rojo">
          {descargar.error instanceof ErrorApi ? descargar.error.message : "No se pudo descargar"}
        </p>
      ) : null}
    </div>
  );
}

export function TablaCotizaciones({
  cotizaciones,
  tareas,
  onNuevaCotizacion,
}: {
  cotizaciones: Cotizacion[];
  tareas: Tarea[];
  onNuevaCotizacion: (tareaId: string | null) => void;
}) {
  const mapaProveedores = useMapaProveedores();

  const grupos = [{ id: null as string | null, nombre: "General del proyecto" }, ...tareas].map(
    (grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      cotizaciones: cotizaciones.filter((c) => c.tareaId === grupo.id),
    }),
  );

  const gruposConDatos = grupos.filter((grupo) => grupo.cotizaciones.length > 0);

  if (gruposConDatos.length === 0) {
    return <EstadoVacio titulo="Todavía no hay cotizaciones cargadas" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {gruposConDatos.map((grupo) => (
        <div key={grupo.id ?? "general"} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">{grupo.nombre}</h3>
            <BotonAccionFila onClick={() => onNuevaCotizacion(grupo.id)}>
              <IconoMas className="h-3.5 w-3.5" />
              Nueva versión
            </BotonAccionFila>
          </div>
          <Tabla>
            <thead>
              <TablaFila>
                <TablaEncabezadoCelda>Proveedor</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Monto</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>PDF</TablaEncabezadoCelda>
              </TablaFila>
            </thead>
            <tbody>
              {grupo.cotizaciones.map((cotizacion) => (
                <TablaFila key={cotizacion.id}>
                  <TablaCelda className="font-semibold text-gray-900">
                    {mapaProveedores.get(cotizacion.proveedorId)?.nombre ?? "—"}
                  </TablaCelda>
                  <TablaCelda>{formatearMonto(cotizacion.montoTotal, cotizacion.moneda)}</TablaCelda>
                  <TablaCelda>
                    <Insignia tono={TONO_ESTADO_COTIZACION[cotizacion.estado]}>
                      {ETIQUETAS_ESTADO_COTIZACION[cotizacion.estado]}
                    </Insignia>
                  </TablaCelda>
                  <TablaCelda>
                    <BotonDescargarPdf cotizacion={cotizacion} />
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
