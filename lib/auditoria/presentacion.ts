// Backend filtra por igualdad exacta (sin búsqueda parcial ni endpoint de valores
// distintos) — estas listas hay que mantenerlas a mano si se agregan entidades o
// acciones nuevas en el backend (revisar ACCIONES_AUDITORIA en
// gestion-interna-backend/src/auditoria/acciones-auditoria.constantes.ts).

export const ENTIDADES_AUDITORIA = [
  "Usuario",
  "Sector",
  "Cliente",
  "Proveedor",
  "Proyecto",
  "Tarea",
  "Cotizacion",
  "PropuestaInversion",
  "OrdenCompra",
] as const;

export const ACCIONES_AUDITORIA = [
  "CREAR_USUARIO",
  "ACTUALIZAR_USUARIO",
  "ELIMINAR_USUARIO",
  "CAMBIAR_CONTRASENA_PROPIA",
  "CREAR_SECTOR",
  "ACTUALIZAR_SECTOR",
  "ELIMINAR_SECTOR",
  "CREAR_PROVEEDOR",
  "ACTUALIZAR_PROVEEDOR",
  "ELIMINAR_PROVEEDOR",
  "CREAR_CLIENTE",
  "ACTUALIZAR_CLIENTE",
  "ELIMINAR_CLIENTE",
  "CREAR_PROYECTO",
  "ACTUALIZAR_PROYECTO",
  "ELIMINAR_PROYECTO",
  "CREAR_TAREA",
  "ACTUALIZAR_TAREA",
  "ELIMINAR_TAREA",
  "CREAR_COTIZACION",
  "CREAR_PROPUESTA_INVERSION",
  "CREAR_ORDEN_COMPRA",
  "ACTUALIZAR_ORDEN_COMPRA",
  "ELIMINAR_ORDEN_COMPRA",
  "ADJUNTAR_FACTURA_ORDEN_COMPRA",
  "ENVIAR_ORDEN_COMPRA",
  "APROBAR_ORDEN_COMPRA",
  "RECHAZAR_ORDEN_COMPRA",
  "MARCAR_EN_CONSULTA_ORDEN_COMPRA",
  "RESPONDER_CONSULTA_ORDEN_COMPRA",
  "OBSERVAR_PAGO_ORDEN_COMPRA",
  "RESOLVER_OBSERVACION_ORDEN_COMPRA",
  "CONFIRMAR_PAGO_ORDEN_COMPRA",
  "ANULAR_ORDEN_COMPRA",
  "CREAR_COMENTARIO",
] as const;

export function formatearAccion(accion: string): string {
  const texto = accion.toLowerCase().replaceAll("_", " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
