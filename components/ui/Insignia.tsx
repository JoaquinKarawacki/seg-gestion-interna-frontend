import type { ReactNode } from "react";
import clsx from "clsx";

export type TonoInsignia = "gris" | "negro" | "apagado" | "rojo" | "rojo-outline";

const CLASES_TONO: Record<TonoInsignia, string> = {
  gris: "bg-gray-100 text-gray-700",
  negro: "bg-gray-900 text-white",
  apagado: "bg-gray-100 text-gray-400",
  rojo: "bg-seg-rojo text-white",
  "rojo-outline": "border border-seg-rojo text-seg-rojo bg-white",
};

interface PropsInsignia {
  tono: TonoInsignia;
  icono?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Insignia({ tono, icono, children, className }: PropsInsignia) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        CLASES_TONO[tono],
        className,
      )}
    >
      {icono}
      {children}
    </span>
  );
}
