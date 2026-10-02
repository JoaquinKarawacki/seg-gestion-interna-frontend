"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/contexto";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useMapaProveedores } from "@/lib/proveedores/hooks";
import { useMapaSectores } from "@/lib/sectores/hooks";
import { useProyecto } from "@/lib/proyectos/hooks";
import { useRubros } from "@/lib/rubros/hooks";
import {
  useAnularOrdenCompra,
  useAprobarOrdenCompra,
  useDescargarAdjuntoOrdenCompra,
  useEliminarOrdenCompra,
  useEnviarOrdenCompra,
  useHistorialOrdenCompra,
  useRechazarOrdenCompra,
  useOrdenCompra,
} from "@/lib/ordenes-compra/hooks";
import {
  ETIQUETAS_ESTADO_OC,
  ETIQUETAS_TIPO_OC,
  TONO_ESTADO_OC,
  formatearMonto,
  puedeAnular,
  puedeAprobarORechazar,
  puedeCrearOrdenPago,
  puedeEliminar,
  puedeEnviar,
} from "@/lib/ordenes-compra/presentacion";
import { Boton } from "@/components/ui/Boton";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Insignia } from "@/components/ui/Insignia";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { ModalMotivoTransicion } from "@/components/ordenes-pago/ModalMotivoTransicion";
import { HistorialOrdenCompra } from "@/components/ordenes-compra/HistorialOrdenCompra";

type AccionModal = "rechazar" | "anular" | null;

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
  const solicitud = useOrdenCompra(id);
  const historial = useHistorialOrdenCompra(id);
  const mapaClientes = useMapaClientes();
  const mapaProveedores = useMapaProveedores();
  const mapaSectores = useMapaSectores();
  const proyecto = useProyecto(solicitud.data?.proyectoId ?? undefined);
  const rubros = useRubros();

  const mapaRubros = useMemo(
    () => new Map(rubros.data?.map((rubro) => [rubro.id, rubro])),
    [rubros.data],
  );

  const enviar = useEnviarOrdenCompra();
  const aprobar = useAprobarOrdenCompra();
  const rechazar = useRechazarOrdenCompra();
  const anular = useAnularOrdenCompra();
  const eliminar = useEliminarOrdenCompra();
  const descargarAdjunto = useDescargarAdjuntoOrdenCompra();

  const [accionModal, setAccionModal] = useState<AccionModal>(null);
  const [errorEliminar, setErrorEliminar] = useState<unknown>(null);

  if (solicitud.isLoading) return <Cargando etiqueta="Cargando orden de compra..." />;
  if (solicitud.isError) return <EstadoError error={solicitud.error} />;
  if (!solicitud.data || !usuario) return null;

  const datos = solicitud.data;

  function cerrarModal() {
    setAccionModal(null);
  }

  async function confirmarModal(motivo?: string) {
    if (accionModal === "rechazar") await rechazar.mutateAsync({ id: datos.id, motivo: motivo ?? "" });
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

  const mutacionEnCurso = enviar.isPending || aprobar.isPending;
  const errorAccionDirecta = enviar.error ?? aprobar.error;
  const clienteNombre = proyecto.data
    ? mapaClientes.get(proyecto.data.clienteId)?.nombre ?? "—"
    : "—";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href="/ordenes-compra" className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Órdenes de Compra
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Orden de compra #{datos.numero}</h1>
          <Insignia tono={TONO_ESTADO_OC[datos.estado]}>{ETIQUETAS_ESTADO_OC[datos.estado]}</Insignia>
          {datos.esPagoUnico ? <Insignia tono="negro">Pago único</Insignia> : null}
        </div>
      </div>

      {errorAccionDirecta ? <EstadoError error={errorAccionDirecta} /> : null}
      {errorEliminar ? <EstadoError error={errorEliminar} /> : null}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Datos generales</h2>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Dato etiqueta="Tipo" valor={ETIQUETAS_TIPO_OC[datos.tipo]} />
          <Dato etiqueta="Fecha" valor={new Date(datos.fecha).toLocaleDateString("es-UY")} />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Proyecto</p>
            <p className="text-gray-800">
              <Link href={`/proyectos/${datos.proyectoId}`} className="font-medium text-seg-rojo hover:underline">
                {proyecto.data?.nombre ?? "—"}
              </Link>
            </p>
          </div>
          <Dato etiqueta="Cliente" valor={clienteNombre} />
          <Dato etiqueta="Proveedor" valor={mapaProveedores.get(datos.proveedorId)?.nombre ?? "—"} />
          <Dato etiqueta="Sector" valor={mapaSectores.get(datos.sectorId)?.nombre ?? "—"} />
          <Dato etiqueta="Rubro" valor={mapaRubros.get(datos.rubroId)?.nombre ?? "—"} />
          <Dato etiqueta="Monto" valor={formatearMonto(datos.monto, datos.moneda)} />
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

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Adjunto</h2>
        <div className="flex flex-col items-start gap-1">
          <BotonAccionFila
            onClick={() => descargarAdjunto.mutate({ id: datos.id, numero: datos.numero })}
            disabled={descargarAdjunto.isPending}
          >
            Ver adjunto (PDF)
          </BotonAccionFila>
          {descargarAdjunto.error ? <EstadoError error={descargarAdjunto.error} /> : null}
        </div>
      </div>

      {datos.esPagoUnico && datos.estado !== "APROBADO" ? (
        <p className="text-sm text-gray-500">
          La orden de pago se genera automáticamente al aprobar esta orden de compra.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {puedeCrearOrdenPago(datos) ? (
          <Boton
            tamanio="sm"
            onClick={() => router.push(`/ordenes-pago/nueva?solicitudId=${datos.id}`)}
          >
            Crear Orden de Pago
          </Boton>
        ) : null}
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
            <Boton
              tamanio="sm"
              variante="outline"
              disabled={mutacionEnCurso}
              onClick={() => setAccionModal("rechazar")}
            >
              Rechazar
            </Boton>
          </>
        ) : null}
        {puedeAnular(datos, usuario) ? (
          <Boton
            tamanio="sm"
            variante="outline"
            disabled={mutacionEnCurso}
            onClick={() => setAccionModal("anular")}
          >
            Anular
          </Boton>
        ) : null}
        {puedeEliminar(datos, usuario) ? (
          <Boton tamanio="sm" variante="outline" onClick={manejarEliminar} disabled={eliminar.isPending}>
            Eliminar
          </Boton>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Historial</h2>
        {historial.isLoading ? <Cargando etiqueta="Cargando historial..." /> : null}
        {historial.isError ? <EstadoError error={historial.error} /> : null}
        {historial.data ? <HistorialOrdenCompra historial={historial.data} /> : null}
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
    </div>
  );
}
