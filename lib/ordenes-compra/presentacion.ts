import type { TonoInsignia } from "@/components/ui/Insignia";
import type { Usuario } from "@/lib/auth/tipos";
import type { Cotizacion } from "@/lib/cotizaciones/tipos";
import type { EstadoOC, FormaPago, OrdenCompra, TipoOC } from "@/lib/ordenes-compra/tipos";

export const ETIQUETAS_TIPO_OC: Record<TipoOC, string> = {
  ARTICULO: "Artículo",
  SERVICIO: "Servicio",
};

export const ETIQUETAS_FORMA_PAGO: Record<FormaPago, string> = {
  CONTADO_CONTRA_ENTREGA: "Contado contra entrega",
  TARJETA_CREDITO: "Tarjeta de crédito",
  DIFERIDO: "Diferido",
  GIRO_RED_COBRANZA: "Giro / red de cobranza",
  TRANSFERENCIA_BANCARIA: "Transferencia bancaria",
};

export const ETIQUETAS_ESTADO_OC: Record<EstadoOC, string> = {
  BORRADOR: "Borrador",
  PENDIENTE: "Pendiente",
  EN_CONSULTA: "En consulta",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  PAGO_OBSERVADO: "Pago observado",
  PAGADO: "Pagado",
  ANULADO: "Anulado",
};

export const TONO_ESTADO_OC: Record<EstadoOC, TonoInsignia> = {
  BORRADOR: "gris",
  PENDIENTE: "rojo-outline",
  EN_CONSULTA: "apagado",
  APROBADO: "negro",
  RECHAZADO: "rojo",
  PAGO_OBSERVADO: "rojo-outline",
  PAGADO: "negro",
  ANULADO: "apagado",
};

// Reglas de permiso centralizadas — reflejan la máquina de estados y los roles
// exactos que exige el backend. "Enviar" es más restrictivo en el front que en el
// backend a propósito (el backend no chequea pertenencia ahí, decisión tomada con
// el usuario de igualar el criterio de editar/eliminar).

function esDeLaOrden(orden: OrdenCompra, usuario: Usuario): boolean {
  return (
    usuario.id === orden.solicitanteId ||
    usuario.sectorId === orden.sectorId ||
    usuario.rol === "ADMIN"
  );
}

export function puedeEditar(orden: OrdenCompra, usuario: Usuario): boolean {
  return orden.estado === "BORRADOR" && esDeLaOrden(orden, usuario);
}

export const puedeEliminar = puedeEditar;

// Uruguay es UTC-3: toISOString() corre a UTC y adelanta el día entre las
// 21:00 y las 23:59 hora local. Se arma el string a mano con los getters
// locales de Date, nunca pasando por UTC.
export function obtenerFechaLocalDeHoy(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function puedeEnviar(orden: OrdenCompra, usuario: Usuario): boolean {
  return orden.estado === "BORRADOR" && esDeLaOrden(orden, usuario);
}

export function puedeAprobarORechazar(orden: OrdenCompra, usuario: Usuario): boolean {
  return orden.estado === "PENDIENTE" && usuario.rol === "ENCARGADO" && usuario.sectorId === orden.sectorId;
}

export function puedeObservarPago(orden: OrdenCompra, usuario: Usuario): boolean {
  return orden.estado === "APROBADO" && usuario.rol === "PAGOS";
}

export function puedeConfirmarPago(orden: OrdenCompra, usuario: Usuario): boolean {
  return orden.estado === "APROBADO" && usuario.rol === "PAGOS";
}

export function puedeResolverObservacion(orden: OrdenCompra, usuario: Usuario): boolean {
  return orden.estado === "PAGO_OBSERVADO" && usuario.rol === "PAGOS";
}

const ESTADOS_ANULABLES: EstadoOC[] = ["BORRADOR", "PENDIENTE", "EN_CONSULTA", "APROBADO", "PAGO_OBSERVADO"];

export function puedeAnular(orden: OrdenCompra, usuario: Usuario): boolean {
  if (!ESTADOS_ANULABLES.includes(orden.estado)) return false;
  if (usuario.rol === "ADMIN") return true;
  if (usuario.rol === "ENCARGADO") return usuario.sectorId === orden.sectorId;
  return false;
}

export function calcularSaldoDisponible(cotizacion: Cotizacion, ordenes: OrdenCompra[]): number {
  const comprometido = ordenes
    .filter((orden) => orden.cotizacionId === cotizacion.id && orden.estado !== "ANULADO")
    .reduce((acc, orden) => acc + Number(orden.monto), 0);
  return Number(cotizacion.montoTotal) - comprometido;
}
