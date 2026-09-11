import { MONEDAS } from "@/lib/cotizaciones/presentacion";
import type { Cotizacion, Moneda } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import type { Tarea } from "@/lib/tareas/tipos";

// IVA general de Uruguay. Fijo porque hoy no hay ningún lado del sistema que
// permita cargar una tasa distinta (ni en Cotizacion ni en OrdenCompra).
const TASA_IVA_URUGUAY = 0.22;

export interface ResumenCostosProyecto {
  moneda: Moneda;
  monedasDisponibles: Moneda[];
  costoSeg: number;
  ejecucion: number;
}

export interface DesgloseProveedorTarea {
  proveedorId: string;
  cotizado: number;
  pagado: number;
}

export interface DesgloseTarea {
  tareaId: string;
  proveedores: DesgloseProveedorTarea[];
}

// Todas las monedas con actividad en el proyecto: la de cotizaciones de
// tarea activas primero, seguida de las de órdenes de compra pagadas, en ese
// orden de aparición, sin repetir. Solo se usa para decidir si hay algo para
// mostrar (tarjeta vacía o no); el selector de moneda cicla siempre sobre
// las 3 monedas soportadas por la app.
export function obtenerMonedasDisponibles(cotizaciones: Cotizacion[], ordenesCompra: OrdenCompra[]): Moneda[] {
  const monedas: Moneda[] = [];

  function agregar(moneda: Moneda) {
    if (!monedas.includes(moneda)) monedas.push(moneda);
  }

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

// El Costo SEG siempre se toma sin IVA: si la cotización se cargó con el
// checkbox "Incluye IVA", el monto cargado es el bruto y hay que sacarle la
// tasa para llegar al neto.
function calcularMontoNetoCotizacion(cotizacion: Cotizacion): number {
  const monto = Number(cotizacion.montoTotal);
  return cotizacion.ivaIncluido ? monto / (1 + TASA_IVA_URUGUAY) : monto;
}

// Misma idea para la Ejecución, reutilizando los campos ya existentes de
// OrdenCompra: si no paga IVA, el monto ya es neto; si paga IVA pero el
// monto no lo incluye (se agrega aparte al pagar), también ya es neto.
// Solo hay que descontar cuando paga IVA Y el monto cargado lo incluye.
function calcularMontoNetoOrdenCompra(orden: OrdenCompra): number {
  const monto = Number(orden.monto);
  return orden.pagaIva && orden.ivaIncluido ? monto / (1 + TASA_IVA_URUGUAY) : monto;
}

export function calcularResumenCostos(
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
  tasas: Map<Moneda, number>,
  monedaSeleccionada?: Moneda,
): ResumenCostosProyecto | null {
  if (obtenerMonedasDisponibles(cotizaciones, ordenesCompra).length === 0) return null;

  const moneda = monedaSeleccionada ?? MONEDAS[0];

  const costoSeg = cotizaciones
    .filter((cotizacion) => cotizacion.estado === "ACTIVA")
    .reduce(
      (acc, cotizacion) => acc + convertir(calcularMontoNetoCotizacion(cotizacion), cotizacion.moneda, moneda, tasas),
      0,
    );

  const ejecucion = ordenesCompra
    .filter((orden) => orden.estado === "PAGADO")
    .reduce((acc, orden) => acc + convertir(calcularMontoNetoOrdenCompra(orden), orden.moneda, moneda, tasas), 0);

  return {
    moneda,
    monedasDisponibles: MONEDAS,
    costoSeg,
    ejecucion,
  };
}

// Por cada tarea del proyecto, cuánto se cotizó (neto) vs cuánto se pagó
// (neto) a cada proveedor involucrado, todo convertido a la moneda elegida.
export function calcularDesglosePorTarea(
  tareas: Tarea[],
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
  tasas: Map<Moneda, number>,
  moneda: Moneda,
): DesgloseTarea[] {
  return tareas.map((tarea) => {
    const cotizacionesDeTarea = cotizaciones.filter(
      (cotizacion) => cotizacion.tareaId === tarea.id && cotizacion.estado === "ACTIVA",
    );
    const ordenesDeTarea = ordenesCompra.filter((orden) => orden.tareaId === tarea.id && orden.estado === "PAGADO");

    const proveedorIds = new Set([
      ...cotizacionesDeTarea.map((cotizacion) => cotizacion.proveedorId),
      ...ordenesDeTarea.map((orden) => orden.proveedorId),
    ]);

    const proveedores = Array.from(proveedorIds).map((proveedorId) => {
      const cotizado = cotizacionesDeTarea
        .filter((cotizacion) => cotizacion.proveedorId === proveedorId)
        .reduce(
          (acc, cotizacion) =>
            acc + convertir(calcularMontoNetoCotizacion(cotizacion), cotizacion.moneda, moneda, tasas),
          0,
        );
      const pagado = ordenesDeTarea
        .filter((orden) => orden.proveedorId === proveedorId)
        .reduce((acc, orden) => acc + convertir(calcularMontoNetoOrdenCompra(orden), orden.moneda, moneda, tasas), 0);

      return { proveedorId, cotizado, pagado };
    });

    return { tareaId: tarea.id, proveedores };
  });
}
