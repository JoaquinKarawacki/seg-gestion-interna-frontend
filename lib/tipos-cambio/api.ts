import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { Moneda } from "@/lib/cotizaciones/tipos";
import type { ActualizarTipoCambioDto, TipoCambio } from "@/lib/tipos-cambio/tipos";

export async function listarTiposCambio() {
  const { datos } = await peticion<RespuestaLista<TipoCambio>>("/tipos-cambio");
  return datos;
}

export async function actualizarTipoCambio(moneda: Moneda, dto: ActualizarTipoCambioDto) {
  const { datos } = await peticion<RespuestaExitosa<TipoCambio>>(`/tipos-cambio/${moneda}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}
