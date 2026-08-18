"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { useSectores } from "@/lib/sectores/hooks";
import { useActualizarUsuario, useCrearUsuario } from "@/lib/usuarios/hooks";
import { ETIQUETAS_ROL } from "@/lib/usuarios/presentacion";
import type { Usuario } from "@/lib/usuarios/tipos";
import type { RolUsuario } from "@/lib/auth/tipos";

const SIN_SECTOR = "";

interface DatosFormulario {
  nombre: string;
  email: string;
  contrasena: string;
  rol: RolUsuario;
  sectorId: string;
}

export function ModalUsuario({
  usuario,
  onCerrar,
}: {
  usuario: Usuario | null;
  onCerrar: () => void;
}) {
  const sectores = useSectores();
  const crearUsuario = useCrearUsuario();
  const actualizarUsuario = useActualizarUsuario(usuario?.id ?? "");
  const mutacion = usuario ? actualizarUsuario : crearUsuario;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      nombre: usuario?.nombre ?? "",
      email: usuario?.email ?? "",
      contrasena: "",
      rol: usuario?.rol ?? "SOLICITANTE",
      sectorId: usuario?.sectorId ?? SIN_SECTOR,
    },
  });

  async function alEnviar(datos: DatosFormulario) {
    const sectorId = datos.sectorId === SIN_SECTOR ? undefined : datos.sectorId;

    if (usuario) {
      await actualizarUsuario.mutateAsync({
        nombre: datos.nombre,
        email: datos.email,
        rol: datos.rol,
        sectorId,
      });
    } else {
      await crearUsuario.mutateAsync({
        nombre: datos.nombre,
        email: datos.email,
        contrasena: datos.contrasena,
        rol: datos.rol,
        sectorId,
      });
    }
    onCerrar();
  }

  return (
    <Modal titulo={usuario ? "Editar usuario" : "Nuevo usuario"} abierto onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-4">
        {mutacion.error ? <EstadoError error={mutacion.error} /> : null}
        <Campo etiqueta="Nombre" error={errors.nombre?.message} {...register("nombre", { required: "Requerido" })} />
        <Campo
          etiqueta="Email"
          type="email"
          error={errors.email?.message}
          {...register("email", { required: "Requerido" })}
        />
        {!usuario ? (
          <Campo
            etiqueta="Contraseña provisoria"
            type="password"
            error={errors.contrasena?.message}
            {...register("contrasena", {
              required: "Requerido",
              minLength: { value: 8, message: "Mínimo 8 caracteres" },
            })}
          />
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select etiqueta="Rol" error={errors.rol?.message} {...register("rol")}>
            {Object.entries(ETIQUETAS_ROL).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Select>
          <Select etiqueta="Sector" error={errors.sectorId?.message} {...register("sectorId")}>
            <option value={SIN_SECTOR}>— Sin sector —</option>
            {sectores.data?.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
              </option>
            ))}
          </Select>
        </div>
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          {usuario ? "Guardar cambios" : "Crear usuario"}
        </Boton>
      </form>
    </Modal>
  );
}
