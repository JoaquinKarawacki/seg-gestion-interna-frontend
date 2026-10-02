"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useAuth } from "@/lib/auth/contexto";
import { useSectores } from "@/lib/sectores/hooks";
import { useMapaClientes } from "@/lib/clientes/hooks";
import { useProveedores } from "@/lib/proveedores/hooks";
import { useProyectos, useProyecto } from "@/lib/proyectos/hooks";
import { MONEDAS } from "@/lib/cotizaciones/presentacion";
import { useCrearSolicitudCompra } from "@/lib/solicitudes-compra/hooks";
import { ETIQUETAS_TIPO_SC } from "@/lib/solicitudes-compra/presentacion";
import { ETIQUETAS_FORMA_PAGO } from "@/lib/ordenes-compra/presentacion";
import type { FormaPago } from "@/lib/ordenes-compra/tipos";
import {
  TAMANO_MAXIMO_ARCHIVO_ADJUNTO_BYTES,
  TIPO_ARCHIVO_ADJUNTO_ACEPTADO,
} from "@/lib/solicitudes-compra/tipos";
import type { TipoSolicitudCompra } from "@/lib/solicitudes-compra/tipos";
import type { Moneda } from "@/lib/cotizaciones/tipos";
import { SelectorRubro, VALOR_RUBRO_OTROS } from "@/components/solicitudes-compra/SelectorRubro";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";

interface DatosFormulario {
  tipo: TipoSolicitudCompra;
  sectorId: string;
  proveedorId: string;
  moneda: Moneda;
  monto: string;
  concepto: string;
  pagaIva: boolean;
  ivaIncluido: boolean;
  observaciones: string;
  adjunto?: FileList;
  esPagoUnico: boolean;
  pagoUnicoFormaPago?: FormaPago;
}

interface ErroresLocales {
  proyecto?: string;
  rubro?: string;
}

export function FormularioSolicitudCompra() {
  const router = useRouter();
  const { usuario } = useAuth();
  const sectores = useSectores();
  const proveedores = useProveedores();
  const proyectos = useProyectos();
  const mapaClientes = useMapaClientes();

  const [proyectoId, setProyectoId] = useState("");
  const [rubroId, setRubroId] = useState("");
  const [rubroNombre, setRubroNombre] = useState("");
  const [erroresLocales, setErroresLocales] = useState<ErroresLocales>({});

  const proyectoSeleccionado = useProyecto(proyectoId || undefined);
  const clienteNombre = proyectoSeleccionado.data
    ? mapaClientes.get(proyectoSeleccionado.data.clienteId)?.nombre ?? "—"
    : "";

  const crear = useCrearSolicitudCompra();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      tipo: "ARTICULO",
      sectorId: usuario?.sectorId ?? "",
      proveedorId: "",
      moneda: "UYU",
      monto: "",
      concepto: "",
      pagaIva: true,
      ivaIncluido: true,
      observaciones: "",
      esPagoUnico: false,
    },
  });

  const esPagoUnico = useWatch({ control, name: "esPagoUnico" });

  async function alEnviar(datos: DatosFormulario) {
    const nuevosErrores: ErroresLocales = {};
    if (!proyectoId) nuevosErrores.proyecto = "Requerido";
    const esOtros = rubroId === VALOR_RUBRO_OTROS;
    if (!rubroId) nuevosErrores.rubro = "Requerido";
    else if (esOtros && !rubroNombre.trim()) nuevosErrores.rubro = "Ingresá el nombre del rubro";

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresLocales(nuevosErrores);
      return;
    }
    setErroresLocales({});

    const nueva = await crear.mutateAsync({
      tipo: datos.tipo,
      sectorId: datos.sectorId,
      proveedorId: datos.proveedorId,
      proyectoId,
      rubroId: esOtros ? undefined : rubroId,
      rubroNombre: esOtros ? rubroNombre.trim() : undefined,
      moneda: datos.moneda,
      monto: Number(datos.monto),
      concepto: datos.concepto,
      pagaIva: datos.pagaIva,
      ivaIncluido: datos.ivaIncluido,
      observaciones: datos.observaciones || undefined,
      esPagoUnico: datos.esPagoUnico,
      pagoUnicoFormaPago: datos.esPagoUnico ? datos.pagoUnicoFormaPago : undefined,
      adjunto: datos.adjunto?.[0],
    });
    router.push(`/solicitudes-compra/${nueva.id}`);
  }

  if (sectores.isLoading || proveedores.isLoading || proyectos.isLoading) {
    return <Cargando etiqueta="Cargando formulario..." />;
  }
  if (sectores.isError) return <EstadoError error={sectores.error} />;
  if (proveedores.isError) return <EstadoError error={proveedores.error} />;
  if (proyectos.isError) return <EstadoError error={proyectos.error} />;

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-5">
      {crear.error ? <EstadoError error={crear.error} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          etiqueta="Proyecto"
          value={proyectoId}
          error={erroresLocales.proyecto}
          onChange={(evento) => setProyectoId(evento.target.value)}
        >
          <option value="">— Seleccionar —</option>
          {proyectos.data?.map((proyecto) => (
            <option key={proyecto.id} value={proyecto.id}>
              {proyecto.nombre}
            </option>
          ))}
        </Select>
        <Campo etiqueta="Cliente" value={clienteNombre} disabled readOnly />
      </div>

      <SelectorRubro
        rubroId={rubroId}
        rubroNombre={rubroNombre}
        onRubroIdChange={setRubroId}
        onRubroNombreChange={setRubroNombre}
        error={erroresLocales.rubro}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          etiqueta="Proveedor"
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
        <Select etiqueta="Tipo" error={errors.tipo?.message} {...register("tipo")}>
          {Object.entries(ETIQUETAS_TIPO_SC).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Select>
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
            error={errors.monto?.message}
            {...register("monto", {
              required: "Requerido",
              min: { value: 0.01, message: "Debe ser mayor a cero" },
            })}
          />
        </div>
      </div>

      <TextArea
        etiqueta="Concepto"
        error={errors.concepto?.message}
        {...register("concepto", { required: "Requerido" })}
      />

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

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-seg-rojo" {...register("esPagoUnico")} />
          Pago único — generar la orden de pago al aprobar
        </label>
        {esPagoUnico ? (
          <div className="mt-4">
            <Select
              etiqueta="Forma de pago"
              error={errors.pagoUnicoFormaPago?.message}
              {...register("pagoUnicoFormaPago", {
                validate: (valor) => !esPagoUnico || Boolean(valor) || "Requerido",
              })}
            >
              <option value="">— Seleccionar —</option>
              {Object.entries(ETIQUETAS_FORMA_PAGO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </Select>
            <p className="mt-2 text-xs text-gray-500">
              Al aprobar esta orden de compra se creará automáticamente una orden de pago por el
              monto total, con esta forma de pago.
            </p>
          </div>
        ) : null}
      </div>

      <TextArea etiqueta="Observaciones (opcional)" {...register("observaciones")} />

      <Campo
        etiqueta="Adjunto PDF (obligatorio)"
        type="file"
        accept={TIPO_ARCHIVO_ADJUNTO_ACEPTADO}
        error={errors.adjunto?.message}
        {...register("adjunto", {
          validate: (lista) => {
            const archivo = lista?.[0];
            if (!archivo) return "El adjunto es obligatorio";
            if (archivo.type !== TIPO_ARCHIVO_ADJUNTO_ACEPTADO) return "El archivo debe ser un PDF";
            if (archivo.size > TAMANO_MAXIMO_ARCHIVO_ADJUNTO_BYTES)
              return "El PDF no puede superar los 10MB";
            return true;
          },
        })}
      />

      <Boton type="submit" disabled={isSubmitting} className="self-start">
        Crear orden de compra
      </Boton>
    </form>
  );
}
