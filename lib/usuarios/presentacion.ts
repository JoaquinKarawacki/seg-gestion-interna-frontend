import type { RolUsuario } from "@/lib/auth/tipos";

export const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  SOLICITANTE: "Solicitante",
  ENCARGADO: "Encargado",
  PAGOS: "Pagos",
  ADMIN: "Administrador",
};
