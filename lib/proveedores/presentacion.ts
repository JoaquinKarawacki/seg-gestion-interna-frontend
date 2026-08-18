import type { TipoCuentaBancaria } from "@/lib/proveedores/tipos";

export const ETIQUETAS_TIPO_CUENTA: Record<TipoCuentaBancaria, string> = {
  CAJA_AHORRO: "Caja de ahorro",
  CUENTA_CORRIENTE: "Cuenta corriente",
  EXTERIOR: "Cuenta exterior",
};
