import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { ActualizarProyectoDto, CrearProyectoDto, Proyecto } from "@/lib/proyectos/tipos";

export async function listarProyectos() {
  const { datos } = await peticion<RespuestaLista<Proyecto>>("/proyectos");
  return datos;
}

export async function obtenerProyecto(id: string) {
  const { datos } = await peticion<RespuestaExitosa<Proyecto>>(`/proyectos/${id}`);
  return datos;
}

export async function crearProyecto(dto: CrearProyectoDto) {
  const { datos } = await peticion<RespuestaExitosa<Proyecto>>("/proyectos", {
    metodo: "POST",
    cuerpo: dto,
  });
  return datos;
}

export async function actualizarProyecto(id: string, dto: ActualizarProyectoDto) {
  const { datos } = await peticion<RespuestaExitosa<Proyecto>>(`/proyectos/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarProyecto(id: string) {
  await peticion<void>(`/proyectos/${id}`, { metodo: "DELETE" });
}

export async function recalcularCostoSegProyecto(id: string) {
  const { datos } = await peticion<RespuestaExitosa<Proyecto>>(
    `/proyectos/${id}/recalcular-costo-seg`,
    { metodo: "POST" },
  );
  return datos;
}
