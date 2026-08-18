"use client";

import Link from "next/link";
import { FormularioOrdenCompra } from "@/components/ordenes-compra/FormularioOrdenCompra";

export default function PaginaNuevaOrdenCompra() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div>
        <Link href="/ordenes-compra" className="text-sm text-gray-500 hover:text-seg-rojo">
          ← Órdenes de Compra
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Nueva orden de compra</h1>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <FormularioOrdenCompra ordenExistente={null} />
      </div>
    </div>
  );
}
