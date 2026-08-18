"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/contexto";
import { useCambiarContrasenaPropia } from "@/lib/usuarios/hooks";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";

interface DatosFormulario {
  contrasenaActual: string;
  contrasenaNueva: string;
  confirmarContrasena: string;
}

export default function PaginaMiCuenta() {
  const { usuario } = useAuth();
  const cambiarContrasena = useCambiarContrasenaPropia();
  const [exito, setExito] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>();

  async function alEnviar(datos: DatosFormulario) {
    setExito(false);
    await cambiarContrasena.mutateAsync({
      contrasenaActual: datos.contrasenaActual,
      contrasenaNueva: datos.contrasenaNueva,
    });
    reset();
    setExito(true);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-sm text-gray-500">
          {usuario?.nombre} · {usuario?.email}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(alEnviar)}
        className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          Cambiar contraseña
        </h2>
        {cambiarContrasena.error ? <EstadoError error={cambiarContrasena.error} /> : null}
        {exito ? (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Contraseña actualizada correctamente.
          </p>
        ) : null}
        <Campo
          etiqueta="Contraseña actual"
          type="password"
          autoComplete="current-password"
          error={errors.contrasenaActual?.message}
          {...register("contrasenaActual", { required: "Requerido" })}
        />
        <Campo
          etiqueta="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          error={errors.contrasenaNueva?.message}
          {...register("contrasenaNueva", {
            required: "Requerido",
            minLength: { value: 8, message: "Mínimo 8 caracteres" },
          })}
        />
        <Campo
          etiqueta="Confirmar contraseña nueva"
          type="password"
          autoComplete="new-password"
          error={errors.confirmarContrasena?.message}
          {...register("confirmarContrasena", {
            required: "Requerido",
            validate: (valor) => valor === getValues("contrasenaNueva") || "Las contraseñas no coinciden",
          })}
        />
        <Boton type="submit" disabled={isSubmitting} className="self-start">
          Actualizar contraseña
        </Boton>
      </form>
    </div>
  );
}
