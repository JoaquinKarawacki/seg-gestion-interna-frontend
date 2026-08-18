import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type {
  ActualizarUsuarioDto,
  CambiarContrasenaPropiaDto,
  CrearUsuarioDto,
  Usuario,
} from "@/lib/usuarios/tipos";

export async function listarUsuarios() {
  const { datos } = await peticion<RespuestaLista<Usuario>>("/usuarios");
  return datos;
}

export async function crearUsuario(dto: CrearUsuarioDto) {
  const { datos } = await peticion<RespuestaExitosa<Usuario>>("/usuarios", {
    metodo: "POST",
    cuerpo: dto,
  });
  return datos;
}

export async function actualizarUsuario(id: string, dto: ActualizarUsuarioDto) {
  const { datos } = await peticion<RespuestaExitosa<Usuario>>(`/usuarios/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function darDeBajaUsuario(id: string) {
  await peticion<void>(`/usuarios/${id}`, { metodo: "DELETE" });
}

export async function cambiarContrasenaPropia(dto: CambiarContrasenaPropiaDto) {
  await peticion<RespuestaExitosa<null>>("/usuarios/mi-contrasena", {
    metodo: "PATCH",
    cuerpo: dto,
  });
}
