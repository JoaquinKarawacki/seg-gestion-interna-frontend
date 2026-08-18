import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type {
  ActualizarOrdenCompraDto,
  CrearOrdenCompraDto,
  FiltrosOrdenCompra,
  HistorialEstadoOC,
  OrdenCompra,
} from "@/lib/ordenes-compra/tipos";

// Devuelve el sobre completo (no solo .datos) porque el listado principal necesita
// `total` para "Cargar más" — mismo criterio que Auditoría, ver esa sección del contexto.
export async function listarOrdenesCompra(filtros: FiltrosOrdenCompra = {}) {
  const parametros = new URLSearchParams();
  if (filtros.proyectoId) parametros.set("proyectoId", filtros.proyectoId);
  if (filtros.cotizacionId) parametros.set("cotizacionId", filtros.cotizacionId);
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.sectorId) parametros.set("sectorId", filtros.sectorId);
  if (filtros.solicitanteId) parametros.set("solicitanteId", filtros.solicitanteId);
  if (filtros.pagina) parametros.set("pagina", String(filtros.pagina));
  if (filtros.porPagina) parametros.set("porPagina", String(filtros.porPagina));

  const cadena = parametros.toString();
  return peticion<RespuestaLista<OrdenCompra>>(`/ordenes-compra${cadena ? `?${cadena}` : ""}`);
}

export async function obtenerOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}`);
  return datos;
}

export async function crearOrdenCompra(dto: CrearOrdenCompraDto) {
  const formData = new FormData();
  formData.set("tipo", dto.tipo);
  formData.set("fecha", dto.fecha);
  formData.set("sectorId", dto.sectorId);
  formData.set("proveedorId", dto.proveedorId);
  if (dto.cotizacionId) formData.set("cotizacionId", dto.cotizacionId);
  formData.set("moneda", dto.moneda);
  formData.set("monto", String(dto.monto));
  formData.set("concepto", dto.concepto);
  formData.set("formaPago", dto.formaPago);
  formData.set("pagaIva", String(dto.pagaIva));
  formData.set("ivaIncluido", String(dto.ivaIncluido));
  if (dto.observaciones) formData.set("observaciones", dto.observaciones);
  if (dto.factura) formData.set("factura", dto.factura);

  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>("/ordenes-compra", {
    metodo: "POST",
    formData,
  });
  return datos;
}

export async function actualizarOrdenCompra(id: string, dto: ActualizarOrdenCompraDto) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarOrdenCompra(id: string) {
  await peticion<void>(`/ordenes-compra/${id}`, { metodo: "DELETE" });
}

export async function adjuntarFacturaOrdenCompra(id: string, factura: File) {
  const formData = new FormData();
  formData.set("factura", factura);
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}/factura`, {
    metodo: "PATCH",
    formData,
  });
  return datos;
}

export function descargarFacturaOrdenCompra(id: string) {
  return peticionBinaria(`/ordenes-compra/${id}/factura`);
}

export async function enviarOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}/enviar`, {
    metodo: "POST",
  });
  return datos;
}

export async function aprobarOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}/aprobar`, {
    metodo: "POST",
  });
  return datos;
}

export async function rechazarOrdenCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}/rechazar`, {
    metodo: "POST",
    cuerpo: { motivo },
  });
  return datos;
}

export async function observarPagoOrdenCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/observar-pago`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function resolverObservacionOrdenCompra(id: string, motivo?: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/resolver-observacion`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function confirmarPagoOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/confirmar-pago`,
    { metodo: "POST" },
  );
  return datos;
}

export async function anularOrdenCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}/anular`, {
    metodo: "POST",
    cuerpo: { motivo },
  });
  return datos;
}

export async function listarHistorialOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaLista<HistorialEstadoOC>>(
    `/ordenes-compra/${id}/historial`,
  );
  return datos;
}
