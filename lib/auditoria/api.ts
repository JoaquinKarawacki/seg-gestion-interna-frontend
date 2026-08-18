import { peticion } from "@/lib/http/cliente";
import type { RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { FiltrosAuditoria, RegistroAuditoria } from "@/lib/auditoria/tipos";

// A diferencia de los demás listados (que no paginan de verdad y descartan el
// sobre), Auditoría sí pagina en el backend — se devuelve el sobre completo
// porque el front necesita `total` para saber si hay más páginas para "Cargar más".
export async function listarAuditoria(filtros: FiltrosAuditoria) {
  const parametros = new URLSearchParams();
  if (filtros.accion) parametros.set("accion", filtros.accion);
  if (filtros.entidad) parametros.set("entidad", filtros.entidad);
  if (filtros.usuarioEmail) parametros.set("usuarioEmail", filtros.usuarioEmail);
  if (filtros.pagina) parametros.set("pagina", String(filtros.pagina));
  if (filtros.porPagina) parametros.set("porPagina", String(filtros.porPagina));

  const cadena = parametros.toString();
  return peticion<RespuestaLista<RegistroAuditoria>>(`/auditoria${cadena ? `?${cadena}` : ""}`);
}
