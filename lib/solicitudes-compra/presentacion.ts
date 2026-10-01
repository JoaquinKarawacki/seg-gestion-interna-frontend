import type { TonoInsignia } from "@/components/ui/Insignia";
import type { Usuario } from "@/lib/auth/tipos";
import type {
  EstadoSolicitudCompra,
  SolicitudCompra,
  TipoSolicitudCompra,
} from "@/lib/solicitudes-compra/tipos";

export { formatearMonto, MONEDAS } from "@/lib/cotizaciones/presentacion";

export const ETIQUETAS_TIPO_SC: Record<TipoSolicitudCompra, string> = {
  ARTICULO: "Artículo",
  SERVICIO: "Servicio",
};

export const ETIQUETAS_ESTADO_SC: Record<EstadoSolicitudCompra, string> = {
  BORRADOR: "Borrador",
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  ANULADO: "Anulado",
};

export const TONO_ESTADO_SC: Record<EstadoSolicitudCompra, TonoInsignia> = {
  BORRADOR: "gris",
  PENDIENTE: "rojo-outline",
  APROBADO: "negro",
  RECHAZADO: "rojo",
  ANULADO: "apagado",
};

// Reglas de permiso centralizadas — reflejan la máquina de estados y los roles
// que exige el backend para la OC. La aprueba el ENCARGADO del sector.

function esEncargadoDelSector(solicitud: SolicitudCompra, usuario: Usuario): boolean {
  return usuario.sectoresEncargado.includes(solicitud.sectorId);
}

function esDeLaSolicitud(solicitud: SolicitudCompra, usuario: Usuario): boolean {
  return (
    usuario.id === solicitud.solicitanteId ||
    esEncargadoDelSector(solicitud, usuario) ||
    usuario.rol === "ADMIN"
  );
}

export function puedeEnviar(solicitud: SolicitudCompra, usuario: Usuario): boolean {
  return solicitud.estado === "BORRADOR" && esDeLaSolicitud(solicitud, usuario);
}

export function puedeAprobarORechazar(solicitud: SolicitudCompra, usuario: Usuario): boolean {
  return (
    solicitud.estado === "PENDIENTE" &&
    usuario.rol === "ENCARGADO" &&
    esEncargadoDelSector(solicitud, usuario)
  );
}

const ESTADOS_ANULABLES: EstadoSolicitudCompra[] = ["BORRADOR", "PENDIENTE", "APROBADO"];

export function puedeAnular(solicitud: SolicitudCompra, usuario: Usuario): boolean {
  if (!ESTADOS_ANULABLES.includes(solicitud.estado)) return false;
  if (usuario.rol === "ADMIN") return true;
  if (usuario.rol === "ENCARGADO") return esEncargadoDelSector(solicitud, usuario);
  return false;
}

export function puedeEliminar(solicitud: SolicitudCompra, usuario: Usuario): boolean {
  return solicitud.estado === "BORRADOR" && esDeLaSolicitud(solicitud, usuario);
}
