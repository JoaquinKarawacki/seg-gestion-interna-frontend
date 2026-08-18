import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface PropsBotonAccionFila extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function BotonAccionFila({ children, className, ...resto }: PropsBotonAccionFila) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500",
        "transition-colors hover:bg-gray-100 hover:text-seg-rojo disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...resto}
    >
      {children}
    </button>
  );
}
