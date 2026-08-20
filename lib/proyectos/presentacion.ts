import { MONEDAS } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion, Moneda } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import type { PropuestaInversion } from "@/lib/propuestas-inversion/tipos";
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

// Todas las monedas con actividad en el proyecto: la de la propuesta de
// inversión activa (si hay) primero, seguida de las de cotizaciones de tarea
// activas y de órdenes de compra pagadas — en ese orden de aparición, sin
// repetir. Solo se usa para decidir si hay algo para mostrar (tarjeta vacía o
// no); el selector de moneda cicla siempre sobre las 3 monedas soportadas por
// la app.
export function obtenerMonedasDisponibles(
  propuestaActiva: PropuestaInversion | null,
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
): Moneda[] {
  const monedas: Moneda[] = [];

  function agregar(moneda: Moneda) {
    if (!monedas.includes(moneda)) monedas.push(moneda);
  }

  if (propuestaActiva) agregar(propuestaActiva.moneda);
  cotizaciones
    .filter((cotizacion) => cotizacion.estado === "ACTIVA")
    .forEach((cotizacion) => agregar(cotizacion.moneda));
  ordenesCompra.filter((orden) => orden.estado === "PAGADO").forEach((orden) => agregar(orden.moneda));

  return monedas;
}

// UYU es la base (tasa 1 implícita); USD/EUR vienen del mapa de tipos de
// cambio (`useMapaTiposCambio`). Si todavía no se cargó/seteó una tasa, se
// usa 1 como default inofensivo (no revienta el cálculo, solo no convierte).
function obtenerTasaEnUyu(moneda: Moneda, tasas: Map<Moneda, number>): number {
  if (moneda === "UYU") return 1;
  return tasas.get(moneda) ?? 1;
}

function convertir(monto: number, monedaOrigen: Moneda, monedaDestino: Moneda, tasas: Map<Moneda, number>): number {
  if (monedaOrigen === monedaDestino) return monto;
  const montoEnUyu = monto * obtenerTasaEnUyu(monedaOrigen, tasas);
  return montoEnUyu / obtenerTasaEnUyu(monedaDestino, tasas);
}

// La propuesta de inversión activa es la moneda "de origen" del override
// manual de Costo SEG (solo se puede editar mientras se está viendo esa
// moneda) — en cualquier otra moneda se convierte con las tasas, igual que el
// resto de los montos. Nada se excluye: todo se convierte a la moneda
// elegida antes de sumar/restar, así el selector siempre muestra números
// reales y no ceros.
export function calcularResumenCostos(
  proyecto: Proyecto,
  propuestaActiva: PropuestaInversion | null,
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
  tasas: Map<Moneda, number>,
  monedaSeleccionada?: Moneda,
): ResumenCostosProyecto | null {
  if (obtenerMonedasDisponibles(propuestaActiva, cotizaciones, ordenesCompra).length === 0) return null;

  const moneda = monedaSeleccionada ?? propuestaActiva?.moneda ?? MONEDAS[0];

  const costoAproximado = propuestaActiva
    ? convertir(Number(propuestaActiva.costoTotalAproximado), propuestaActiva.moneda, moneda, tasas)
    : null;
  const honorarios = propuestaActiva
    ? convertir(Number(propuestaActiva.honorarios), propuestaActiva.moneda, moneda, tasas)
    : null;

  const costoSegCalculado = cotizaciones
    .filter((cotizacion) => cotizacion.estado === "ACTIVA")
    .reduce(
      (acc, cotizacion) => acc + convertir(Number(cotizacion.montoTotal), cotizacion.moneda, moneda, tasas),
      0,
    );

  const gastado = ordenesCompra
    .filter((orden) => orden.estado === "PAGADO")
    .reduce((acc, orden) => acc + convertir(Number(orden.monto), orden.moneda, moneda, tasas), 0);

  const costoSegEditable = propuestaActiva?.moneda === moneda;
  const costoSegManualBase = proyecto.costoSegManual !== null ? Number(proyecto.costoSegManual) : null;
  const costoSegManual =
    costoSegManualBase !== null && propuestaActiva
      ? convertir(costoSegManualBase, propuestaActiva.moneda, moneda, tasas)
      : costoSegManualBase;
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
