import { useQuery } from "@tanstack/react-query";
import { listarRubros } from "@/lib/rubros/api";

const CLAVE_RUBROS = "rubros";

export function useRubros() {
  return useQuery({ queryKey: [CLAVE_RUBROS], queryFn: listarRubros });
}
