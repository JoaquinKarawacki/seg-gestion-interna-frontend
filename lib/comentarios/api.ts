import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { Comentario, CrearComentarioDto } from "@/lib/comentarios/tipos";

export async function listarComentarios(ordenPagoId: string) {
  const { datos } = await peticion<RespuestaLista<Comentario>>(
    `/ordenes-pago/${ordenPagoId}/comentarios`,
  );
  return datos;
}

export async function crearComentario(ordenPagoId: string, dto: CrearComentarioDto) {
  const { datos } = await peticion<RespuestaExitosa<Comentario>>(
    `/ordenes-pago/${ordenPagoId}/comentarios`,
    { metodo: "POST", cuerpo: dto },
  );
  return datos;
}
