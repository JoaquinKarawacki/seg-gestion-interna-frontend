import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type {
  CrearSolicitudCompraDto,
  FiltrosSolicitudCompra,
  HistorialSolicitudCompra,
  SolicitudCompra,
} from "@/lib/solicitudes-compra/tipos";

export async function listarSolicitudesCompra(filtros: FiltrosSolicitudCompra = {}) {
  const parametros = new URLSearchParams();
  if (filtros.proyectoId) parametros.set("proyectoId", filtros.proyectoId);
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.sectorId) parametros.set("sectorId", filtros.sectorId);
  if (filtros.solicitanteId) parametros.set("solicitanteId", filtros.solicitanteId);
  if (filtros.pagina) parametros.set("pagina", String(filtros.pagina));
  if (filtros.porPagina) parametros.set("porPagina", String(filtros.porPagina));

  const cadena = parametros.toString();
  return peticion<RespuestaLista<SolicitudCompra>>(
    `/solicitudes-compra${cadena ? `?${cadena}` : ""}`,
  );
}

export async function obtenerSolicitudCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<SolicitudCompra>>(`/solicitudes-compra/${id}`);
  return datos;
}

export async function crearSolicitudCompra(dto: CrearSolicitudCompraDto) {
  const formData = new FormData();
  formData.set("tipo", dto.tipo);
  formData.set("sectorId", dto.sectorId);
  formData.set("proveedorId", dto.proveedorId);
  formData.set("proyectoId", dto.proyectoId);
  if (dto.rubroId) formData.set("rubroId", dto.rubroId);
  if (dto.rubroNombre) formData.set("rubroNombre", dto.rubroNombre);
  formData.set("moneda", dto.moneda);
  formData.set("monto", String(dto.monto));
  formData.set("concepto", dto.concepto);
  formData.set("pagaIva", String(dto.pagaIva));
  formData.set("ivaIncluido", String(dto.ivaIncluido));
  if (dto.observaciones) formData.set("observaciones", dto.observaciones);
  if (dto.esPagoUnico) formData.set("esPagoUnico", "true");
  if (dto.pagoUnicoFormaPago) formData.set("pagoUnicoFormaPago", dto.pagoUnicoFormaPago);
  if (dto.adjunto) formData.set("adjunto", dto.adjunto);

  const { datos } = await peticion<RespuestaExitosa<SolicitudCompra>>("/solicitudes-compra", {
    metodo: "POST",
    formData,
  });
  return datos;
}

export async function eliminarSolicitudCompra(id: string) {
  await peticion<void>(`/solicitudes-compra/${id}`, { metodo: "DELETE" });
}

export function descargarAdjuntoSolicitudCompra(id: string) {
  return peticionBinaria(`/solicitudes-compra/${id}/adjunto`);
}

export async function enviarSolicitudCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<SolicitudCompra>>(
    `/solicitudes-compra/${id}/enviar`,
    { metodo: "POST" },
  );
  return datos;
}

export async function aprobarSolicitudCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<SolicitudCompra>>(
    `/solicitudes-compra/${id}/aprobar`,
    { metodo: "POST" },
  );
  return datos;
}

export async function rechazarSolicitudCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<SolicitudCompra>>(
    `/solicitudes-compra/${id}/rechazar`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function anularSolicitudCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<SolicitudCompra>>(
    `/solicitudes-compra/${id}/anular`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function listarHistorialSolicitudCompra(id: string) {
  const { datos } = await peticion<RespuestaLista<HistorialSolicitudCompra>>(
    `/solicitudes-compra/${id}/historial`,
  );
  return datos;
}
