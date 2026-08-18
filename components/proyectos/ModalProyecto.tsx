"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { useClientes } from "@/lib/clientes/hooks";
import { useActualizarProyecto, useCrearProyecto } from "@/lib/proyectos/hooks";
import type { Proyecto } from "@/lib/proyectos/tipos";

interface DatosFormulario {
  nombre: string;
  clienteId: string;
}

export function ModalProyecto({
  proyecto,
  onCerrar,
}: {
  proyecto: Proyecto | null;
  onCerrar: () => void;
}) {
  const clientes = useClientes();
  const crearProyecto = useCrearProyecto();
  const actualizarProyecto = useActualizarProyecto(proyecto?.id ?? "");
  const mutacion = proyecto ? actualizarProyecto : crearProyecto;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      nombre: proyecto?.nombre ?? "",
      clienteId: proyecto?.clienteId ?? "",
    },
  });

  async function alEnviar(datos: DatosFormulario) {
    await mutacion.mutateAsync(datos);
    onCerrar();
  }

  return (
    <Modal titulo={proyecto ? "Editar proyecto" : "Nuevo proyecto"} abierto onCerrar={onCerrar}>
      {clientes.isLoading ? <Cargando etiqueta="Cargando clientes..." /> : null}
      {clientes.isError ? <EstadoError error={clientes.error} /> : null}
      {clientes.data ? (
        <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
          {mutacion.error ? <EstadoError error={mutacion.error} /> : null}
          <Campo
            etiqueta="Nombre"
            error={errors.nombre?.message}
            {...register("nombre", { required: "Requerido" })}
          />
          <Select
            etiqueta="Cliente"
            error={errors.clienteId?.message}
            {...register("clienteId", { required: "Requerido" })}
          >
            <option value="">— Seleccionar —</option>
            {clientes.data.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </Select>
          <Boton type="submit" disabled={isSubmitting} className="self-start">
            {proyecto ? "Guardar cambios" : "Crear proyecto"}
          </Boton>
        </form>
      ) : null}
    </Modal>
  );
}
