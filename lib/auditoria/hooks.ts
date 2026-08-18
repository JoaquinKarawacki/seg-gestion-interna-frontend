import { useQueries, useQuery } from "@tanstack/react-query";
import { listarAuditoria } from "@/lib/auditoria/api";
import type { FiltrosAuditoria } from "@/lib/auditoria/tipos";

export const CLAVE_AUDITORIA = "auditoria";

export function useAuditoria(filtros: FiltrosAuditoria) {
  return useQuery({
    queryKey: [CLAVE_AUDITORIA, filtros],
    queryFn: () => listarAuditoria(filtros),
  });
}

// Trae las páginas 1..paginasCargadas y devuelve el resultado ya combinado —
// evita mantener un acumulador de estado sincronizado a mano con un efecto
// (cada página queda cacheada por separado en React Query, así que "Cargar más"
// solo pide la página nueva, nunca re-pide las anteriores).
export function useAuditoriaPaginada(
  filtrosBase: Omit<FiltrosAuditoria, "pagina" | "porPagina">,
  paginasCargadas: number,
  porPagina: number,
) {
  const consultas = useQueries({
    queries: Array.from({ length: paginasCargadas }, (_, indice) => {
      const filtros = { ...filtrosBase, pagina: indice + 1, porPagina };
      return {
        queryKey: [CLAVE_AUDITORIA, filtros],
        queryFn: () => listarAuditoria(filtros),
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
