import { useMutation } from "@tanstack/react-query";
import { descargarExcelPagos } from "@/lib/exportacion-pagos/api";

// Baja el Excel y dispara la descarga en el navegador (mismo patrón que la
// descarga de factura). El nombre del archivo lo define el backend.
export function useDescargarExcelPagos() {
  return useMutation({
    mutationFn: async () => {
      const { blob, nombreArchivo } = await descargarExcelPagos();
      const url = window.URL.createObjectURL(blob);
      const enlace = window.document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo ?? "pagos.xlsx";
      window.document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
