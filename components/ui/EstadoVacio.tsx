import type { ReactNode } from "react";

interface PropsEstadoVacio {
  titulo: string;
  descripcion?: string;
  icono?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, icono }: PropsEstadoVacio) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
      {icono}
      <p className="font-semibold text-gray-700">{titulo}</p>
      {descripcion ? <p className="max-w-sm text-sm">{descripcion}</p> : null}
    </div>
  );
}
