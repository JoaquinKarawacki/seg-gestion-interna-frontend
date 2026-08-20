"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useCrearPropuestaInversion } from "@/lib/propuestas-inversion/hooks";
import {
  TAMANO_MAXIMO_ARCHIVO_PROPUESTA_INVERSION_BYTES,
  TIPOS_ARCHIVO_PROPUESTA_INVERSION_ACEPTADOS,
} from "@/lib/propuestas-inversion/tipos";
import { MONEDAS } from "@/lib/cotizaciones/presentacion";
import type { Moneda } from "@/lib/cotizaciones/tipos";

interface DatosFormulario {
  costoTotalAproximado: string;
  ahorroMensual: string;
  cantidadMeses: string;
  porcentajeSeg: string;
  moneda: Moneda;
  archivo: FileList | undefined;
}

export function ModalPropuestaInversion({
  proyectoId,
  onCerrar,
}: {
  proyectoId: string;
  onCerrar: () => void;
}) {
  const crearPropuesta = useCrearPropuestaInversion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      costoTotalAproximado: "",
      ahorroMensual: "",
      cantidadMeses: "",
      porcentajeSeg: "",
      moneda: "UYU",
    },
  });

  async function alEnviar(datos: DatosFormulario) {
    await crearPropuesta.mutateAsync({
      proyectoId,
      costoTotalAproximado: Number(datos.costoTotalAproximado),
      ahorroMensual: Number(datos.ahorroMensual),
      cantidadMeses: Number(datos.cantidadMeses),
      porcentajeSeg: Number(datos.porcentajeSeg),
      moneda: datos.moneda,
      archivo: datos.archivo?.[0],
    });
    onCerrar();
  }

  return (
    <Modal titulo="Nueva propuesta de inversión" abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {crearPropuesta.error ? <EstadoError error={crearPropuesta.error} /> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Costo total aproximado"
            type="number"
            step="0.01"
            error={errors.costoTotalAproximado?.message}
            {...register("costoTotalAproximado", {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Ahorro mensual"
            type="number"
            step="0.01"
            error={errors.ahorroMensual?.message}
            {...register("ahorroMensual", {
              required: "Requerido",
              min: { value: 0.01, message: "Debe ser mayor a cero" },
            })}
          />
          <Campo
            etiqueta="Cantidad de meses"
            type="number"
            step="1"
            error={errors.cantidadMeses?.message}
            {...register("cantidadMeses", {
              required: "Requerido",
              min: { value: 1, message: "Debe ser al menos 1" },
            })}
          />
        </div>
        <Campo
          etiqueta="% que se queda SEG"
          type="number"
          step="0.01"
          error={errors.porcentajeSeg?.message}
          {...register("porcentajeSeg", {
            required: "Requerido",
            min: { value: 0, message: "No puede ser negativo" },
            max: { value: 100, message: "No puede superar 100" },
          })}
        />
        <Campo
          etiqueta="Archivo (PDF, Word o imagen, opcional)"
          type="file"
          accept={TIPOS_ARCHIVO_PROPUESTA_INVERSION_ACEPTADOS.join(",")}
          error={errors.archivo?.message}
          {...register("archivo", {
            validate: (lista) => {
              const archivo = lista?.[0];
              if (!archivo) return true;
              if (!TIPOS_ARCHIVO_PROPUESTA_INVERSION_ACEPTADOS.includes(archivo.type)) {
                return "El archivo debe ser un PDF, Word o imagen";
              }
              if (archivo.size > TAMANO_MAXIMO_ARCHIVO_PROPUESTA_INVERSION_BYTES) {
                return "El archivo no puede superar los 10MB";
              }
              return true;
            },
          })}
        />
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          Guardar propuesta
        </Boton>
      </form>
    </Modal>
  );
}
