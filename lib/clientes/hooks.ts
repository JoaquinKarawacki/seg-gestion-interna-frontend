import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes,
} from "@/lib/clientes/api";
import type { ActualizarClienteDto, CrearClienteDto } from "@/lib/clientes/tipos";

const CLAVE_CLIENTES = "clientes";

export function useClientes() {
  return useQuery({ queryKey: [CLAVE_CLIENTES], queryFn: listarClientes });
}

export function useMapaClientes() {
  const { data } = useClientes();
  return useMemo(() => new Map(data?.map((cliente) => [cliente.id, cliente])), [data]);
}

export function useCrearCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearClienteDto) => crearCliente(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_CLIENTES] }),
  });
}

export function useActualizarCliente(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ActualizarClienteDto) => actualizarCliente(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_CLIENTES] }),
  });
}

export function useEliminarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarCliente(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CLAVE_CLIENTES] }),
  });
}
