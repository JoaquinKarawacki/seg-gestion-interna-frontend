import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarTipoCambio, listarTiposCambio } from "@/lib/tipos-cambio/api";
import type { Moneda } from "@/lib/cotizaciones/tipos";
import type { ActualizarTipoCambioDto } from "@/lib/tipos-cambio/tipos";

const CLAVE_TIPOS_CAMBIO = "tipos-cambio";

export function useTiposCambio() {
  return useQuery({ queryKey: [CLAVE_TIPOS_CAMBIO], queryFn: listarTiposCambio });
}

export function useMapaTiposCambio() {
  const { data } = useTiposCambio();
  return useMemo(() => new Map(data?.map((tipoCambio) => [tipoCambio.moneda, tipoCambio])), [data]);
}

export function useActualizarTipoCambio(moneda: Moneda) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarTipoCambioDto) => actualizarTipoCambio(moneda, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_TIPOS_CAMBIO] }),
  });
}
