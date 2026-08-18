"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/contexto";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { useMapaSectores } from "@/lib/sectores/hooks";
import { useProyecto } from "@/lib/proyectos/hooks";
import { useTareasDeProyecto } from "@/lib/tareas/hooks";
import { useCotizacion } from "@/lib/cotizaciones/hooks";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import {
  useAnularOrdenCompra,
  useAprobarOrdenCompra,
  useConfirmarPagoOrdenCompra,
  useDescargarFacturaOrdenCompra,
  useEliminarOrdenCompra,
  useEnviarOrdenCompra,
  useHistorialOrdenCompra,
  useObservarPagoOrdenCompra,
  useOrdenCompra,
  useRechazarOrdenCompra,
  useResolverObservacionOrdenCompra,
} from "@/lib/ordenes-compra/hooks";
import {
  ETIQUETAS_ESTADO_OC,
  ETIQUETAS_FORMA_PAGO,
  ETIQUETAS_TIPO_OC,
  TONO_ESTADO_OC,
  puedeAnular,
  puedeAprobarORechazar,
  puedeConfirmarPago,
  puedeEditar,
  puedeEliminar,
  puedeEnviar,
  puedeObservarPago,
  puedeResolverObservacion,
} from "@/lib/ordenes-compra/presentacion";
import { Boton, BotonLink } from "@/components/ui/Boton";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Insignia } from "@/components/ui/Insignia";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { ModalMotivoTransicion } from "@/components/ordenes-compra/ModalMotivoTransicion";
import { ModalAdjuntarFactura } from "@/components/ordenes-compra/ModalAdjuntarFactura";
import { HistorialOrdenCompra } from "@/components/ordenes-compra/HistorialOrdenCompra";
import { HiloComentarios } from "@/components/ordenes-compra/HiloComentarios";

type AccionModal = "rechazar" | "observar-pago" | "resolver-observacion" | "anular" | "factura" | null;

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{etiqueta}</p>
      <p className="text-gray-800">{valor}</p>
    </div>
  );
}

export default function PaginaDetalleOrdenCompra() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const orden = useOrdenCompra(id);
  const historial = useHistorialOrdenCompra(id);
  const mapaClientes = useMapaClientes();
  const mapaProveedores = useMapaProveedores();
  const mapaSectores = useMapaSectores();
  const proyecto = useProyecto(orden.data?.proyectoId ?? undefined);
  const tareas = useTareasDeProyecto(orden.data?.proyectoId ?? undefined);
  const cotizacion = useCotizacion(orden.data?.cotizacionId ?? undefined);

  const enviar = useEnviarOrdenCompra();
  const aprobar = useAprobarOrdenCompra();
  const rechazar = useRechazarOrdenCompra();
  const observarPago = useObservarPagoOrdenCompra();
  const resolverObservacion = useResolverObservacionOrdenCompra();
  const confirmarPago = useConfirmarPagoOrdenCompra();
  const anular = useAnularOrdenCompra();
  const eliminar = useEliminarOrdenCompra();
  const descargarFactura = useDescargarFacturaOrdenCompra();

  const [accionModal, setAccionModal] = useState<AccionModal>(null);
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  if (orden.isLoading) return <Cargando etiqueta="Cargando orden de compra..." />;
  if (orden.isError) return <EstadoError error={orden.error} />;
  if (!orden.data || !usuario) return null;

  const datos = orden.data;
  const tarea = datos.tareaId ? tareas.data?.find((item) => item.id === datos.tareaId) : undefined;

  function cerrarModal() {
    setAccionModal(null);
  }

  async function confirmarModal(motivo?: string) {
    if (accionModal === "rechazar") await rechazar.mutateAsync({ id: datos.id, motivo: motivo ?? "" });
    if (accionModal === "observar-pago") await observarPago.mutateAsync({ id: datos.id, motivo: motivo ?? "" });
    if (accionModal === "resolver-observacion") await resolverObservacion.mutateAsync({ id: datos.id, motivo });
    if (accionModal === "anular") await anular.mutateAsync({ id: datos.id, motivo: motivo ?? "" });
    cerrarModal();
  }

  async function manejarEliminar() {
    if (!window.confirm(`¿Eliminar la orden de compra #${datos.numero}?`)) return;
    setErrorEliminar(null);
    try {
      await eliminar.mutateAsync(datos.id);
      router.push("/ordenes-compra");
    } catch (error) {
      setErrorEliminar(error);
    }
  }

  const mutacionEnCurso = enviar.isPending || aprobar.isPending || confirmarPago.isPending;
  const errorAccionDirecta = enviar.error ?? aprobar.error ?? confirmarPago.error;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href="/ordenes-compra" className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Órdenes de Compra
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Orden de compra #{datos.numero}</h1>
          <Insignia tono={TONO_ESTADO_OC[datos.estado]}>{ETIQUETAS_ESTADO_OC[datos.estado]}</Insignia>
        </div>
      </div>

      {errorAccionDirecta ? <EstadoError error={errorAccionDirecta} /> : null}
      {errorEliminar ? <EstadoError error={errorEliminar} /> : null}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Datos generales</h2>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Dato etiqueta="Tipo" valor={ETIQUETAS_TIPO_OC[datos.tipo]} />
          <Dato etiqueta="Fecha" valor={new Date(datos.fecha).toLocaleDateString("es-UY")} />
          <Dato etiqueta="Proveedor" valor={mapaProveedores.get(datos.proveedorId)?.nombre ?? "—"} />
          <Dato etiqueta="Sector" valor={mapaSectores.get(datos.sectorId)?.nombre ?? "—"} />
          <Dato etiqueta="Monto" valor={formatearMonto(datos.monto, datos.moneda)} />
          <Dato etiqueta="Forma de pago" valor={ETIQUETAS_FORMA_PAGO[datos.formaPago]} />
          <Dato etiqueta="Paga IVA" valor={datos.pagaIva ? "Sí" : "No"} />
          <Dato etiqueta="IVA incluido" valor={datos.ivaIncluido ? "Sí" : "No"} />
        </div>
        <div className="mt-4">
          <Dato etiqueta="Concepto" valor={datos.concepto} />
        </div>
        {datos.observaciones ? (
          <div className="mt-4">
            <Dato etiqueta="Observaciones" valor={datos.observaciones} />
          </div>
        ) : null}
      </div>

      {datos.cotizacionId ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Origen</h2>
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <p>
              Cliente:{" "}
              <span className="font-medium text-gray-900">
                {mapaClientes.get(datos.clienteId ?? "")?.nombre ?? "—"}
              </span>
            </p>
            <p>
              Proyecto:{" "}
              {datos.proyectoId ? (
                <Link href={`/proyectos/${datos.proyectoId}`} className="font-medium text-seg-rojo hover:underline">
                  {proyecto.data?.nombre ?? "—"}
                </Link>
              ) : (
                "—"
              )}
            </p>
            <p>
              Tarea: <span className="font-medium text-gray-900">{tarea?.nombre ?? "General del proyecto"}</span>
            </p>
            {cotizacion.data ? (
              <p>
                Cotización vinculada:{" "}
                <span className="font-medium text-gray-900">
                  {formatearMonto(cotizacion.data.montoTotal, cotizacion.data.moneda)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Factura</h2>
          <Boton tamanio="sm" variante="outline" onClick={() => setAccionModal("factura")}>
            {datos.facturaPdfRuta ? "Reemplazar factura" : "Adjuntar factura"}
          </Boton>
        </div>
        {datos.facturaPdfRuta ? (
          <BotonAccionFila
            onClick={() => descargarFactura.mutate({ id: datos.id, numero: datos.numero })}
            disabled={descargarFactura.isPending}
          >
            Descargar factura
          </BotonAccionFila>
        ) : (
          <p className="text-sm text-gray-400">Sin factura adjunta</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {puedeEnviar(datos, usuario) ? (
          <Boton tamanio="sm" disabled={mutacionEnCurso} onClick={() => enviar.mutate(datos.id)}>
            Enviar
          </Boton>
        ) : null}
        {puedeAprobarORechazar(datos, usuario) ? (
          <>
            <Boton tamanio="sm" disabled={mutacionEnCurso} onClick={() => aprobar.mutate(datos.id)}>
              Aprobar
            </Boton>
            <Boton tamanio="sm" variante="outline" onClick={() => setAccionModal("rechazar")}>
              Rechazar
            </Boton>
          </>
        ) : null}
        {puedeObservarPago(datos, usuario) ? (
          <Boton tamanio="sm" variante="outline" onClick={() => setAccionModal("observar-pago")}>
            Observar pago
          </Boton>
        ) : null}
        {puedeConfirmarPago(datos, usuario) ? (
          <Boton tamanio="sm" disabled={mutacionEnCurso} onClick={() => confirmarPago.mutate(datos.id)}>
            Confirmar pago
          </Boton>
        ) : null}
        {puedeResolverObservacion(datos, usuario) ? (
          <Boton tamanio="sm" onClick={() => setAccionModal("resolver-observacion")}>
            Resolver observación
          </Boton>
        ) : null}
        {puedeAnular(datos, usuario) ? (
          <Boton tamanio="sm" variante="outline" onClick={() => setAccionModal("anular")}>
            Anular
          </Boton>
        ) : null}
        {puedeEditar(datos, usuario) ? (
          <BotonLink tamanio="sm" variante="outline" href={`/ordenes-compra/${datos.id}/editar`}>
            Editar
          </BotonLink>
        ) : null}
        {puedeEliminar(datos, usuario) ? (
          <Boton tamanio="sm" variante="outline" onClick={manejarEliminar} disabled={eliminar.isPending}>
            Eliminar
          </Boton>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Historial</h2>
        {historial.isLoading ? <Cargando etiqueta="Cargando..." /> : null}
        {historial.isError ? <EstadoError error={historial.error} /> : null}
        {historial.data ? <HistorialOrdenCompra historial={historial.data} /> : null}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Comentarios</h2>
        <HiloComentarios ordenCompraId={datos.id} />
      </div>

      {accionModal === "rechazar" ? (
        <ModalMotivoTransicion
          titulo="Rechazar orden de compra"
          motivoRequerido
          cargando={rechazar.isPending}
          error={rechazar.error}
          onConfirmar={confirmarModal}
          onCerrar={cerrarModal}
        />
      ) : null}
      {accionModal === "observar-pago" ? (
        <ModalMotivoTransicion
          titulo="Observar pago"
          motivoRequerido
          cargando={observarPago.isPending}
          error={observarPago.error}
          onConfirmar={confirmarModal}
          onCerrar={cerrarModal}
        />
      ) : null}
      {accionModal === "resolver-observacion" ? (
        <ModalMotivoTransicion
          titulo="Resolver observación"
          motivoRequerido={false}
          cargando={resolverObservacion.isPending}
          error={resolverObservacion.error}
          onConfirmar={confirmarModal}
          onCerrar={cerrarModal}
        />
      ) : null}
      {accionModal === "anular" ? (
        <ModalMotivoTransicion
          titulo="Anular orden de compra"
          motivoRequerido
          cargando={anular.isPending}
          error={anular.error}
          onConfirmar={confirmarModal}
          onCerrar={cerrarModal}
        />
      ) : null}
      {accionModal === "factura" ? (
        <ModalAdjuntarFactura ordenId={datos.id} onCerrar={cerrarModal} />
      ) : null}
    </div>
  );
}
