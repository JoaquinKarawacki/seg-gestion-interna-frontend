"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { useClientes } from "@/lib/clientes/hooks";
import { useSectores } from "@/lib/sectores/hooks";
import { useActualizarProyecto, useCrearProyecto } from "@/lib/proyectos/hooks";
import type { Proyecto } from "@/lib/proyectos/tipos";

const SIN_SECTOR = "";

interface DatosFormulario {
  nombre: string;
  clienteId: string;
  sectorId: string;
}

export function ModalProyecto({
  proyecto,
  onCerrar,
}: {
  proyecto: Proyecto | null;
  onCerrar: () => void;
}) {
  const clientes = useClientes();
  const sectores = useSectores();
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
      sectorId: proyecto?.sectorId ?? SIN_SECTOR,
    },
  });

  async function alEnviar(datos: DatosFormulario) {
    const sectorId = datos.sectorId === SIN_SECTOR ? undefined : datos.sectorId;
    await mutacion.mutateAsync({ ...datos, sectorId });
    onCerrar();
  }

  return (
    <Modal titulo={proyecto ? "Editar proyecto" : "Nuevo proyecto"} abierto onCerrar={onCerrar}>
      {clientes.isLoading || sectores.isLoading ? <Cargando etiqueta="Cargando..." /> : null}
      {clientes.isError ? <EstadoError error={clientes.error} /> : null}
      {sectores.isError ? <EstadoError error={sectores.error} /> : null}
      {clientes.data && sectores.data ? (
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
          <Select etiqueta="Sector" error={errors.sectorId?.message} {...register("sectorId")}>
            <option value={SIN_SECTOR}>— Sin sector —</option>
            {sectores.data.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
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
