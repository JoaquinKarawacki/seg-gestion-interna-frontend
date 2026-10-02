import type { TonoInsignia } from "@/components/ui/Insignia";
import type { Usuario } from "@/lib/auth/tipos";
import type {
  EstadoOC,
  OrdenCompra,
  TipoOrdenCompra,
} from "@/lib/ordenes-compra/tipos";

export { formatearMonto, MONEDAS } from "@/lib/cotizaciones/presentacion";

export const ETIQUETAS_TIPO_OC: Record<TipoOrdenCompra, string> = {
  ARTICULO: "Artículo",
  SERVICIO: "Servicio",
};

export const ETIQUETAS_ESTADO_OC: Record<EstadoOC, string> = {
  BORRADOR: "Borrador",
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  ANULADO: "Anulado",
};

export const TONO_ESTADO_OC: Record<EstadoOC, TonoInsignia> = {
  BORRADOR: "gris",
  PENDIENTE: "rojo-outline",
  APROBADO: "negro",
  RECHAZADO: "rojo",
  ANULADO: "apagado",
};

// Reglas de permiso centralizadas — reflejan la máquina de estados y los roles
// que exige el backend para la OC. La aprueba el ENCARGADO del sector.

function esEncargadoDelSector(solicitud: OrdenCompra, usuario: Usuario): boolean {
  return usuario.sectoresEncargado.includes(solicitud.sectorId);
}

function esDeLaSolicitud(solicitud: OrdenCompra, usuario: Usuario): boolean {
  return (
    usuario.id === solicitud.solicitanteId ||
    esEncargadoDelSector(solicitud, usuario) ||
    usuario.rol === "ADMIN"
  );
}

export function puedeEnviar(solicitud: OrdenCompra, usuario: Usuario): boolean {
  return solicitud.estado === "BORRADOR" && esDeLaSolicitud(solicitud, usuario);
}

export function puedeAprobarORechazar(solicitud: OrdenCompra, usuario: Usuario): boolean {
  return (
    solicitud.estado === "PENDIENTE" &&
    usuario.rol === "ENCARGADO" &&
    esEncargadoDelSector(solicitud, usuario)
  );
}

const ESTADOS_ANULABLES: EstadoOC[] = ["BORRADOR", "PENDIENTE", "APROBADO"];

export function puedeAnular(solicitud: OrdenCompra, usuario: Usuario): boolean {
  if (!ESTADOS_ANULABLES.includes(solicitud.estado)) return false;
  if (usuario.rol === "ADMIN") return true;
  if (usuario.rol === "ENCARGADO") return esEncargadoDelSector(solicitud, usuario);
  return false;
}

export function puedeEliminar(solicitud: OrdenCompra, usuario: Usuario): boolean {
  return solicitud.estado === "BORRADOR" && esDeLaSolicitud(solicitud, usuario);
}

// De una OC aprobada se derivan las Órdenes de Pago (Fase 2). Crear una OP no está
// restringido por rol en el backend, así que el gate acá es el estado de la OC.
// En una OC de pago único la OP se genera sola al aprobar, así que no se ofrece el
// alta manual (evita una OP duplicada que excedería el monto).
export function puedeCrearOrdenPago(solicitud: OrdenCompra): boolean {
  return solicitud.estado === "APROBADO" && !solicitud.esPagoUnico;
}
