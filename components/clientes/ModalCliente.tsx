"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useActualizarCliente, useCrearCliente } from "@/lib/clientes/hooks";
import type { Cliente } from "@/lib/clientes/tipos";

interface DatosFormulario {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
}

export function ModalCliente({
  cliente,
  onCerrar,
}: {
  cliente: Cliente | null;
  onCerrar: () => void;
}) {
  const crearCliente = useCrearCliente();
  const actualizarCliente = useActualizarCliente(cliente?.id ?? "");
  const mutacion = cliente ? actualizarCliente : crearCliente;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      nombre: cliente?.nombre ?? "",
      rut: cliente?.rut ?? "",
      email: cliente?.email ?? "",
      telefono: cliente?.telefono ?? "",
    },
  });

  async function alEnviar(datos: DatosFormulario) {
    await mutacion.mutateAsync({
      nombre: datos.nombre,
      rut: datos.rut,
      email: datos.email || undefined,
      telefono: datos.telefono || undefined,
    });
    onCerrar();
  }

  return (
    <Modal titulo={cliente ? "Editar cliente" : "Nuevo cliente"} abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {mutacion.error ? <EstadoError error={mutacion.error} /> : null}
        <Campo etiqueta="Nombre" error={errors.nombre?.message} {...register("nombre", { required: "Requerido" })} />
        <Campo etiqueta="RUT" error={errors.rut?.message} {...register("rut", { required: "Requerido" })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Campo etiqueta="Teléfono" error={errors.telefono?.message} {...register("telefono")} />
        </div>
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          {cliente ? "Guardar cambios" : "Crear cliente"}
        </Boton>
      </form>
    </Modal>
  );
}
