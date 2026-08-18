"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useActualizarProveedor, useCrearProveedor } from "@/lib/proveedores/hooks";
import { ETIQUETAS_TIPO_CUENTA } from "@/lib/proveedores/presentacion";
import type { Proveedor, TipoCuentaBancaria } from "@/lib/proveedores/tipos";

interface DatosFormulario {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  banco: string;
  tipoCuenta: TipoCuentaBancaria;
  numeroCuenta: string;
}

export function ModalProveedor({
  proveedor,
  onCerrar,
}: {
  proveedor: Proveedor | null;
  onCerrar: () => void;
}) {
  const crearProveedor = useCrearProveedor();
  const actualizarProveedor = useActualizarProveedor(proveedor?.id ?? "");
  const mutacion = proveedor ? actualizarProveedor : crearProveedor;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      nombre: proveedor?.nombre ?? "",
      rut: proveedor?.rut ?? "",
      email: proveedor?.email ?? "",
      telefono: proveedor?.telefono ?? "",
      banco: proveedor?.banco ?? "",
      tipoCuenta: proveedor?.tipoCuenta ?? "CAJA_AHORRO",
      numeroCuenta: proveedor?.numeroCuenta ?? "",
    },
  });

  async function alEnviar(datos: DatosFormulario) {
    await mutacion.mutateAsync({
      nombre: datos.nombre,
      rut: datos.rut,
      email: datos.email || undefined,
      telefono: datos.telefono || undefined,
      banco: datos.banco,
      tipoCuenta: datos.tipoCuenta,
      numeroCuenta: datos.numeroCuenta,
    });
    onCerrar();
  }

  return (
    <Modal titulo={proveedor ? "Editar proveedor" : "Nuevo proveedor"} abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {mutacion.error ? <EstadoError error={mutacion.error} /> : null}
        <Campo etiqueta="Nombre" error={errors.nombre?.message} {...register("nombre", { required: "Requerido" })} />
        <Campo etiqueta="RUT" error={errors.rut?.message} {...register("rut", { required: "Requerido" })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Campo etiqueta="Teléfono" error={errors.telefono?.message} {...register("telefono")} />
        </div>
        <Campo etiqueta="Banco" error={errors.banco?.message} {...register("banco", { required: "Requerido" })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select etiqueta="Tipo de cuenta" error={errors.tipoCuenta?.message} {...register("tipoCuenta")}>
            {Object.entries(ETIQUETAS_TIPO_CUENTA).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Select>
          <Campo
            etiqueta="Número de cuenta"
            error={errors.numeroCuenta?.message}
            {...register("numeroCuenta", { required: "Requerido" })}
          />
        </div>
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          {proveedor ? "Guardar cambios" : "Crear proveedor"}
        </Boton>
      </form>
    </Modal>
  );
}
