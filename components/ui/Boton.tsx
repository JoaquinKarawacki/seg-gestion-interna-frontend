import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type VarianteBoton = "rojo" | "outline" | "outline-blanco";
export type TamanioBoton = "sm" | "normal" | "lg";

const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  rojo: "bg-seg-rojo text-white hover:bg-seg-rojo-oscuro",
  outline: "border-2 border-seg-rojo text-seg-rojo hover:bg-seg-rojo hover:text-white",
  "outline-blanco": "border-2 border-white text-white hover:bg-white hover:text-seg-rojo",
};

const CLASES_TAMANIO: Record<TamanioBoton, string> = {
  sm: "px-6 py-2 text-sm",
  normal: "px-8 py-2.5 text-sm",
  lg: "px-10 py-3 text-base",
};

const CLASES_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

interface PropsComunes {
  variante?: VarianteBoton;
  tamanio?: TamanioBoton;
  className?: string;
}

interface PropsBoton extends PropsComunes, ButtonHTMLAttributes<HTMLButtonElement> {}

export function Boton({
  variante = "rojo",
  tamanio = "normal",
  children,
  className,
  ...resto
}: PropsBoton) {
  return (
    <button
      className={clsx(CLASES_BASE, CLASES_VARIANTE[variante], CLASES_TAMANIO[tamanio], className)}
      {...resto}
    >
      {children}
    </button>
  );
}

interface PropsBotonLink extends PropsComunes {
  href: string;
  children: ReactNode;
}

export function BotonLink({
  variante = "rojo",
  tamanio = "normal",
  children,
  className,
  href,
}: PropsBotonLink) {
  return (
    <Link
      href={href}
      className={clsx(CLASES_BASE, CLASES_VARIANTE[variante], CLASES_TAMANIO[tamanio], className)}
    >
      {children}
    </Link>
  );
}
