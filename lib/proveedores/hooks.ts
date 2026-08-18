import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProveedor,
  crearProveedor,
  eliminarProveedor,
  listarProveedores,
} from "@/lib/proveedores/api";
import type { ActualizarProveedorDto, CrearProveedorDto } from "@/lib/proveedores/tipos";

const CLAVE_PROVEEDORES = "proveedores";

export function useProveedores() {
  return useQuery({ queryKey: [CLAVE_PROVEEDORES], queryFn: listarProveedores });
}

export function useMapaProveedores() {
  const { data } = useProveedores();
  return useMemo(() => new Map(data?.map((proveedor) => [proveedor.id, proveedor])), [data]);
}

export function useCrearProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearProveedorDto) => crearProveedor(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROVEEDORES] }),
  });
}

export function useActualizarProveedor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarProveedorDto) => actualizarProveedor(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROVEEDORES] }),
  });
}

export function useEliminarProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarProveedor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_PROVEEDORES] }),
  });
}
