"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useSectores } from "@/lib/sectores/hooks";
import { useMapaProveedores, useProveedores } from "@/lib/proveedores/hooks";
import { useProyectos } from "@/lib/proyectos/hooks";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useOrdenesCompra } from "@/lib/ordenes-compra/hooks";
import { formatearMonto, MONEDAS } from "@/lib/cotizaciones/presentacion";
import { calcularMontoConIva } from "@/lib/iva";
import {
  useActualizarOrdenPago,
  useCrearOrdenPago,
} from "@/lib/ordenes-pago/hooks";
import {
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
  // Editables al crear desde una OC:
  fecha: string;
  monto: string;
  concepto: string;
  formaPago: FormaPago;
  pagaIva: boolean;
  observaciones: string;
  factura?: FileList;
  // Solo usados en modo edición (la OP ya existe); al crear se heredan de la OC.
  tipo: TipoOC;
  sectorId: string;
  proveedorId: string;
  moneda: Moneda;
}

export function FormularioOrdenPago({
  ordenExistente,
  solicitudOrigen = null,
}: {
  ordenExistente: OrdenPago | null;
  solicitudOrigen?: OrdenCompra | null;
}) {
  const router = useRouter();
  const sectores = useSectores();
  const proveedores = useProveedores();
  const mapaProveedores = useMapaProveedores();
  const mapaClientes = useMapaClientes();
  const proyectos = useProyectos();
  // Las OP nacen de una Orden de Compra APROBADA (y no de pago único: esas generan
  // su OP solas al aprobarse). Se filtran client-side sobre el catálogo.
  const ordenesCompra = useOrdenesCompra({ porPagina: 200 });
  const ocsAprobadas = (ordenesCompra.data?.datos ?? []).filter(
    (oc) => oc.estado === "APROBADO" && !oc.esPagoUnico,
  );

  const esEdicion = Boolean(ordenExistente);

  // OC seleccionada en el alta (precargada por ?solicitudId= o elegida en el dropdown).
  const [ordenCompraId, setOrdenCompraId] = useState(solicitudOrigen?.id ?? "");
  const ocSeleccionada =
    ocsAprobadas.find((oc) => oc.id === ordenCompraId) ??
    (solicitudOrigen?.id === ordenCompraId ? solicitudOrigen : null);
  const [errorOC, setErrorOC] = useState<string | null>(null);

  // Guarda los datos del submit cuando el backend avisa que el monto excede la OC,
  // para reenviarlos con confirmación si el usuario acepta en el modal.
  const [datosExceso, setDatosExceso] = useState<DatosFormulario | null>(null);

  const crearOrdenPago = useCrearOrdenPago();
  const actualizarOrdenPago = useActualizarOrdenPago(ordenExistente?.id ?? "");
  const mutacion = ordenExistente ? actualizarOrdenPago : crearOrdenPago;
  // En edición, si la OP está vinculada a una cotización el proveedor no se cambia.
  const proveedorBloqueado = Boolean(ordenExistente?.cotizacionId);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      fecha: ordenExistente?.fecha.slice(0, 10) ?? obtenerFechaLocalDeHoy(),
      monto: ordenExistente?.monto ?? "",
      concepto: ordenExistente?.concepto ?? "",
      formaPago: ordenExistente?.formaPago ?? "TRANSFERENCIA_BANCARIA",
      pagaIva: ordenExistente?.pagaIva ?? false,
      observaciones: ordenExistente?.observaciones ?? "",
      tipo: ordenExistente?.tipo ?? "ARTICULO",
      sectorId: ordenExistente?.sectorId ?? "",
      proveedorId: ordenExistente?.proveedorId ?? "",
      moneda: ordenExistente?.moneda ?? "UYU",
    },
  });

  const pagaIva = useWatch({ control, name: "pagaIva" });
  const monto = useWatch({ control, name: "monto" });
  const moneda = useWatch({ control, name: "moneda" });
  const montoNumero = Number(monto);
  const mostrarMontoConIva = pagaIva && Number.isFinite(montoNumero) && montoNumero > 0;

  // Al elegir una OC se prellenan los campos editables con los de la OC; el resto
  // (tipo, sector, proveedor, moneda) se deriva en el backend, acá solo se muestran.
  useEffect(() => {
    if (esEdicion || !ocSeleccionada) return;
    setValue("monto", ocSeleccionada.monto);
    setValue("concepto", ocSeleccionada.concepto);
    setValue("pagaIva", ocSeleccionada.pagaIva);
  }, [esEdicion, ocSeleccionada?.id, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const nombreProveedor = (id: string) => mapaProveedores.get(id)?.nombre ?? "—";
  const nombreProyecto = (id: string) =>
    proyectos.data?.find((proyecto) => proyecto.id === id)?.nombre ?? "—";
  const nombreSector = (id: string) =>
    sectores.data?.find((sector) => sector.id === id)?.nombre ?? "—";
  const nombreCliente = (id: string | null) =>
    id ? mapaClientes.get(id)?.nombre ?? "—" : "—";

  // Crea la OP a partir de la OC. Se separa del submit para poder reintentarla con
  // confirmarExcesoMonto=true desde el modal de advertencia de monto.
  async function crearDesdeOC(datos: DatosFormulario, confirmarExcesoMonto: boolean) {
    if (!ocSeleccionada) return;
    const nueva = await crearOrdenPago.mutateAsync({
      ordenCompraId: ocSeleccionada.id,
      fecha: datos.fecha,
      monto: Number(datos.monto),
      concepto: datos.concepto,
      formaPago: datos.formaPago,
      pagaIva: datos.pagaIva,
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
        ivaIncluido: false,
        observaciones: datos.observaciones || undefined,
      });
      router.push(`/ordenes-pago/${ordenExistente.id}`);
      return;
    }

    if (!ocSeleccionada) {
      setErrorOC("Elegí una orden de compra aprobada");
      return;
    }

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

      {!esEdicion ? (
        <div className="flex flex-col gap-3">
          <Select
            etiqueta="Orden de compra aprobada"
            value={ordenCompraId}
            error={errorOC ?? undefined}
            disabled={ordenesCompra.isLoading}
            onChange={(evento) => {
              setOrdenCompraId(evento.target.value);
              setErrorOC(null);
            }}
          >
            <option value="">— Seleccionar —</option>
            {ocsAprobadas.map((oc) => (
              <option key={oc.id} value={oc.id}>
                OC #{oc.numero} · {nombreProyecto(oc.proyectoId)} ·{" "}
                {nombreProveedor(oc.proveedorId)} · {formatearMonto(oc.monto, oc.moneda)}
              </option>
            ))}
          </Select>
          {ocSeleccionada ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="mb-2">
                Datos heredados de la <b>Orden de Compra #{ocSeleccionada.numero}</b>:
              </p>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <Dato etiqueta="Proyecto" valor={nombreProyecto(ocSeleccionada.proyectoId)} />
                <Dato etiqueta="Cliente" valor={nombreCliente(ocSeleccionada.clienteId)} />
                <Dato etiqueta="Proveedor" valor={nombreProveedor(ocSeleccionada.proveedorId)} />
                <Dato etiqueta="Sector" valor={nombreSector(ocSeleccionada.sectorId)} />
                <Dato etiqueta="Tipo" valor={ETIQUETAS_TIPO_OP[ocSeleccionada.tipo]} />
                <Dato etiqueta="Moneda" valor={ocSeleccionada.moneda} />
                <Dato
                  etiqueta="Monto de la OC"
                  valor={formatearMonto(ocSeleccionada.monto, ocSeleccionada.moneda)}
                />
              </dl>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select etiqueta="Tipo" error={errors.tipo?.message} {...register("tipo")}>
              {Object.entries(ETIQUETAS_TIPO_OP).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </Select>
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Select etiqueta="Moneda" error={errors.moneda?.message} {...register("moneda")}>
              {MONEDAS.map((unaMoneda) => (
                <option key={unaMoneda} value={unaMoneda}>
                  {unaMoneda}
                </option>
              ))}
            </Select>
          </div>
        </>
      )}

      {esEdicion || ocSeleccionada ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Fecha"
              type="date"
              error={errors.fecha?.message}
              {...register("fecha", { required: "Requerido" })}
            />
            <Campo
              etiqueta="Monto (sin IVA)"
              type="number"
              step="0.01"
              disabled={esEdicion}
              error={errors.monto?.message}
              {...register("monto", {
                required: !esEdicion ? "Requerido" : false,
                min: { value: 0.01, message: "Debe ser mayor a cero" },
              })}
            />
          </div>
          {esEdicion ? (
            <p className="-mt-3 text-xs text-gray-400">
              El monto no se puede editar una vez creada la orden.
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 accent-seg-rojo" {...register("pagaIva")} />
              ¿Paga IVA?
            </label>
            {mostrarMontoConIva ? (
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-500">Monto con IVA (22%)</span>
                <span className="font-medium text-gray-800">
                  {formatearMonto(String(calcularMontoConIva(montoNumero)), moneda)}
                </span>
              </div>
            ) : null}
          </div>

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

          <TextArea etiqueta="Observaciones (opcional)" {...register("observaciones")} />

          {!esEdicion ? (
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
            {esEdicion ? "Guardar cambios" : "Crear orden de pago"}
          </Boton>
        </>
      ) : null}

      {datosExceso && ocSeleccionada ? (
        <ModalConfirmacionExcesoMonto
          montoOC={ocSeleccionada.monto}
          montoIngresado={Number(datosExceso.monto)}
          moneda={ocSeleccionada.moneda}
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

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-2 sm:block">
      <dt className="text-xs uppercase tracking-wide text-gray-400">{etiqueta}</dt>
      <dd className="font-medium text-gray-700">{valor}</dd>
    </div>
  );
}
