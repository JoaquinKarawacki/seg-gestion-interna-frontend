"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/contexto";
import type { RolUsuario } from "@/lib/auth/tipos";
import { EstadoVacio } from "@/components/ui/EstadoVacio";

export function RequiereRol({ roles, children }: { roles: RolUsuario[]; children: ReactNode }) {
  const { usuario } = useAuth();

  if (!usuario || !roles.includes(usuario.rol)) {
    return (
      <EstadoVacio
        titulo="No tenés permiso para ver esta sección"
        descripcion="Si creés que esto es un error, consultá con un administrador."
      />
    );
  }

  return <>{children}</>;
}
