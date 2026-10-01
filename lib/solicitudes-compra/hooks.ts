import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularSolicitudCompra,
  aprobarSolicitudCompra,
  crearSolicitudCompra,
  descargarAdjuntoSolicitudCompra,
  eliminarSolicitudCompra,
  enviarSolicitudCompra,
  listarHistorialSolicitudCompra,
  listarSolicitudesCompra,
  obtenerSolicitudCompra,
  rechazarSolicitudCompra,
} from "@/lib/solicitudes-compra/api";
import type {
  CrearSolicitudCompraDto,
  FiltrosSolicitudCompra,
} from "@/lib/solicitudes-compra/tipos";

const CLAVE_SOLICITUDES_COMPRA = "solicitudes-compra";
const CLAVE_HISTORIAL = "historial-solicitud-compra";

// Acotado por diseño: alcanza para el listado general (se filtra client-side) y
// para "todas las OC de un proyecto puntual". Ninguno de esos casos debería
// acercarse a este techo en Fase 1.
const POR_PAGINA_ACOTADO = 200;

export function useSolicitudesCompra(filtros: FiltrosSolicitudCompra = {}) {
  return useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, filtros],
    queryFn: () => listarSolicitudesCompra(filtros),
  });
}

// Todas las OC (para el listado general con búsqueda/filtro client-side).
export function useSolicitudesCompraCatalogo() {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, { porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarSolicitudesCompra({ porPagina: POR_PAGINA_ACOTADO }),
  });
  return { data: data?.datos, total: data?.total, ...resto };
}

// Las OC de un proyecto puntual (tab "Órdenes de Compra" del detalle de Proyecto).
export function useSolicitudesCompraDeProyecto(proyectoId: string | undefined) {
  const { data, ...resto } = useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, { proyectoId, porPagina: POR_PAGINA_ACOTADO }],
    queryFn: () => listarSolicitudesCompra({ proyectoId, porPagina: POR_PAGINA_ACOTADO }),
    enabled: Boolean(proyectoId),
  });
  return { data: data?.datos, ...resto };
}

export function useSolicitudCompra(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_SOLICITUDES_COMPRA, id],
    queryFn: () => obtenerSolicitudCompra(id as string),
    enabled: Boolean(id),
  });
}

export function useHistorialSolicitudCompra(id: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_HISTORIAL, id],
    queryFn: () => listarHistorialSolicitudCompra(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearSolicitudCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearSolicitudCompraDto) => crearSolicitudCompra(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SOLICITUDES_COMPRA] }),
  });
}

export function useEliminarSolicitudCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarSolicitudCompra(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SOLICITUDES_COMPRA] }),
  });
}

export function useDescargarAdjuntoSolicitudCompra() {
  return useMutation({
    mutationFn: async (solicitud: { id: string; numero: number }) => {
      const { blob, nombreArchivo } = await descargarAdjuntoSolicitudCompra(solicitud.id);
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? `orden-compra-${solicitud.numero}.pdf`;
      window.document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

function useTransicionSolicitudCompra<TVariables>(
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

export function useEnviarSolicitudCompra() {
  return useTransicionSolicitudCompra((id: string) => enviarSolicitudCompra(id));
}

export function useAprobarSolicitudCompra() {
  return useTransicionSolicitudCompra((id: string) => aprobarSolicitudCompra(id));
}

export function useRechazarSolicitudCompra() {
  return useTransicionSolicitudCompra(({ id, motivo }: { id: string; motivo: string }) =>
    rechazarSolicitudCompra(id, motivo),
  );
}

export function useAnularSolicitudCompra() {
  return useTransicionSolicitudCompra(({ id, motivo }: { id: string; motivo: string }) =>
    anularSolicitudCompra(id, motivo),
  );
}
