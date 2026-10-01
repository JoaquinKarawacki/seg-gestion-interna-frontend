import { peticion } from "@/lib/http/cliente";
import type { Rubro } from "@/lib/rubros/tipos";

// GET /rubros devuelve solo { datos } (catálogo simple, sin paginar).
export async function listarRubros() {
  const { datos } = await peticion<{ datos: Rubro[] }>("/rubros");
  return datos;
}
