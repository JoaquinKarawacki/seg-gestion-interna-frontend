"use client";

import { useMemo, useState } from "react";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Insignia } from "@/components/ui/Insignia";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { ErrorApi } from "@/lib/http/cliente";
import { useCotizaciones, useDescargarCotizacion } from "@/lib/cotizaciones/hooks";
import {
  ETIQUETAS_ESTADO_COTIZACION,
  TONO_ESTADO_COTIZACION,
  formatearMonto,
} from "@/lib/cotizaciones/presentacion";
import type { CotizacionBusqueda, EstadoCotizacion } from "@/lib/cotizaciones/tipos";

function BotonDescargarPdf({ cotizacion }: { cotizacion: CotizacionBusqueda }) {
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
        Ver PDF
      </BotonAccionFila>
      {descargar.error ? (
        <p className="text-xs text-seg-rojo">
          {descargar.error instanceof ErrorApi ? descargar.error.message : "No se pudo descargar"}
        </p>
      ) : null}
    </div>
  );
}

export default function PaginaCotizaciones() {
  const cotizaciones = useCotizaciones();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoCotizacion | "">("");

  const filtradas = useMemo(() => {
    if (!cotizaciones.data) return [];
    const texto = busqueda.trim().toLowerCase();
    return cotizaciones.data.filter((cotizacion) => {
      if (estado && cotizacion.estado !== estado) return false;
      if (!texto) return true;
      return (
        cotizacion.proyectoNombre.toLowerCase().includes(texto) ||
        cotizacion.proveedorNombre.toLowerCase().includes(texto) ||
        cotizacion.rubroNombre.toLowerCase().includes(texto)
      );
    });
  }, [cotizaciones.data, busqueda, estado]);

  const hayFiltrosActivos = busqueda.trim() !== "" || estado !== "";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
        <p className="text-sm text-gray-500">Búsqueda global de cotizaciones por proyecto, proveedor o rubro.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <Campo
            etiqueta="Buscar"
            placeholder="Proyecto, proveedor o rubro..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
        <div className="min-w-[180px]">
          <Select
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value as EstadoCotizacion | "")}
          >
            <option value="">Todos</option>
            {Object.entries(ETIQUETAS_ESTADO_COTIZACION).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {cotizaciones.isLoading ? <Cargando etiqueta="Cargando cotizaciones..." /> : null}
      {cotizaciones.isError ? <EstadoError error={cotizaciones.error} /> : null}
      {cotizaciones.data ? (
        filtradas.length === 0 ? (
          <EstadoVacio
            titulo={hayFiltrosActivos ? "No hay cotizaciones que coincidan" : "No hay cotizaciones registradas"}
            descripcion={hayFiltrosActivos ? "Probá ajustar los filtros." : undefined}
          />
        ) : (
          <Tabla>
            <thead>
              <TablaFila>
                <TablaEncabezadoCelda>Proyecto</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Proveedor</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Rubro</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Monto</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Fecha</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
                <TablaEncabezadoCelda>PDF</TablaEncabezadoCelda>
              </TablaFila>
            </thead>
            <tbody>
              {filtradas.map((cotizacion) => (
                <TablaFila key={cotizacion.id}>
                  <TablaCelda className="font-semibold text-gray-900">{cotizacion.proyectoNombre}</TablaCelda>
                  <TablaCelda>{cotizacion.proveedorNombre}</TablaCelda>
                  <TablaCelda>{cotizacion.rubroNombre}</TablaCelda>
                  <TablaCelda>{formatearMonto(cotizacion.montoTotal, cotizacion.moneda)}</TablaCelda>
                  <TablaCelda>{new Date(cotizacion.creadoEn).toLocaleDateString("es-UY")}</TablaCelda>
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
        )
      ) : null}
    </div>
  );
}
