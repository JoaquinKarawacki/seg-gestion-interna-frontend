"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useProveedores } from "@/lib/proveedores/hooks";
import { useCrearCotizacion } from "@/lib/cotizaciones/hooks";
import {
  TAMANO_MAXIMO_ARCHIVO_COTIZACION_BYTES,
  TIPO_ARCHIVO_COTIZACION_ACEPTADO,
  type Moneda,
} from "@/lib/cotizaciones/tipos";
import { MONEDAS } from "@/lib/cotizaciones/presentacion";
import type { Tarea } from "@/lib/tareas/tipos";

interface DatosFormulario {
  tareaId: string;
  proveedorId: string;
  montoTotal: string;
  moneda: Moneda;
  archivo: FileList | undefined;
}

export function ModalCotizacion({
  proyectoId,
  tareas,
  tareaIdInicial,
  onCerrar,
}: {
  proyectoId: string;
  tareas: Tarea[];
  tareaIdInicial: string | null;
  onCerrar: () => void;
}) {
  const proveedores = useProveedores();
  const crearCotizacion = useCrearCotizacion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      tareaId: tareaIdInicial ?? tareas[0]?.id ?? "",
      proveedorId: "",
      montoTotal: "",
      moneda: "UYU",
    },
  });

  if (tareas.length === 0) {
    return (
      <Modal titulo="Nueva cotización" abierto onCerrar={onCerrar}>
        <p className="text-sm text-gray-500">
          Creá una tarea antes de cargar una cotización.
        </p>
      </Modal>
    );
  }

  async function alEnviar(datos: DatosFormulario) {
    await crearCotizacion.mutateAsync({
      proyectoId,
      tareaId: datos.tareaId,
      proveedorId: datos.proveedorId,
      montoTotal: Number(datos.montoTotal),
      moneda: datos.moneda,
      archivo: datos.archivo?.[0],
    });
    onCerrar();
  }

  return (
    <Modal titulo="Nueva cotización" abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {crearCotizacion.error ? <EstadoError error={crearCotizacion.error} /> : null}
        <Select
          etiqueta="Tarea"
          error={errors.tareaId?.message}
          {...register("tareaId", { required: "Requerido" })}
        >
          {tareas.map((tarea) => (
            <option key={tarea.id} value={tarea.id}>
              {tarea.nombre}
            </option>
          ))}
        </Select>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Monto"
            type="number"
            step="0.01"
            error={errors.montoTotal?.message}
            {...register("montoTotal", {
              required: "Requerido",
              min: { value: 0.01, message: "Debe ser mayor a cero" },
            })}
          />
          <Select etiqueta="Moneda" error={errors.moneda?.message} {...register("moneda")}>
            {MONEDAS.map((moneda) => (
              <option key={moneda} value={moneda}>
                {moneda}
              </option>
            ))}
          </Select>
        </div>
        <Campo
          etiqueta="PDF de la cotización (opcional)"
          type="file"
          accept={TIPO_ARCHIVO_COTIZACION_ACEPTADO}
          error={errors.archivo?.message}
          {...register("archivo", {
            validate: (lista) => {
              const archivo = lista?.[0];
              if (!archivo) return true;
              if (archivo.type !== TIPO_ARCHIVO_COTIZACION_ACEPTADO) return "El archivo debe ser un PDF";
              if (archivo.size > TAMANO_MAXIMO_ARCHIVO_COTIZACION_BYTES) return "El PDF no puede superar los 10MB";
              return true;
            },
          })}
        />
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          Guardar cotización
        </Boton>
      </form>
    </Modal>
  );
}
