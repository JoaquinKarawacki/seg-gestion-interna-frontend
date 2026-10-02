"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";

interface DatosFormulario {
  motivo: string;
}

export function ModalMotivoTransicion({
  titulo,
  motivoRequerido,
  cargando,
  error,
  onConfirmar,
  onCerrar,
}: {
  titulo: string;
  motivoRequerido: boolean;
  cargando: boolean;
  error: unknown;
  onConfirmar: (motivo?: string) => void;
  onCerrar: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormulario>();

  function alEnviar(datos: DatosFormulario) {
    onConfirmar(datos.motivo || undefined);
  }

  return (
    <Modal titulo={titulo} abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {error ? <EstadoError error={error} /> : null}
        <TextArea
          etiqueta={motivoRequerido ? "Motivo" : "Motivo (opcional)"}
          error={errors.motivo?.message}
          {...register("motivo", { required: motivoRequerido ? "Requerido" : false })}
        />
        <Boton type="submit" disabled={cargando} className="self-start">
          Confirmar
        </Boton>
      </form>
    </Modal>
  );
}
