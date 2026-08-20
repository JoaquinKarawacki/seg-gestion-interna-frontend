import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { Cotizacion, CrearCotizacionDto } from "@/lib/cotizaciones/tipos";

export async function listarCotizacionesDeProyecto(proyectoId: string) {
  const { datos } = await peticion<RespuestaLista<Cotizacion>>(
    `/proyectos/${proyectoId}/cotizaciones`,
  );
  return datos;
}

export async function obtenerCotizacion(id: string) {
  const { datos } = await peticion<RespuestaExitosa<Cotizacion>>(`/cotizaciones/${id}`);
  return datos;
}

export async function crearCotizacion(dto: CrearCotizacionDto) {
  const formData = new FormData();
  formData.set("proyectoId", dto.proyectoId);
  formData.set("tareaId", dto.tareaId);
  formData.set("proveedorId", dto.proveedorId);
  formData.set("montoTotal", String(dto.montoTotal));
  formData.set("moneda", dto.moneda);
  if (dto.archivo) formData.set("archivo", dto.archivo);

  const { datos } = await peticion<RespuestaExitosa<Cotizacion>>("/cotizaciones", {
    metodo: "POST",
    formData,
  });
  return datos;
}

export function descargarArchivoCotizacion(id: string) {
  return peticionBinaria(`/cotizaciones/${id}/archivo`);
}
