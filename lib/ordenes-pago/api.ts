import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type {
  ActualizarOrdenPagoDto,
  CrearOrdenPagoDto,
  FiltrosOrdenPago,
  HistorialEstadoOP,
  OrdenPago,
} from "@/lib/ordenes-pago/tipos";

// Devuelve el sobre completo (no solo .datos) porque el listado principal necesita
// `total` para "Cargar más" — mismo criterio que Auditoría, ver esa sección del contexto.
export async function listarOrdenesPago(filtros: FiltrosOrdenPago = {}) {
  const parametros = new URLSearchParams();
  if (filtros.proyectoId) parametros.set("proyectoId", filtros.proyectoId);
  if (filtros.cotizacionId) parametros.set("cotizacionId", filtros.cotizacionId);
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.sectorId) parametros.set("sectorId", filtros.sectorId);
  if (filtros.solicitanteId) parametros.set("solicitanteId", filtros.solicitanteId);
  if (filtros.pagina) parametros.set("pagina", String(filtros.pagina));
  if (filtros.porPagina) parametros.set("porPagina", String(filtros.porPagina));

  const cadena = parametros.toString();
  return peticion<RespuestaLista<OrdenPago>>(`/ordenes-pago${cadena ? `?${cadena}` : ""}`);
}

export async function obtenerOrdenPago(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}`);
  return datos;
}

export async function crearOrdenPago(dto: CrearOrdenPagoDto) {
  const formData = new FormData();
  formData.set("tipo", dto.tipo);
  formData.set("fecha", dto.fecha);
  formData.set("sectorId", dto.sectorId);
  formData.set("proveedorId", dto.proveedorId);
  if (dto.cotizacionId) formData.set("cotizacionId", dto.cotizacionId);
  if (dto.ordenCompraId) formData.set("ordenCompraId", dto.ordenCompraId);
  formData.set("moneda", dto.moneda);
  formData.set("monto", String(dto.monto));
  formData.set("concepto", dto.concepto);
  formData.set("formaPago", dto.formaPago);
  formData.set("pagaIva", String(dto.pagaIva));
  formData.set("ivaIncluido", String(dto.ivaIncluido));
  if (dto.observaciones) formData.set("observaciones", dto.observaciones);
  if (dto.confirmarExcesoMonto) formData.set("confirmarExcesoMonto", "true");
  if (dto.factura) formData.set("factura", dto.factura);

  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>("/ordenes-pago", {
    metodo: "POST",
    formData,
  });
  return datos;
}

export async function actualizarOrdenPago(id: string, dto: ActualizarOrdenPagoDto) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarOrdenPago(id: string) {
  await peticion<void>(`/ordenes-pago/${id}`, { metodo: "DELETE" });
}

export async function adjuntarFacturaOrdenPago(id: string, factura: File) {
  const formData = new FormData();
  formData.set("factura", factura);
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}/factura`, {
    metodo: "PATCH",
    formData,
  });
  return datos;
}

export function descargarFacturaOrdenPago(id: string) {
  return peticionBinaria(`/ordenes-pago/${id}/factura`);
}

export async function enviarOrdenPago(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}/enviar`, {
    metodo: "POST",
  });
  return datos;
}

export async function aprobarOrdenPago(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}/aprobar`, {
    metodo: "POST",
  });
  return datos;
}

export async function rechazarOrdenPago(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}/rechazar`, {
    metodo: "POST",
    cuerpo: { motivo },
  });
  return datos;
}

export async function observarPagoOrdenPago(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(
    `/ordenes-pago/${id}/observar-pago`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function resolverObservacionOrdenPago(id: string, motivo?: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(
    `/ordenes-pago/${id}/resolver-observacion`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function confirmarPagoOrdenPago(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(
    `/ordenes-pago/${id}/confirmar-pago`,
    { metodo: "POST" },
  );
  return datos;
}

export async function anularOrdenPago(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenPago>>(`/ordenes-pago/${id}/anular`, {
    metodo: "POST",
    cuerpo: { motivo },
  });
  return datos;
}

export async function listarHistorialOrdenPago(id: string) {
  const { datos } = await peticion<RespuestaLista<HistorialEstadoOP>>(
    `/ordenes-pago/${id}/historial`,
  );
  return datos;
}
