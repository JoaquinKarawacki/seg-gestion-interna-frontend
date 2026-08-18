"use client";

import { useAuth } from "@/lib/auth/contexto";

export default function PaginaDashboard() {
  const { usuario } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Hola, {usuario?.nombre}</h1>
        <div className="mt-2 h-1 w-16 rounded bg-seg-rojo" />
      </div>
      <p className="text-gray-600">
        Panel de gestión interna de SEG Ingeniería. El resumen por rol (borradores propios,
        pendientes de aprobación, órdenes para pagar) se construye en una fase posterior.
      </p>
    </div>
  );
}
