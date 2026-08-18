import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearComentario, listarComentarios } from "@/lib/comentarios/api";
import type { CrearComentarioDto } from "@/lib/comentarios/tipos";

const CLAVE_COMENTARIOS = "comentarios";
const CLAVE_ORDENES_COMPRA = "ordenes-compra";
const CLAVE_HISTORIAL = "historial-orden-compra";

export function useComentarios(ordenCompraId: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_COMENTARIOS, ordenCompraId],
    queryFn: () => listarComentarios(ordenCompraId as string),
    enabled: Boolean(ordenCompraId),
  });
}

export function useCrearComentario(ordenCompraId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearComentarioDto) => crearComentario(ordenCompraId, dto),
    onSuccess: () => {
      // Comentar puede disparar un cambio de estado automático en la orden
      // (PENDIENTE<->EN_CONSULTA) — hay que refrescar la orden y su historial, no solo el hilo.
      queryClient.invalidateQueries({ queryKey: [CLAVE_COMENTARIOS, ordenCompraId] });
      queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] });
      queryClient.invalidateQueries({ queryKey: [CLAVE_HISTORIAL, ordenCompraId] });
    },
  });
}
