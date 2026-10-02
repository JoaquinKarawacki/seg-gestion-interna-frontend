import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearComentario, listarComentarios } from "@/lib/comentarios/api";
import type { CrearComentarioDto } from "@/lib/comentarios/tipos";

const CLAVE_COMENTARIOS = "comentarios";
const CLAVE_ORDENES_COMPRA = "ordenes-pago";
const CLAVE_HISTORIAL = "historial-orden-pago";

export function useComentarios(ordenPagoId: string | undefined) {
  return useQuery({
    queryKey: [CLAVE_COMENTARIOS, ordenPagoId],
    queryFn: () => listarComentarios(ordenPagoId as string),
    enabled: Boolean(ordenPagoId),
  });
}

export function useCrearComentario(ordenPagoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearComentarioDto) => crearComentario(ordenPagoId, dto),
    onSuccess: () => {
      // Comentar puede disparar un cambio de estado automático en la orden
      // (PENDIENTE<->EN_CONSULTA) — hay que refrescar la orden y su historial, no solo el hilo.
      queryClient.invalidateQueries({ queryKey: [CLAVE_COMENTARIOS, ordenPagoId] });
      queryClient.invalidateQueries({ queryKey: [CLAVE_ORDENES_COMPRA] });
      queryClient.invalidateQueries({ queryKey: [CLAVE_HISTORIAL, ordenPagoId] });
    },
  });
}
