import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarOrdenCompra,
  adjuntarFacturaOrdenCompra,
  anularOrdenCompra,
  aprobarOrdenCompra,
  confirmarPagoOrdenCompra,
  crearOrdenCompra,
  descargarFacturaOrdenCompra,
  eliminarOrdenCompra,
  enviarOrdenCompra,
  listarHistorialOrdenCompra,
  listarOrdenesCompra,
  observarPagoOrdenCompra,
  obtenerOrdenCompra,
  rechazarOrdenCompra,
  resolverObservacionOrdenCompra,
} from "@/lib/ordenes-compra/api";
import type {
  ActualizarOrdenCompraDto,
  CrearOrdenCompraDto,
  FiltrosOrdenCompra,
} from "@/lib/ordenes-compra/tipos";

const CLAVE_ORDENES_COMPRA = "ordenes-compra";
const CLAVE_HISTORIAL = "historial-orden-compra";

// Acotado por diseño: alcanza para "todas las OC de un proyecto puntual" o
// "todas las OC de una cotización puntual" (ver useOrdenesCompraDeProyecto/
// useOrdenesCompraDeCotizacion) — esos casos nunca deberían acercarse a 200
// filas. El listado SIN filtrar (useOrdenesCompraPaginadas) es el que de verdad
// puede crecer sin límite, por eso pagina de a POR_PAGINA_LISTADO en vez de traer
// hasta este techo de una.
const POR_PAGINA_ACOTADO = 200;

export function useOrdenesCompra(filtros: FiltrosOrdenCompra = {}) {
  return useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, filtros],
    queryFn: () => listarOrdenesCompra(filtros),
  });
}

// El listado principal (/ordenes-compra) — crece sin límite natural, así que
// pagina de verdad. Trae las páginas 1..paginasCargadas y las combina, igual
// que useAuditoriaPaginada (ver lib/auditoria/hooks.ts para el razonamiento
// completo de por qué esto y no un acumulador de estado + efecto).
export function useOrdenesCompraPaginadas(
  filtrosBase: Omit<FiltrosOrdenCompra, "pagina" | "porPagina">,
  paginasCargadas: number,
  porPagina: number,
) {
  const consultas = useQueries({
    queries: Array.from({ length: paginasCargadas }, (_, indice) => {
      const filtros = { ...filtrosBase, pagina: indice + 1, porPagina };
      return {
        queryKey: [CLAVE_ORDENES_COMPRA, filtros],
        queryFn: () => listarOrdenesCompra(filtros),
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
export function useOrdenesCompraDeProyecto(proyectoId: string | undefined) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, { proyectoId, porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarOrdenesCompra({ proyectoId, porPagina: POR_PAGINA_ACOTADO }),
    enabled: Boolean(proyectoId),
  });
  return { data: data?.datos, ...resto };
}

// Las OC vinculadas a una cotización puntual (para "saldo disponible" al crear
// una OC nueva) — acotado por cotizacionId, no necesita paginar.
export function useOrdenesCompraDeCotizacion(cotizacionId: string | undefined) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, { cotizacionId, porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarOrdenesCompra({ cotizacionId, porPagina: POR_PAGINA_ACOTADO }),
    enabled: Boolean(cotizacionId),
  });
  return { data: data?.datos, ...resto };
}

// Conteo liviano por filtro (para tarjetas de resumen tipo Dashboard) — pide
// porPagina=1 para no traer filas de más, solo necesita el `total`.
export function useConteoOrdenesCompra(
  filtros: Omit<FiltrosOrdenCompra, "pagina" | "porPagina">,
  opciones: { enabled?: boolean } = {},
) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, "conteo", filtros],
    queryFn: () => listarOrdenesCompra({ ...filtros, porPagina: 1 }),
    enabled: opciones.enabled ?? true,
  });
  return { total: data?.total, ...resto };
}

export function useOrdenCompra(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_ORDENES_COMPRA, id],
    queryFn: () => obtenerOrdenCompra(id as string),
    enabled: Boolean(id),
  });
}

export function useHistorialOrdenCompra(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_HISTORIAL, id],
    queryFn: () => listarHistorialOrdenCompra(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearOrdenCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearOrdenCompraDto) => crearOrdenCompra(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useActualizarOrdenCompra(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarOrdenCompraDto) => actualizarOrdenCompra(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useEliminarOrdenCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarOrdenCompra(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useAdjuntarFacturaOrdenCompra(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factura: File) => adjuntarFacturaOrdenCompra(id, factura),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] }),
  });
}

export function useDescargarFacturaOrdenCompra() {
  return useMutation({
    mutationFn: async (orden: { id: string; numero: number }) => {
      const { blob, nombreArchivo } = await descargarFacturaOrdenCompra(orden.id);
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? `orden-compra-${orden.numero}.pdf`;
      window.document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

function useTransicionOrdenCompra<TVariables>(
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

export function useEnviarOrdenCompra() {
  return useTransicionOrdenCompra((id: string) => enviarOrdenCompra(id));
}

export function useAprobarOrdenCompra() {
  return useTransicionOrdenCompra((id: string) => aprobarOrdenCompra(id));
}

export function useRechazarOrdenCompra() {
  return useTransicionOrdenCompra(({ id, motivo }: { id: string; motivo: string }) =>
    rechazarOrdenCompra(id, motivo),
  );
}

export function useObservarPagoOrdenCompra() {
  return useTransicionOrdenCompra(({ id, motivo }: { id: string; motivo: string }) =>
    observarPagoOrdenCompra(id, motivo),
  );
}

export function useResolverObservacionOrdenCompra() {
  return useTransicionOrdenCompra(({ id, motivo }: { id: string; motivo?: string }) =>
    resolverObservacionOrdenCompra(id, motivo),
  );
}

export function useConfirmarPagoOrdenCompra() {
  return useTransicionOrdenCompra((id: string) => confirmarPagoOrdenCompra(id));
}

export function useAnularOrdenCompra() {
  return useTransicionOrdenCompra(({ id, motivo }: { id: string; motivo: string }) =>
    anularOrdenCompra(id, motivo),
  );
}
