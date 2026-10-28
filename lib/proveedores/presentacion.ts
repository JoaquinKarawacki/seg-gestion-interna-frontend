import type { Proveedor, TipoCuentaBancaria } from "@/lib/proveedores/tipos";

export const ETIQUETAS_TIPO_CUENTA: Record<TipoCuentaBancaria, string> = {
  CAJA_AHORRO: "Caja de ahorro",
  CUENTA_CORRIENTE: "Cuenta corriente",
  EXTERIOR: "Cuenta exterior",
};

// Los campos bancarios son obligatorios en el schema, pero datos importados
// pueden venir con texto vacío. El tipo de cuenta es enum (siempre tiene valor),
// así que alcanza con mirar banco y número de cuenta para saber si "falta" la
// información que necesita el rol PAGOS para transferir.
export function tieneDatosBancariosCompletos(
  proveedor: Pick<Proveedor, "banco" | "numeroCuenta">,
): boolean {
  return proveedor.banco.trim() !== "" && proveedor.numeroCuenta.trim() !== "";
}
