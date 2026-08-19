import type { Cotizacion, Moneda } from "@/lib/cotizaciones/tipos";
import type { OrdenCompra } from "@/lib/ordenes-compra/tipos";
import type { Proyecto } from "@/lib/proyectos/tipos";

export interface ResumenCostosProyecto {
  moneda: Moneda;
  costoAproximado: number;
  honorarios: number | null;
  costoSegCalculado: number;
  costoSegManual: number | null;
  costoSeg: number;
  gastado: number;
  margenDeEquipo: number;
  hayOtrasMonedas: boolean;
}

// La cotización general activa (tareaId null) define la moneda de referencia
// del proyecto — el resto de las métricas se calculan solo con montos en esa
// misma moneda; lo que esté en otra moneda se excluye y se señala aparte
// (decisión tomada con el usuario: no mezclar montos de distinta moneda).
export function calcularResumenCostos(
  proyecto: Proyecto,
  cotizaciones: Cotizacion[],
  ordenesCompra: OrdenCompra[],
): ResumenCostosProyecto | null {
  const general = cotizaciones.find(
    (cotizacion) => cotizacion.tareaId === null && cotizacion.estado === "ACTIVA",
  );
  if (!general) return null;

  const moneda = general.moneda;
  const costoAproximado = Number(general.montoTotal);
  const honorarios = general.honorarios !== null ? Number(general.honorarios) : null;

  const cotizacionesDeTarea = cotizaciones.filter(
    (cotizacion) => cotizacion.tareaId !== null && cotizacion.estado === "ACTIVA",
  );
  const costoSegCalculado = cotizacionesDeTarea
    .filter((cotizacion) => cotizacion.moneda === moneda)
    .reduce((acc, cotizacion) => acc + Number(cotizacion.montoTotal), 0);

  const ordenesPagadas = ordenesCompra.filter((orden) => orden.estado === "PAGADO");
  const gastado = ordenesPagadas
    .filter((orden) => orden.moneda === moneda)
    .reduce((acc, orden) => acc + Number(orden.monto), 0);

  const costoSegManual = proyecto.costoSegManual !== null ? Number(proyecto.costoSegManual) : null;
  const costoSeg = costoSegManual ?? costoSegCalculado;
  const margenDeEquipo = costoAproximado - costoSeg;

  const hayOtrasMonedas =
    cotizacionesDeTarea.some((cotizacion) => cotizacion.moneda !== moneda) ||
    ordenesPagadas.some((orden) => orden.moneda !== moneda);

  return {
    moneda,
    costoAproximado,
    honorarios,
    costoSegCalculado,
    costoSegManual,
    costoSeg,
    gastado,
    margenDeEquipo,
    hayOtrasMonedas,
  };
}
