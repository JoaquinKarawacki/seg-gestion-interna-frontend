import { MONEDAS } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion, Moneda } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import type { Proyecto } from "@/lib/proyectos/tipos";

export interface ResumenCostosProyecto {
  moneda: Moneda;
  monedasDisponibles: Moneda[];
  costoAproximado: number | null;
  honorarios: number | null;
  costoSegCalculado: number;
  costoSegManual: number | null;
  costoSeg: number;
  costoSegEditable: boolean;
  gastado: number;
  margenDeEquipo: number | null;
}

// Todas las monedas con actividad en el proyecto: la de la cotización general
// activa (si hay) primero, seguida de las de cotizaciones de tarea activas y
// de órdenes de compra pagadas — en ese orden de aparición, sin repetir.
export function obtenerMonedasDisponibles(
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
): Moneda[] {
  const general = cotizaciones.find(
    (cotizacion) => cotizacion.tareaId === null && cotizacion.estado === "ACTIVA",
  );
  const monedas: Moneda[] = [];

  function agregar(moneda: Moneda) {
    if (!monedas.includes(moneda)) monedas.push(moneda);
  }

  if (general) agregar(general.moneda);
  cotizaciones
    .filter((cotizacion) => cotizacion.tareaId !== null && cotizacion.estado === "ACTIVA")
    .forEach((cotizacion) => agregar(cotizacion.moneda));
  ordenesCompra.filter((orden) => orden.estado === "PAGADO").forEach((orden) => agregar(orden.moneda));

  return monedas;
}

// La cotización general activa (tareaId null) es la "moneda por defecto" del
// proyecto — Costo aproximado/Honorarios/Margen de equipo dependen de ella y
// por eso solo se muestran cuando la moneda elegida coincide con la suya (en
// cualquier otra moneda no hay de dónde sacar esos tres valores). Costo SEG
// (calculado) y Gastado sí se recalculan para la moneda elegida. El override
// manual de Costo SEG vive como un solo valor en el Proyecto, sin moneda
// propia, así que solo es editable en la moneda de la cotización general.
export function calcularResumenCostos(
  proyecto: Proyecto,
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
  monedaSeleccionada?: Moneda,
): ResumenCostosProyecto | null {
  if (obtenerMonedasDisponibles(cotizaciones, ordenesCompra).length === 0) return null;

  const general = cotizaciones.find(
    (cotizacion) => cotizacion.tareaId === null && cotizacion.estado === "ACTIVA",
  );
  // El cambio de moneda tiene que poder hacerse siempre, aunque el proyecto
  // hoy solo tenga actividad en una — por eso se cicla sobre las 3 monedas
  // soportadas por la app (MONEDAS), no solo sobre las que ya tienen datos.
  const moneda = monedaSeleccionada ?? general?.moneda ?? MONEDAS[0];
  const costoSegEditable = general?.moneda === moneda;

  const costoAproximado = costoSegEditable && general ? Number(general.montoTotal) : null;
  const honorarios =
    costoSegEditable && general && general.honorarios !== null ? Number(general.honorarios) : null;

  const cotizacionesDeTarea = cotizaciones.filter(
    (cotizacion) => cotizacion.tareaId !== null && cotizacion.estado === "ACTIVA",
  );
  const costoSegCalculado = cotizacionesDeTarea
    .filter((cotizacion) => cotizacion.moneda === moneda)
    .reduce((acc, cotizacion) => acc + Number(cotizacion.montoTotal), 0);

  const gastado = ordenesCompra
    .filter((orden) => orden.estado === "PAGADO" && orden.moneda === moneda)
    .reduce((acc, orden) => acc + Number(orden.monto), 0);

  const costoSegManual =
    costoSegEditable && proyecto.costoSegManual !== null ? Number(proyecto.costoSegManual) : null;
  const costoSeg = costoSegManual ?? costoSegCalculado;
  const margenDeEquipo = costoAproximado !== null ? costoAproximado - costoSeg : null;

  return {
    moneda,
    monedasDisponibles: MONEDAS,
    costoAproximado,
    honorarios,
    costoSegCalculado,
    costoSegManual,
    costoSeg,
    costoSegEditable,
    gastado,
    margenDeEquipo,
  };
}
