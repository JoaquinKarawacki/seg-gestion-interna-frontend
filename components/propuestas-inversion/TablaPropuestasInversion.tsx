"use client";

import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { ErrorApi } from "@/lib/http/cliente";
import { formatearMonto, formatearNumero } from "@/lib/cotizaciones/presentacion";
import { useDescargarPropuestaInversion } from "@/lib/propuestas-inversion/hooks";
import {
  ETIQUETAS_ESTADO_PROPUESTA_INVERSION,
  TONO_ESTADO_PROPUESTA_INVERSION,
} from "@/lib/propuestas-inversion/presentacion";
import type { PropuestaInversion } from "@/lib/propuestas-inversion/tipos";

function BotonDescargarArchivo({ propuesta }: { propuesta: PropuestaInversion }) {
  const descargar = useDescargarPropuestaInversion();

  if (!propuesta.archivoRuta) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-col items-start gap-1">
      <BotonAccionFila
        onClick={() =>
          descargar.mutate({
            id: propuesta.id,
            nombreSugerido: propuesta.archivoNombreOriginal ?? `propuesta-inversion-${propuesta.id}`,
          })
        }
        disabled={descargar.isPending}
      >
        Descargar archivo
      </BotonAccionFila>
      {descargar.error ? (
        <p className="text-xs text-seg-rojo">
          {descargar.error instanceof ErrorApi ? descargar.error.message : "No se pudo descargar"}
        </p>
      ) : null}
    </div>
  );
}

export function TablaPropuestasInversion({ propuestas }: { propuestas: PropuestaInversion[] }) {
  if (propuestas.length === 0) {
    return <EstadoVacio titulo="Todavía no hay propuestas de inversión cargadas" />;
  }

  return (
    <Tabla>
      <thead>
        <TablaFila>
          <TablaEncabezadoCelda>Costo total</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Ahorro mensual</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Meses</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>% SEG</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Honorarios</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Archivo</TablaEncabezadoCelda>
        </TablaFila>
      </thead>
      <tbody>
        {propuestas.map((propuesta) => (
          <TablaFila key={propuesta.id}>
            <TablaCelda className="font-semibold text-gray-900">
              {formatearMonto(propuesta.costoTotalAproximado, propuesta.moneda)}
            </TablaCelda>
            <TablaCelda>{formatearMonto(propuesta.ahorroMensual, propuesta.moneda)}</TablaCelda>
            <TablaCelda>{propuesta.cantidadMeses}</TablaCelda>
            <TablaCelda>{formatearNumero(propuesta.porcentajeSeg)}%</TablaCelda>
            <TablaCelda>{formatearMonto(propuesta.honorarios, propuesta.moneda)}</TablaCelda>
            <TablaCelda>
              <Insignia tono={TONO_ESTADO_PROPUESTA_INVERSION[propuesta.estado]}>
                {ETIQUETAS_ESTADO_PROPUESTA_INVERSION[propuesta.estado]}
              </Insignia>
            </TablaCelda>
            <TablaCelda>
              <BotonDescargarArchivo propuesta={propuesta} />
            </TablaCelda>
          </TablaFila>
        ))}
      </tbody>
    </Tabla>
  );
}
