"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormularioOrdenPago } from "@/components/ordenes-pago/FormularioOrdenPago";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useOrdenPago } from "@/lib/ordenes-pago/hooks";
import { puedeEditar } from "@/lib/ordenes-pago/presentacion";
import { useAuth } from "@/lib/auth/contexto";

export default function PaginaEditarOrdenPago() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const orden = useOrdenPago(id);

  if (orden.isLoading) return <Cargando etiqueta="Cargando orden de pago..." />;
  if (orden.isError) return <EstadoError error={orden.error} />;
  if (!orden.data || !usuario) return null;

  if (!puedeEditar(orden.data, usuario)) {
    return (
      <EstadoVacio
        titulo="No podés editar esta orden de pago"
        descripcion="Solo se puede editar mientras está en borrador, y solo el solicitante, alguien del mismo sector o un administrador."
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href={`/ordenes-pago/${id}`} className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Orden de pago #{orden.data.numero}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Editar orden de pago</h1>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <FormularioOrdenPago ordenExistente={orden.data} />
      </div>
    </div>
  );
}
