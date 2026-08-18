import { ErrorApi } from "@/lib/http/cliente";

export function EstadoError({ error }: { error: unknown }) {
  const mensaje = error instanceof ErrorApi ? error.message : "Ocurrió un error inesperado";

  return (
    <div className="rounded-lg border border-seg-rojo/30 bg-seg-rojo/5 px-4 py-3 text-sm text-seg-rojo">
      {mensaje}
    </div>
  );
}
