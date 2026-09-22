"use client";

import { useForm, useWatch } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
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
  sectoresEncargadoIds: string[];
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>({
    defaultValues: {
      nombre: usuario?.nombre ?? "",
      email: usuario?.email ?? "",
      contrasena: "",
      rol: usuario?.rol ?? "SOLICITANTE",
      sectorId: usuario?.sectorId ?? SIN_SECTOR,
      sectoresEncargadoIds: usuario?.sectoresEncargadoIds ?? [],
    },
  });

  const rolSeleccionado = useWatch({ control, name: "rol" });

  async function alEnviar(datos: DatosFormulario) {
    // Solo tiene sentido para ENCARGADO — si se cambia el rol a otro, no
    // manda sectores de aprobación aunque hayan quedado tildados de antes.
    const sectoresEncargadoIds =
      datos.rol === "ENCARGADO" ? datos.sectoresEncargadoIds : [];

    if (usuario) {
      // null explícito (no undefined): así el PATCH realmente limpia el sector
      // cuando se elige "— Sin sector —", en vez de dejar el valor anterior
      // sin tocar (undefined se pierde al serializar y el backend lo ignora).
      const sectorId = datos.sectorId === SIN_SECTOR ? null : datos.sectorId;
      await actualizarUsuario.mutateAsync({
        nombre: datos.nombre,
        email: datos.email,
        rol: datos.rol,
        sectorId,
        sectoresEncargadoIds,
      });
    } else {
      const sectorId = datos.sectorId === SIN_SECTOR ? undefined : datos.sectorId;
      await crearUsuario.mutateAsync({
        nombre: datos.nombre,
        email: datos.email,
        contrasena: datos.contrasena,
        rol: datos.rol,
        sectorId,
        sectoresEncargadoIds,
      });
    }
    onCerrar();
  }

  return (
    <Modal titulo={usuario ? "Editar usuario" : "Nuevo usuario"} abierto onCerrar={onCerrar}>
      {sectores.isLoading ? <Cargando etiqueta="Cargando..." /> : null}
      {sectores.isError ? <EstadoError error={sectores.error} /> : null}
      {sectores.data ? (
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
              {sectores.data.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
              ))}
            </Select>
          </div>
          {rolSeleccionado === "ENCARGADO" ? (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-medium text-gray-700">
                Sectores que puede aprobar
              </legend>
              <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                {sectores.data.map((sector) => (
                  <label key={sector.id} className="flex items-center gap-2 text-sm text-gray-900">
                    <input
                      type="checkbox"
                      value={sector.id}
                      className="accent-seg-rojo"
                      {...register("sectoresEncargadoIds")}
                    />
                    {sector.nombre}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <Boton type="submit" disabled={isSubmitting} className="self-start">
            {usuario ? "Guardar cambios" : "Crear usuario"}
          </Boton>
        </form>
      ) : null}
    </Modal>
  );
}
