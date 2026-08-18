"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useAdjuntarFacturaOrdenCompra } from "@/lib/ordenes-compra/hooks";
import { TAMANO_MAXIMO_ARCHIVO_FACTURA_BYTES, TIPO_ARCHIVO_FACTURA_ACEPTADO } from "@/lib/ordenes-compra/tipos";

interface DatosFormulario {
  factura: FileList;
}

export function ModalAdjuntarFactura({
  ordenId,
  onCerrar,
}: {
  ordenId: string;
  onCerrar: () => void;
}) {
  const adjuntarFactura = useAdjuntarFacturaOrdenCompra(ordenId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>();

  async function alEnviar(datos: DatosFormulario) {
    await adjuntarFactura.mutateAsync(datos.factura[0]);
    onCerrar();
  }

  return (
    <Modal titulo="Adjuntar factura" abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {adjuntarFactura.error ? <EstadoError error={adjuntarFactura.error} /> : null}
        <Campo
          etiqueta="PDF de la factura"
          type="file"
          accept={TIPO_ARCHIVO_FACTURA_ACEPTADO}
          error={errors.factura?.message}
          {...register("factura", {
            required: "Requerido",
            validate: (lista) => {
              const archivo = lista?.[0];
              if (!archivo) return "Requerido";
              if (archivo.type !== TIPO_ARCHIVO_FACTURA_ACEPTADO) return "El archivo debe ser un PDF";
              if (archivo.size > TAMANO_MAXIMO_ARCHIVO_FACTURA_BYTES) return "El PDF no puede superar los 10MB";
              return true;
            },
          })}
        />
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          Guardar
        </Boton>
      </form>
    </Modal>
  );
}
