"use client";

import { Modal } from "@/components/ui/Modal";
import { Boton } from "@/components/ui/Boton";
import { EstadoError } from "@/components/ui/EstadoError";
import { formatearMonto } from "@/lib/cotizaciones/presentacion";
import type { Moneda } from "@/lib/cotizaciones/tipos";

// Advertencia + confirmación cuando el monto de la OP hace que el total supere el
// de la Orden de Compra. El backend ya bloqueó con 422 MONTO_EXCEDE_COTIZACION;
// confirmar reenvía con confirmarExcesoMonto=true.
export function ModalConfirmacionExcesoMonto({
  montoOC,
  montoIngresado,
  moneda,
  cargando,
  error,
  onConfirmar,
  onCerrar,
}: {
  montoOC: string;
  montoIngresado: number;
  moneda: Moneda;
  cargando: boolean;
  error: unknown;
  onConfirmar: () => void;
  onCerrar: () => void;
}) {
  return (
    <Modal titulo="El monto supera la Orden de Compra" abierto onCerrar={onCerrar}>
      <div className="flex flex-col gap-4">
        {error ? <EstadoError error={error} /> : null}
        <p className="text-sm text-gray-600">
          El monto ingresado (
          <b>{formatearMonto(String(montoIngresado), moneda)}</b>) hace que el total de
          órdenes de pago supere el monto aprobado de la Orden de Compra (
          <b>{formatearMonto(montoOC, moneda)}</b>).
        </p>
        <p className="text-sm text-gray-600">¿Querés crear la orden de pago igual?</p>
        <div className="flex gap-2">
          <Boton onClick={onConfirmar} disabled={cargando}>
            Crear igual
          </Boton>
          <Boton variante="outline" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Boton>
        </div>
      </div>
    </Modal>
  );
}
