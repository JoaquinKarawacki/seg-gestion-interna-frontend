"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useActualizarTarea, useCrearTarea } from "@/lib/tareas/hooks";
import type { Tarea } from "@/lib/tareas/tipos";

interface DatosFormulario {
  nombre: string;
}

export function ModalTarea({
  proyectoId,
  tarea,
  onCerrar,
}: {
  proyectoId: string;
  tarea: Tarea | null;
  onCerrar: () => void;
}) {
  const crearTarea = useCrearTarea();
  const actualizarTarea = useActualizarTarea(tarea?.id ?? "");
  const mutacion = tarea ? actualizarTarea : crearTarea;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({ defaultValues: { nombre: tarea?.nombre ?? "" } });

  async function alEnviar(datos: DatosFormulario) {
    if (tarea) {
      await actualizarTarea.mutateAsync({ nombre: datos.nombre });
    } else {
      await crearTarea.mutateAsync({ nombre: datos.nombre, proyectoId });
    }
    onCerrar();
  }

  return (
    <Modal titulo={tarea ? "Editar tarea" : "Nueva tarea"} abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {mutacion.error ? <EstadoError error={mutacion.error} /> : null}
        <Campo
          etiqueta="Nombre"
          error={errors.nombre?.message}
          {...register("nombre", { required: "Requerido" })}
        />
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          {tarea ? "Guardar cambios" : "Crear tarea"}
        </Boton>
      </form>
    </Modal>
  );
}
