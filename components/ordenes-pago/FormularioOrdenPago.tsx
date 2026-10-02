"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/contexto";
import { useSectores } from "@/lib/sectores/hooks";
import { useMapaProveedores, useProveedores } from "@/lib/proveedores/hooks";
import { useProyectos } from "@/lib/proyectos/hooks";
import { useCotizacionesDeProyecto } from "@/lib/cotizaciones/hooks";
import { formatearMonto, MONEDAS } from "@/lib/cotizaciones/presentacion";
import {
  useActualizarOrdenPago,
  useCrearOrdenPago,
  useOrdenesPagoDeCotizacion,
} from "@/lib/ordenes-pago/hooks";
import {
  calcularSaldoDisponible,
  ETIQUETAS_FORMA_PAGO,
  ETIQUETAS_TIPO_OP,
  obtenerFechaLocalDeHoy,
} from "@/lib/ordenes-pago/presentacion";
import {
  TAMANO_MAXIMO_ARCHIVO_FACTURA_BYTES,
  TIPO_ARCHIVO_FACTURA_ACEPTADO,
} from "@/lib/ordenes-pago/tipos";
import type { FormaPago, OrdenPago, TipoOC } from "@/lib/ordenes-pago/tipos";
import type { Moneda } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import { ErrorApi } from "@/lib/http/cliente";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { ModalConfirmacionExcesoMonto } from "@/components/ordenes-pago/ModalConfirmacionExcesoMonto";

interface DatosFormulario {
  tipo: TipoOC;
  fecha: string;
  sectorId: string;
  proveedorId: string;
  moneda: Moneda;
  monto: string;
  concepto: string;
  formaPago: FormaPago;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones: string;
  factura?: FileList;
}

export function FormularioOrdenPago({
  ordenExistente,
  solicitudOrigen = null,
}: {
  ordenExistente: OrdenPago | null;
  solicitudOrigen?: OrdenCompra | null;
}) {
  const router = useRouter();
  const { usuario } = useAuth();
  const sectores = useSectores();
  const proveedores = useProveedores();
  const mapaProveedores = useMapaProveedores();
  const proyectos = useProyectos();

  // Modo "crear OP desde una Orden de Compra aprobada" (Fase 2).
  const esDesdeOC = Boolean(solicitudOrigen) && !ordenExistente;

  const [proyectoId, setProyectoId] = useState("");
  const [cotizacionId, setCotizacionId] = useState("");
  // Guarda los datos del submit cuando el backend avisa que el monto excede la OC,
  // para reenviarlos con confirmación si el usuario acepta en el modal.
  const [datosExceso, setDatosExceso] = useState<DatosFormulario | null>(null);
  const cotizacionesDelProyecto = useCotizacionesDeProyecto(proyectoId || undefined);
  const ordenesPagoDeCotizacion = useOrdenesPagoDeCotizacion(cotizacionId || undefined);
  const cotizacionesActivas = (cotizacionesDelProyecto.data ?? []).filter(
    (cotizacion) => cotizacion.estado === "ACTIVA",
  );
  const cotizacionSeleccionada = cotizacionesActivas.find((c) => c.id === cotizacionId) ?? null;

  const crearOrdenPago = useCrearOrdenPago();
  const actualizarOrdenPago = useActualizarOrdenPago(ordenExistente?.id ?? "");
  const mutacion = ordenExistente ? actualizarOrdenPago : crearOrdenPago;
  const proveedorBloqueado =
    Boolean(ordenExistente?.cotizacionId) || Boolean(cotizacionSeleccionada) || esDesdeOC;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    // En modo OC se heredan solo Tipo, Sector, Proveedor y Moneda. Monto, Concepto,
    // Paga IVA / IVA incluido y Observaciones quedan vacíos para que los complete
    // el solicitante (decisión del usuario).
    defaultValues: {
      tipo: ordenExistente?.tipo ?? solicitudOrigen?.tipo ?? "ARTICULO",
      fecha: ordenExistente?.fecha.slice(0, 10) ?? obtenerFechaLocalDeHoy(),
      sectorId: ordenExistente?.sectorId ?? solicitudOrigen?.sectorId ?? usuario?.sectorId ?? "",
      proveedorId: ordenExistente?.proveedorId ?? solicitudOrigen?.proveedorId ?? "",
      moneda: ordenExistente?.moneda ?? solicitudOrigen?.moneda ?? "UYU",
      monto: ordenExistente?.monto ?? "",
      concepto: ordenExistente?.concepto ?? "",
      formaPago: ordenExistente?.formaPago ?? "TRANSFERENCIA_BANCARIA",
      pagaIva: ordenExistente?.pagaIva ?? (esDesdeOC ? false : true),
      ivaIncluido: ordenExistente?.ivaIncluido ?? (esDesdeOC ? false : true),
      observaciones: ordenExistente?.observaciones ?? "",
    },
  });

  useEffect(() => {
    if (cotizacionSeleccionada) {
      setValue("proveedorId", cotizacionSeleccionada.proveedorId);
      setValue("moneda", cotizacionSeleccionada.moneda);
    }
  }, [cotizacionSeleccionada, setValue]);

  // Crea la OP a partir de la OC. Se separa del submit para poder reintentarla con
  // confirmarExcesoMonto=true desde el modal de advertencia de monto.
  async function crearDesdeOC(datos: DatosFormulario, confirmarExcesoMonto: boolean) {
    const nueva = await crearOrdenPago.mutateAsync({
      tipo: datos.tipo,
      fecha: datos.fecha,
      sectorId: datos.sectorId,
      proveedorId: solicitudOrigen!.proveedorId,
      ordenCompraId: solicitudOrigen!.id,
      moneda: datos.moneda,
      monto: Number(datos.monto),
      concepto: datos.concepto,
      formaPago: datos.formaPago,
      pagaIva: datos.pagaIva,
      ivaIncluido: datos.ivaIncluido,
      observaciones: datos.observaciones || undefined,
      factura: datos.factura?.[0],
      confirmarExcesoMonto,
    });
    router.push(`/ordenes-pago/${nueva.id}`);
  }

  async function alEnviar(datos: DatosFormulario) {
    if (ordenExistente) {
      await actualizarOrdenPago.mutateAsync({
        tipo: datos.tipo,
        fecha: datos.fecha,
        sectorId: datos.sectorId,
        proveedorId: proveedorBloqueado ? undefined : datos.proveedorId,
        moneda: datos.moneda,
        concepto: datos.concepto,
        formaPago: datos.formaPago,
        pagaIva: datos.pagaIva,
        ivaIncluido: datos.ivaIncluido,
        observaciones: datos.observaciones || undefined,
      });
      router.push(`/ordenes-pago/${ordenExistente.id}`);
      return;
    }

    if (esDesdeOC) {
      try {
        await crearDesdeOC(datos, false);
      } catch (error) {
        // Si el backend avisa que el monto supera la OC, abrimos el modal de
        // confirmación en vez de tratarlo como error terminal.
        if (error instanceof ErrorApi && error.codigo === "MONTO_EXCEDE_COTIZACION") {
          setDatosExceso(datos);
          return;
        }
        throw error;
      }
      return;
    }

    const nueva = await crearOrdenPago.mutateAsync({
      tipo: datos.tipo,
      fecha: datos.fecha,
      sectorId: datos.sectorId,
      proveedorId: cotizacionSeleccionada ? cotizacionSeleccionada.proveedorId : datos.proveedorId,
      cotizacionId: cotizacionId || undefined,
      moneda: datos.moneda,
      monto: Number(datos.monto),
      concepto: datos.concepto,
      formaPago: datos.formaPago,
      pagaIva: datos.pagaIva,
      ivaIncluido: datos.ivaIncluido,
      observaciones: datos.observaciones || undefined,
      factura: datos.factura?.[0],
    });
    router.push(`/ordenes-pago/${nueva.id}`);
  }

  async function confirmarExceso() {
    if (!datosExceso) return;
    try {
      await crearDesdeOC(datosExceso, true);
    } catch {
      // El error queda en crearOrdenPago.error y se muestra dentro del modal.
    }
  }

  if (sectores.isLoading || proveedores.isLoading || proyectos.isLoading) {
    return <Cargando etiqueta="Cargando formulario..." />;
  }
  if (sectores.isError) return <EstadoError error={sectores.error} />;
  if (proveedores.isError) return <EstadoError error={proveedores.error} />;
  if (proyectos.isError) return <EstadoError error={proyectos.error} />;

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-5">
      {/* Mientras el modal de exceso está abierto, el error lo muestra el propio modal. */}
      {mutacion.error && !datosExceso ? <EstadoError error={mutacion.error} /> : null}

      {esDesdeOC && solicitudOrigen ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
          Esta orden de pago se genera desde la{" "}
          <b>Orden de Compra #{solicitudOrigen.numero}</b>. Monto de la OC:{" "}
          <b>{formatearMonto(solicitudOrigen.monto, solicitudOrigen.moneda)}</b>.
        </div>
      ) : !ordenExistente ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
            Vincular a un proyecto (opcional)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              etiqueta="Proyecto"
              value={proyectoId}
              onChange={(evento) => {
                setProyectoId(evento.target.value);
                setCotizacionId("");
              }}
            >
              <option value="">— Ninguno —</option>
              {proyectos.data?.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </Select>
            {proyectoId ? (
              <Select
                etiqueta="Cotización activa"
                value={cotizacionId}
                onChange={(evento) => setCotizacionId(evento.target.value)}
              >
                <option value="">— Ninguna —</option>
                {cotizacionesActivas.map((cotizacion) => (
                  <option key={cotizacion.id} value={cotizacion.id}>
                    {mapaProveedores.get(cotizacion.proveedorId)?.nombre ?? "—"} ·{" "}
                    {formatearMonto(cotizacion.montoTotal, cotizacion.moneda)}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>
          {cotizacionSeleccionada ? (
            <p className="mt-3 text-xs text-gray-500">
              Saldo disponible en esa cotización:{" "}
              {formatearMonto(
                String(calcularSaldoDisponible(cotizacionSeleccionada, ordenesPagoDeCotizacion.data ?? [])),
                cotizacionSeleccionada.moneda,
              )}
            </p>
          ) : null}
        </div>
      ) : ordenExistente.cotizacionId ? (
        <p className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Esta orden está vinculada a una cotización — el proveedor no se puede cambiar.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select etiqueta="Tipo" error={errors.tipo?.message} {...register("tipo")}>
          {Object.entries(ETIQUETAS_TIPO_OP).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Select>
        <Campo
          etiqueta="Fecha"
          type="date"
          error={errors.fecha?.message}
          {...register("fecha", { required: "Requerido" })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          etiqueta="Sector"
          error={errors.sectorId?.message}
          {...register("sectorId", { required: "Requerido" })}
        >
          <option value="">— Seleccionar —</option>
          {sectores.data?.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.nombre}
            </option>
          ))}
        </Select>
        <Select
          etiqueta="Proveedor"
          disabled={proveedorBloqueado}
          error={errors.proveedorId?.message}
          {...register("proveedorId", { required: "Requerido" })}
        >
          <option value="">— Seleccionar —</option>
          {proveedores.data?.map((proveedor) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select etiqueta="Moneda" error={errors.moneda?.message} {...register("moneda")}>
          {MONEDAS.map((moneda) => (
            <option key={moneda} value={moneda}>
              {moneda}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Campo
            etiqueta="Monto"
            type="number"
            step="0.01"
            disabled={Boolean(ordenExistente)}
            error={errors.monto?.message}
            {...register("monto", {
              required: !ordenExistente ? "Requerido" : false,
              min: { value: 0.01, message: "Debe ser mayor a cero" },
            })}
          />
        </div>
      </div>
      {ordenExistente ? (
        <p className="-mt-3 text-xs text-gray-400">
          El monto no se puede editar una vez creada la orden.
        </p>
      ) : null}

      <TextArea
        etiqueta="Concepto"
        error={errors.concepto?.message}
        {...register("concepto", { required: "Requerido" })}
      />

      <Select
        etiqueta="Forma de pago"
        error={errors.formaPago?.message}
        {...register("formaPago", { required: "Requerido" })}
      >
        {Object.entries(ETIQUETAS_FORMA_PAGO).map(([valor, etiqueta]) => (
          <option key={valor} value={valor}>
            {etiqueta}
          </option>
        ))}
      </Select>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-seg-rojo" {...register("pagaIva")} />
          Paga IVA
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-seg-rojo" {...register("ivaIncluido")} />
          IVA incluido en el monto
        </label>
      </div>

      <TextArea etiqueta="Observaciones (opcional)" {...register("observaciones")} />

      {!ordenExistente ? (
        <Campo
          etiqueta="Factura (opcional)"
          type="file"
          accept={TIPO_ARCHIVO_FACTURA_ACEPTADO}
          error={errors.factura?.message}
          {...register("factura", {
            validate: (lista) => {
              const archivo = lista?.[0];
              if (!archivo) return true;
              if (archivo.type !== TIPO_ARCHIVO_FACTURA_ACEPTADO) return "El archivo debe ser un PDF";
              if (archivo.size > TAMANO_MAXIMO_ARCHIVO_FACTURA_BYTES) return "El PDF no puede superar los 10MB";
              return true;
            },
          })}
        />
      ) : null}

      <Boton type="submit" disabled={isSubmitting} className="self-start">
        {ordenExistente ? "Guardar cambios" : "Crear orden de pago"}
      </Boton>

      {datosExceso && solicitudOrigen ? (
        <ModalConfirmacionExcesoMonto
          montoOC={solicitudOrigen.monto}
          montoIngresado={Number(datosExceso.monto)}
          moneda={solicitudOrigen.moneda}
          cargando={crearOrdenPago.isPending}
          error={
            crearOrdenPago.error instanceof ErrorApi &&
            crearOrdenPago.error.codigo === "MONTO_EXCEDE_COTIZACION"
              ? null
              : crearOrdenPago.error
          }
          onConfirmar={confirmarExceso}
          onCerrar={() => {
            // Limpia el error MONTO_EXCEDE de la mutación para que no reaparezca en el
            // banner de arriba al cerrar el modal.
            crearOrdenPago.reset();
            setDatosExceso(null);
          }}
        />
      ) : null}
    </form>
  );
}
