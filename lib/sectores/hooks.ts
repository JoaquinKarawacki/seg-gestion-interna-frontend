import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarSector,
  crearSector,
  eliminarSector,
  listarSectores,
} from "@/lib/sectores/api";
import type { ActualizarSectorDto, CrearSectorDto } from "@/lib/sectores/tipos";

const CLAVE_SECTORES = "sectores";

export function useSectores() {
  return useQuery({ queryKey: [CLAVE_SECTORES], queryFn: listarSectores });
}

export function useMapaSectores() {
  const { data } = useSectores();
  return useMemo(() => new Map(data?.map((sector) => [sector.id, sector])), [data]);
}

export function useCrearSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearSectorDto) => crearSector(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SECTORES] }),
  });
}

export function useActualizarSector(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarSectorDto) => actualizarSector(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SECTORES] }),
  });
}

export function useEliminarSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarSector(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_SECTORES] }),
  });
}
