"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/contexto";
import { Cargando } from "@/components/ui/Cargando";

export function RequiereSesion({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace("/login");
    }
  }, [cargando, usuario, router]);

  if (cargando || !usuario) {
    return <Cargando etiqueta="Verificando sesión..." />;
  }

  return <>{children}</>;
}
