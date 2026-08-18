"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/contexto";
import { IconoCerrar, IconoMenu, IconoSalir } from "@/components/ui/Iconos";
import type { RolUsuario } from "@/lib/auth/tipos";
import logoSeg from "@/public/seg ingenieria logo.png";

interface ItemNav {
  href: string;
  etiqueta: string;
  roles?: RolUsuario[];
}

const ITEMS_NAV: ItemNav[] = [
  { href: "/dashboard", etiqueta: "Inicio" },
  { href: "/ordenes-compra", etiqueta: "Órdenes de Compra" },
  { href: "/proyectos", etiqueta: "Proyectos" },
  { href: "/clientes", etiqueta: "Clientes" },
  { href: "/proveedores", etiqueta: "Proveedores" },
  { href: "/sectores", etiqueta: "Sectores", roles: ["ADMIN"] },
  { href: "/usuarios", etiqueta: "Usuarios", roles: ["ADMIN"] },
  { href: "/auditoria", etiqueta: "Auditoría", roles: ["ADMIN"] },
];

export function EncabezadoApp() {
  const { usuario, cerrarSesion } = useAuth();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const itemsVisibles = ITEMS_NAV.filter(
    (item) => !item.roles || (usuario && item.roles.includes(usuario.rol)),
  );

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-seg-rojo py-2 text-center text-xs text-white sm:text-sm">
        SEG Ingeniería — Gestión Interna
      </div>
      <div className="bg-black">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4">
          <Link href="/dashboard" className="flex items-center">
            <Image src={logoSeg} alt="SEG Ingeniería" className="h-10 w-auto" priority />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {itemsVisibles.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-seg-rojo"
                    : "text-gray-300 hover:text-white",
                )}
              >
                {item.etiqueta}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/mi-cuenta"
              className="hidden text-sm text-gray-300 transition-colors hover:text-white sm:inline"
            >
              {usuario?.nombre}
            </Link>
            <button
              type="button"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
              className="text-gray-300 transition-colors hover:text-seg-rojo"
            >
              <IconoSalir className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              className="text-gray-300 transition-colors hover:text-white md:hidden"
            >
              {menuAbierto ? <IconoCerrar className="h-5 w-5" /> : <IconoMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuAbierto ? (
          <nav className="flex flex-col border-t border-white/10 py-2 md:hidden">
            {itemsVisibles.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAbierto(false)}
                className={clsx(
                  "px-4 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-seg-rojo"
                    : "text-gray-300 hover:text-white",
                )}
              >
                {item.etiqueta}
              </Link>
            ))}
            <Link
              href="/mi-cuenta"
              onClick={() => setMenuAbierto(false)}
              className="border-t border-white/10 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:text-white"
            >
              {usuario?.nombre}
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
