"use client";

import { useForm } from "react-hook-form";
import { Boton } from "@/components/ui/Boton";
import { TextArea } from "@/components/ui/TextArea";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useAuth } from "@/lib/auth/contexto";
import { useMapaUsuarios } from "@/lib/usuarios/hooks";
import { useComentarios, useCrearComentario } from "@/lib/comentarios/hooks";

interface DatosFormulario {
  texto: string;
}

export function HiloComentarios({ ordenCompraId }: { ordenCompraId: string }) {
  const { usuario } = useAuth();
  const comentarios = useComentarios(ordenCompraId);
  const crearComentario = useCrearComentario(ordenCompraId);
  const mapaUsuarios = useMapaUsuarios();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormulario>();

  async function alEnviar(datos: DatosFormulario) {
    await crearComentario.mutateAsync({ texto: datos.texto });
    reset();
  }

  function nombreAutor(autorId: string): string {
    if (autorId === usuario?.id) return "Vos";
    return mapaUsuarios.get(autorId)?.nombre ?? "—";
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-400">
        Comentar puede cambiar el estado automáticamente: si un encargado del sector comenta una
        orden pendiente, pasa a &quot;En consulta&quot;; si el solicitante responde, vuelve a
        &quot;Pendiente&quot;.
      </p>

      {comentarios.isLoading ? <Cargando etiqueta="Cargando comentarios..." /> : null}
      {comentarios.isError ? <EstadoError error={comentarios.error} /> : null}
      {comentarios.data && comentarios.data.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay comentarios" />
      ) : null}

      <div className="flex flex-col gap-3">
        {comentarios.data?.map((comentario) => (
          <div key={comentario.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">{nombreAutor(comentario.autorId)}</p>
              <p className="text-xs text-gray-400">
                {new Date(comentario.creadoEn).toLocaleString("es-UY")}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-700">{comentario.texto}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(alEnviar)} className="flex flex-col gap-3">
        {crearComentario.error ? <EstadoError error={crearComentario.error} /> : null}
        <TextArea
          etiqueta="Nuevo comentario"
          error={errors.texto?.message}
          {...register("texto", { required: "Requerido" })}
        />
        <Boton type="submit" disabled={isSubmitting} tamanio="sm" className="self-start">
          Comentar
        </Boton>
      </form>
    </div>
  );
}
