import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { Comentario, CrearComentarioDto } from "@/lib/comentarios/tipos";

export async function listarComentarios(ordenCompraId: string) {
  const { datos } = await peticion<RespuestaLista<Comentario>>(
    `/ordenes-compra/${ordenCompraId}/comentarios`,
  );
  return datos;
}

export async function crearComentario(ordenCompraId: string, dto: CrearComentarioDto) {
  const { datos } = await peticion<RespuestaExitosa<Comentario>>(
    `/ordenes-compra/${ordenCompraId}/comentarios`,
    { metodo: "POST", cuerpo: dto },
  );
  return datos;
}
