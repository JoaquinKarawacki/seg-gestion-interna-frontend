import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularOrdenCompra,
  aprobarOrdenCompra,
  crearOrdenCompra,
  descargarAdjuntoOrdenCompra,
  eliminarOrdenCompra,
  enviarOrdenCompra,
  listarHistorialOrdenCompra,
  listarOrdenesCompra,
  obtenerOrdenCompra,
  rechazarOrdenCompra,
} from "@/lib/ordenes-compra/api";
import type {
  CrearOrdenCompraDto,
  FiltrosOrdenCompra,
} from "@/lib/ordenes-compra/tipos";

const CLAVE_SOLICITUDES_COMPRA = "ordenes-compra";
const CLAVE_HISTORIAL = "historial-orden-compra";

// Acotado por diseño: alcanza para el listado general (se filtra client-side) y
// para "todas las OC de un proyecto puntual". Ninguno de esos casos debería
// acercarse a este techo en Fase 1.
const POR_PAGINA_ACOTADO = 200;

export function useOrdenesCompra(filtros: FiltrosOrdenCompra = {}) {
  return useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, filtros],
    queryFn: () => listarOrdenesCompra(filtros),
  });
}

// Todas las OC (para el listado general con búsqueda/filtro client-side).
export function useOrdenesCompraCatalogo() {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, { porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarOrdenesCompra({ porPagina: POR_PAGINA_ACOTADO }),
  });
  return { data: data?.datos, total: data?.total, ...resto };
}

// Las OC de un proyecto puntual (tab "Órdenes de Compra" del detalle de Proyecto).
export function useOrdenesCompraDeProyecto(proyectoId: string | undefined) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, { proyectoId, porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarOrdenesCompra({ proyectoId, porPagina: POR_PAGINA_ACOTADO }),
    enabled: Boolean(proyectoId),
  });
  return { data: data?.datos, ...resto };
}

export function useOrdenCompra(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, id],
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SOLICITUDES_COMPRA] }),
  });
}

export function useEliminarOrdenCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarOrdenCompra(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SOLICITUDES_COMPRA] }),
  });
}

export function useDescargarAdjuntoOrdenCompra() {
  return useMutation({
    mutationFn: async (solicitud: { id: string; numero: number }) => {
      const { blob, nombreArchivo } = await descargarAdjuntoOrdenCompra(solicitud.id);
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? `orden-pago-${solicitud.numero}.pdf`;
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
      queryClient.invalidateQueries({ queryKey: [CLAVE_SOLICITUDES_COMPRA] });
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

export function useAnularOrdenCompra() {
  return useTransicionOrdenCompra(({ id, motivo }: { id: string; motivo: string }) =>
    anularOrdenCompra(id, motivo),
  );
}
