import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { CrearPropuestaInversionDto, PropuestaInversion } from "@/lib/propuestas-inversion/tipos";

export async function listarPropuestasDeProyecto(proyectoId: string) {
  const { datos } = await peticion<RespuestaLista<PropuestaInversion>>(
    `/proyectos/${proyectoId}/propuestas-inversion`,
  );
  return datos;
}

export async function obtenerPropuestaInversion(id: string) {
  const { datos } = await peticion<RespuestaExitosa<PropuestaInversion>>(
    `/propuestas-inversion/${id}`,
  );
  return datos;
}

export async function crearPropuestaInversion(dto: CrearPropuestaInversionDto) {
  const formData = new FormData();
  formData.set("proyectoId", dto.proyectoId);
  formData.set("costoTotalAproximado", String(dto.costoTotalAproximado));
  formData.set("ahorroMensual", String(dto.ahorroMensual));
  formData.set("cantidadMeses", String(dto.cantidadMeses));
  formData.set("porcentajeSeg", String(dto.porcentajeSeg));
  formData.set("moneda", dto.moneda);
  if (dto.archivo) formData.set("archivo", dto.archivo);

  const { datos } = await peticion<RespuestaExitosa<PropuestaInversion>>("/propuestas-inversion", {
    metodo: "POST",
    formData,
  });
  return datos;
}

export function descargarArchivoPropuestaInversion(id: string) {
  return peticionBinaria(`/propuestas-inversion/${id}/archivo`);
}
