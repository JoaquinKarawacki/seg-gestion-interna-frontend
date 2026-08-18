import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { ActualizarTareaDto, CrearTareaDto, Tarea } from "@/lib/tareas/tipos";

export async function listarTareasDeProyecto(proyectoId: string) {
  const { datos } = await peticion<RespuestaLista<Tarea>>(`/proyectos/${proyectoId}/tareas`);
  return datos;
}

export async function crearTarea(dto: CrearTareaDto) {
  const { datos } = await peticion<RespuestaExitosa<Tarea>>("/tareas", {
    metodo: "POST",
    cuerpo: dto,
  });
  return datos;
}

export async function actualizarTarea(id: string, dto: ActualizarTareaDto) {
  const { datos } = await peticion<RespuestaExitosa<Tarea>>(`/tareas/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarTarea(id: string) {
  await peticion<void>(`/tareas/${id}`, { metodo: "DELETE" });
}
