import { jwtDecode } from "jwt-decode";
import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa } from "@/lib/tipos/respuesta-api";
import type { CredencialesLogin, PayloadJwt, RolUsuario, SesionIniciada } from "./tipos";

interface UsuarioSinSector {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

interface DatosLogin {
  token: string;
  usuario: UsuarioSinSector;
}

export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<SesionIniciada> {
  const respuesta = await peticion<RespuestaExitosa<DatosLogin>>("/auth/login", {
    metodo: "POST",
    cuerpo: credenciales,
    conAuth: false,
  });

  // El login no devuelve sectorId, pero el JWT sí lo lleva — se necesita para
  // mostrar/ocultar acciones de aprobación por sector en la UI.
  const payload = jwtDecode<PayloadJwt>(respuesta.datos.token);

  return {
    token: respuesta.datos.token,
    usuario: { ...respuesta.datos.usuario, sectorId: payload.sectorId },
  };
}
