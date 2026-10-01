"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormularioOrdenCompra } from "@/components/ordenes-compra/FormularioOrdenCompra";
import { useSolicitudCompra } from "@/lib/solicitudes-compra/hooks";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";

// Lee ?solicitudId= para el flujo Fase 2 "crear Orden de Pago desde una Orden de
// Compra aprobada". Sin el parámetro es el alta clásica de OP.
function ContenidoNuevaOrdenCompra() {
  const parametros = useSearchParams();
  const solicitudId = parametros.get("solicitudId") ?? undefined;
  const solicitud = useSolicitudCompra(solicitudId);

  if (solicitudId) {
    if (solicitud.isLoading) return <Cargando etiqueta="Cargando orden de compra..." />;
    if (solicitud.isError) return <EstadoError error={solicitud.error} />;
  }

  return <FormularioOrdenCompra ordenExistente={null} solicitudOrigen={solicitud.data ?? null} />;
}

export default function PaginaNuevaOrdenCompra() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href="/ordenes-compra" className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Órdenes de Pago
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Nueva orden de pago</h1>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Suspense fallback={<Cargando etiqueta="Cargando formulario..." />}>
          <ContenidoNuevaOrdenCompra />
        </Suspense>
      </div>
    </div>
  );
}
