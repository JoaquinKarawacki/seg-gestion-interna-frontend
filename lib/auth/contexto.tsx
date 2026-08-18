"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  borrarSesion,
  guardarSesion,
  obtenerToken,
  obtenerUsuarioGuardado,
} from "@/lib/auth/almacen-token";
import { registrarManejadorExpiracion } from "@/lib/http/cliente";
import { iniciarSesion as iniciarSesionApi } from "@/lib/auth/api";
import type { CredencialesLogin, PayloadJwt, Usuario } from "@/lib/auth/tipos";

interface ContextoAuth {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<Usuario>;
  cerrarSesion: () => void;
}

interface EstadoSesion {
  usuario: Usuario | null;
  cargando: boolean;
}

const SESION_INICIAL: EstadoSesion = { usuario: null, cargando: true };

const ContextoAutenticacion = createContext<ContextoAuth | null>(null);

function tokenValido(token: string): boolean {
  try {
    const payload = jwtDecode<PayloadJwt>(token);
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<EstadoSesion>(SESION_INICIAL);
  const router = useRouter();

  const cerrarSesion = useCallback(() => {
    borrarSesion();
    setSesion({ usuario: null, cargando: false });
    router.push("/login");
  }, [router]);

  useEffect(() => {
    // localStorage no existe durante el render en el servidor: la sesión solo puede
    // hidratarse acá, después del montaje.
    const tokenGuardado = obtenerToken();
    const usuarioGuardado = obtenerUsuarioGuardado();

    if (tokenGuardado && usuarioGuardado && tokenValido(tokenGuardado)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSesion({ usuario: usuarioGuardado, cargando: false });
    } else {
      if (tokenGuardado) borrarSesion();
      setSesion({ usuario: null, cargando: false });
    }
  }, []);

  useEffect(() => {
    registrarManejadorExpiracion(() => cerrarSesion());
  }, [cerrarSesion]);

  const manejarLogin = useCallback(async (credenciales: CredencialesLogin) => {
    const { token, usuario } = await iniciarSesionApi(credenciales);
    guardarSesion(token, usuario);
    setSesion({ usuario, cargando: false });
    return usuario;
  }, []);

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario: sesion.usuario,
      cargando: sesion.cargando,
      iniciarSesion: manejarLogin,
      cerrarSesion,
    }),
    [sesion, manejarLogin, cerrarSesion],
  );

  return (
    <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>
  );
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de ProveedorAuth");
  }
  return contexto;
}
