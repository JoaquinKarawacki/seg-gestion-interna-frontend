import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { ActualizarSectorDto, CrearSectorDto, Sector } from "@/lib/sectores/tipos";

export async function listarSectores() {
  const { datos } = await peticion<RespuestaLista<Sector>>("/sectores");
  return datos;
}

export async function crearSector(dto: CrearSectorDto) {
  const { datos } = await peticion<RespuestaExitosa<Sector>>("/sectores", {
    metodo: "POST",
    cuerpo: dto,
  });
  return datos;
}

export async function actualizarSector(id: string, dto: ActualizarSectorDto) {
  const { datos } = await peticion<RespuestaExitosa<Sector>>(`/sectores/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarSector(id: string) {
  await peticion<void>(`/sectores/${id}`, { metodo: "DELETE" });
}
