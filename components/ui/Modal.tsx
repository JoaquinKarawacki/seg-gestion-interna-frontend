"use client";

import type { ReactNode } from "react";
import { IconoCerrar } from "@/components/ui/Iconos";

interface PropsModal {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}

export function Modal({ abierto, onCerrar, titulo, children }: PropsModal) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-seg-rojo transition-colors"
          >
            <IconoCerrar className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
