"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormularioOrdenCompra } from "@/components/ordenes-compra/FormularioOrdenCompra";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useOrdenCompra } from "@/lib/ordenes-compra/hooks";
import { puedeEditar } from "@/lib/ordenes-compra/presentacion";
import { useAuth } from "@/lib/auth/contexto";

export default function PaginaEditarOrdenCompra() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const orden = useOrdenCompra(id);

  if (orden.isLoading) return <Cargando etiqueta="Cargando orden de compra..." />;
  if (orden.isError) return <EstadoError error={orden.error} />;
  if (!orden.data || !usuario) return null;

  if (!puedeEditar(orden.data, usuario)) {
    return (
      <EstadoVacio
        titulo="No podés editar esta orden de compra"
        descripcion="Solo se puede editar mientras está en borrador, y solo el solicitante, alguien del mismo sector o un administrador."
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href={`/ordenes-compra/${id}`} className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Orden de compra #{orden.data.numero}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Editar orden de compra</h1>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <FormularioOrdenCompra ordenExistente={orden.data} />
      </div>
    </div>
  );
}
