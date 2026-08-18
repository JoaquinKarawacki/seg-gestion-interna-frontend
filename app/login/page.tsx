"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/contexto";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { EstadoError } from "@/components/ui/EstadoError";
import type { CredencialesLogin } from "@/lib/auth/tipos";
import logoSeg from "@/public/seg ingenieria logo.png";

export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const router = useRouter();
  const [errorLogin, setErrorLogin] = useState<unknown>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CredencialesLogin>();

  async function alEnviar(datos: CredencialesLogin) {
    setErrorLogin(null);
    try {
      await iniciarSesion(datos);
      router.push("/dashboard");
    } catch (error) {
      setErrorLogin(error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src={logoSeg}
            alt="SEG Ingeniería"
            className="mx-auto mb-4 h-20 w-auto"
            priority
          />
          <h1 className="text-3xl font-bold text-gray-900">Gestión Interna</h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded bg-seg-rojo" />
        </div>

        <form
          onSubmit={handleSubmit(alEnviar)}
          className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          <Campo
            etiqueta="Email"
            type="email"
            autoComplete="email"
            {...register("email", { required: true })}
          />
          <Campo
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            {...register("contrasena", { required: true })}
          />
          {errorLogin ? <EstadoError error={errorLogin} /> : null}
          <Boton type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Boton>
        </form>
      </div>
    </div>
  );
}
