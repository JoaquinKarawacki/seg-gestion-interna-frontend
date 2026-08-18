"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useActualizarSector, useCrearSector } from "@/lib/sectores/hooks";
import type { Sector } from "@/lib/sectores/tipos";

interface DatosFormulario {
  nombre: string;
}

export function ModalSector({
  sector,
  onCerrar,
}: {
  sector: Sector | null;
  onCerrar: () => void;
}) {
  const crearSector = useCrearSector();
  const actualizarSector = useActualizarSector(sector?.id ?? "");
  const mutacion = sector ? actualizarSector : crearSector;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({ defaultValues: { nombre: sector?.nombre ?? "" } });

  async function alEnviar(datos: DatosFormulario) {
    await mutacion.mutateAsync(datos);
    onCerrar();
  }

  return (
    <Modal titulo={sector ? "Editar sector" : "Nuevo sector"} abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {mutacion.error ? <EstadoError error={mutacion.error} /> : null}
        <Campo
          etiqueta="Nombre"
          error={errors.nombre?.message}
          {...register("nombre", {
            required: "Requerido",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
          })}
        />
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          {sector ? "Guardar cambios" : "Crear sector"}
        </Boton>
      </form>
    </Modal>
  );
}
