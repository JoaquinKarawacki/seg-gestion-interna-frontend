import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarOrdenPago,
  adjuntarFacturaOrdenPago,
  anularOrdenPago,
  aprobarOrdenPago,
  confirmarPagoOrdenPago,
  crearOrdenPago,
  descargarFacturaOrdenPago,
  eliminarOrdenPago,
  enviarOrdenPago,
  listarHistorialOrdenPago,
  listarOrdenesPago,
  observarPagoOrdenPago,
  obtenerOrdenPago,
  rechazarOrdenPago,
  resolverObservacionOrdenPago,
} from "@/lib/ordenes-pago/api";
import type {
  ActualizarOrdenPagoDto,
  CrearOrdenPagoDto,
  FiltrosOrdenPago,
} from "@/lib/ordenes-pago/tipos";

const CLAVE_ORDENES_COMPRA = "ordenes-pago";
const CLAVE_HISTORIAL = "historial-orden-pago";

// Acotado por diseño: alcanza para "todas las OC de un proyecto puntual" o
// "todas las OC de una cotización puntual" (ver useOrdenesPagoDeProyecto/
// useOrdenesPagoDeCotizacion) — esos casos nunca deberían acercarse a 200
// filas. El listado SIN filtrar (useOrdenesPagoPaginadas) es el que de verdad
// puede crecer sin límite, por eso pagina de a POR_PAGINA_LISTADO en vez de traer
// hasta este techo de una.
const POR_PAGINA_ACOTADO = 200;

export function useOrdenesPago(filtros: FiltrosOrdenPago = {}) {
  return useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, filtros],
    queryFn: () => listarOrdenesPago(filtros),
  });
}

// El listado principal (/ordenes-pago) — crece sin límite natural, así que
// pagina de verdad. Trae las páginas 1..paginasCargadas y las combina, igual
// que useAuditoriaPaginada (ver lib/auditoria/hooks.ts para el razonamiento
// completo de por qué esto y no un acumulador de estado + efecto).
export function useOrdenesPagoPaginadas(
  filtrosBase: Omit<FiltrosOrdenPago, "pagina" | "porPagina">,
  paginasCargadas: number,
  porPagina: number,
) {
  const consultas = useQueries({
    queries: Array.from({ length: paginasCargadas }, (_, indice) => {
      const filtros = { ...filtrosBase, pagina: indice + 1, porPagina };
      return {
        queryKey: [CLAVE_ORDENES_COMPRA, filtros],
        queryFn: () => listarOrdenesPago(filtros),
      };
    }),
  });

  const ultima = consultas.at(-1);

  return {
    registros: consultas.flatMap((consulta) => consulta.data?.datos ?? []),
    total: ultima?.data?.total ?? 0,
    isLoading: consultas.some((consulta) => consulta.isLoading),
    isError: consultas.some((consulta) => consulta.isError),
    error: consultas.find((consulta) => consulta.isError)?.error,
    isFetchingMas: paginasCargadas > 1 && Boolean(ultima?.isFetching),
  };
}

// Las OC de un proyecto puntual (tab "Órdenes de Compra" del detalle de Proyecto)
// — acotado por proyectoId, no necesita paginar.
export function useOrdenesPagoDeProyecto(proyectoId: string | undefined) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, { proyectoId, porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarOrdenesPago({ proyectoId, porPagina: POR_PAGINA_ACOTADO }),
    enabled: Boolean(proyectoId),
  });
  return { data: data?.datos, ...resto };
}

// Las OC vinculadas a una cotización puntual (para "saldo disponible" al crear
// una OC nueva) — acotado por cotizacionId, no necesita paginar.
export function useOrdenesPagoDeCotizacion(cotizacionId: string | undefined) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, { cotizacionId, porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarOrdenesPago({ cotizacionId, porPagina: POR_PAGINA_ACOTADO }),
    enabled: Boolean(cotizacionId),
  });
  return { data: data?.datos, ...resto };
}

// Conteo liviano por filtro (para tarjetas de resumen tipo Dashboard) — pide
// porPagina=1 para no traer filas de más, solo necesita el `total`.
export function useConteoOrdenesPago(
  filtros: Omit<FiltrosOrdenPago, "pagina" | "porPagina">,
  opciones: { enabled?: boolean } = {},
) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, "conteo", filtros],
    queryFn: () => listarOrdenesPago({ ...filtros, porPagina: 1 }),
    enabled: opciones.enabled ?? true,
  });
  return { total: data?.total, ...resto };
}

export function useOrdenPago(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, id],
    queryFn: () => obtenerOrdenPago(id as string),
    enabled: Boolean(id),
  });
}

export function useHistorialOrdenPago(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_HISTORIAL, id],
    queryFn: () => listarHistorialOrdenPago(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearOrdenPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearOrdenPagoDto) => crearOrdenPago(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useActualizarOrdenPago(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarOrdenPagoDto) => actualizarOrdenPago(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useEliminarOrdenPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarOrdenPago(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useAdjuntarFacturaOrdenPago(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factura: File) => adjuntarFacturaOrdenPago(id, factura),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useDescargarFacturaOrdenPago() {
  return useMutation({
    mutationFn: async (orden: { id: string; numero: number }) => {
      const { blob, nombreArchivo } = await descargarFacturaOrdenPago(orden.id);
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? `orden-pago-${orden.numero}.pdf`;
      window.document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

function useTransicionOrdenPago<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] });
      queryClient.invalidateQueries({ queryKey: [CLAVE_HISTORIAL] });
    },
  });
}

export function useEnviarOrdenPago() {
  return useTransicionOrdenPago((id: string) => enviarOrdenPago(id));
}

export function useAprobarOrdenPago() {
  return useTransicionOrdenPago((id: string) => aprobarOrdenPago(id));
}

export function useRechazarOrdenPago() {
  return useTransicionOrdenPago(({ id, motivo }: { id: string; motivo: string }) =>
    rechazarOrdenPago(id, motivo),
  );
}

export function useObservarPagoOrdenPago() {
  return useTransicionOrdenPago(({ id, motivo }: { id: string; motivo: string }) =>
    observarPagoOrdenPago(id, motivo),
  );
}

export function useResolverObservacionOrdenPago() {
  return useTransicionOrdenPago(({ id, motivo }: { id: string; motivo?: string }) =>
    resolverObservacionOrdenPago(id, motivo),
  );
}

export function useConfirmarPagoOrdenPago() {
  return useTransicionOrdenPago((id: string) => confirmarPagoOrdenPago(id));
}

export function useAnularOrdenPago() {
  return useTransicionOrdenPago(({ id, motivo }: { id: string; motivo: string }) =>
    anularOrdenPago(id, motivo),
  );
}
