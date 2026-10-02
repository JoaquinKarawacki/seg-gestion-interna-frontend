import { peticion, peticionBinaria } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type {
  CrearOrdenCompraDto,
  FiltrosOrdenCompra,
  HistorialOrdenCompra,
  OrdenCompra,
} from "@/lib/ordenes-compra/tipos";

export async function listarOrdenesCompra(filtros: FiltrosOrdenCompra = {}) {
  const parametros = new URLSearchParams();
  if (filtros.proyectoId) parametros.set("proyectoId", filtros.proyectoId);
  if (filtros.estado) parametros.set("estado", filtros.estado);
  if (filtros.sectorId) parametros.set("sectorId", filtros.sectorId);
  if (filtros.solicitanteId) parametros.set("solicitanteId", filtros.solicitanteId);
  if (filtros.pagina) parametros.set("pagina", String(filtros.pagina));
  if (filtros.porPagina) parametros.set("porPagina", String(filtros.porPagina));

  const cadena = parametros.toString();
  return peticion<RespuestaLista<OrdenCompra>>(
    `/ordenes-compra${cadena ? `?${cadena}` : ""}`,
  );
}

export async function obtenerOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(`/ordenes-compra/${id}`);
  return datos;
}

export async function crearOrdenCompra(dto: CrearOrdenCompraDto) {
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

  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>("/ordenes-compra", {
    metodo: "POST",
    formData,
  });
  return datos;
}

export async function eliminarOrdenCompra(id: string) {
  await peticion<void>(`/ordenes-compra/${id}`, { metodo: "DELETE" });
}

export function descargarAdjuntoOrdenCompra(id: string) {
  return peticionBinaria(`/ordenes-compra/${id}/adjunto`);
}

export async function enviarOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/enviar`,
    { metodo: "POST" },
  );
  return datos;
}

export async function aprobarOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/aprobar`,
    { metodo: "POST" },
  );
  return datos;
}

export async function rechazarOrdenCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/rechazar`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function anularOrdenCompra(id: string, motivo: string) {
  const { datos } = await peticion<RespuestaExitosa<OrdenCompra>>(
    `/ordenes-compra/${id}/anular`,
    { metodo: "POST", cuerpo: { motivo } },
  );
  return datos;
}

export async function listarHistorialOrdenCompra(id: string) {
  const { datos } = await peticion<RespuestaLista<HistorialOrdenCompra>>(
    `/ordenes-compra/${id}/historial`,
  );
  return datos;
}
